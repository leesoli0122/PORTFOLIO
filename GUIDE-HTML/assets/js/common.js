/*---------------------------------------------
ready, load
---------------------------------------------*/
// 모든 리소스(이미지 등)가 로드된 후 fnPreload()를 호출하여 초기화
$(window).on('load', function(){
    fnPreload();
});

/*---------------------------------------------
preload, init
---------------------------------------------*/
/* preload */
function fnPreload(){
    statusManager.init();
}

/*---------------------------------------------
statusManager 모듈 정의
---------------------------------------------*/
var statusManager = (function() {
// 상태별 개수 변수
var progressCnt = 0,   // 진행 중 개수
compCnt     = 0,   // 완료 개수
atmosphere      = 0;   // 대기 개수

return {
// 테이블 각 행의 상태를 업데이트하는 함수
updateStates: function(){

    // 호출 시마다 카운트 초기화
    progressCnt = 0;
    compCnt = 0;
    atmosphere = 0;

    $(".component-item").each(function() {
        var $row = $(this);
        var $stateCell = $row.find(".status-badge");

        if ($row.hasClass("non")) {
            $stateCell.html("<span>대기</span>");
            atmosphere++;
        } else if ($row.hasClass("ing")) {
            $stateCell.html("<span>진행중</span>");
            progressCnt++;
        } else if ($row.hasClass("comp")) {
            $stateCell.html("<span>완료</span>");
            compCnt++;
        } else {
            $stateCell.text("");
        }
    });

},

// 상태별 카운트를 업데이트
updateCounts: function(){
    var totCnt = $(".component-item").length; // 전체 li 개수
    $("#compCnt").text(compCnt);
    $("#totCnt").text(totCnt);
    $("#progressCnt").text(progressCnt);
    $("#atmosphere").text(atmosphere);
},
    // 전체 초기화: 상태 업데이트, 카운트 갱신, 레이아웃 조정 실행
    init: function() {
    // 반환된 객체의 메서드를 호출
    this.updateStates();
    this.updateCounts();
},
    // 상태와 카운트만 갱신
    update: function() {
        this.updateStates();
        this.updateCounts();
        }
    };
})();