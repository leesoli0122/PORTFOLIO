function initPreviewTabs() {
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.view-tab');
        if (!btn) return;

        const wrap = btn.closest('.view-wrap');
        if (!wrap) return;

        const targetId = btn.dataset.tab;

        // 버튼 active 제거
        wrap.querySelectorAll('.view-tab').forEach(tab => tab.classList.remove('active'));

        // 코드블럭 active 제거
        wrap.querySelectorAll(".view-pannel").forEach(panel => panel.classList.remove('active'));

        // 선택 활성화
        btn.classList.add('active');

        const target = wrap.querySelector('#' + targetId);
        if (target) target.classList.add('active');
    });
}