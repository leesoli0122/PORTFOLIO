// =============================================
// maker.js — 캐릭터 만들기 페이지
// =============================================

const _selected = {};
PARTS_CONFIG.tabs.forEach(t => { _selected[t.id] = null; });

let _activeTabId = PARTS_CONFIG.tabs[0].id;
let _favsOnly    = false;
let _favSet      = new Set();

const _canvas = document.getElementById("preview-canvas");
const _ctx    = _canvas.getContext("2d");

// --------------------------------------------------
// 토스트
// --------------------------------------------------
function showToast(message, duration = 2200) {
    const toast       = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.add("hidden"), duration);
}

// --------------------------------------------------
// 탭 바 생성
// --------------------------------------------------
function buildTabBar() {
    const tabBar     = document.getElementById("maker-tab-bar");
    tabBar.innerHTML = "";

    PARTS_CONFIG.tabs.forEach(tab => {
        const btn       = document.createElement("button");
        btn.className   = "tab-btn" + (tab.id === _activeTabId ? " active" : "");
        btn.textContent = tab.label;
        btn.setAttribute("role", "tab");
        btn.addEventListener("click", () => switchTab(tab.id));
        tabBar.appendChild(btn);
    });
}

// --------------------------------------------------
// 탭 전환
// --------------------------------------------------
async function switchTab(tabId) {
    _activeTabId = tabId;
    document.querySelectorAll("#maker-tab-bar .tab-btn").forEach((btn, i) => {
        btn.classList.toggle("active", PARTS_CONFIG.tabs[i].id === tabId);
    });
    document.getElementById("tab-title").textContent =
        PARTS_CONFIG.tabs.find(t => t.id === tabId)?.label ?? "";
    await renderPartsList(tabId);
}

// --------------------------------------------------
// 이벤트 바인딩
// --------------------------------------------------
function bindEvents() {
    // 카카오 저장 (360×360)
    document.getElementById("btn-save-kakao").addEventListener("click", async () => {
        const btn       = document.getElementById("btn-save-kakao");
        btn.disabled    = true;
        btn.textContent = "저장 중…";

        const ok = await SaveManager.saveAsPNG(
            _selected,
            PARTS_CONFIG.layerOrder,
            { platform: "kakao", canvasSize: SaveManager.CANVAS_SIZE_KAKAO }
        );
        showToast(ok ? "카카오용으로 저장됐어요 🎉 (360×360)" : "저장에 실패했어요. 다시 시도해주세요.");

        btn.disabled    = false;
        btn.textContent = "🐾 카카오 저장";
    });

    // OGQ 저장 (740×740)
    document.getElementById("btn-save-ogq").addEventListener("click", async () => {
        const btn       = document.getElementById("btn-save-ogq");
        btn.disabled    = true;
        btn.textContent = "저장 중…";

        const ok = await SaveManager.saveAsPNG(
            _selected,
            PARTS_CONFIG.layerOrder,
            { platform: "ogq", canvasSize: SaveManager.CANVAS_SIZE_OGQ }
        );
        showToast(ok ? "OGQ용으로 저장됐어요 🎉 (740×740)" : "저장에 실패했어요. 다시 시도해주세요.");

        btn.disabled    = false;
        btn.textContent = "🟢 OGQ 저장";
    });

    // 초기화
    document.getElementById("btn-reset").addEventListener("click", () => {
        PARTS_CONFIG.tabs.forEach(t => { _selected[t.id] = null; });
        renderCanvas();
        renderPartsList(_activeTabId);
        showToast("초기화됐어요");
    });

    // 랜덤
    document.getElementById("btn-random").addEventListener("click", async () => {
        for (const tab of PARTS_CONFIG.tabs) {
            const parts       = await DB.getPartsByTab(tab.id);
            _selected[tab.id] = parts.length > 0
                ? parts[Math.floor(Math.random() * parts.length)]
                : null;
        }
        renderCanvas();
        await renderPartsList(_activeTabId);
        showToast("랜덤 조합! 🎲");
    });

    // 즐겨찾기 필터
    document.getElementById("btn-fav-filter").addEventListener("click", async () => {
        _favsOnly = !_favsOnly;
        document.getElementById("btn-fav-filter").classList.toggle("active", _favsOnly);
        await renderPartsList(_activeTabId);
    });
}

