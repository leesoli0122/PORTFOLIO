// =============================================
// db.js — IndexedDB 전담 모듈
//
// 저장소 구조:
//   parts      : 업로드한 파츠 이미지 (탭별 분류)
//   gallery    : 완성된 이모티콘 PNG
//   favs       : 즐겨찾기 파츠 ID 목록
//   categories : 갤러리 카테고리 (v2 신규)
//
// 버전 이력:
//   v1 → 최초 릴리즈
//   v2 → parts.order 추가
//         gallery.name / categoryId / platform / size 추가
//         categories 스토어 신규 생성
// =============================================

const DB = (() => {

    const DB_NAME    = "emoji-maker";
    const DB_VERSION = 2;
    let   _db        = null;

    // --------------------------------------------------
    // 초기화: 앱 시작 시 한 번 호출
    // --------------------------------------------------
    function init() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);

            req.onupgradeneeded = (e) => {
                const db     = e.target.result;
                const oldVer = e.oldVersion;

                // ── v1 최초 설치 ───────────────────────────
                if (oldVer < 1) {
                    const partsStore = db.createObjectStore("parts", {
                        keyPath: "id", autoIncrement: true
                    });
                    partsStore.createIndex("tabId", "tabId", { unique: false });

                    db.createObjectStore("gallery", {
                        keyPath: "id", autoIncrement: true
                    });

                    db.createObjectStore("favs", { keyPath: "partId" });
                }

                // ── v1 → v2 마이그레이션 ──────────────────
                if (oldVer < 2) {
                    // categories 스토어 신규 생성
                    if (!db.objectStoreNames.contains("categories")) {
                        db.createObjectStore("categories", {
                            keyPath: "id", autoIncrement: true
                        });
                    }

                    const tx = e.target.transaction;

                    // parts 기존 레코드에 order 필드 부여 (tabId별 순차 부여)
                    const partsStore  = tx.objectStore("parts");
                    const tabCounters = {};
                    const partsCursor = partsStore.openCursor();

                    partsCursor.onsuccess = (ce) => {
                        const cursor = ce.target.result;
                        if (!cursor) return;

                        const record = cursor.value;
                        if (record.order === undefined || record.order === null) {
                            const tab = record.tabId || "unknown";
                            if (tabCounters[tab] === undefined) tabCounters[tab] = 0;
                            record.order = tabCounters[tab]++;
                            cursor.update(record);
                        }
                        cursor.continue();
                    };

                    // gallery 기존 레코드에 신규 필드 기본값 부여
                    const galleryStore  = tx.objectStore("gallery");
                    const galleryCursor = galleryStore.openCursor();

                    galleryCursor.onsuccess = (ce) => {
                        const cursor = ce.target.result;
                        if (!cursor) return;

                        const record = cursor.value;
                        let   dirty  = false;

                        if (record.name === undefined) {
                            record.name = _defaultName(record.createdAt);
                            dirty = true;
                        }
                        if (record.categoryId === undefined) {
                            record.categoryId = null;
                            dirty = true;
                        }
                        if (record.platform === undefined) {
                            record.platform = "default";
                            dirty = true;
                        }
                        if (record.size === undefined) {
                            record.size = 360;
                            dirty = true;
                        }

                        if (dirty) cursor.update(record);
                        cursor.continue();
                    };
                }
            };

            req.onsuccess = (e) => {
                _db = e.target.result;
                resolve();
            };

            req.onerror = (e) => {
                console.error("IndexedDB 열기 실패:", e.target.error);
                reject(e.target.error);
            };
        });
    }


    // --------------------------------------------------
    // 내부 헬퍼: 트랜잭션 + 스토어 반환
    // --------------------------------------------------
    function _store(storeName, mode = "readonly") {
        const tx = _db.transaction(storeName, mode);
        return tx.objectStore(storeName);
    }

    function _promisify(req) {
        return new Promise((resolve, reject) => {
            req.onsuccess = (e) => resolve(e.target.result);
            req.onerror   = (e) => reject(e.target.error);
        });
    }

    // 기본 파일명 생성: emoji_YYYYMMDD_HHMMSS
    function _defaultName(timestamp) {
        const d   = new Date(timestamp || Date.now());
        const pad = (n) => String(n).padStart(2, "0");
        const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
        const hms = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
        return `emoji_${ymd}_${hms}`;
    }


    // --------------------------------------------------
    // PARTS — 파츠 이미지 관리
    // --------------------------------------------------

    /**
     * 파츠 추가
     * @param {string} tabId    - 탭 id (face, ear, outfit, pose, background)
     * @param {string} name     - 파일명 (표시용 라벨)
     * @param {string} dataURL  - base64 이미지 데이터
     * @returns {Promise<number>} 저장된 id
     */
    function addPart(tabId, name, dataURL) {
        return new Promise((resolve, reject) => {
            const tx    = _db.transaction("parts", "readwrite");
            const store = tx.objectStore("parts");
            const index = store.index("tabId");
            const getReq = index.getAll(tabId);

            getReq.onsuccess = (e) => {
                const existing = e.target.result || [];
                const maxOrder = existing.reduce((m, p) => Math.max(m, p.order ?? -1), -1);

                const addReq = store.add({
                    tabId,
                    name,
                    dataURL,
                    order:     maxOrder + 1,
                    createdAt: Date.now()
                });

                addReq.onsuccess = (e) => resolve(e.target.result);
                addReq.onerror   = (e) => reject(e.target.error);
            };

            getReq.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * 특정 탭의 파츠 목록 조회 (order 오름차순)
     * @param {string} tabId
     * @returns {Promise<Array>}
     */
    function getPartsByTab(tabId) {
        return new Promise((resolve, reject) => {
            const store = _store("parts");
            const index = store.index("tabId");
            const req   = index.getAll(tabId);

            req.onsuccess = (e) => {
                const parts = (e.target.result || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                resolve(parts);
            };
            req.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * 파츠 단건 조회
     * @param {number} id
     * @returns {Promise<Object>}
     */
    function getPartById(id) {
        const store = _store("parts");
        return _promisify(store.get(id));
    }

    /**
     * 파츠 이름 수정 (빈 문자열 무시)
     * @param {number} id
     * @param {string} name
     * @returns {Promise<void>}
     */
    function updatePartName(id, name) {
        if (!name || !name.trim()) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const tx    = _db.transaction("parts", "readwrite");
            const store = tx.objectStore("parts");
            const getReq = store.get(id);

            getReq.onsuccess = (e) => {
                const record = e.target.result;
                if (!record) return reject(new Error(`Part id=${id} not found`));

                record.name      = name.trim();
                const putReq     = store.put(record);
                putReq.onsuccess = () => resolve();
                putReq.onerror   = (e) => reject(e.target.error);
            };

            getReq.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * 파츠 order 값 수정
     * @param {number} id
     * @param {number} order
     * @returns {Promise<void>}
     */
    function updatePartOrder(id, order) {
        return new Promise((resolve, reject) => {
            const tx    = _db.transaction("parts", "readwrite");
            const store = tx.objectStore("parts");
            const getReq = store.get(id);

            getReq.onsuccess = (e) => {
                const record = e.target.result;
                if (!record) return reject(new Error(`Part id=${id} not found`));

                record.order     = order;
                const putReq     = store.put(record);
                putReq.onsuccess = () => resolve();
                putReq.onerror   = (e) => reject(e.target.error);
            };

            getReq.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * 파츠 삭제
     * @param {number} id
     * @returns {Promise<void>}
     */
    function deletePart(id) {
        const store = _store("parts", "readwrite");
        return _promisify(store.delete(id));
    }


    // --------------------------------------------------
    // GALLERY — 완성작 관리
    // --------------------------------------------------

    /**
     * 갤러리에 이모티콘 저장
     * @param {string} dataURL
     * @param {object} [meta]  { name, categoryId, platform, size }
     * @returns {Promise<number>} 저장된 id
     */
    function saveToGallery(dataURL, meta = {}) {
        const store = _store("gallery", "readwrite");
        return _promisify(store.add({
            dataURL,
            name:       meta.name       || _defaultName(Date.now()),
            categoryId: meta.categoryId ?? null,
            platform:   meta.platform   || "default",
            size:       meta.size       || 360,
            createdAt:  Date.now()
        }));
    }

    /**
     * 갤러리 전체 조회 (최신순)
     * @returns {Promise<Array>}
     */
    function getAllGallery() {
        return new Promise((resolve, reject) => {
            const store = _store("gallery");
            const req   = store.getAll();
            req.onsuccess = (e) => resolve((e.target.result || []).reverse());
            req.onerror   = (e) => reject(e.target.error);
        });
    }

    /**
     * 갤러리 항목 부분 업데이트 (name, categoryId 등)
     * @param {number} id
     * @param {object} fields
     * @returns {Promise<void>}
     */
    function updateGalleryItem(id, fields) {
        return new Promise((resolve, reject) => {
            const tx    = _db.transaction("gallery", "readwrite");
            const store = tx.objectStore("gallery");
            const getReq = store.get(id);

            getReq.onsuccess = (e) => {
                const record = e.target.result;
                if (!record) return reject(new Error(`Gallery id=${id} not found`));

                Object.assign(record, fields);
                const putReq     = store.put(record);
                putReq.onsuccess = () => resolve();
                putReq.onerror   = (e) => reject(e.target.error);
            };

            getReq.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * 갤러리 항목 삭제
     * @param {number} id
     * @returns {Promise<void>}
     */
    function deleteFromGallery(id) {
        const store = _store("gallery", "readwrite");
        return _promisify(store.delete(id));
    }


    // --------------------------------------------------
    // CATEGORIES — 카테고리 관리 (v2 신규)
    // --------------------------------------------------

    /**
     * 카테고리 추가
     * @param {string} name
     * @returns {Promise<number>} 저장된 id
     */
    function addCategory(name) {
        const store = _store("categories", "readwrite");
        return _promisify(store.add({ name: name.trim(), createdAt: Date.now() }));
    }

    /**
     * 카테고리 전체 조회 (생성순)
     * @returns {Promise<Array>}
     */
    function getAllCategories() {
        return new Promise((resolve, reject) => {
            const store = _store("categories");
            const req   = store.getAll();
            req.onsuccess = (e) => {
                const cats = (e.target.result || []).sort((a, b) => a.createdAt - b.createdAt);
                resolve(cats);
            };
            req.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * 카테고리 삭제 + 해당 완성작 categoryId → null (미분류)
     * @param {number} id
     * @returns {Promise<void>}
     */
    function deleteCategory(id) {
        return new Promise((resolve, reject) => {
            const tx       = _db.transaction(["categories", "gallery"], "readwrite");
            const catStore = tx.objectStore("categories");
            const galStore = tx.objectStore("gallery");

            catStore.delete(id);

            const galReq = galStore.getAll();
            galReq.onsuccess = (e) => {
                (e.target.result || []).forEach(item => {
                    if (item.categoryId === id) {
                        item.categoryId = null;
                        galStore.put(item);
                    }
                });
            };

            tx.oncomplete = () => resolve();
            tx.onerror    = (e) => reject(e.target.error);
        });
    }


    // --------------------------------------------------
    // FAVS — 즐겨찾기 관리
    // --------------------------------------------------

    /**
     * 즐겨찾기 전체 조회
     * @returns {Promise<Set<number>>} partId Set
     */
    async function getAllFavs() {
        const store = _store("favs");
        const all   = await _promisify(store.getAll());
        return new Set(all.map(f => f.partId));
    }

    /**
     * 즐겨찾기 토글 (있으면 제거, 없으면 추가)
     * @param {number} partId
     * @returns {Promise<boolean>} 토글 후 상태 (true = 즐겨찾기됨)
     */
    async function toggleFav(partId) {
        const store    = _store("favs", "readwrite");
        const existing = await _promisify(store.get(partId));

        if (existing) {
            await _promisify(store.delete(partId));
            return false;
        } else {
            await _promisify(store.add({ partId }));
            return true;
        }
    }


    // --------------------------------------------------
    // 외부에 공개할 API
    // --------------------------------------------------
    return {
        init,
        // parts
        addPart,
        getPartsByTab,
        getPartById,
        updatePartName,
        updatePartOrder,
        deletePart,
        // gallery
        saveToGallery,
        getAllGallery,
        updateGalleryItem,
        deleteFromGallery,
        // categories
        addCategory,
        getAllCategories,
        deleteCategory,
        // favs
        getAllFavs,
        toggleFav
    };

})();