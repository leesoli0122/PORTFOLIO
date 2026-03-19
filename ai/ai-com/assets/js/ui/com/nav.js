/* =========================================================
   MG캐피탈 nav.js 안정화 완성본 (새로고침/FTP DOM 지연 대응)
   - 요소가 늦게 생성되어도 초기화가 붙도록 waitForEl 적용
   - 중복 바인딩 방지 가드 적용
========================================================= */

/* ---------------------------------------------
   공용: 요소 생성 대기 유틸
--------------------------------------------- */
function waitForEl(selector, cb, opt) {
    opt = opt || {};
    var interval = opt.interval || 100;   // ms
    var maxTry = opt.maxTry || 80;        // 80 * 100ms = 8초
    var count = 0;

    var timer = setInterval(function () {
        var el = document.querySelector(selector);
        if (el) {
            clearInterval(timer);
            cb(el);
            return;
        }
        count++;
        if (count >= maxTry) {
            clearInterval(timer);
            if (opt.warn !== false) {
                console.warn('waitForEl: timeout (' + selector + ')');
            }
        }
    }, interval);
}

/* ---------------------------------------------
   초기화: load 이후, 필요한 DOM이 생길 때마다 순차 초기화
--------------------------------------------- */
window.addEventListener('load', function () {

    // 전체메뉴(올메뉴) 탭 영역이 생기면 mobileMenu 초기화
    waitForEl('.menu-tit li', function () {
        mobileMenu();
    });

    // 전체메뉴 버튼/레이어가 생기면 menuToggle 초기화
    waitForEl('.menu-btn', function () {
        waitForEl('#allMenu', function () {
            menuToggle();
        });
    });

    // 헤더 메뉴(#menuWrap)이 생기면 headerMenu 초기화
    waitForEl('#menuWrap .menu-item', function () {
        headerMenu();
    });

    // 검색 버튼/레이어가 생기면 searchToggle 초기화
    waitForEl('.search-btn', function () {
        waitForEl('#allSearch', function () {
            searchToggle();
        });
    });

    // 폰트 크기 초기화(체크박스가 있으면 바로)
    initFontSize();
});

/* ---------------------------------------------
    스크롤 제어 함수 (통합)
--------------------------------------------- */
function updateScrollState() {
    var allMenu = document.getElementById('allMenu');
    var menuInner = document.querySelector('.menu-inner');
    var shouldLockScroll = allMenu && allMenu.classList.contains('on');

    document.body.classList.toggle('no-scroll', shouldLockScroll);

    if (shouldLockScroll && menuInner) {
        if (window.innerWidth < 768) {
            menuInner.style.maxHeight = '100vh';
        } else {
            var headerEl = document.querySelector('.allmenu-header');
            var navTabEl = document.querySelector('.menu-cont .menu-l .menu-tit');

            var headerHeight = headerEl ? headerEl.offsetHeight : 0;
            var navTabHeight = navTabEl ? navTabEl.offsetHeight : 0;

            // 템플릿리터럴 대신 문자열 결합(환경 이슈 방지)
            menuInner.style.maxHeight = 'calc(100vh - ' + (headerHeight + navTabHeight) + 'px)';
        }
    }
}

