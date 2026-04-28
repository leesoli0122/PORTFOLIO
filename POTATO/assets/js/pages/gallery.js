// gallery.js — 갤러리 페이지 (14단계)

let _currentItem    = null;
let _activeCatId    = "all";
let _categories     = [];
let _longPressTimer = null;

function showToast(message, duration = 2200) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.add("hidden"), duration);
}

function formatDate(timestamp) {
    const d = new Date(timestamp);
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

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
        const btn = document.createElement("button");
        btn.className = "category-tab-btn" + (tab.id === _activeCatId ? " active" : "");
        btn.textContent = tab.label;
        btn.dataset.catId = String(tab.id);
        btn.addEventListener("click", () => {
            _activeCatId = (tab.id === "all" || tab.id === "uncat") ? tab.id : Number(tab.id);
            renderCategoryBar();
            renderGallery();
        });
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

async function deleteCategory(catId) {
    await DB.deleteCategory(catId);
    if (_activeCatId === catId) _activeCatId = "all";
    showToast("카테고리를 삭제했어요");
    await renderCategoryBar();
    await renderGallery();
    await _syncCategorySelects();
}

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
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.text  = c.name;
            sel.appendChild(opt);
        });
        sel.value = prev;
    });
}

async function renderGallery() {
    const grid    = document.getElementById("gallery-grid");
    const empty   = document.getElementById("gallery-empty");
    const countEl = document.getElementById("gallery-count");
    grid.innerHTML = "";
    const allItems = await DB.getAllGallery();
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
        const card = document.createElement("div");
        card.className = "gallery-card";
        const img = document.createElement("img");
        img.src     = item.dataURL;
        img.alt     = item.name || "이모티콘";
        img.loading = "lazy";
        const nameEl = document.createElement("p");
        nameEl.className   = "gallery-card-name";
        nameEl.textContent = item.name || "";
        const dateEl = document.createElement("p");
        dateEl.className   = "gallery-card-date";
        dateEl.textContent = formatDate(item.createdAt);
        card.appendChild(img);
        if (item.name) card.appendChild(nameEl);
        card.appendChild(dateEl);
        card.addEventListener("click", () => openModal(item));
        grid.appendChild(card);
    });
}

async function openModal(item) {
    _currentItem = item;
    document.getElementById("modal-img").src          = item.dataURL;
    document.getElementById("modal-date").textContent = formatDate(item.createdAt);
    document.getElementById("modal-name").textContent = item.name || "";
    await _syncCategorySelects();
    const catSel = document.getElementById("modal-category-select");
    catSel.value = item.categoryId != null ? String(item.categoryId) : "";
    document.getElementById("modal-overlay").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal-overlay").classList.add("hidden");
    _currentItem = null;
}

function startModalNameEdit() {
    const nameEl  = document.getElementById("modal-name");
    const editBtn = document.getElementById("modal-name-edit");
    if (editBtn.classList.contains("editing")) return;
    const original = nameEl.textContent;
    const input    = document.createElement("input");
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
        const span = document.createElement("span");
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
            const span = document.createElement("span");
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

async function openNameModal(galleryId) {
    await _syncCategorySelects();
    const overlay = document.getElementById("name-modal-overlay");
    const input   = document.getElementById("name-modal-input");
    input.value   = "";
    overlay.classList.remove("hidden");
    setTimeout(() => input.focus(), 50);
    const confirm = async () => {
        const name   = input.value.trim();
        const catVal = document.getElementById("name-modal-category").value;
        const catId  = catVal ? Number(catVal) : null;
        const fields = { categoryId: catId };
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

function bindEvents() {
    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal-overlay").addEventListener("click", (e) => {
        if (e.target === document.getElementById("modal-overlay")) closeModal();
    });
    document.getElementById("modal-name-edit").addEventListener("click", startModalNameEdit);
    document.getElementById("modal-category-select").addEventListener("change", async (e) => {
        if (!_currentItem) return;
        const catId = e.target.value ? Number(e.target.value) : null;
        await DB.updateGalleryItem(_currentItem.id, { categoryId: catId });
        _currentItem.categoryId = catId;
        showToast("카테고리를 변경했어요");
        await renderGallery();
    });
    document.getElementById("modal-download").addEventListener("click", () => {
        if (!_currentItem) return;
        const link    = document.createElement("a");
        link.href     = _currentItem.dataURL;
        link.download = `${_currentItem.name || "emoji"}_${_currentItem.id}.png`;
        link.click();
    });
    document.getElementById("modal-delete").addEventListener("click", async () => {
        if (!_currentItem) return;
        await DB.deleteFromGallery(_currentItem.id);
        closeModal();
        showToast("삭제했어요");
        await renderGallery();
    });
    document.getElementById("btn-add-category").addEventListener("click", openCatModal);
    document.getElementById("cat-modal-confirm").addEventListener("click", confirmAddCategory);
    document.getElementById("cat-modal-cancel").addEventListener("click", closeCatModal);
    document.getElementById("cat-modal-overlay").addEventListener("click", (e) => {
        if (e.target === document.getElementById("cat-modal-overlay")) closeCatModal();
    });
    document.getElementById("cat-modal-input").addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); confirmAddCategory(); }
    });
    document.getElementById("name-modal-overlay").addEventListener("click", (e) => {
        if (e.target === document.getElementById("name-modal-overlay")) {
            document.getElementById("name-modal-overlay").classList.add("hidden");
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await DB.init();
    bindEvents();
    await renderCategoryBar();
    await _syncCategorySelects();
    await renderGallery();
});