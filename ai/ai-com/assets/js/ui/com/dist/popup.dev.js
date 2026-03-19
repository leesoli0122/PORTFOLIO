"use strict";

$(document).ready(function () {
  (function () {
    var DEBUG = false; // ���������� �˾��� �� Ʈ����(��ư/��ǲ/��)

    var lastTriggerEl = null;
    /* =========================================================
       [2026-01-13] �߰� #A: ���������� ��Ŀ���� �ִ� ���(���� �˷� ���)
       - Ŭ�� ���� �ߴ� �˷��� lastTriggerEl�� ���� �� ������ lastActiveEl�� ����
    ========================================================= */

    var lastActiveEl = null; // ��Ŀ�� ������ ��� �ĺ� ������ (button ����)

    var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' + 'select:not([disabled]), textarea:not([disabled]), [role="button"], ' + '[tabindex]:not([tabindex="-1"])';

    function log() {
      if (!DEBUG) return;

      try {
        console.log.apply(console, arguments);
      } catch (e) {}
    }
    /* =========================================================
       [2026-01-13] �߰� #B: ������ ���� �˷����� "���� ��" ���� fallback ��Ŀ��
       - lastTriggerEl / lastActiveEl�� ������ ����� �̵�
       - ������Ʈ�� �°� selector �켱������ �ణ ��Ƶ�
    ========================================================= */


    function getFallbackFocusEl() {
      // 1) �α��� ȭ���̶�� ���̵�/��� �Է��� �ֿ켱
      var el = document.querySelector('#loginId, #user_id, #userid, input[name="userId"], input[name="id"], input[type="text"].login') || document.querySelector('#loginPw, #password, input[name="password"], input[type="password"]');
      if (el) return el; // 2) �α��� ��ư/��ũ(�ؽ�Ʈ ����� �����ϴ� class/id �켱)

      el = document.querySelector('#btnLogin, .btn-login, a.btn-login, button.btn-login') || document.querySelector('a[href*="login"], button[onclick*="login"], a[onclick*="login"]');
      if (el) return el; // 3) ����/�������� ù ��Ŀ�� ���� ���

      el = document.querySelector('main ' + FOCUSABLE) || document.querySelector(FOCUSABLE);
      return el || null;
    }
    /* =========================================================
       [2026-01-15] ���� ���� �Լ�(�˾� "���� ����"������ ���)
       - ��Ģ: ���̾ �ϳ��� ���� ��(=������ ����)�� "�θ� Ʈ����"�� ����
    ========================================================= */


    function restoreFocusBack() {
      var backEl = lastTriggerEl && document.contains(lastTriggerEl) ? lastTriggerEl : lastActiveEl && document.contains(lastActiveEl) ? lastActiveEl : getFallbackFocusEl();
      if (!backEl || !document.contains(backEl)) return;
      var tries = 0;

      (function attempt() {
        tries++;

        try {
          if (typeof backEl.scrollIntoView === "function") {
            backEl.scrollIntoView({
              block: "nearest",
              inline: "nearest"
            });
          }

          backEl.focus();
        } catch (e) {}

        if (document.activeElement === backEl) return;
        if (tries < 3) setTimeout(attempt, 60);
      })();
    }
    /* =========================================================
       [2026-01-16] START (���� �۾�)
        �ٽ� ��ǥ: "�˾� �ȿ��� confirm/alert ���̾ �ߴ� 2�� �˾�"�� �������� �ذ�
       ---------------------------------------------------------
       1) ���̾�(�˾�/confirm/alert)�� �������� ����
          - ����: �ش� ���̾� ���η� ��Ŀ�� ����
          - ����: �Ʒ� ���̾�� ���� (���̾ ������ restoreFocusBack)
       2) ���� �ҽ� �ִ� Ȱ��:
          - restoreFocusBack() �״�� ��� (��, ���̾ 0���� ���� ȣ��ǵ��� ����)
          - focusIntoPopup() �״�� ��� (layerPopup ���� �� ����)
          - ���� click �ڵ鷯/closePopup ����
       3) ���� #G(�˷� �������� restoreFocusBack ȣ��)�� 2�� �������� Ʀ�� �����̶� ����/��ü
    ========================================================= */

    /* ---------------------------------------------
       #E(���� ����) : data-* �� ����(Ŭ����/onclick) Ʈ���ŵ� lastTriggerEl�� ����
       - �˾�/�˷� ���� Ŭ���� Ʈ���ŷ� ����� ����
       - click���� ���� ��� ���� ĸó(pointerdown/mousedown/keydown) ���
    --------------------------------------------- */


    function rememberTrigger(target) {
      var $cand = $(target).closest('a[href], button, input, select, textarea, label, [role="button"], [tabindex]');
      if (!$cand.length) return; // �˾�/�˷� ���� Ŭ���� Ʈ���ŷ� ����� ����(�ݱ�/Ȯ�� ��ư ��)

      if ($cand.closest(".layerPopup, [role='alert'], [role='alertdialog'], [aria-modal='true'], .ui-dialog, [role='dialog']").length) return;
      lastTriggerEl = $cand.get(0);
    }

    document.addEventListener("pointerdown", function (e) {
      rememberTrigger(e.target);
    }, true);
    document.addEventListener("mousedown", function (e) {
      rememberTrigger(e.target);
    }, true);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") rememberTrigger(e.target);
    }, true);
    /* ---------------------------------------------
       [���̾� �Ǻ�] : "�˾�/confirm/alert" �����̳� �ĺ�
       - ����û �˾�: .layerPopup.on
       - confirm/alert: .pop-content.alert (����), .confirm, [role='alertdialog'] ��
    --------------------------------------------- */

    function getLayerContainer(el) {
      if (!el) return null;
      return el.closest(".layerPopup.on, .layerPopup.active," + // ���� �˾�
      ".pop-content.alert, .alert, .confirm, .layerAlert," + // confirm/alert �迭(������Ʈ ����)
      ".message, .messagePop, .modalAlert," + ".ui-dialog, [role='dialog'], [role='alertdialog'], [aria-modal='true']");
    }
    /* ---------------------------------------------
       [���̾� ���� ù ��Ŀ��] : confirm�� ��ư �켱
    --------------------------------------------- */


    function firstFocusableIn(container) {
      if (!container) return null; // ����: confirm_yes/no �� ������ �ֿ켱

      var el = container.querySelector("#confirm_yes, #confirm_no") || container.querySelector("[data-confirm-yes], [data-confirm-no]");
      if (el) return el;
      el = container.querySelector(FOCUSABLE);
      if (el) return el; // ����: �����̳� ��ü

      if (!container.hasAttribute("tabindex")) container.setAttribute("tabindex", "-1");
      return container;
    }
    /* ---------------------------------------------
       [�����ִ� ���̾� ���] : ���� �� ���� ���� �Ǵܿ�
    --------------------------------------------- */


    function getOpenLayers() {
      var nodes = Array.prototype.slice.call(document.querySelectorAll(".layerPopup.on, .layerPopup.active," + ".pop-content.alert, .alert, .confirm, .layerAlert," + ".message, .messagePop, .modalAlert," + ".ui-dialog, [role='alertdialog'], [role='dialog'][aria-modal='true']"));
      return nodes.filter(function (n) {
        if (!n || !document.contains(n)) return false;
        var cs = window.getComputedStyle(n);
        return cs.display !== "none" && cs.visibility !== "hidden";
      });
    }
    /* ---------------------------------------------
       [���̾� ���η� ��Ŀ�� ����] (��õ� ����)
    --------------------------------------------- */


    function focusIntoLayer(container) {
      if (!container || !document.contains(container)) return;
      var tries = 0;

      (function attempt() {
        tries++;
        var el = firstFocusableIn(container);

        try {
          el.focus();
        } catch (e) {}

        if (document.activeElement === el) return;
        if (tries < 4) setTimeout(attempt, 60);
      })();
    }
    /* ---------------------------------------------
       [���̾� ����] : 2�� �˾� ��Ŀ�� ���͸� ���� ó��
    --------------------------------------------- */


    var layerStack = []; // { el: HTMLElement, lastFocusInside: HTMLElement|null }

    function pushLayer(container) {
      if (!container) return; // �ߺ� push ����

      for (var i = layerStack.length - 1; i >= 0; i--) {
        if (layerStack[i].el === container) {
          focusIntoLayer(container);
          return;
        }
      }

      layerStack.push({
        el: container,
        lastFocusInside: null
      });
      focusIntoLayer(container);
    }

    function markLastFocusInside(container, focusEl) {
      if (!container || !focusEl) return;

      for (var i = layerStack.length - 1; i >= 0; i--) {
        if (layerStack[i].el === container) {
          layerStack[i].lastFocusInside = focusEl;
          return;
        }
      } // ���ÿ� ������(���Ž÷� ���ڱ� �� ���̾�) push�ϰ� ���


      layerStack.push({
        el: container,
        lastFocusInside: focusEl
      });
    }

    function popLayer(container) {
      if (!container) return; // ���ÿ��� ����

      for (var i = layerStack.length - 1; i >= 0; i--) {
        if (layerStack[i].el === container) {
          layerStack.splice(i, 1);
          break;
        }
      } // ���� �Ŀ��� ���̾ ���������� -> ���� �� ���̾�� ����


      var openLayers = getOpenLayers();

      if (openLayers.length) {
        var top = openLayers[openLayers.length - 1]; // top ���̾ lastFocusInside�� ������ �켱 ���

        var last = null;

        for (var k = layerStack.length - 1; k >= 0; k--) {
          if (layerStack[k].el === top && layerStack[k].lastFocusInside && document.contains(layerStack[k].lastFocusInside)) {
            last = layerStack[k].lastFocusInside;
            break;
          }
        }

        if (last) {
          try {
            last.focus();
          } catch (e) {}

          setTimeout(function () {
            try {
              last.focus();
            } catch (e) {}
          }, 0);
        } else {
          focusIntoLayer(top);
        }

        return;
      } // ���̾ �ϳ��� ������ -> ���������� �θ� Ʈ���ŷ� ����


      restoreFocusBack();
    }
    /* ---------------------------------------------
       ? focusin ��� ��ü: ���̾� ���δ� ���ÿ� ��� / ���̾� ���� lastActiveEl ���
       - (���� "�˾� ���δ� ������� ����" ���� ����)
    --------------------------------------------- */


    document.addEventListener("focusin", function () {
      var ae = document.activeElement;
      if (!ae || ae === document.body || ae === document.documentElement) return;
      var layer = getLayerContainer(ae);

      if (layer) {
        markLastFocusInside(layer, ae);
        return;
      }

      lastActiveEl = ae;
    });
    /* ---------------------------------------------
       ? ���̾� ����/���� ���� (class ��� + DOM �߰�/���� ���)
    --------------------------------------------- */

    (function observeLayerOpenClose() {
      if (!window.MutationObserver) return; // 1) class ���(on/active) ����

      var classObs = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.type !== "attributes" || m.attributeName !== "class") continue;
          var el = m.target;
          if (!el || el.nodeType !== 1) continue; // ���̾� �ĺ��� ó��

          if (!el.matches(".layerPopup, .pop-content.alert, .alert, .confirm, .layerAlert, .message, .messagePop, .modalAlert, " + ".ui-dialog, [role='dialog'], [role='alertdialog'], [aria-modal='true']")) continue;
          var oldVal = m.oldValue || "";
          var wasOpen = oldVal.indexOf("on") !== -1 || oldVal.indexOf("active") !== -1;
          var isOpen = el.classList.contains("on") || el.classList.contains("active");

          if (!wasOpen && isOpen) {
            // ����: ���η� ��Ŀ�� ����
            pushLayer(el);
          } else if (wasOpen && !isOpen) {
            // ����: �Ʒ� ���̾� or �θ�� ����
            setTimeout(function () {
              popLayer(el);
            }, 0);
          }
        }
      });
      classObs.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ["class"]
      }); // 2) DOM �߰�/���� ���� (confirm�� remove �Ǵ� Ÿ��)

      var domObs = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          // added
          if (m.addedNodes && m.addedNodes.length) {
            Array.prototype.forEach.call(m.addedNodes, function (node) {
              if (!node || node.nodeType !== 1) return;

              if (node.matches && node.matches(".pop-content.alert, .alert, .confirm, .layerAlert, .message, .messagePop, .modalAlert, [role='alertdialog'], [role='dialog'][aria-modal='true']")) {
                pushLayer(node);
              }
            });
          } // removed


          if (m.removedNodes && m.removedNodes.length) {
            Array.prototype.forEach.call(m.removedNodes, function (node) {
              if (!node || node.nodeType !== 1) return;

              if (node.matches && node.matches(".pop-content.alert, .alert, .confirm, .layerAlert, .message, .messagePop, .modalAlert, [role='alertdialog'], [role='dialog'][aria-modal='true'], .layerPopup")) {
                setTimeout(function () {
                  popLayer(node);
                }, 0);
              }
            });
          }
        });
      });
      domObs.observe(document.body, {
        childList: true,
        subtree: true
      });
    })();
    /* =========================================================
       [2026-01-16] END (���� �۾�)
    ========================================================= */
    // �˾� ���η� ��Ŀ�� �̵� (���� �Լ� �ִ� Ȱ�� �״�� ����)


    function focusIntoPopup($target) {
      if (!$target || !$target.length) return;

      function pick() {
        var $firstFocusable = $target.find(FOCUSABLE).filter(":visible").first();
        if ($firstFocusable.length) return $firstFocusable;
        var $el = $target.find(".pop-area").first();
        if (!$el.length) $el = $target.find(".pop-content").first();
        if (!$el.length) $el = $target;
        if (!$el.is("[tabindex]")) $el.attr("tabindex", "-1");
        return $el;
      }

      var tries = 0;

      (function attempt() {
        tries++;
        var $el = pick();

        try {
          $el.get(0).focus();
        } catch (e) {}

        if (document.activeElement === $el.get(0)) return;
        if (tries < 4) setTimeout(attempt, 60);
      })();
    }

    var popupL = {
      /** �˾� �ʱ�ȭ **/
      initPopup: function initPopup(id) {
        var $target = $("#" + id);
        if (!$target.length) return;
        $target.addClass("on");
        $target.find(".pop-content").scrollTop(0);
        $("body, .contentWrap").css("overflow", "hidden");
        log("initPopup:", id); // ���� ��Ŀ�� ���� �״�� ���

        focusIntoPopup($target); // Ŭ�� ��Ŀ�� �ǵ��� ������ 2��

        requestAnimationFrame(function () {
          focusIntoPopup($target);
        }); // [2026-01-16] ���̾� ���ÿ��� ���(���� �� ���� push)
        // - closePopup�� �ƴ϶� class ��۷� ������ ���̽��� ������ observer�� ��κ� ó��������,
        //   ���⼭�� �����ϰ� push(�ߺ��� pushLayer�� ����)

        pushLayer($target.get(0));
      },
      openPopup: function openPopup(id) {
        this.initPopup(id);
      },
      openModal: function openModal(id) {
        this.initPopup(id);
        log("openModal:", id);
      },
      openMenu: function openMenu(id) {
        this.initPopup(id);
        log("openMenu:", id);
      },

      /** �˾� �ݱ� **/
      closePopup: function closePopup(id) {
        var _target = document.getElementById(id);

        if (_target) _target.classList.remove("on");
        this.fkSelAndPopupResetOverflow();

        if (_target && _target.classList.contains("full")) {
          var header = _target.querySelector(".pop-header");

          if (header) header.style.position = "";
        }

        this.fkSelAndPopupResetOverflow(); // [2026-01-16] �˾� ������ "���̾� pop"���� ó��
        // - popLayer�� ���� ���̾� ���������� ��������,
        //   �ƹ��͵� ������ restoreFocusBack()���� �θ� ����

        setTimeout(function () {
          if (_target) popLayer(_target);else restoreFocusBack(); // ������
        }, 50);
      },
      fkSelAndPopupResetOverflow: function fkSelAndPopupResetOverflow() {
        var isPopupOpen = $(".layerPopup.on").length > 0;
        var isSelectOpen = $(".stove-option-layer.on").length > 0;

        if (!isPopupOpen && !isSelectOpen) {
          $("body, .contentWrap").css("overflow", "");
          $(".pop-area, .pop-content").removeAttr("tabindex");
          setTimeout(function () {
            $(".layerPopup.toggleUp").removeClass("active");
          }, 10);
        }
      }
    };
    var btmShtTL = {
      btmAti: function btmAti(id) {
        var $target = $("#" + id);
        if (!$target.length) return;
        var $contentWrap = $target.find(".pop-content");
        $target.toggleClass("active");
        log("btmAti:", id);

        if ($target.hasClass("active")) {
          $contentWrap.scrollTop(0);
          $contentWrap.attr("tabindex", "-1");
          setTimeout(function () {
            try {
              $contentWrap.get(0).focus();
            } catch (e) {}
          }, 0);
          setTimeout(function () {
            try {
              $contentWrap.get(0).focus();
            } catch (e) {}
          }, 60); // [2026-01-16] ���ҽ�Ʈ�� ���̾� ���(�ʿ� ��)

          pushLayer($target.get(0));
        } else {
          $contentWrap.removeAttr("tabindex"); // [2026-01-16] ������ pop

          popLayer($target.get(0));
        }
      }
    }; // �� + change �� �˾� ���� ���̽� (���� ����)

    $(document).on("change", "input, select, textarea", function () {
      var $label = $('label[for="' + this.id + '"]');
      var popupId = $label.data("popup-open");
      if (!popupId) return;
      lastTriggerEl = $label.get(0) || this;
      popupL.openPopup(popupId);
    }); // Ŭ������ ���ݴ� ���̽� (���� ����)

    $(document).on("click", function (e) {
      var $t = $(e.target);
      var $openBtn = $t.closest("[data-popup-open]");

      if ($openBtn.length) {
        lastTriggerEl = $openBtn.get(0);
        return popupL.openPopup($openBtn.data("popup-open"));
      }

      var $modalBtn = $t.closest("[data-modal-open]");

      if ($modalBtn.length) {
        lastTriggerEl = $modalBtn.get(0);
        return popupL.openModal($modalBtn.data("modal-open"));
      }

      var $menuBtn = $t.closest("[data-menu-open]");

      if ($menuBtn.length) {
        lastTriggerEl = $menuBtn.get(0);
        return popupL.openMenu($menuBtn.data("menu-open"));
      }

      var $closeBtn = $t.closest("[data-popup-close]");
      if ($closeBtn.length) return popupL.closePopup($closeBtn.data("popup-close"));
      var $btmToggleBtn = $t.closest("[data-btm-toggle]");

      if ($btmToggleBtn.length) {
        lastTriggerEl = $btmToggleBtn.get(0);
        return btmShtTL.btmAti($btmToggleBtn.data("btm-toggle"));
      } // ���ҽ�Ʈ dim Ŭ�� �� �ݱ� (���� ����)


      var $dimLayer = $t.closest(".layerPopup.btmSheet");

      if ($dimLayer.length && $t.is($dimLayer)) {
        $dimLayer.removeClass("active").find(".pop-content").removeAttr("tabindex");
        popupL.closePopup($dimLayer.attr("id"));
      }
    });
    /* =========================================================
       [2026-01-13] �߰� #D: ���Ž�(Ŭ����/onclick)�� ������ layerPopup ��Ŀ�� ����(����)
       - ���� ����� ���� �ʱ� ���� .layerPopup.on "����"�� ����
       - [2026-01-16]  ���⼭�� ���� ���� �� focusIntoPopup + pushLayer�� ����
    ========================================================= */

    (function observeLegacyLayerPopupOpen() {
      if (!window.MutationObserver) return;
      var obs = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.type !== "attributes" || m.attributeName !== "class") continue;
          var el = m.target;
          if (!el || !el.classList) continue;
          if (!el.classList.contains("layerPopup")) continue;
          var oldVal = m.oldValue || "";
          var wasOpen = oldVal.indexOf("on") !== -1;
          var isOpen = el.classList.contains("on");

          if (!wasOpen && isOpen) {
            focusIntoPopup($(el)); // [2026-01-16] ���� push

            pushLayer(el);
          }
        }
      });
      obs.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ["class"]
      });
    })();
    /* ===== [2026-01-15] START =====
       #F ���Ž� ���� ����(���� closePopup �� ���� class�� ���� ���)
       - .layerPopup.on �� ������ ���� popLayer() ����
       - (���� restoreFocusBack ���) ���� ��Ģ���� �Ʒ� ���̾�/�θ� ����
    ===== */


    (function observeLegacyLayerPopupClose() {
      if (!window.MutationObserver) return;
      var obs = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.type !== "attributes" || m.attributeName !== "class") continue;
          var el = m.target;
          if (!el || !el.classList) continue;
          if (!el.classList.contains("layerPopup")) continue;
          var oldVal = m.oldValue || "";
          var wasOpen = oldVal.indexOf("on") !== -1;
          var isOpen = el.classList.contains("on");

          if (wasOpen && !isOpen) {
            setTimeout(function () {
              popLayer(el);
            }, 50);
          }
        }
      });
      obs.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ["class"]
      });
    })();
    /* ===== [2026-01-15] END ===== */

    /* =========================================================
       [2026-01-16] START  (���� �۾�)
        ���� #G(�˷� �������� restoreFocusBack ȣ��) ����/��ü
       - ����: confirm(�˷�) ������ "�θ� Ʈ����"�� �ƴ϶� "�Ʒ� ���̾�(����û �˾�)"�� ���� ��
       - ������ observeLayerOpenClose()�� DOM remove/class ����� ������ popLayer()�� ó����
    ========================================================= */
    // (�ǵ������� �����)  �� ���� observeGenericAlertClose() ������ ����/�ּ� ó��

    /* =========================================================
       [2026-01-16] END (���� �۾�)
    ========================================================= */
    // ���� ����


    window.popupL = popupL;
    window.btmShtTL = btmShtTL;
    window.fkSelAndPopupResetOverflow = popupL.fkSelAndPopupResetOverflow;
  })();
});
//# sourceMappingURL=popup.dev.js.map