/*--------------------------------------------------------
    전체메뉴 탭 (모바일: 탭 전환 / PC: 스크롤 이동) 2025.12.05 수정
----------------------------------------------------------*/
function mobileMenu() {
    // 중복 바인딩 방지
    if (window.__mobileMenuInited) return;
    window.__mobileMenuInited = true;

    var menuTabs = document.querySelectorAll('.menu-tit li');
    var menuContents = document.querySelectorAll('.menu-inner > li');
    var menuInner = document.querySelector('.menu-inner');

    for (var i = 0; i < menuTabs.length; i++) {

        // 키보드 접근성
        menuTabs[i].setAttribute('tabindex', '0');

        // 탭 활성화 함수 (모바일용)
        function activateTab(tab) {
            for (var j = 0; j < menuTabs.length; j++) {
                menuTabs[j].classList.remove('on');
            }
            for (var k = 0; k < menuContents.length; k++) {
                menuContents[k].classList.remove('on');
            }

            tab.classList.add('on');

            var span = tab.querySelector('span');
            var targetClass = span ? span.getAttribute('data-focus') : null;
            if (targetClass) {
                var target = document.querySelector('.menu-inner .' + targetClass);
                if (target) target.classList.add('on');
            }
        }

        // 스크롤 이동 함수 (PC용)
        function scrollToSection(tab) {
            var span = tab.querySelector('span');
            var targetClass = span ? span.getAttribute('data-focus') : null;
            var targetSection = targetClass ? document.querySelector('.menu-inner > .' + targetClass) : null;

            if (targetSection && menuInner) {

                for (var j = 0; j < menuTabs.length; j++) {
                    menuTabs[j].classList.remove('on');
                }
                tab.classList.add('on');

                var header = document.querySelector('.allmenu-header');
                var menuL = document.querySelector('.menu-l');
                var headerHeight = header ? header.offsetHeight : 0;
                var tabHeight = menuL ? menuL.offsetHeight : 0;

                var offsetTop = targetSection.offsetTop - headerHeight - tabHeight;

                menuInner.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }

        // 클릭 이벤트
        menuTabs[i].addEventListener('click', function () {
            if (window.innerWidth < 768) {
                activateTab(this);
            } else {
                scrollToSection(this);
            }
        });

        // 키보드 이벤트 (Enter, Space)
        menuTabs[i].addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (window.innerWidth < 768) {
                    activateTab(this);
                } else {
                    scrollToSection(this);
                }
            }
        });
    }

    // PC에서 스크롤 시 탭 자동 활성화 (선택사항)
    if (menuInner) {
        var scrollTimeout;
        menuInner.addEventListener('scroll', function () {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function () {
                if (window.innerWidth >= 768) {
                    updateActiveTabOnScroll();
                }
            }, 100);
        });
    }

    function updateActiveTabOnScroll() {
        if (!menuInner) return;

        var scrollTop = menuInner.scrollTop;
        var currentSection = null;
        var minDistance = Infinity;

        for (var i = 0; i < menuContents.length; i++) {
            var section = menuContents[i];
            var sectionTop = section.offsetTop - menuInner.offsetTop;
            var distance = Math.abs(scrollTop - sectionTop);

            if (distance < minDistance) {
                minDistance = distance;
                currentSection = section;
            }
        }

        if (currentSection) {
            var targetClass = currentSection.classList[0];

            for (var t = 0; t < menuTabs.length; t++) {
                var span = menuTabs[t].querySelector('span');
                var tabTarget = span ? span.getAttribute('data-focus') : null;

                if (tabTarget === targetClass) {
                    for (var j = 0; j < menuTabs.length; j++) {
                        menuTabs[j].classList.remove('on');
                    }
                    menuTabs[t].classList.add('on');
                    break;
                }
            }
        }
    }
}

/*---------------------------------------------
    메뉴/검색 토글 통합 함수
---------------------------------------------*/
function menuToggle() {
    // 중복 바인딩 방지
    if (window.__menuToggleInited) return;
    window.__menuToggleInited = true;

    var menuBtn = document.querySelector('.menu-btn');
    var allMenu = document.getElementById('allMenu');
    var menuCloseBtn = document.querySelector('.allmenu-header-inner .close-btn');

    if (menuBtn && allMenu) {
        menuBtn.addEventListener('click', function () {
            allMenu.classList.add('on');
            updateScrollState();
        });

        if (menuCloseBtn) {
            menuCloseBtn.addEventListener('click', function () {
                allMenu.classList.remove('on');
                updateScrollState();
            });
        }
    }

    // resize 시 높이 재계산
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (allMenu && allMenu.classList.contains('on')) {
                updateScrollState();
            }
        }, 100);
    });
}

