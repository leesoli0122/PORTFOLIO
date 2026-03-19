$(document).ready(function(){
  /*---------------------------------------------
ready, load, init
  ---------------------------------------------*/
  $(document).ready(function(){
      iptFocusScrl();
      fileUploader.init();
      initClearable(); // 클리어 버튼 초기화
  });

  /**
   * 3자리 수마다 콤마 적용
  **/
  var commaFormatter = (function () {
      return {
          format: function (input) {
              // unit 클래스가 없으면 그냥 종료
              if (!input.classList.contains('unit')) return;
  
              var value = input.value.replace(/[^0-9]/g, ''); // 숫자 이외 제거
              value = value.replace(/,/g, ''); // 기존 ',' 제거
              value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 3자리마다 ',' 추가
  
              input.value = value;
          }
      };
  })();
  // event
  $(document).on('keyup', 'input[inputmode=numeric]', function() {
      commaFormatter.format(this);
  });

   /*---------------------------
    입력 클리어 버튼 (공용)
    - .ipt-clear 래퍼 없으면 자동 생성
    - readonly 허용(= 버튼 생성 막지 않음)
  ---------------------------*/
  function ensureClear($input) {
    // 래퍼 보장
    var $wrap = $input.closest('.ipt-clear');
    /*if (!$wrap.length) {
      $input.wrap('<span class="ipt-clear"></span>');
      $wrap = $input.parent();
    }*/

    // disabled만 막음 (readonly는 허용)
    var disabled = $input.prop('disabled');
    var hasVal = ($input.val() || '').trim() !== '' && !disabled;
    var $btn = $wrap.find('> .btn-clear');

    if (hasVal && !$btn.length) {
      $('<button type="button" class="btn-clear" aria-label="입력 지우기" title="지우기">\xd7</button>')
        .appendTo($wrap)
        .on('click', function (e) {
          e.preventDefault();

          // 1) 텍스트 초기화
          $input.val('').removeClass('up').focus().trigger('input');

          // 2) 같은 .ipt-file 컨테이너가 있다면 파일/라벨도 초기화
          var $box = $wrap.closest('.ipt-file');
          if ($box.length) {
            var $file  = $box.find('input[type="file"]').first();
            var $label = $box.find('.fileLabel').first();
            if ($file.length)  $file.val('').trigger('change'); // 내부 상태/리스너 동기화
            if ($label.length) {
              // 원본 텍스트 복원: 원본 텍스트가 있으면 원본으로, 없으면 빈 문자열로
              var originalText = $label.data('original-text') || '';
              var restoreText = originalText.trim() !== '' ? originalText : '';
              $label.text(restoreText);
            }
          }

          // 3) 버튼 제거
          $(this).remove();
        });
    } else if (!hasVal && $btn.length) {
      $btn.remove();
    }
  }

  function bindClearOnce($input) {
    if ($input.data('clear-bound')) return;
    $input
      .on('input', function () { ensureClear($(this)); })
      .on('keyup change propertychange', function () { ensureClear($(this)); }); // IE 대응
    $input.data('clear-bound', true);
    ensureClear($input); // 초기 상태 반영
  }

  function initClearable(scope) {
    (scope || $(document)).find('input[type="text"]').each(function () {
      bindClearOnce($(this));
    });
  }


  /**
   * 파일 업로드
   */
  var fileUploader = (function () {
      return {
          init: function () {
              // 각 .ipt-file 컨테이너를 개별적으로 처리
              $('.ipt-file').each(function() {
                  var $container = $(this);
                  var $uploadButton = $container.find('.uploadButton');
                  var $fileInput = $container.find('input[type="file"]');
                  var $fileLabel = $container.find('.fileLabel');
                  
                  // 원본 텍스트 저장 (초기화 시점에 저장) - 빈 문자열도 그대로 저장
                  var originalText = $fileLabel.text();
                  $fileLabel.data('original-text', originalText);
                  
                  // 파일 선택 버튼 클릭
                  $uploadButton.on('click', function () {
                      $fileInput.trigger('click');
                  });
                  
                  // 키보드 접근성
                  $uploadButton.on('keydown', function (e) {
                      if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          $fileInput.trigger('click');
                      }
                  });
                  
                  // 파일 선택 시 파일명 표시 및 이미지 미리보기
                  $fileInput.on('change', function () {
                      var file = this.files[0];
                      var fileName = file ? file.name : '';
                      
                      // 현재 컨테이너의 레이블만 업데이트
                      $fileLabel.text(fileName);
                      
                      // 이미지 미리보기 (현재 컨테이너의 .img-photo)
                      var $imgPhoto = $container.closest('.photo-content').find('.img-photo');
                      if (file && file.type.startsWith('image/')) {
                        var reader = new FileReader();
                        reader.onload = function(e) {
                          $imgPhoto.html('<img src="' + e.target.result + '" alt="업로드된 이미지" style="max-width:190px; max-height:253px;">');
                        };
                        reader.readAsDataURL(file);
                      } else {
                        $imgPhoto.empty();
                      }
                      
                      // 파일 업로드 후 클리어 버튼 생성
                      if (fileName) {
                        // 기존 클리어 버튼 제거
                        $fileLabel.find('.btn-clear').remove();
                        
                        // 클리어 버튼 생성
                        $('<button type="button" class="btn-clear" aria-label="첨부파일 삭제" title="사제">&times;</button>')
                          .appendTo($fileLabel)
                          .on('click', function (e) {
                            e.preventDefault();
                            
                            // 파일 초기화 (현재 컨테이너만)
                            $fileInput.val('');
                            
                            // 텍스트 복원: 원본 텍스트가 있으면 원본으로, 없으면 빈 문자열로
                            var storedOriginalText = $fileLabel.data('original-text') || '';
                            var restoreText = storedOriginalText.trim() !== '' ? storedOriginalText : '';
                            $fileLabel.text(restoreText);
                            
                            // 현재 컨테이너의 이미지 미리보기 제거
                            var $currentImgPhoto = $container.closest('.photo-content').find('.img-photo');
                            $currentImgPhoto.empty();
                            
                            // 버튼 제거
                            $(this).remove();
                          });
                      }
                  });
              });
          }
      };
  })();

    /**
     * Android 인풋 포커스 스크롤 이슈
    **/
    function iptFocusScrl() {
        if(/Android/i.test(navigator.userAgent) ) {
            window.addEventListener("resize", function(){
                if( document.activeElement.tagName=="INPUT" ){
                    window.setTimeout(function(){
                        document.activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
                    },0);
                }
            });
        }
    }
});


 /**
     * 공통 글자수 카운터
     * - 각 textarea의 maxlength 값을 읽어 최대치로 사용
     * - .char-counter 내 .current / .max를 자동 갱신
     * - aria-live="polite"로 스크린리더에 부드럽게 알림
     */
 (function () {
  function initCounter(wrap) {
    var ta = wrap.querySelector('textarea');
    var counter = wrap.querySelector('.char-counter');
    if (!ta || !counter) return;

    var curEl = counter.querySelector('.current');
    var maxEl = counter.querySelector('.max');

    // maxlength가 없으면 기본 1000으로
    var max = parseInt(ta.getAttribute('maxlength'), 10);
    if (isNaN(max) || max <= 0) max = 1000;

    // 표시 상한 보정
    if (maxEl) maxEl.textContent = String(max);

    // 입력 시 갱신
    var update = function () {
      var len = ta.value.length;
      if (len > max) {
        // 혹시나 스크립트로 넘어가면 자르기 (브라우저가 보통 막지만 안전장치)
        ta.value = ta.value.substring(0, max);
        len = max;
      }
      if (curEl) curEl.textContent = String(len);
    };

    // 초기 1회 반영
    update();
    ta.addEventListener('input', update);
  }

  // 페이지 내 모든 textarea-wrap 처리
  document.querySelectorAll('.textarea-wrap').forEach(initCounter);
 })();

