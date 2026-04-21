// =============================================
// maker.js — 메이커 페이지 전담
// =============================================

const MakerPage = (() => {

    // 현재 선택된 파츠: { tabId: partObject | null }
    const _selected = {};
    PARTS_CONFIG.tabs.forEach(t => { _selected[t.id] = null; });

    let _activeTabId    = PARTS_CONFIG.tabs[0].id;
    let _favsOnly       = false;        // 즐겨찾기 필터 상태
    let _favSet         = new Set();    // 즐겨찾기 partId 집합

    const _canvas   = document.getElementById("preview-canvas");
    const _ctx      = _canvas.getContext("2d");

    // --------------------------------------------------
    // 페이지 진입 시 초기화
    // --------------------------------------------------
    async function init() {
        _favSet = await DB.getAllFavs();
        _buildTabBar();
        _bindEvents();
        await _renderPartsList(_activeTabId);
        _renderCanvas();
    }

    // --------------------------------------------------
    // 탭 바 생성
    // --------------------------------------------------
    function _buildTabBar() {
        const tabBar    = document.getElementById("maker-tab-bar");
        tabBar.innerHTML = "";

        PARTS_CONFIG.tabs.forEach(tab => {
            const btn       = document.createElement("button");
            btn.className   = "tab-btn" + (tab.id === _activeTabId ? " active" : "");
            btn.textContent = tab.label;
            btn.dataset.tab = tab.id;
            btn.setAttribute("role", "tab");
            btn.addEventListener("click", () => _switchTab(tab.id));
            tabBar.appendChild(btn);
        });
    }

    // --------------------------------------------------
    // 탭 전환
    // --------------------------------------------------
    async function _switchTab(tabId) {
        _activeTabId = tabId;

        document.querySelectorAll("#maker-tab-bar .tab-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.tab === tabId);
        });

        document.getElementById("tab-title").textContent =
            PARTS_CONFIG.tabs.find(t => t.id === tabId)?.label ?? "";

        await _renderPartsList(tabId);
    }

    // --------------------------------------------------
    // 이벤트 바인딩
    // --------------------------------------------------
    function _bindEvents() {
        // 저장 버튼
        document.getElementById("btn-save").addEventListener("click", async () => {
            const btn       = document.getElementById("btn-save");
            btn.disabled    = true;
            btn.textContent = "저장 중…";

            const ok = await SaveManager.saveAsPNG(_selected, PARTS_CONFIG.layerOrder);
            if (ok) {
                App.showToast("저장됐어요! 갤러리에서 확인하세요 🎉");
            } else {
                App.showToast("저장에 실패했어요. 다시 시도해주세요.");
            }

            btn.disabled    = false;
            btn.textContent = "💾 저장";
        });

        // 초기화 버튼
        document.getElementById("btn-reset").addEventListener("click", () => {
            PARTS_CONFIG.tabs.forEach(t => { _selected[t.id] = null; });
            _renderCanvas();
            _renderPartsList(_activeTabId);
            App.showToast("초기화됐어요");
        });

        // 랜덤 버튼
        document.getElementById("btn-random").addEventListener("click", async () => {
            for (const tab of PARTS_CONFIG.tabs) {
                const parts = await DB.getPartsByTab(tab.id);
                if (parts.length > 0) {
                    _selected[tab.id] = parts[Math.floor(Math.random() * parts.length)];
                } else {
                    _selected[tab.id] = null;
                }
            }
            _renderCanvas();
            await _renderPartsList(_activeTabId);
            App.showToast("랜덤 조합! 🎲");
        });

        // 즐겨찾기 필터 버튼
        document.getElementById("btn-fav-filter").addEventListener("click", async () => {
            _favsOnly = !_favsOnly;
            document.getElementById("btn-fav-filter").classList.toggle("active", _favsOnly);
            await _renderPartsList(_activeTabId);
        });
    }

    // --------------------------------------------------
    // 파츠 목록 렌더링
    // --------------------------------------------------
    async function _renderPartsList(tabId) {
        const grid      = document.getElementById("parts-grid");
        grid.innerHTML  = "";

        document.getElementById("tab-title").textContent =
            PARTS_CONFIG.tabs.find(t => t.id === tabId)?.label ?? "";

        let parts = await DB.getPartsByTab(tabId);

        // 즐겨찾기 필터
        if (_favsOnly) {
            parts = parts.filter(p => _favSet.has(p.id));
        }

        if (parts.length === 0) {
            const msg = document.createElement("p");
            msg.className   = "empty-message";
            msg.innerHTML   = _favsOnly
                ? "즐겨찾기한 파츠가 없어요.<br>⭐ 버튼을 눌러 즐겨찾기를 추가하세요."
                : "등록된 파츠가 없어요.<br>📁 파츠 업로드에서 이미지를 추가하세요.";
            grid.appendChild(msg);
            return;
        }

        parts.forEach(part => {
            const card          = document.createElement("div");
            card.className      = "part-card";
            if (_selected[tabId]?.id === part.id) card.classList.add("selected");

            // 즐겨찾기 별 버튼
            const favBtn        = document.createElement("button");
            favBtn.className    = "fav-btn" + (_favSet.has(part.id) ? " starred" : "");
            favBtn.textContent  = "★";
            favBtn.title        = "즐겨찾기";
            favBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const isNowStarred  = await DB.toggleFav(part.id);
                _favSet             = await DB.getAllFavs();
                favBtn.classList.toggle("starred", isNowStarred);
                if (_favsOnly) await _renderPartsList(tabId);
            });

            const img           = document.createElement("img");
            img.src             = part.dataURL;
            img.alt             = part.name;
            img.loading         = "lazy";

            const label         = document.createElement("span");
            label.className     = "part-label";
            label.textContent   = part.name;

            card.appendChild(favBtn);
            card.appendChild(img);
            card.appendChild(label);

            card.addEventListener("click", () => _onPartSelect(tabId, part, card));
            grid.appendChild(card);
        });
    }

    // --------------------------------------------------
    // 파츠 선택 처리
    // --------------------------------------------------
    function _onPartSelect(tabId, part, clickedCard) {
        const isSame = _selected[tabId]?.id === part.id;

        // 기존 선택 해제
        document.querySelectorAll("#parts-grid .part-card.selected")
            .forEach(c => c.classList.remove("selected"));

        if (isSame) {
            _selected[tabId] = null;
        } else {
            _selected[tabId] = part;
            clickedCard.classList.add("selected");
        }

        _renderCanvas();
    }

    // --------------------------------------------------
    // 캔버스 렌더링 (레이어 순서 보장)
    // --------------------------------------------------
    function _renderCanvas() {
        _ctx.clearRect(0, 0, _canvas.width, _canvas.height);

        // 레이어를 순서대로 직렬 처리
        PARTS_CONFIG.layerOrder.reduce((chain, layerId) => {
            return chain.then(() => {
                const part = _selected[layerId];
                if (!part?.dataURL) return Promise.resolve();

                return new Promise(resolve => {
                    const img       = new Image();
                    img.onload      = () => { _ctx.drawImage(img, 0, 0, _canvas.width, _canvas.height); resolve(); };
                    img.onerror     = () => resolve();
                    img.src         = part.dataURL;
                });
            });
        }, Promise.resolve());
    }

    // --------------------------------------------------
    // 외부 공개
    // --------------------------------------------------
    return { init };

})();