// 검색 토글
function searchToggle() {
    // 중복 바인딩 방지
    if (window.__searchToggleInited) return;
    window.__searchToggleInited = true;

    var searchBtn = document.querySelector('.search-btn');
    var allSearch = document.getElementById('allSearch');
    var searchCloseBtn = document.querySelector('.header-btn-wrap .close-btn');
    var allMenuSearchBtn = document.querySelector('.allmenu-header-inner .search-btn');
    var allSearchCloseBtn = document.querySelector('.allsearch-header-inner .close-btn');

    if (searchBtn && allSearch) {

        function openSearch(triggerButton, closeButton) {
            var menuItems = document.querySelectorAll('.lnb .menu-item');
            for (var i = 0; i < menuItems.length; i++) {
                var item = menuItems[i];
                item.classList.remove('on');
                var btn = item.querySelector('.menu-tit');
                if (btn) btn.classList.remove('on');
            }

            allSearch.classList.add('on');

            if (triggerButton) triggerButton.style.display = 'none';
            if (closeButton) closeButton.classList.add('on');

            setTimeout(function () {
                var searchInput = allSearch.querySelector('input[type="text"], input[type="search"], input:not([type])');
                if (searchInput) {
                    searchInput.focus();
                } else {
                    var focusableElements = allSearch.querySelectorAll(
                        'input:not([disabled]), button:not([disabled]), a[href], textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
                    );
                    if (focusableElements.length > 0) focusableElements[0].focus();
                }
            }, 100);
        }

        function closeSearch(triggerButton, closeButton) {
            allSearch.classList.remove('on');

            if (triggerButton) {
                triggerButton.style.display = 'inline-block';
                setTimeout(function () { triggerButton.focus(); }, 100);
            }
            if (closeButton) closeButton.classList.remove('on');
        }

        // PC 검색 버튼
        searchBtn.addEventListener('click', function () {
            openSearch(searchBtn, searchCloseBtn);
        });

        if (searchCloseBtn) {
            searchCloseBtn.addEventListener('click', function () {
                closeSearch(searchBtn, searchCloseBtn);
            });
        }

        // 모바일 검색 버튼
        if (allMenuSearchBtn && allSearchCloseBtn) {
            allMenuSearchBtn.addEventListener('click', function () {
                openSearch(allMenuSearchBtn, allSearchCloseBtn);
            });

            allSearchCloseBtn.addEventListener('click', function () {
                closeSearch(allMenuSearchBtn, allSearchCloseBtn);
            });
        }

        // 포커스 트랩
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Tab' && allSearch.classList.contains('on')) {

                var activeCloseBtn = null;
                if (searchCloseBtn && searchCloseBtn.classList.contains('on')) {
                    activeCloseBtn = searchCloseBtn;
                } else if (allSearchCloseBtn) {
                    activeCloseBtn = allSearchCloseBtn;
                }
                if (!activeCloseBtn) return;

                var nodeList = allSearch.querySelectorAll(
                    'input:not([disabled]), button:not([disabled]), a[href], textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );

                var searchFocusable = [];
                for (var i = 0; i < nodeList.length; i++) searchFocusable.push(nodeList[i]);

                if (searchFocusable.length === 0) return;

                var firstSearchElement = searchFocusable[0];
                var lastSearchElement = searchFocusable[searchFocusable.length - 1];

                if (!e.shiftKey && document.activeElement === lastSearchElement) {
                    e.preventDefault();
                    activeCloseBtn.focus();
                }
                else if (!e.shiftKey && document.activeElement === activeCloseBtn) {
                    e.preventDefault();
                    firstSearchElement.focus();
                }
                else if (e.shiftKey && document.activeElement === firstSearchElement) {
                    e.preventDefault();
                    activeCloseBtn.focus();
                }
                else if (e.shiftKey && document.activeElement === activeCloseBtn) {
                    e.preventDefault();
                    lastSearchElement.focus();
                }
            }
        });

        function handleResize() {
            if (window.innerWidth < 767) {
                if (searchBtn) searchBtn.style.display = 'none';
            } else {
                if (searchBtn && !allSearch.classList.contains('on')) {
                    searchBtn.style.display = 'inline-block';
                }
            }
        }

        handleResize();

        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(handleResize, 10);
        });
    }
}

