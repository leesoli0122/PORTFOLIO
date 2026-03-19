"use strict";

$(document).ready(function () {
  /*---------------------------------------------
  ready, load, init
  ---------------------------------------------*/
  $(document).ready(function () {
    iptFocusScrl();
    fileUploader.init();
  });
  /**
   * 3�ڸ� ������ �޸� ����
  **/

  var commaFormatter = function () {
    return {
      format: function format(input) {
        // unit Ŭ������ ������ �׳� ����
        if (!input.classList.contains('unit')) return;
        var value = input.value.replace(/[^0-9]/g, ''); // ���� �̿� ����

        value = value.replace(/,/g, ''); // ���� ',' ����

        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 3�ڸ����� ',' �߰�

        input.value = value;
      }
    };
  }(); // event


  $(document).on('keyup', 'input[inputmode=numeric]', function () {
    commaFormatter.format(this);
  });
  /**
   * ���� ���ε�
   */

  var fileUploader = function () {
    return {
      init: function init() {
        var $uploadInput = $('.uploadInput');
        var $upload = $('.uploadInput, .uploadButton');
        /* 20251017 �߰� �������⿡�� ��� */

        var $fileInput = $('#files');
        var $fileLabel = $('.fileLabel');
        $upload.on('click', function () {
          $fileInput.trigger('click');
        });
        $upload.on('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            $fileInput.trigger('click');
          }
        }); // ���ϸ� ǥ��

        $fileInput.on('change', function () {
          var fileName = this.files.length > 0 ? this.files[0].name : '';
          $uploadInput.val(fileName).text(fileName).addClass('up');
          $fileLabel.text('���õ� ����: ' + fileName);
        });
      }
    };
  }();
  /**
   * Android ��ǲ ��Ŀ�� ��ũ�� �̽�
  **/


  function iptFocusScrl() {
    if (/Android/i.test(navigator.userAgent)) {
      window.addEventListener("resize", function () {
        if (document.activeElement.tagName == "INPUT") {
          window.setTimeout(function () {
            document.activeElement.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
          }, 0);
        }
      });
    }
  }
});
//# sourceMappingURL=input.dev.js.map
