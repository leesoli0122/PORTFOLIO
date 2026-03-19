$(function(){
  $('[data-include-path]').each(function(){
    var path = $(this).attr('data-include-path');
    var url  = path + (path.indexOf('?')>-1 ? '&' : '?') + '_v=' + Date.now();
    var $this = $(this);
    $this.load(url, function(res, status, xhr){
      if(status === 'error'){
        $this.html('로드 ??????: ' + xhr.status + ' ' + xhr.statusText + '<br><code>'+url+'</code>');
      } else {
        // include ????? ??? nav.js ??????
        if (path.indexOf('nav.html') > -1 || path.indexOf('lnb.html') > -1) {
          // nav.js?? ????? 로드?????? ???????? ??????
          if (typeof window.mobileMenu === 'undefined') {
            // nav.js 로드
            $.getScript('../../assets/js/ui/com/nav.js', function() {
              console.log('nav.js 로드 ?????');
            });
          } else {
            // ????? 로드??? 경우 ????????? ?????????
            if (typeof window.mobileMenu === 'function') window.mobileMenu();
            if (typeof window.menuToggle === 'function') window.menuToggle();
            if (typeof window.headerMenu === 'function') window.headerMenu();
          }
          
          // ???????? ???벤트 ???바인??? ??????
          setTimeout(function() {
            if (typeof window.bindScrollEvents === 'function') {
              console.log('???????? ???벤트 ???바인??? ??????');
              window.bindScrollEvents();
            }
          }, 100);
        }
      }
    });
  });
});