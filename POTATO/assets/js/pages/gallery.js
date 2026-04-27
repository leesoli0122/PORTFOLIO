// =============================================
// gallery.js — 갤러리 페이지 (14단계: 이름 붙이기 + 카테고리 분류)
// =============================================

let _currentItem   = null;   // 모달에 열린 항목
let _activeCatId   = "all";  // 현재 선택된 카테고리 탭 ('all' | 'uncat' | number)
let _categories    = [];     // 카테고리 목록 캐시
let _longPressTimer = null;  // 카테고리 탭 길게 누르기 타이머

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
// 날짜 포맷
// --------------------------------------------------
function formatDate(timestamp) {
    const d   = new Date(timestamp);
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

// --------------------------------------------------
// 카테고리 탭 바 렌더링
// --------------------------------------------------
async function renderCategoryBar() {
    _categories = await DB.getAllCategories();

    const bar = document.getElementById("category-tab-bar");
    bar.innerHTML = "";

    const tabs = [
        { id: "all",   label: "전체" },
        { id: "uncat", label: "미분류" },
        ..._categories.map(c => ({ id: c.id, label: c.name }))
    ];

    tabs.forEach(tab => {
        const btn       = document.createElement("button");
        btn.className   = "category-tab-btn" + (tab.id === _activeCatId ? " active" : "");
        btn.textContent = tab.label;
        btn.dataset.catId = String(tab.id);

        // 클릭: 탭 전환
        btn.addEventListener("click", () => {
            _activeCatId = tab.id === "all" || tab.id === "uncat" ? tab.id : Number(tab.id);
            renderCategoryBar();
            renderGallery();
        });

        // 길게 누르기: 사용자 생성 카테고리만 삭제 옵션 표시
        if (typeof tab.id === "number" || (typeof tab.id !== "string")) {
            // number인 경우
        }
        if (tab.id !== "all" && tab.id !== "uncat") {
            btn.addEventListener("pointerdown", () => {
                _longPressTimer = setTimeout(() => {
                    if (confirm(`"${tab.label}" 카테고리를 삭제할까요?\n해당 완성작은 미분류로 이동해요.`)) {
                        deleteCategory(tab.id);
                    }
                }, 700);
            });
            btn.addEventListener("pointerup",    () => clearTimeout(_longPressTimer));
            btn.addEventListener("pointerleave", () => clearTimeout(_longPressTimer));
        }

        bar.appendChild(btn);
    });
}

// --------------------------------------------------
// 카테고리 삭제
// --------------------------------------------------
async function deleteCategory(catId) {
    await DB.deleteCategory(catId);
    if (_activeCatId === catId) _activeCatId = "all";
    showToast("카테고리를 삭제했어요");
    await renderCategoryBar();
    await renderGallery();
    await _syncCategorySelects();
}

// --------------------------------------------------
// 카테고리 <select> 옵션 동기화 (모달들)
// --------------------------------------------------
async function _syncCategorySelects() {
    _categories = await DB.getAllCategories();
    const selects = [
        document.getElementById("modal-category-select"),
        document.getElementById("name-modal-category")
    ];
    selects.forEach(sel => {
        if (!sel) return;
        const prev = sel.value;
        sel.innerHTML = `<option value="">미분류</option>`;
        _categories.forEach(c => {
            const opt   = document.createElement("option");
            opt.value   = c.id;
            opt.text    = c.name;
            sel.appendChild(opt);
        });
        sel.value = prev; // 가능한 한 이전 선택 유지
    });
}

// --------------------------------------------------
// 갤러리 렌더링
// --------------------------------------------------
async function renderGallery() {
    const grid    = document.getElementById("gallery-grid");
    const empty   = document.getElementById("gallery-empty");
    const countEl = document.getElementById("gallery-count");
    grid.innerHTML = "";

    const allItems = await DB.getAllGallery();

    // 카테고리 필터
    let items;
    if (_activeCatId === "all") {
        items = allItems;
    } else if (_activeCatId === "uncat") {
        items = allItems.filter(i => i.categoryId === null || i.categoryId === undefined);
    } else {
        items = allItems.filter(i => i.categoryId === _activeCatId);
    }

    countEl.textContent = `${items.length}개`;

    if (items.length === 0) {
        grid.classList.add("hidden");
        empty.classList.remove("hidden");
        return;
    }

    grid.classList.remove("hidden");
    empty.classList.add("hidden");

    items.forEach(item => {
        const card     = document.createElement("div");
        card.className = "gallery-card";

        const img    = document.createElement("img");
        img.src      = item.dataURL;
        img.alt      = item.name || "이모티콘";
        img.loading  = "lazy";

        // 이름 표시
        const nameEl       = document.createElement("p");
        nameEl.className   = "gallery-card-name";
        nameEl.textContent = item.name || "";

        const dateEl       = document.createElement("p");
        dateEl.className   = "gallery-card-date";
        dateEl.textContent = formatDate(item.createdAt);

        card.appendChild(img);
        if (item.name) card.appendChild(nameEl);
        card.appendChild(dateEl);
        card.addEventListener("click", () => openModal(item));
        grid.appendChild(card);
    });
}

// --------------------------------------------------
// 상세 모달 열기
// --------------------------------------------------
async function openModal(item) {
    _currentItem = item;

    document.getElementById("modal-img").src          = item.dataURL;
    document.getElementById("modal-date").textContent = formatDate(item.createdAt);
    document.getElementById("modal-name").textContent = item.name || "";

    // 카테고리 select 동기화
    await _syncCategorySelects();
    const catSel   = document.getElementById("modal-category-select");
    catSel.value   = item.categoryId != null ? String(item.categoryId) : "";

    document.getElementById("modal-overlay").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal-overlay").classList.add("hidden");
    _currentItem = null;
}

// --------------------------------------------------
// 모달 내 이름 인라인 수정
// --------------------------------------------------
function startModalNameEdit() {
    const nameEl  = document.getElementById("modal-name");
    const editBtn = document.getElementById("modal-name-edit");
    if (editBtn.classList.contains("editing")) return;

    const original = nameEl.textContent;

    const input     = document.createElement("input");
    input.type      = "text";
    input.className = "modal-name-input";
    input.value     = original;
    input.maxLength = 40;

    nameEl.replaceWith(input);
    editBtn.classList.add("editing");
    editBtn.textContent = "✔️";
    input.focus();
    input.select();

    const save = async () => {
        const newName = input.value.trim() || original;
        if (newName !== original) {
            await DB.updateGalleryItem(_currentItem.id, { name: newName });
            _currentItem.name = newName;
            showToast("이름을 수정했어요 ✏️");
        }
        const span       = document.createElement("span");
        span.id          = "modal-name";
        span.className   = "modal-name-label";
        span.textContent = newName;
        input.replaceWith(span);
        editBtn.classList.remove("editing");
        editBtn.textContent = "✏️";
        await renderGallery();
    };

    editBtn.onclick = (e) => { e.stopPropagation(); save(); };
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter")  { e.preventDefault(); save(); }
        if (e.key === "Escape") {
            const span       = document.createElement("span");
            span.id          = "modal-name";
            span.className   = "modal-name-label";
            span.textContent = original;
            input.replaceWith(span);
            editBtn.classList.remove("editing");
            editBtn.textContent = "✏️";
        }
    });
    input.addEventListener("blur", () => {
        setTimeout(() => { if (document.activeElement !== editBtn) save(); }, 150);
    });
}

