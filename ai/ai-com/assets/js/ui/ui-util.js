// IE11 호환성을 위한 UI 유틸리티
// ES6 모듈 대신 일반 스크립트 로딩 방식 사용

(function() {
    'use strict';
    
    // IE11 호환성을 위한 동적 스크립트 로딩 함수
    function loadScript(src, callback) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        
        if (callback) {
            if (script.readyState) {
                script.onreadystatechange = function() {
                    if (script.readyState === 'loaded' || script.readyState === 'complete') {
                        script.onreadystatechange = null;
                        callback();
                    }
                };
            } else {
                script.onload = callback;
            }
        }
        
        document.head.appendChild(script);
    }
    
    // 모든 UI 컴포넌트 스크립트 로드 
    function loadUIComponents() {
        var components = [
            'accordion.js',
            'input.js',
            'layout.js',
            'popup.js',
            'tab.js',
            'nav.js',
            'terms.js',
        ];
        
        var basePath = '../../assets/js/ui/com/';
        var loadedCount = 0;
        
        console.log('UI 컴포넌트 로딩 시작...');
        
        components.forEach(function(component) {
            var scriptPath = basePath + component;
            console.log('로딩 중:', scriptPath);
            
            loadScript(scriptPath, function() {
                loadedCount++;
                console.log('로드 완료:', component, '(', loadedCount, '/', components.length, ')');
                if (loadedCount === components.length) {
                    console.log('모든 UI 컴포넌트가 로드되었습니다.');
                }
            });
        });
    }
    
    // DOM이 준비되면 UI 컴포넌트 로드
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadUIComponents);
    } else {
        loadUIComponents();
    }
    
    console.log('UI Util loaded - IE11 compatible version');
})();