/*---------------------------------------------
    헤더 드롭다운 메뉴 기능
---------------------------------------------*/
function headerMenu() {
    // 중복 바인딩 방지
    if (window.__headerMenuInited) return;
    window.__headerMenuInited = true;

    // #menuWrap 기준
    var menuItems = document.querySelectorAll('#menuWrap .menu-item');

    if (!menuItems || menuItems.length === 0) {
        // 필요하면 경고 유지, 싫으면 지워도 됨
        console.warn('headerMenu: #menuWrap .menu-item 요소를 찾을 수 없습니다.');
        return;
    }

    var currentPageActiveMenu = null;
    for (var i = 0; i < menuItems.length; i++) {
        var btn = menuItems[i].querySelector('.menu-tit');
        if (btn && btn.classList.contains('active')) currentPageActiveMenu = btn;
    }

    function restoreCurrentPageActive() {
        for (var i = 0; i < menuItems.length; i++) {
            var btn = menuItems[i].querySelector('.menu-tit');
            if (btn) btn.classList.remove('active');
        }
        if (currentPageActiveMenu) currentPageActiveMenu.classList.add('active');
    }

    function closeAllMenus() {
        for (var i = 0; i < menuItems.length; i++) {
            var item = menuItems[i];
            item.classList.remove('on');
            var btn = item.querySelector('.menu-tit');
            if (btn) btn.classList.remove('on');
        }
    }

    for (var idx = 0; idx < menuItems.length; idx++) (function (menuItem) {

        var menuButton = menuItem.querySelector('.menu-tit');
        var listItem = menuItem.querySelector('.list-item');
        var hasSubmenu = listItem !== null;

        if (!menuButton) return;

        var closeTimer = null;

        function openMenu() {
            if (closeTimer) {
                clearTimeout(closeTimer);
                closeTimer = null;
            }

            if (hasSubmenu) {
                for (var i = 0; i < menuItems.length; i++) {
                    var otherItem = menuItems[i];
                    if (otherItem !== menuItem) {
                        otherItem.classList.remove('on');
                        var otherBtn = otherItem.querySelector('.menu-tit');
                        if (otherBtn) otherBtn.classList.remove('on', 'active');
                    }
                }
                menuItem.classList.add('on');
                menuButton.classList.add('on');
            }
        }

        function scheduleClose() {
            closeTimer = setTimeout(function () {
                menuItem.classList.remove('on');
                menuButton.classList.remove('on');
            }, 100);
        }

        if (hasSubmenu) {
            menuItem.addEventListener('mouseenter', openMenu);
            menuItem.addEventListener('mouseleave', scheduleClose);

            if (listItem) {
                listItem.addEventListener('mouseenter', openMenu);
                listItem.addEventListener('mouseleave', scheduleClose);
            }

            menuButton.addEventListener('click', function (e) {
                e.preventDefault();

                var isActive = menuButton.classList.contains('active');

                if (isActive) {
                    menuButton.classList.remove('active');
                    menuItem.classList.remove('on');
                    menuButton.classList.remove('on');
                } else {
                    if (closeTimer) {
                        clearTimeout(closeTimer);
                        closeTimer = null;
                    }

                    for (var i = 0; i < menuItems.length; i++) {
                        var otherItem = menuItems[i];
                        if (otherItem !== menuItem) {
                            otherItem.classList.remove('on');
                            var otherBtn = otherItem.querySelector('.menu-tit');
                            if (otherBtn) otherBtn.classList.remove('active', 'on');
                        }
                    }

                    menuButton.classList.add('active');
                    menuItem.classList.add('on');
                    menuButton.classList.add('on');
                }
            });

        } else {
            menuButton.addEventListener('click', function () {
                var href = this.getAttribute('href');
                if (href && href !== '#') window.location.href = href;
            });
        }

    })(menuItems[idx]);

    // 2depth hover
    var submenu2Items = document.querySelectorAll('.lnb .submenu2 > li');
    for (var i = 0; i < submenu2Items.length; i++) {
        (function (item) {
            var submenu2Link = item.querySelector('a, button');
            if (submenu2Link) submenu2Link.setAttribute('tabindex', '0');

            item.addEventListener('mouseenter', function (e) {
                e.stopPropagation();
                var allSubmenu2 = document.querySelectorAll('.lnb .submenu2 > li');
                for (var j = 0; j < allSubmenu2.length; j++) allSubmenu2[j].classList.remove('on');
                this.classList.add('on');
            });
        })(submenu2Items[i]);
    }

    // 키보드 Enter/Space
    var allMenuLinks = document.querySelectorAll('.lnb .menu-tit, .lnb .submenu a, .lnb .submenu button, .lnb .submenu2 a, .lnb .submenu2 button');
    for (var i = 0; i < allMenuLinks.length; i++) {
        allMenuLinks[i].addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }

    // 메뉴 영역 밖 마우스 나가면 복원
    var gnbElement = document.querySelector('.gnb');
    if (gnbElement) {
        gnbElement.addEventListener('mouseleave', function () {
            closeAllMenus();
            restoreCurrentPageActive();
        });
    }

    // 포커스가 헤더 밖으로 나가면 복원
    var headerWrap = document.getElementById('headerWrap');
    if (headerWrap) {
        document.addEventListener('focusin', function (e) {
            var isInsideHeader = headerWrap.contains(e.target);
            if (!isInsideHeader) {
                closeAllMenus();
                restoreCurrentPageActive();
            }
        });
    }
}

/* ---------------------------------------------
   폰트 크기 초기화 (기존 유지, load에서 1회)
--------------------------------------------- */
function initFontSize() {
    if (window.__fontSizeInited) return;
    window.__fontSizeInited = true;

    var checkbox = document.getElementById("fontSizeNormal");
    if (!checkbox) return;

    var KEY = "fontSizeNormalChecked";
    var root = document.documentElement;

    function apply(checked) {
        root.classList.toggle("font-big", !!checked);
    }

    var saved = localStorage.getItem(KEY);
    var checked = saved === null ? false : saved === "true";

    checkbox.checked = checked;
    apply(checked);

    checkbox.addEventListener("change", function () {
        localStorage.setItem(KEY, this.checked ? "true" : "false");
        apply(this.checked);
    });
}