// --------------------------------------------------
// 카테고리 추가 모달
// --------------------------------------------------
function openCatModal() {
    const input = document.getElementById("cat-modal-input");
    input.value = "";
    document.getElementById("cat-modal-overlay").classList.remove("hidden");
    setTimeout(() => input.focus(), 50);
}

function closeCatModal() {
    document.getElementById("cat-modal-overlay").classList.add("hidden");
}

async function confirmAddCategory() {
    const name = document.getElementById("cat-modal-input").value.trim();
    if (!name) { showToast("카테고리 이름을 입력해주세요"); return; }
    await DB.addCategory(name);
    closeCatModal();
    showToast(`"${name}" 카테고리를 추가했어요 ✨`);
    await renderCategoryBar();
    await _syncCategorySelects();
}

// --------------------------------------------------
// 이름 입력 모달 (저장 직후 — maker.html에서 postMessage로 호출 가능)
// 단독으로 갤러리 페이지에서 최신 항목에 대해 이름 지정 시 사용
// --------------------------------------------------
async function openNameModal(galleryId) {
    await _syncCategorySelects();
    const overlay = document.getElementById("name-modal-overlay");
    const input   = document.getElementById("name-modal-input");
    input.value   = "";
    overlay.classList.remove("hidden");
    setTimeout(() => input.focus(), 50);

    const confirm = async () => {
        const name     = input.value.trim();
        const catVal   = document.getElementById("name-modal-category").value;
        const catId    = catVal ? Number(catVal) : null;
        const fields   = { categoryId: catId };
        if (name) fields.name = name;
        await DB.updateGalleryItem(galleryId, fields);
        overlay.classList.add("hidden");
        await renderGallery();
    };

    document.getElementById("name-modal-confirm").onclick = confirm;
    document.getElementById("name-modal-skip").onclick    = () => {
        overlay.classList.add("hidden");
        renderGallery();
    };
    document.getElementById("name-modal-input").onkeydown = (e) => {
        if (e.key === "Enter") { e.preventDefault(); confirm(); }
    };
}

