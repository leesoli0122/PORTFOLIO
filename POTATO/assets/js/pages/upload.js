// =============================================
// upload.js — 파츠 업로드 페이지
// =============================================

let _activeTabId = PARTS_CONFIG.tabs[0].id;
let _sortOrder   = "latest";   // "latest" | "name"

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
    const tabBar     = document.getElementById("upload-tab-bar");
    tabBar.innerHTML = "";

    PARTS_CONFIG.tabs.forEach(tab => {
        const btn       = document.createElement("button");
        btn.className   = "tab-btn" + (tab.id === _activeTabId ? " active" : "");
        btn.textContent = tab.label;
        btn.addEventListener("click", () => switchTab(tab.id));
        tabBar.appendChild(btn);
    });
}

// --------------------------------------------------
// 탭 전환
// --------------------------------------------------
async function switchTab(tabId) {
    _activeTabId = tabId;
    document.querySelectorAll("#upload-tab-bar .tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.textContent === PARTS_CONFIG.tabs.find(t => t.id === tabId).label);
    });
    await renderPartsList();
}

// --------------------------------------------------
// 이벤트 바인딩
// --------------------------------------------------
function bindEvents() {
    const selectBtn = document.getElementById("upload-select-btn");
    const fileInput = document.getElementById("upload-input");
    const dropArea  = document.getElementById("upload-drop-area");

    selectBtn.addEventListener("click", () => fileInput.click());

    dropArea.addEventListener("click", (e) => {
        if (e.target !== selectBtn) fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        handleFiles(Array.from(e.target.files));
        fileInput.value = "";
    });

    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.classList.add("drag-over");
    });
    dropArea.addEventListener("dragleave", () => dropArea.classList.remove("drag-over"));
    dropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dropArea.classList.remove("drag-over");
        handleFiles(Array.from(e.dataTransfer.files));
    });

    // 정렬 셀렉트
    document.getElementById("upload-sort-select").addEventListener("change", (e) => {
        _sortOrder = e.target.value === "name" ? "name" : "latest";
        renderPartsList();
    });
}

// --------------------------------------------------
// 파일 처리 → IndexedDB 저장
// --------------------------------------------------
async function handleFiles(files) {
    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
        showToast("이미지 파일만 업로드할 수 있어요");
        return;
    }

    let count = 0;
    for (const file of imageFiles) {
        try {
            const dataURL = await fileToDataURL(file);
            const name    = file.name.replace(/\.[^.]+$/, "");
            await DB.addPart(_activeTabId, name, dataURL);
            count++;
        } catch (err) {
            console.error("저장 실패:", file.name, err);
        }
    }

    if (count > 0) {
        showToast(`${count}개 파츠가 등록됐어요 ✨`);
        await renderPartsList();
    }
}

// --------------------------------------------------
// File → base64
// --------------------------------------------------
function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader   = new FileReader();
        reader.onload  = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// --------------------------------------------------
// 파츠 목록 렌더링
// --------------------------------------------------
async function renderPartsList() {
    const grid     = document.getElementById("upload-parts-grid");
    const countEl  = document.getElementById("upload-count");
    grid.innerHTML = "";

    let parts = await DB.getPartsByTab(_activeTabId);
    countEl.textContent = parts.length;

    // select 값 동기화
    const sortSel = document.getElementById("upload-sort-select");
    if (sortSel) sortSel.value = _sortOrder === "name" ? "name" : "newest";

    if (parts.length === 0) {
        grid.innerHTML = `<p class="upload-empty">아직 등록된 파츠가 없어요.<br>위에서 이미지를 선택해주세요.</p>`;
        return;
    }

    // ── 정렬 적용 ─────────────────────────────────
    if (_sortOrder === "latest") {
        parts = [...parts].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    } else {
        parts = [...parts].sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }

    parts.forEach(part => {
        const card         = document.createElement("div");
        card.className     = "upload-part-card";

        const img          = document.createElement("img");
        img.src            = part.dataURL;
        img.alt            = part.name;
        img.loading        = "lazy";

        // ── 이름 + 편집 영역 ──────────────────────────
        const nameRow      = document.createElement("div");
        nameRow.className  = "upload-name-row";

        const label        = document.createElement("span");
        label.className    = "upload-part-label";
        label.textContent  = part.name;

        const editBtn      = document.createElement("button");
        editBtn.className  = "upload-edit-btn";
        editBtn.textContent = "✏️";
        editBtn.title      = "이름 수정";
        editBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            startEditName(part, label, editBtn);
        });

        nameRow.appendChild(label);
        nameRow.appendChild(editBtn);

        // ── 삭제 버튼 ─────────────────────────────────
        const delBtn       = document.createElement("button");
        delBtn.className   = "upload-delete-btn";
        delBtn.textContent = "✕";
        delBtn.addEventListener("click", () => deletePart(part.id));

        card.appendChild(img);
        card.appendChild(nameRow);
        card.appendChild(delBtn);
        grid.appendChild(card);
    });
}

