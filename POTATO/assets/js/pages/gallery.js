// =============================================
// gallery.js — 갤러리 페이지
// =============================================

let _currentItem = null;

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
// 갤러리 렌더링
// --------------------------------------------------
async function renderGallery() {
    const grid     = document.getElementById("gallery-grid");
    const empty    = document.getElementById("gallery-empty");
    const countEl  = document.getElementById("gallery-count");
    grid.innerHTML = "";

    const items         = await DB.getAllGallery();
    countEl.textContent = `${items.length}개`;

    if (items.length === 0) {
        grid.classList.add("hidden");
        empty.classList.remove("hidden");
        return;
    }

    grid.classList.remove("hidden");
    empty.classList.add("hidden");

    items.forEach(item => {
        const card         = document.createElement("div");
        card.className     = "gallery-card";

        const img          = document.createElement("img");
        img.src            = item.dataURL;
        img.alt            = "이모티콘";
        img.loading        = "lazy";

        const dateEl       = document.createElement("p");
        dateEl.className   = "gallery-card-date";
        dateEl.textContent = formatDate(item.createdAt);

        card.appendChild(img);
        card.appendChild(dateEl);
        card.addEventListener("click", () => openModal(item));
        grid.appendChild(card);
    });
}

// --------------------------------------------------
// 날짜 포맷
// --------------------------------------------------
function formatDate(timestamp) {
    const d   = new Date(timestamp);
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

// --------------------------------------------------
// 모달
// --------------------------------------------------
function openModal(item) {
    _currentItem = item;
    document.getElementById("modal-img").src          = item.dataURL;
    document.getElementById("modal-date").textContent = formatDate(item.createdAt);
    document.getElementById("modal-overlay").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal-overlay").classList.add("hidden");
    _currentItem = null;
}

// --------------------------------------------------
// 이벤트 바인딩
// --------------------------------------------------
function bindEvents() {
    document.getElementById("modal-close").addEventListener("click", closeModal);

    document.getElementById("modal-overlay").addEventListener("click", (e) => {
        if (e.target === document.getElementById("modal-overlay")) closeModal();
    });

    document.getElementById("modal-download").addEventListener("click", () => {
        if (!_currentItem) return;
        const link    = document.createElement("a");
        link.href     = _currentItem.dataURL;
        link.download = `emoji_${_currentItem.id}.png`;
        link.click();
    });

    document.getElementById("modal-delete").addEventListener("click", async () => {
        if (!_currentItem) return;
        await DB.deleteFromGallery(_currentItem.id);
        closeModal();
        showToast("삭제했어요");
        await renderGallery();
    });
}

// --------------------------------------------------
// 초기화
// --------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    await DB.init();
    bindEvents();
    await renderGallery();
});