// --------------------------------------------------
// 이벤트 바인딩
// --------------------------------------------------
function bindEvents() {
    // 상세 모달
    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal-overlay").addEventListener("click", (e) => {
        if (e.target === document.getElementById("modal-overlay")) closeModal();
    });

    document.getElementById("modal-name-edit").addEventListener("click", startModalNameEdit);

    // 카테고리 변경 (상세 모달)
    document.getElementById("modal-category-select").addEventListener("change", async (e) => {
        if (!_currentItem) return;
        const catId = e.target.value ? Number(e.target.value) : null;
        await DB.updateGalleryItem(_currentItem.id, { categoryId: catId });
        _currentItem.categoryId = catId;
        showToast("카테고리를 변경했어요");
        await renderGallery();
    });

    // 다운로드
    document.getElementById("modal-download").addEventListener("click", () => {
        if (!_currentItem) return;
        const link    = document.createElement("a");
        link.href     = _currentItem.dataURL;
        link.download = `${_currentItem.name || "emoji"}_${_currentItem.id}.png`;
        link.click();
    });

    // 삭제
    document.getElementById("modal-delete").addEventListener("click", async () => {
        if (!_currentItem) return;
        await DB.deleteFromGallery(_currentItem.id);
        closeModal();
        showToast("삭제했어요");
        await renderGallery();
    });

    // 카테고리 추가 버튼
    document.getElementById("btn-add-category").addEventListener("click", openCatModal);

    // 카테고리 추가 모달
    document.getElementById("cat-modal-confirm").addEventListener("click", confirmAddCategory);
    document.getElementById("cat-modal-cancel").addEventListener("click",  closeCatModal);
    document.getElementById("cat-modal-overlay").addEventListener("click", (e) => {
        if (e.target === document.getElementById("cat-modal-overlay")) closeCatModal();
    });
    document.getElementById("cat-modal-input").addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); confirmAddCategory(); }
    });

    // 이름 입력 모달 — 배경 클릭 닫기 방지 (실수 방지)
    document.getElementById("name-modal-overlay").addEventListener("click", (e) => {
        if (e.target === document.getElementById("name-modal-overlay")) {
            document.getElementById("name-modal-overlay").classList.add("hidden");
        }
    });
}

// --------------------------------------------------
// 초기화
// --------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    await DB.init();
    bindEvents();
    await renderCategoryBar();
    await _syncCategorySelects();
    await renderGallery();
});