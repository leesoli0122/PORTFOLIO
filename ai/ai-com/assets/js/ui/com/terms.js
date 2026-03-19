$(document).ready(function () {
    /**
     * 약관 동의
     */
    var TermsAgreement = (function () {
        var $chkAll, $reqChks, $optChks, $consChk, $consChks, $allChks, $submitBtn;

        return {
            // 초기화
            init: function () {
                $chkAll = $("#chkAll"); // 전체 동의 (부모)
                $reqChks = $(".chkReq"); // 필수 체크
                $optChks = $(".chkOpt"); // 선택 체크
                $consChk = $("#chkCons"); // 마케팅 동의 (부모)
                $consChks = $(".chkConsChild"); // 마케팅 동의 체크 (SMS, 이메일, 전화)
                $allChks = $(".chkReq, .chkOpt, #chkCons, .chkConsChild"); // 전체 체크
                // $submitBtn = $('#submitBtn'); // 제출 버튼

                this.bindEvents();
            },

            // 이벤트
            bindEvents: function () {
                var self = this;

                // 전체 동의 (부모)
                $chkAll.on("change", function () {
                    self.toggleAll($(this).prop("checked"));
                });

                // 전체 체크
                $allChks.on("change", function () {
                    // self.uptSubmitBtn();
                    self.uptAllChk();
                });

                // 마케팅 동의 (부모)
                $consChk.on("change", function () {
                    var isChecked = $(this).prop("checked");
                    $consChks.prop("checked", isChecked);
                    self.uptAllChk();
                });

                // 마케팅 동의 체크
                $consChks.on("change", function () {
                    self.uptConsAllChk();
                    self.uptAllChk();
                });
            },

            toggleAll: function (isChecked) {
                $allChks.prop("checked", isChecked);
                // this.uptSubmitBtn();
                this.uptAllChk();
            },

            // 전체 동의 체크 상태 업데이트 (체크 상태)
            uptAllChk: function () {
                var allReqChked = $reqChks.length === $reqChks.filter(":checked").length; // 필수 체크
                var allSelChked = $optChks.length === $optChks.filter(":checked").length; // 선택 체크
                var allConsChked = $consChks.length === $consChks.filter(":checked").length; // 마케팅 동의
                var allChecked = $allChks.length === $allChks.filter(":checked").length; // 전체 체크

                //  필수 + 선택 + 마케팅 동의 ( 전체 체크 시 전체 동의 체크 활성화 )
                if (allReqChked && allSelChked && allConsChked) {
                    $chkAll.prop("checked", true);
                } else {
                    $chkAll.prop("checked", false);
                }
            },

            // 마케팅 동의 체크 (선택 체크 중 하나라도 체크 시)
            uptConsAllChk: function () {
                var anyConsChked = $consChks.filter(":checked").length > 0;
                $consChk.prop("checked", anyConsChked);
            },

            //버튼 활성화 (필수 체크)
            // uptSubmitBtn: function () {
            //     var allReqChked = $reqChks.length === $reqChks.filter(':checked').length;
            //     $submitBtn.prop('disabled', !allReqChked);
            // }
        };
    })();

    TermsAgreement.init();

    // 라벨 클릭 시 체크박스 체크/해제 + 팝업 열기
    $(document).on("click", "label.check-button[data-popup-open]", function (e) {
        e.preventDefault(); // 체크박스 체크/해제 방지

        var popupId = $(this).data("popup-open");
        if (popupId && window.popupL) {
            window.popupL.openPopup(popupId);
        }
    });

    // onclick 속성을 가진 label 클릭 시 팝업 열기
    $(document).on("click", "label.check-button[onclick]", function (e) {
        e.preventDefault(); // 체크박스 체크/해제 방지
        
        var onclickAttr = $(this).attr("onclick");
        if (onclickAttr && typeof window[onclickAttr.split("(")[0]] === "function") {
            eval(onclickAttr);
        }
    });
});

$(function () {
    var BREAKPOINT = 768; // 모바일: <=768, PC: >768
    var mq = window.matchMedia("(max-width: " + BREAKPOINT + "px)");

    // 개별 요소에 대해 백업/복원/제거
    function backupIfNeeded($els) {
        $els.each(function () {
            var $el = $(this);
            if (!$el.attr("data-open-bak") && $el.is("[data-popup-open]")) {
                $el.attr("data-open-bak", $el.attr("data-popup-open")); // 값 백업
            }
            if (!$el.attr("onclick-bak") && $el.attr("onclick")) {
                $el.attr("onclick-bak", $el.attr("onclick")); // onclick 백업
            }
        });
    }
    
    function toMobile($scope) {
        var $els = ($scope || $(document)).find("label[data-open-bak], label[onclick-bak]");
        // 백업이 있는 애들은 모두 복원
        $els.each(function () {
            var $el = $(this);
            if ($el.attr("data-open-bak")) {
                $el.attr("data-popup-open", $el.attr("data-open-bak"));
            }
            if ($el.attr("onclick-bak")) {
                $el.attr("onclick", $el.attr("onclick-bak"));
            }
        });
    }
    
    function toPC($scope) {
        var $els = ($scope || $(document)).find("label[data-popup-open], label[data-open-bak], label[onclick], label[onclick-bak]");
        // 우선 새로 들어온 요소도 백업 보장
        backupIfNeeded($els);
        // 그리고 data-popup-open과 onclick 제거
        $els.filter("[data-popup-open]").removeAttr("data-popup-open");
        $els.filter("[onclick]").removeAttr("onclick");
    }

    // 초기 백업
    backupIfNeeded($("label[data-popup-open], label[onclick]"));

    // 모드 적용
    function applyMode(isMobile, $scope) {
        if (isMobile) toMobile($scope);
        else toPC($scope);
    }

    // 최초 1회
    applyMode(mq.matches);

    // 브레이크포인트 변경 감지
    if (mq.addEventListener) {
        mq.addEventListener("change", function (e) {
            applyMode(e.matches);
        });
    } else if (mq.addListener) {
        // 구형 브라우저
        mq.addListener(function (e) {
            applyMode(e.matches);
        });
    } else {
        // 폴백: resize로 변경 감지
        var lastMobile = mq.matches;
        $(window).on("resize", function () {
            var nowMobile = $(window).width() <= BREAKPOINT;
            if (nowMobile !== lastMobile) {
                lastMobile = nowMobile;
                applyMode(nowMobile);
            }
        });
    }

    // 동적 추가 감지
    if (window.MutationObserver) {
        var mo = new MutationObserver(function (muts) {
            muts.forEach(function (m) {
                var $added = $(m.addedNodes);
                if (!$added.length) return;
                var $scope = $(); // batch
                $added.each(function () {
                    $scope = $scope.add(this.nodeType === 1 ? this : []);
                });
                if ($scope.length) {
                    // 새로 추가된 label에 대해서도 모드 적용
                    applyMode(mq.matches, $scope);
                }
            });
        });
        mo.observe(document.body, { childList: true, subtree: true });
    } else {
        // 폴백: 주기적으로 체크
        setInterval(function () {
            applyMode(mq.matches);
        }, 500);
    }
});
