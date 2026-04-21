// =============================================
// app.js — 페이지 라우팅 + 앱 초기화
// =============================================

const App = (() => {

    let _currentPage = "main";
    let _toastTimer  = null;

    async function navigateTo(pageId) {
        const current = document.getElementById(`page-${_currentPage}`);
        if (current) current.classList.add("hidden");

        const next = document.getElementById(`page-${pageId}`);
        if (!next) return;

        next.classList.remove("hidden");
        _currentPage = pageId;

        if (pageId === "maker")   await MakerPage.init();
        if (pageId === "upload")  await UploadPage.init();
        if (pageId === "gallery") await GalleryPage.init();
    }

    function showToast(message, duration = 2200) {
        const toast       = document.getElementById("toast");
        toast.textContent = message;
        toast.classList.remove("hidden");
        clearTimeout(_toastTimer);
        _toastTimer = setTimeout(() => toast.classList.add("hidden"), duration);
    }

    return { navigateTo, showToast };

})();


document.addEventListener("DOMContentLoaded", async () => {

    try {
        await DB.init();
    } catch (err) {
        console.error("DB 초기화 실패:", err);
        App.showToast("저장소 초기화에 실패했어요.");
        return;
    }

    // data-page 버튼 클릭 이벤트 — document가 아닌 #app에 단 1회만 등록
    document.getElementById("app").addEventListener("click", (e) => {
        const target = e.target.closest("[data-page]");
        if (target) App.navigateTo(target.dataset.page);
    });

    App.navigateTo("main");

});