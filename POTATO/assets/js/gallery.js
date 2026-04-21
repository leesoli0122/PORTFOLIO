// =============================================
// gallery.js — 갤러리 페이지 전담
// =============================================

const GalleryPage = (() => {

    let _currentItem = null;
    let _modalBound  = false;

    async function init() {
        if (!_modalBound) {
            _bindModalEvents();
            _modalBound = true;
        }
        await _renderGallery();
    }

    async function _renderGallery() {
        const grid     = document.getElementById("gallery-grid");
        const empty    = document.getElementById("gallery-empty");
        const countEl  = document.getElementById("gallery-count");
        grid.innerHTML = "";

        const items = await DB.getAllGallery();
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
            dateEl.textContent = _formatDate(item.createdAt);

            card.appendChild(img);
            card.appendChild(dateEl);
            // 갤러리 카드 클릭 시 모달 — data-page와 충돌 없도록 직접 바인딩
            card.addEventListener("click", (e) => {
                e.stopPropagation(); // #app 이벤트 위임으로 올라가지 않게 차단
                _openModal(item);
            });

            grid.appendChild(card);
        });
    }

    function _formatDate(timestamp) {
        const d   = new Date(timestamp);
        const pad = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
    }

    function _openModal(item) {
        _currentItem = item;
        document.getElementById("modal-img").src          = item.dataURL;
        document.getElementById("modal-date").textContent = _formatDate(item.createdAt);
        document.getElementById("modal-overlay").classList.remove("hidden");
    }

    function _closeModal() {
        document.getElementById("modal-overlay").classList.add("hidden");
        _currentItem = null;
    }

    function _bindModalEvents() {
        const overlay = document.getElementById("modal-overlay");

        // 오버레이 배경 클릭으로 닫기
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) _closeModal();
            // stopPropagation 제거 — modal-box 안 버튼들은 각자 처리
        });

        document.getElementById("modal-close").addEventListener("click", _closeModal);

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
            _closeModal();
            App.showToast("삭제했어요");
            await _renderGallery();
        });
    }

    return { init };

})();