// --------------------------------------------------
// 파츠 목록 렌더링
// --------------------------------------------------
async function renderPartsList(tabId) {
    const grid     = document.getElementById("parts-grid");
    grid.innerHTML = "";

    document.getElementById("tab-title").textContent =
        PARTS_CONFIG.tabs.find(t => t.id === tabId)?.label ?? "";

    let parts = await DB.getPartsByTab(tabId);
    if (_favsOnly) parts = parts.filter(p => _favSet.has(p.id));

    if (parts.length === 0) {
        const msg       = document.createElement("p");
        msg.className   = "empty-message";
        msg.innerHTML   = _favsOnly
            ? "즐겨찾기한 파츠가 없어요.<br>⭐ 버튼을 눌러 즐겨찾기를 추가하세요."
            : "등록된 파츠가 없어요.<br>📁 파츠 업로드에서 이미지를 추가하세요.";
        grid.appendChild(msg);
        return;
    }

    parts.forEach(part => {
        const card       = document.createElement("div");
        card.className   = "part-card";
        if (_selected[tabId]?.id === part.id) card.classList.add("selected");

        // 즐겨찾기 버튼
        const favBtn       = document.createElement("button");
        favBtn.className   = "fav-btn" + (_favSet.has(part.id) ? " starred" : "");
        favBtn.textContent = "★";
        favBtn.title       = "즐겨찾기";
        favBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const starred = await DB.toggleFav(part.id);
            _favSet       = await DB.getAllFavs();
            favBtn.classList.toggle("starred", starred);
            if (_favsOnly) await renderPartsList(tabId);
        });

        const img         = document.createElement("img");
        img.src           = part.dataURL;
        img.alt           = part.name;
        img.loading       = "lazy";

        const label       = document.createElement("span");
        label.className   = "part-label";
        label.textContent = part.name;

        card.appendChild(favBtn);
        card.appendChild(img);
        card.appendChild(label);
        card.addEventListener("click", () => onPartSelect(tabId, part, card));
        grid.appendChild(card);
    });
}

// --------------------------------------------------
// 파츠 선택
// --------------------------------------------------
function onPartSelect(tabId, part, clickedCard) {
    const isSame = _selected[tabId]?.id === part.id;
    document.querySelectorAll("#parts-grid .part-card.selected")
        .forEach(c => c.classList.remove("selected"));

    if (isSame) {
        _selected[tabId] = null;
    } else {
        _selected[tabId] = part;
        clickedCard.classList.add("selected");
    }
    renderCanvas();
}

// --------------------------------------------------
// 캔버스 렌더링
// --------------------------------------------------
function renderCanvas() {
    _ctx.clearRect(0, 0, _canvas.width, _canvas.height);

    PARTS_CONFIG.layerOrder.reduce((chain, layerId) => {
        return chain.then(() => {
            const part = _selected[layerId];
            if (!part?.dataURL) return Promise.resolve();

            return new Promise(resolve => {
                const img  = new Image();
                img.onload = () => { _ctx.drawImage(img, 0, 0, _canvas.width, _canvas.height); resolve(); };
                img.onerror = () => resolve();
                img.src    = part.dataURL;
            });
        });
    }, Promise.resolve());
}

// --------------------------------------------------
// 초기화
// --------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    await DB.init();
    _favSet = await DB.getAllFavs();
    buildTabBar();
    bindEvents();
    await renderPartsList(_activeTabId);
    renderCanvas();
});