// --------------------------------------------------
// 이름 인라인 편집 시작
// --------------------------------------------------
function startEditName(part, labelEl, editBtn) {
    // 이미 편집 중이면 무시
    if (editBtn.classList.contains("editing")) return;

    const originalName = labelEl.textContent;

    // input 생성
    const input        = document.createElement("input");
    input.type         = "text";
    input.className    = "upload-name-input";
    input.value        = originalName;
    input.maxLength    = 40;

    // 라벨 → input 교체
    labelEl.replaceWith(input);
    editBtn.classList.add("editing");
    editBtn.textContent = "✔️";
    editBtn.title       = "저장";

    input.focus();
    input.select();

    // 저장 함수
    const save = async () => {
        const newName = input.value.trim();

        if (newName && newName !== originalName) {
            await DB.updatePartName(part.id, newName);
            part.name = newName;
            showToast("이름을 수정했어요 ✏️");
        }

        // input → 라벨 복원
        const restoredLabel       = document.createElement("span");
        restoredLabel.className   = "upload-part-label";
        restoredLabel.textContent = newName || originalName;
        input.replaceWith(restoredLabel);

        editBtn.classList.remove("editing");
        editBtn.textContent = "✏️";
        editBtn.title       = "이름 수정";

        // 편집 버튼 클릭 핸들러를 새 label 기준으로 재등록
        editBtn.onclick = (e) => {
            e.stopPropagation();
            startEditName(part, restoredLabel, editBtn);
        };
    };

    // 취소 함수
    const cancel = () => {
        const restoredLabel       = document.createElement("span");
        restoredLabel.className   = "upload-part-label";
        restoredLabel.textContent = originalName;
        input.replaceWith(restoredLabel);

        editBtn.classList.remove("editing");
        editBtn.textContent = "✏️";
        editBtn.title       = "이름 수정";

        editBtn.onclick = (e) => {
            e.stopPropagation();
            startEditName(part, restoredLabel, editBtn);
        };
    };

    // ✔️ 버튼 클릭 → 저장
    editBtn.onclick = (e) => {
        e.stopPropagation();
        save();
    };

    // Enter → 저장, Escape → 취소
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter")  { e.preventDefault(); save(); }
        if (e.key === "Escape") { e.preventDefault(); cancel(); }
    });

    // 포커스 아웃 → 저장
    input.addEventListener("blur", () => {
        // setTimeout: ✔️ 버튼 클릭과 blur 충돌 방지
        setTimeout(() => {
            if (document.activeElement !== editBtn) save();
        }, 150);
    });
}

// --------------------------------------------------
// 파츠 삭제
// --------------------------------------------------
async function deletePart(partId) {
    await DB.deletePart(partId);
    showToast("파츠를 삭제했어요");
    await renderPartsList();
}

// --------------------------------------------------
// 초기화
// --------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    await DB.init();
    buildTabBar();
    bindEvents();
    await renderPartsList();
});