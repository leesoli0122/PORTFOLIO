/* =========================================
    GUIDE SPA SYSTEM

    실행 순서

    1?? DOM 준비
    2?? restoreStatus() → localStorage 상태 복원
    3?? statusManager.init() → 텍스트 + 카운트 계산
    4?? loadInitial() → 첫 화면 로딩
========================================= */
$(document).ready(function () {

    /* ===============================
        1. 다크 / 라이트 모드
    =============================== */

    const btnLight = document.getElementById('btn-light');
    const btnDark  = document.getElementById('btn-dark');

    function setMode(mode) {
        document.documentElement.setAttribute(
            'data-theme',
            mode === 'dark' ? 'dark' : ''
        );

        btnLight.classList.toggle('active', mode === 'light');
        btnDark.classList.toggle('active',  mode === 'dark');

        localStorage.setItem("guide_theme", mode);
    }

    // 저장된 테마 복원
    const savedTheme = localStorage.getItem("guide_theme");
    if (savedTheme) setMode(savedTheme);

    btnLight?.addEventListener('click', () => setMode('light'));
    btnDark?.addEventListener('click', () => setMode('dark'));
    
    /* =========================================
        2. 상태 복원
    ========================================= */
    function restoreStatus() {
        $(".component-item").each(function () {
            const $item = $(this);
            const file = $item.find(".component-info").data("include-path");

            // !file 체크 이유 : include-path 없는 경우 방지, 안전 코드, 정상적인 루프 유지
            if (!file) return;

            const name = file.split("/").pop().replace(".html", "");

            const saved = localStorage.getItem("guide_status_" + name);

            if (saved) {
                $item.removeClass("non ing comp");
                $item.addClass(saved);
            }
        });
    }

    /* ===============================
        3. 컴포넌트 로드
    =============================== */

    function loadComponent($el) {

        if (!$el.length) return;

        const file = $el.data("include-path");
        if (!file) return;

        // active 처리
        $(".component-info").removeClass("active");
        $el.addClass("active");

        // HTML 로드
        $("#component-view").load(file, function () {

            // 파일명 기준으로 init 실행
            const name = file
                .split("/")
                .pop()
                .replace(".html", "");

            runComponentInit(name);
            bindStatusControl(name);
        });

        // URL hash 변경
        const hashName = file
            .split("/")
            .pop()
            .replace(".html", "");

        window.location.hash = hashName;
    }

    /* =========================================
        4. 상태 버튼 -> 사이드 메뉴 반영
    ========================================= */
    function bindStatusControl(componentName) {
        const $activeMenu = $(".component-info.active").closest(".component-item");
        if (!$activeMenu.length) return;

        $(".status-btn").off("click").on("click", function () {
            // 기존 상태 클래스 제거
            $activeMenu.removeClass("non ing comp");

            // 상태 저장
            let state = "";

            // 버튼 상태 확인
            if ($(this).hasClass("todo")) {
                $activeMenu.addClass("non");
                state = "non";
            } else if ($(this).hasClass("inprogress")) {
                $activeMenu.addClass("ing");
                state = "ing";
            } else if ($(this).hasClass("completed")) {
                $activeMenu.addClass("comp");
                state = "comp";
            }

            // 현재 컴포넌트 이름 추출
            const file = $activeMenu.find(".component-info").data("include-path");

            const name = file.split("/").pop().replace(".html", "");

            // 상태 저장
            localStorage.setItem("guide_status_" + name, state);

            // statusManager로 전체 갱신
            if (typeof statusManager !== "undefined") {
                statusManager.update();
            }
        })
    }

    /* ===============================
        5. 첫 화면 자동 로딩
    =============================== */

    function loadInitial() {

        const hash = window.location.hash.replace("#", "");

        if (hash) {
            const $target = $(".component-info").filter(function () {
                return $(this)
                    .data("include-path")
                    .toLowerCase()
                    .includes(hash.toLowerCase());
            });

            if ($target.length) {
                loadComponent($target.first());
                return;
            }
        }

        // 기본 첫 번째
        loadComponent($(".component-info").first());
    }

    /* ===============================
        6. 메뉴 클릭
    =============================== */

    $(".component-info").on("click", function (e) {
        e.preventDefault();
        loadComponent($(this));
    });

    /* ===============================
        7. 초기 실행 순서
    =============================== */

    restoreStatus(); // 먼저 복원

    if (typeof statusManager !== "undefined") {
        statusManager.init(); // 그 다음 계산
    }

    loadInitial(); // 화면 로딩

    /* ===============================
        8. 뒤로가기 지원
    =============================== */

    $(window).on("hashchange", function () {
        loadInitial();
    });
})

/* =========================================
    Component Init Auto Mapping
========================================= */

function runComponentInit(name) {

    if (!name) return;

    // kebab-case -> PascalCase 변환
    const pascal = name.toLowerCase().split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join("");

    const fnName = "init" + pascal;

    if (typeof window[fnName] === "function") {
        window[fnName]();
    }
}
