

$(document).ready(function(){

    /**
     *   TAB
    **/
    var Tabs = (function () {
        return {
            init: function (container) {
                var $tabContainer = $(container);
                var $tabs = $tabContainer.find('.tab-item, .nested-tab-item');
                // var $panels = $tabContainer.find('.tab-panel, .nested-tab-panel');

                // 초기 활성 탭
                $tabs.each(function () {
                    var $tab = $(this);
                    var targetId = $tab.attr('data-tab');
                    var $panel = $('#' + targetId);

                    if ($tab.hasClass('active')) {
                        $tab.attr('aria-selected', 'true');
                        $tab.attr('title', '선택됨'); //21.1.28 웹접근성
                        $panel.show().attr('aria-hidden', 'false');
                        //$tab.find('button').attr('aria-label', $tab.find('button').text() + ', 현재 선택됨');
                    } else {
                        $tab.attr('aria-selected', 'false');
                        $tab.attr('title'); //21.1.28 웹접근성
                        $panel.hide().attr('aria-hidden', 'true');
                        //$tab.find('button').attr('aria-label', $tab.find('button').text());
                    }
                });

                // event binding
                $tabs.on('click', function (e) {
                    e.preventDefault();
                    Tabs.switchTab($(this), $tabContainer);
                });

                // 키보드 이벤트 바인딩
                $tabs.on('keydown', function (e) {
                    Tabs.handleKeydown(e, $(this), $tabContainer);
                });

                // 포커스 이벤트 바인딩
                $tabs.on('focus', function () {
                    $(this).addClass('focused');
                }).on('blur', function () {
                    $(this).removeClass('focused');
                });
            },

            switchTab: function ($clickedTab, $tabContainer) {
                var targetId = $clickedTab.attr('data-tab');
                var $targetPanel = $('#' + targetId);
                var isNested = $clickedTab.hasClass('nested-tab-item');

                // 같은 그룹의 탭 찾기
                var $allTabs = isNested ? $tabContainer.find('.nested-tab-item') : $tabContainer.find('.tab-item');
                var $allPanels = isNested ? $tabContainer.find('.nested-tab-panel') : $tabContainer.find('.tab-panel');

                // 기존 탭 초기화
                $allTabs.removeClass('active').attr('aria-selected', 'false').removeAttr('title'); // 21.1.28 웹접근성
                $allPanels.hide().attr('aria-hidden', 'true');
                /*$allTabs.find('button').each(function() {
                    var $btn = $(this);
                    $btn.attr('aria-label', $btn.text());
                });*/

                // 새 탭 활성화
                $clickedTab.addClass('active').attr('aria-selected', 'true').attr('title', '선택됨'); // // 21.1.28 웹접근성
                $targetPanel.show().attr('aria-hidden', 'false');
                //$clickedTab.find('button').attr('aria-label', $clickedTab.find('button').text() + ', 현재 선택됨');

                /* ============================
                2026.02.06 추가 (최소 수정)
                - 부모탭(국산/수입) 전환 시,
                    내부 브랜드 active 패널이 none으로 남아
                    "한 번 더 눌러야 보이는" 현상 방지
                - 자식탭이 있는 경우 active 자식패널을 즉시 복구
                ============================ */
                if (!isNested) {
                    var $nestedTabs = $targetPanel.find('.nested-tab-item');
                    if ($nestedTabs.length) {
                        var $activeNested = $nestedTabs.filter('.active').first();
                        if (!$activeNested.length) {
                            $activeNested = $nestedTabs.first().addClass('active');
                        }

                        var nestedTargetId = $activeNested.attr('data-tab');

                        // 자식 패널 전체 숨김 후 active만 다시 표시
                        var $nestedPanels = $targetPanel.find('.nested-tab-panel');
                        $nestedPanels.hide().attr('aria-hidden', 'true');

                        if (nestedTargetId) {
                            var $activeNestedPanel = $('#' + nestedTargetId);
                            $activeNestedPanel.show().attr('aria-hidden', 'false');

                            // nested-tab-panel은 flex 유지 필요 (CSS 의존 최소화)
                            if ($activeNestedPanel.hasClass('nested-tab-panel')) {
                                $activeNestedPanel.css('display', 'flex');
                            }

                            // 접근성(title/aria-selected)도 함께 복구
                            $nestedTabs.removeAttr('title').attr('aria-selected', 'false');
                            $activeNested.attr('aria-selected', 'true').attr('title', '선택됨');
                        }
                    }
                }
                
                // 모바일 select 동기화
                var $mobileSelect = $tabContainer.find('.tab-select-mobile select');
                if ($mobileSelect.length) {
                    $mobileSelect.val(targetId);
                }

                // 포커스 이동 (접근성 향상)
                $clickedTab.find('button').focus();
                
                // 스크린 리더를 위한 탭 변경 안내
                announceTabChange($clickedTab.find('button').text());
            },

            handleKeydown: function (e, $currentTab, $tabContainer) {
                var $tabs = $tabContainer.find('.tab-item, .nested-tab-item');
                var currentIndex = $tabs.index($currentTab);
                var $nextTab, $prevTab;

                switch (e.keyCode) {
                    case 37: // Left arrow
                        e.preventDefault();
                        $prevTab = $tabs.eq(currentIndex - 1);
                        if ($prevTab.length) {
                            $prevTab.find('button').focus();
                        } else {
                            $tabs.last().find('button').focus(); // 마지막 탭으로
                        }
                        break;
                    case 39: // Right arrow
                        e.preventDefault();
                        $nextTab = $tabs.eq(currentIndex + 1);
                        if ($nextTab.length) {
                            $nextTab.find('button').focus();
                        } else {
                            $tabs.first().find('button').focus(); // 첫 번째 탭으로
                        }
                        break;
                    case 36: // Home
                        e.preventDefault();
                        $tabs.first().find('button').focus();
                        break;
                    case 35: // End
                        e.preventDefault();
                        $tabs.last().find('button').focus();
                        break;
                    case 13: // Enter
                    case 32: // Space
                        e.preventDefault();
                        Tabs.switchTab($currentTab, $tabContainer);
                        break;
                }
            }
        };
    })();

    // 모든 탭 초기화
    $('.jsTab, .nestedJsTab').each(function () {
        Tabs.init(this);
    });

    /**
     *   RADIO TAB 2025.10.22 추가
    **/
    $('.radio[data-tab]').on('change', 'input[type="radio"]', function() {
        if ($(this).is(':checked')) {
            var $radioLabel = $(this).closest('.radio[data-tab]');
            var targetId = $radioLabel.attr('data-tab');
            var $targetPanel = $('#' + targetId);
            
            // 같은 그룹의 모든 패널 숨기기
            var radioName = $(this).attr('name');
            $('input[name="' + radioName + '"]').closest('.radio[data-tab]').each(function() {
                var panelId = $(this).attr('data-tab');
                $('#' + panelId).hide();
            });
            
            // 선택된 패널만 표시
            $targetPanel.show();
        }
    });

    // 초기 로드 시 모든 패널 숨기기
    $('.radio[data-tab]').each(function() {
        var panelId = $(this).attr('data-tab');
        $('#' + panelId).hide();
    });

    // 초기 로드 시 체크된 라디오의 패널만 표시
    $('.radio[data-tab] input[type="radio"]:checked').each(function() {
        var targetId = $(this).closest('.radio[data-tab]').attr('data-tab');
        $('#' + targetId).show();
    });
    
    /**
     *   TAB Swiper - IE11 호환성 처리
    **/
    var tabSwiperL = (function () {
        var pager = ['영역', '영역2', '영역3', '영역4'];
        var tabSwiper = null;

        // Swiper가 존재하고 IE11이 아닌 경우에만 초기화
        if (typeof Swiper !== 'undefined' && !isIE11()) {
            try {
                tabSwiper = new Swiper('.tabs.tab-area.swiper', {
                    spaceBetween: 20,
                    autoHeight: true,
                    pagination: {
                        el: '.tabs ul',
                        clickable: true,
                        renderBullet: function (index, className) {
                            return '<li class="tab-item ' + className + '">' + pager[index] + '</li>';
                        }
                    }
                });
            } catch (e) {
                console.log('Swiper 초기화 실패:', e.message);
                // Swiper 초기화 실패 시 기본 탭 동작으로 폴백
                initFallbackTabs();
            }
        } else {
            // IE11이거나 Swiper가 없는 경우 기본 탭 동작으로 폴백
            initFallbackTabs();
        }

        return tabSwiper;
    })();

    /**
     * IE11 감지 함수
     */
    function isIE11() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        var msie11 = ua.indexOf('Trident/');
        return (msie > 0 || msie11 > 0);
    }

    /**
     * Swiper 대신 기본 탭 동작으로 폴백
     */
    function initFallbackTabs() {
        var $swiperContainer = $('.tabs.tab-area.swiper');
        if ($swiperContainer.length > 0) {
            var $tabList = $swiperContainer.find('.swiper-pager.tab-list');
            var $slides = $swiperContainer.find('.swiper-slide');
            
            // 기본 탭 스타일 적용
            $tabList.find('li').each(function(index) {
                var $tab = $(this);
                var $slide = $slides.eq(index);
                
                // 첫 번째 탭만 활성화
                if (index === 0) {
                    $tab.addClass('swiper-pagination-bullet-active');
                    $slide.show();
                } else {
                    $slide.hide();
                }
                
                // 탭 클릭 이벤트
                $tab.on('click', function() {
                    $tabList.find('li').removeClass('swiper-pagination-bullet-active');
                    $tab.addClass('swiper-pagination-bullet-active');
                    $slides.hide();
                    $slide.show();
                });
            });
        }
    }

    /**
     * 모바일 select와 PC 탭 동기화
     */
    var $mobileSelect = $('.tab-select-mobile select');
    if ($mobileSelect.length) {
        $mobileSelect.on('change', function() {
            var selectedValue = $(this).val();
            var $tabContainer = $(this).closest('.jsTab');
            var $targetTab = $tabContainer.find('.tab-item[data-tab="' + selectedValue + '"]');
            if ($targetTab.length) {
                Tabs.switchTab($targetTab, $tabContainer);
            }
        });
    }

    /**
     * 스크린 리더를 위한 상태 안내
     */
    function announceTabChange(tabName) {
        // 스크린 리더 사용자에게 탭 변경을 안내
        var announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = tabName + ' 탭이 선택되었습니다.';
        
        document.body.appendChild(announcement);
        
        // 잠시 후 제거
        setTimeout(function() {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * 금융상품
     */
    const buttons = document.querySelectorAll('.anchor-list .btn-group button');
    const isMobile = () => window.innerWidth <= 768;

    // 초기 상태 설정 함수
    function initPanels() {
        const activeButton = document.querySelector('.anchor-list .btn-group button.active');

        if (isMobile()) {
            // 모바일: 현재 active 패널만 표시
            $('.anchor-panel').hide();
            const targetButton = activeButton || buttons[0];
            if (targetButton) {
                $(targetButton.dataset.target).show();
                if (!activeButton) targetButton.classList.add('active');
            }
        } else {
            // PC: 모든 패널 표시
            $('.anchor-panel').show();
            if (!activeButton && buttons[0]) buttons[0].classList.add('active');
        }
    }

    // 페이지 로드 시 초기화
    initPanels();

    // 화면 크기 변경 시 재초기화 (debounce 적용)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initPanels, 150);
    });

    // 버튼 클릭 이벤트
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const targetId = this.dataset.target;
            
            // 버튼 활성화 상태 변경
            buttons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            if (isMobile()) {
                // 모바일: 패널 전환
                e.preventDefault();
                $('.anchor-panel').hide();
                $(targetId).show();
            } else {
                // PC: 헤더 높이 계산하여 앵커 이동
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                const targetPosition = targetElement.offsetTop;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

});




/* =========================================================
[공통 추가] include 탭(.btn-group > a.tab-item) 선택됨 title 처리
- 회사소개 상단 탭처럼 data-tab 없는 a 탭 대응
- active에만 title="선택됨" + aria-selected="true"
========================================================= */
(function () {
function applyIncludeTabTitle($scope) {
    var $root = $scope && $scope.length ? $scope : $(document);

    // 회사소개 탭 구조: .btn-group 안의 a.tab-item
    var $tabs = $root.find('.btn-group > a.tab-item');
    if (!$tabs.length) return;

    // 기존 선택됨 title 제거 + aria-selected 정리
    $tabs.removeAttr('title').attr('aria-selected', 'false');

    // active에만 부여
    $tabs.filter('.active').attr('title', '선택됨').attr('aria-selected', 'true');
}

// 1) 최초 1회 (include/렌더 타이밍 보강)
$(function () {
    applyIncludeTabTitle();
    setTimeout(function () { applyIncludeTabTitle(); }, 0);
});

// 2) 클릭 시 active가 바뀌는 경우 대비
// (goMenuFnc로 페이지 이동이면 사실 필요 없지만, 혹시 클래스만 바뀌는 화면도 대비)
$(document).on('click', '.btn-group > a.tab-item', function () {
    var $tabs = $(this).closest('.btn-group').find('> a.tab-item');
    $tabs.removeAttr('title').attr('aria-selected', 'false');
    $(this).attr('title', '선택됨').attr('aria-selected', 'true');
});
/* ---------------------------S : 셀렉트탭 전용(26.03.04 추가)--------------------------- */
/* 기존 셀렉트 탭은 모바일일 경우, 같은 탭 내부에서 같은 값을 동기화 하며 사용하기 때문에 */
/* 새로 클래스 세팅 하여 기본 세팅 */
$('.select-tab-area').each(function() {
    var $area = $(this);
    var $select = $area.find('.tab-select-common');
    
    if ($select.length > 0) {
        var activeId = $select.val(); 

        $area.find('.tab-panel').hide().removeClass('active');
        $('#' + activeId).show().addClass('active');
    }
});

/* 셀렉트 변경 시 패널 교체 */
$(document).on('change', '.tab-select-common', function() {
    var targetId = $(this).val();
    var $area = $(this).closest('.select-tab-area');

    $area.find('.tab-panel').hide().removeClass('active');
    $('#' + targetId).show().addClass('active');
});
/* ---------------------------E : 셀렉트탭 전용(26.03.04 추가)--------------------------- */
// 필요하면 외부에서 호출할 수 있게 노출
window.applyIncludeTabTitle = applyIncludeTabTitle;
})();