// =============================================
// db.js — IndexedDB 전담 모듈
//
// 저장소 구조:
//   parts   : 업로드한 파츠 이미지 (탭별 분류)
//   gallery : 완성된 이모티콘 PNG
//   favs    : 즐겨찾기 파츠 ID 목록
// =============================================

const DB = (() => {

    const DB_NAME    = "emoji-maker";
    const DB_VERSION = 1;
    let   _db        = null;

    // --------------------------------------------------
    // 초기화: 앱 시작 시 한 번 호출
    // --------------------------------------------------
    function init() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);

            // DB 최초 생성 or 버전 업그레이드 시 스토어 생성
            req.onupgradeneeded = (e) => {
                const db = e.target.result;

                // parts 스토어: { id, tabId, name, dataURL, createdAt }
                if (!db.objectStoreNames.contains("parts")) {
                    const store = db.createObjectStore("parts", { keyPath: "id", autoIncrement: true });
                    store.createIndex("tabId", "tabId", { unique: false });
                }

                // gallery 스토어: { id, dataURL, createdAt }
                if (!db.objectStoreNames.contains("gallery")) {
                    db.createObjectStore("gallery", { keyPath: "id", autoIncrement: true });
                }

                // favs 스토어: { partId } — partId를 key로 사용
                if (!db.objectStoreNames.contains("favs")) {
                    db.createObjectStore("favs", { keyPath: "partId" });
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
        const store = _store("parts", "readwrite");
        return _promisify(store.add({
            tabId,
            name,
            dataURL,
            createdAt: Date.now()
        }));
    }

    /**
     * 특정 탭의 파츠 목록 조회
     * @param {string} tabId
     * @returns {Promise<Array>}
     */
    function getPartsByTab(tabId) {
        return new Promise((resolve, reject) => {
            const store = _store("parts");
            const index = store.index("tabId");
            const req   = index.getAll(tabId);
            req.onsuccess = (e) => resolve(e.target.result);
            req.onerror   = (e) => reject(e.target.error);
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
     * 파츠 삭제
     * @param {number} id
     * @returns {Promise}
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
     * @returns {Promise<number>} 저장된 id
     */
    function saveToGallery(dataURL) {
        const store = _store("gallery", "readwrite");
        return _promisify(store.add({
            dataURL,
            createdAt: Date.now()
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
            req.onsuccess = (e) => resolve(e.target.result.reverse());
            req.onerror   = (e) => reject(e.target.error);
        });
    }

    /**
     * 갤러리 항목 삭제
     * @param {number} id
     * @returns {Promise}
     */
    function deleteFromGallery(id) {
        const store = _store("gallery", "readwrite");
        return _promisify(store.delete(id));
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
        deletePart,
        // gallery
        saveToGallery,
        getAllGallery,
        deleteFromGallery,
        // favs
        getAllFavs,
        toggleFav
    };

})();