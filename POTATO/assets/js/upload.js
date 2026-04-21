// =============================================
// upload.js — 파츠 업로드 페이지 전담
// =============================================

const UploadPage = (() => {

    let _activeTabId = PARTS_CONFIG.tabs[0].id;  // 현재 선택된 탭

    // --------------------------------------------------
    // 페이지 진입 시 초기화
    // --------------------------------------------------
    async function init() {
        _buildTabBar();
        _bindEvents();
        await _renderPartsList();
    }

    // --------------------------------------------------
    // 탭 바 생성
    // --------------------------------------------------
    function _buildTabBar() {
        const tabBar = document.getElementById("upload-tab-bar");
        tabBar.innerHTML = "";

        PARTS_CONFIG.tabs.forEach(tab => {
            const btn       = document.createElement("button");
            btn.className   = "tab-btn" + (tab.id === _activeTabId ? " active" : "");
            btn.textContent = tab.label;
            btn.dataset.tab = tab.id;
            btn.addEventListener("click", () => _switchTab(tab.id));
            tabBar.appendChild(btn);
        });
    }

    // --------------------------------------------------
    // 탭 전환
    // --------------------------------------------------
    async function _switchTab(tabId) {
        _activeTabId = tabId;

        document.querySelectorAll("#upload-tab-bar .tab-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.tab === tabId);
        });

        await _renderPartsList();
    }

    // --------------------------------------------------
    // 이벤트 바인딩
    // --------------------------------------------------
    function _bindEvents() {
        const selectBtn  = document.getElementById("upload-select-btn");
        const fileInput  = document.getElementById("upload-input");
        const dropArea   = document.getElementById("upload-drop-area");

        // 버튼 클릭 → 파일 선택 창 열기
        selectBtn.addEventListener("click", () => fileInput.click());
        dropArea.addEventListener("click", (e) => {
            if (e.target !== selectBtn) fileInput.click();
        });

        // 파일 선택됐을 때
        fileInput.addEventListener("change", (e) => {
            _handleFiles(Array.from(e.target.files));
            fileInput.value = "";   // 같은 파일 재선택 허용
        });

        // iPad 드래그 앤 드롭 (선택 사항)
        dropArea.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropArea.classList.add("drag-over");
        });
        dropArea.addEventListener("dragleave", () => dropArea.classList.remove("drag-over"));
        dropArea.addEventListener("drop", (e) => {
            e.preventDefault();
            dropArea.classList.remove("drag-over");
            _handleFiles(Array.from(e.dataTransfer.files));
        });
    }

    // --------------------------------------------------
    // 파일 처리 → IndexedDB 저장
    // --------------------------------------------------
    async function _handleFiles(files) {
        const imageFiles = files.filter(f => f.type.startsWith("image/"));

        if (imageFiles.length === 0) {
            App.showToast("이미지 파일만 업로드할 수 있어요");
            return;
        }

        let successCount = 0;

        for (const file of imageFiles) {
            try {
                const dataURL = await _fileToDataURL(file);
                // 파일명에서 확장자 제거해서 라벨로 사용
                const name    = file.name.replace(/\.[^.]+$/, "");
                await DB.addPart(_activeTabId, name, dataURL);
                successCount++;
            } catch (err) {
                console.error("파일 저장 실패:", file.name, err);
            }
        }

        if (successCount > 0) {
            App.showToast(`${successCount}개 파츠가 등록됐어요 ✨`);
            await _renderPartsList();
        }
    }

    // --------------------------------------------------
    // File → base64 dataURL 변환
    // --------------------------------------------------
    function _fileToDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader    = new FileReader();
            reader.onload   = (e) => resolve(e.target.result);
            reader.onerror  = reject;
            reader.readAsDataURL(file);
        });
    }

    // --------------------------------------------------
    // 등록된 파츠 목록 렌더링
    // --------------------------------------------------
    async function _renderPartsList() {
        const grid      = document.getElementById("upload-parts-grid");
        const countEl   = document.getElementById("upload-count");
        grid.innerHTML  = "";

        const parts = await DB.getPartsByTab(_activeTabId);
        countEl.textContent = parts.length;

        if (parts.length === 0) {
            grid.innerHTML = `<p class="upload-empty">아직 등록된 파츠가 없어요.<br>위에서 이미지를 선택해주세요.</p>`;
            return;
        }

        parts.forEach(part => {
            const card          = document.createElement("div");
            card.className      = "upload-part-card";

            const img           = document.createElement("img");
            img.src             = part.dataURL;
            img.alt             = part.name;
            img.loading         = "lazy";

            const label         = document.createElement("span");
            label.className     = "upload-part-label";
            label.textContent   = part.name;

            const delBtn        = document.createElement("button");
            delBtn.className    = "upload-delete-btn";
            delBtn.textContent  = "✕";
            delBtn.title        = "삭제";
            delBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                _deletePart(part.id);
            });

            card.appendChild(img);
            card.appendChild(label);
            card.appendChild(delBtn);
            grid.appendChild(card);
        });
    }

    // --------------------------------------------------
    // 파츠 삭제
    // --------------------------------------------------
    async function _deletePart(partId) {
        await DB.deletePart(partId);
        // 즐겨찾기에도 있으면 함께 제거
        const favs = await DB.getAllFavs();
        if (favs.has(partId)) {
            await DB.toggleFav(partId);
        }
        App.showToast("파츠를 삭제했어요");
        await _renderPartsList();
    }

    // --------------------------------------------------
    // 외부 공개
    // --------------------------------------------------
    return { init };

})();