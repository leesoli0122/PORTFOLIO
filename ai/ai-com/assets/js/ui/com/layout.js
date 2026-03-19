$(document).ready(function () {
    /*---------------------------------------------
        load, init
    ---------------------------------------------*/
    $(window).on("load", function () {
        if ($(".fullPopupOn .pop-con-wrap").length > 0) {
            // DOM 존재 여부 먼저 체크한 뒤에 이벤트 바인딩
            headerPopupL.scrolling();
        }

        if ($(".contentWrap").length > 0) {
            scrollTopBtnL.scrolling(); // 초기 상태 확인
        }

        if ($("#skipnavi").length > 0) {
            skipNaviL.init(); // init 실행 전에 존재 여부 확인
        }

        console.log("[layout.js] 초기화 완료");
    });

    /*---------------------------------------------
        resize
    ---------------------------------------------*/
    $(window).on("resize", function () {
        if ($(".wrap .contentWrap").length > 0) {
            headerL.scrolling();
        }

        if ($(".fullPopupOn .pop-con-wrap").length > 0) {
            headerPopupL.scrolling();
        }

        // if ($('.wrap .contentWrap').length > 0) {
        //     sideToolsL.updatePosition();
        // }
    });
    /*---------------------------------------------
        GNB 메뉴 제어 모듈
    ---------------------------------------------*/
    var gnbFullL = (function () {
        return {
            $gnbItem: null,

            // 마우스 오버 또는 포커스
            mouseOverFocusIn: function () {
                this.$gnbItem.on("mouseenter focusin", function () {
                    var $this = $(this);

                    // 이미 열려있으면 다시 열지 않음 (중복 방지)
                    if (!$this.hasClass("on")) {
                        $this.addClass("on").siblings().removeClass("on");

                        $this.find(".menu-sub").hide().css("display", "flex").stop(true, true).slideDown(200);
                        $this.siblings().find(".menu-sub").stop(true, true).slideUp(200);
                    }
                });
            },

            // 마우스 리브
            mouseLeave: function () {
                this.$gnbItem.on("mouseleave", function () {
                    var $this = $(this);
                    $this.removeClass("on");
                    $this.find(".menu-sub").stop(true, true).slideUp(200);
                });
            },

            // 외부 포커스 이동 시 메뉴 닫기
            focusOutGnb: function () {
                $("body").on("focusin", function (e) {
                    if (!$(e.target).closest("#gnbFull").length) {
                        gnbFullL.$gnbItem.removeClass("on");
                        gnbFullL.$gnbItem.find(".menu-sub").stop(true, true).slideUp(200);
                    }
                });
            },

            // 초기화
            init: function () {
                this.$gnbItem = $("#gnbFull .menu-list .menu-item"); // DOM
                this.mouseOverFocusIn();
                this.mouseLeave();
                this.focusOutGnb();
            },
        };
    })();

    var gnbL = (function () {
        return {
            init: function () {
                this.bindDepthToggle(); // 공통 뎁스 이벤트
                this.bindMenuClick(); // 1뎁스 이벤트
                this.bindResize(); // 리사이즈 이벤트
            },

            bindMenuClick: function () {
                $(document).on("click", "#gnb .menu-list .menu-item > a", function (e) {
                    e.preventDefault();
                    var $parent = $(this).parent();

                    if ($parent.hasClass("on")) {
                        $parent.removeClass("on");
                        $parent.find(".on").removeClass("on");
                    } else {
                        $parent.addClass("on").siblings(".menu-item").removeClass("on").find(".on").removeClass("on");
                    }
                });
            },

            bindDepthToggle: function () {
                $(document).on("click", "#gnb .depth-con ul > li > a", function (e) {
                    var $this = $(this);
                    var $parentLi = $this.parent();
                    var $nextDepth = $parentLi.children("div, ul").not("a");

                    if (!$nextDepth.length) return;
                    e.preventDefault();

                    $parentLi.toggleClass("on");
                    $parentLi.siblings("li").removeClass("on").find("li").removeClass("on");
                    $parentLi.siblings("li").find("div, ul").removeClass("on");
                });
            },

            bindResize: function () {
                var _this = this;

                $(window).on("resize", function () {
                    // GNB 상태 초기화 또는 재바인딩 필요 시 사용
                    _this.resetGnb(); // 선택적
                });
            },

            resetGnb: function () {
                // 모든 on 클래스 제거 및 메뉴 초기화
                $("#gnb .menu-item, #gnb li").removeClass("on");
                $("#gnb .menu-sub, #gnb .depth02, #gnb .depth03").removeAttr("style");
            },
        };
    })();


    /*---------------------------------------------
        Skip Navi 포커스 이동 모듈
    ---------------------------------------------*/
    // var skipNaviL = (function () {

    //     // 공통으로 타겟(main 영역) 찾는 함수
    //     function getTarget($link) {
    //         var $target = null;

    //         // finance 클래스가 있으면 무조건 visual-container 우선
    //         if ($("main").hasClass("finance")) {
    //             var $visualContainer = $(".visual-container");
    //             if ($visualContainer.length > 0) {
    //                 return $visualContainer.first();
    //             }
    //         }

    //         // 1) data-target 확인
    //         var targetSelector = $link.data("target");
    //         if (targetSelector) {
    //             $target = $(targetSelector);
    //         }

    //         // 2) data-target이 없거나 잘못된 경우: fallback
    //         if (!$target || $target.length === 0) {

    //             var fallbackSelectors = [
    //                 ".page-container",
    //                 ".contentWrap",
    //                 ".bodyWrap",
    //                 ".main",
    //                 "main"
    //             ];
    //             for (var i = 0; i < fallbackSelectors.length; i++) {
    //                 $target = $(fallbackSelectors[i]);
    //                 if ($target.length > 0) {
    //                     break;
    //                 }
    //             }
    //         }

    //         return ($target && $target.length > 0) ? $target.first() : null;
    //     }

    //     // 구조 보정: id, role, href 자동 부여
    //     function enhanceStructure() {
    //         var $link = $("#skipnavi a").first();
    //         if (!$link.length) return;

    //         var $target = getTarget($link);
    //         if (!$target) return;

    //         // 1) 타겟에 id 없으면 자동 부여
    //         var id = $target.attr("id");
    //         if (!id) {
    //             id = "contentArea";
    //             var i = 1;
    //             // 혹시 같은 id가 이미 있으면 숫자 붙이기
    //             while (document.getElementById(id)) {
    //                 id = "contentArea" + (++i);
    //             }
    //             $target.attr("id", id);
    //         }

    //         // 2) 메인 랜드마크 없으면 role="main" 달아주기 (옵션)
    //         if (!$target.is("main") && !$target.attr("role")) {
    //             $target.attr("role", "main");
    //         }

    //         // 3) 스킵 링크 href도 진짜 앵커로 만들어주기
    //         $link.attr("href", "#" + id);
    //     }

    //     return {
    //         moveFocus: function () {

    //             // 먼저 한 번 구조 보정
    //             enhanceStructure();

    //             $("#skipnavi a").on("click keydown", function (e) {
    //                 // 클릭 또는 Enter 키만 처리 (탭 키는 포커스만 받고 이동)
    //                 if (e.type === "click" || e.keyCode === 13) {
    //                     // 기본 동작 방지 (중복 점프 방지)
    //                     e.preventDefault();

    //                     var $link = $(this);
    //                     var $target = getTarget($link);

    //                     if (!$target) return;

    //                     // 포커스 받을 수 있도록 tabindex가 없으면 붙여줌
    //                     if (!$target.attr("tabindex")) {
    //                         $target.attr("tabindex", "-1");
    //                     }

    //                     // 스크롤 이동
    //                     var targetOffset = $target.offset();
    //                     if (targetOffset) {
    //                         $("html, body").animate({
    //                             scrollTop: targetOffset.top - 80 // 헤더 높이 고려
    //                         }, 300);
    //                     }

    //                     // 포커스 이동 (스크롤 후에 약간 딜레이)
    //                     setTimeout(function () {
    //                         $target.focus();
    //                     }, 100);
    //                 }

    //             });
    //         },

    //         init: function () {
    //             this.moveFocus();
    //         },
    //     };

    // })();

    

    /**
     * header on클래스 추가
     **/
    var headerL = (function () {
        var scrollY = 0;

        return {
            headerAni: function () {
                if (scrollY > 0) {
                    $(".headerOn:visible, .btmWrap:visible").addClass("on");
                } else {
                    $(".headerOn:visible, .btmWrap:visible").removeClass("on");
                }
            },
            // 스크롤 처리
            scrolling: function () {
                scrollY = $(".wrap .contentWrap").length > 0 ? $(".wrap .contentWrap").scrollTop() : 0; //.length 조건으로 존재할 때만 .scrollTop() 호출해서 스크립트가 멈추는 상황 방지
                this.headerAni();
            },
        };
    })();

    //event
    if ($(".wrap .contentWrap").length > 0) {
        $(".wrap .contentWrap").on("scroll", function () {
            headerL.scrolling();
        });
    }

    /**
     * 팝업 header on 클래스 추가
     **/
    var headerPopupL = (function () {
        var scrollY = 0;

        return {
            headerAni: function () {
                var headerOn = $(".fullPopupOn:visible .pop-header, .fullPopupOn:visible .pop-btm-wrap");
                if (scrollY > 0) {
                    headerOn.addClass("on");
                } else {
                    headerOn.removeClass("on");
                }
            },
            scrolling: function () {
                scrollY = $(".fullPopupOn .pop-con-wrap").length > 0 ? $(".fullPopupOn .pop-con-wrap").scrollTop() : 0;
                this.headerAni();
            },
        };
    })();

    // event
    if ($(".fullPopupOn .pop-con-wrap").length > 0) {
        $(".fullPopupOn .pop-con-wrap").on("scroll", function () {
            headerPopupL.scrolling();
        });
    }

    /**
     * 스크롤 업 버튼 on 클래스 제어
     **/
    // main2.html에서만 .contentWrap 스크롤 사용 (bodyWrap과 contentWrap이 함께 있는 경우)
    var $scrollContainer = $(".bodyWrap.contentWrap").length ? $(".bodyWrap.contentWrap") : $("body");
    
    var scrollTopBtnL = (function () {
        var scrollY = 0;
    
        return {
            btnAni: function () {
                if (scrollY > 200) {
                    $("#scrollTop").addClass("on");
                } else {
                    $("#scrollTop").removeClass("on");
                }
            },
            scrolling: function () {
                scrollY = $scrollContainer.scrollTop();
                this.btnAni();
            },
            btnClick: function () {
                $(".scrollUpBtn").on("click", function () {
                    $scrollContainer.animate({ scrollTop: 0 }, 200);
                });
            },
            init: function () {
                this.btnClick();
                // 초기 스크롤 위치 확인 (새로고침 시 스크롤 위치 복원 대응)
                this.scrolling();
            }
        };
    })();
    
    // event - 스크롤 컨테이너의 스크롤 이벤트 감지
    $scrollContainer.on("scroll", function () {
        scrollTopBtnL.scrolling();
    });
    
    // init 호출
    scrollTopBtnL.init();
});