/**이메일폼 */
/*(function () {
  var emailGroups = document.querySelectorAll('.email-group');

  emailGroups.forEach(function (group) {
    var sel    = group.querySelector('.email-select');
    var domain = group.querySelector('.email-domain');
    var live   = group.querySelector('.email-live');

    if (!sel || !domain) return; 

    sel.addEventListener('change', function () {
      if (this.value) {
        domain.value = this.value;
        domain.readOnly = true;
        domain.setAttribute('aria-readonly', 'true');
        if (live) live.textContent = '도메인 ' + this.value + ' 자동으로 입력되었습니다.';
      } else {
        domain.readOnly = false;
        domain.removeAttribute('aria-readonly');
        domain.value = '';
        domain.focus();
        if (live) live.textContent = '도메인을 직접 입력하세요.';
      }
    });
  });
})();*/


/* =========================================================
   한컴 가상키보드 “입력 완료” → “인증번호 요청” 버튼 포커스 이동 (안전버전)
   - jQuery 1.12 대응(:visible 셀렉터 사용 안 함)
   - 중복 바인딩 방지
========================================================= */
(function () {
  // 중복 바인딩 방지
  if (window.__xkEnterFocusBound) return;
  window.__xkEnterFocusBound = true;

  // 포커스 이동 대상(인증번호 요청 버튼)
  function focusToCertBtn() {
    var $btn = $(".reCertReqNum").first();
    if (!$btn.length) return;

    // 혹시 disabled면 포커스 못 잡으니 방어
    if ($btn.prop("disabled")) return;

    // 혹시 display:none인 상태면 포커스 시도 의미 없으니 방어(셀렉터가 아닌 함수로 체크)
    if (!$btn.is(":visible")) return;

    $btn.focus();
  }

  // “입력 완료” 클릭 감지 (캡처 단계)
  document.addEventListener(
    "click",
    function (e) {
      // 입력완료 버튼(.xkp_enter) 클릭인지 확인
      var enter = e.target && e.target.closest ? e.target.closest("#xk-pad0 .xkp_enter") : null;
      if (!enter) return;

      // 키패드 닫힘/포커스 뺏김 타이밍 때문에 재시도
      setTimeout(focusToCertBtn, 0);
      setTimeout(focusToCertBtn, 80);
      setTimeout(focusToCertBtn, 250);
    },
    true
  );
})();
