// 현재 선택된 카테고리 값
// 처음 화면에서는 전체 데이터를 보여줘야 하므로 '전체'로 초기화
var currentCategory = '전체';

// 화면에서 사용할 주요 DOM 요소를 변수에 저장
// 처음 화면에서는 전체 데이터를 보여줘야 하므로 '전체'로 초기화
var searchInput = document.getElementById('searchKeyword');
var tableBody = document.getElementById('symbolTableBody');
var categoryList = document.getElementById('categoryList');
var copyStatus = document.getElementById('copyStatus');

// 특수문자 목록을 화면에 그리는 함수
// 검색어 입력, 카데고리 선택이 바뀔 때마다 다시 실행됨
function renderTable() {
    // 검색어를 소문자로 변환
    // 영문 검색 시 대소문자 구분 없이 찾기 위함
    var keyword = searchInput.value.toLowerCase();
    
    // 최종적으로 tbody 안에 넣을 HTML 문자열
    var html = '';

    // 실제 화면에 출력된 데이터 개수
    // 검색 결과가 없을 때 안내 문구를 보여주기 위해 사용
    var count = 0;

    // symbolList 배열을 처음부터 끝까지 반복
    for (var i = 0; i < symbolList.length; i++) {
        var item = symbolList[i];

        // 검색 대상 문자열 생성
        // 특수문자, 설명, 카테고리, 단축키, 엔테테 전체에서 검색되게 처리
        var searchText = (
            item.symbol + ' ' +
            item.name + ' ' +
            item.category + ' ' +
            item.shortcut + ' ' +
            item.entity
        ).toLowerCase();

        // 현재 선택된 카테고리가 '전체'가 아니고,
        // 데이터의 카테고리와 다르면 출력하지 않음
        if (currentCategory !== '전체' && item.category !== currentCategory) {
            continue;
        }

        // 검색어가 있고, 검색 대상 문자열에 포함되지 않으면 출력하지 않음
        if (keyword && searchText.indexOf(keyword) === -1) {
            continue;
        }

        // 조건을 통과한 데이터만 테이블 행으로 생성
        html += '<tr>';

        // 특수문자 출력
        // 공백 문자는 눈에 보이지 않기 때문에 getDisplaySymbol 함수에서 별도 처리
        html += '<td class="symbol">' + getDisplaySymbol(item) + '</td>';

        // 설명 출력
        html += '<td>' + escapeHtml(item.name) + '</td>';
        
        // 카테고리 출력
        html += '<td>' + escapeHtml(item.category) + '</td>';
        
        // 맥 단축키 출력
        // 값이 없으면 '-' 표시
        html += '<td>' + escapeHtml(item.shortcut || '-') + '</td>';

        // HTML 엔티티 출력
        // code 태그로 감싸서 코드 성격을 명확히 함
        html += '<td><code>' + escapeHtml(item.entity) + '</code></td>';

        // 복사 버튼 영역 시작
        html += '<td>';

        // 특수문자 자체를 복사하는 버튼
        // data-copy-type="symbol"로 복사 종류 구분
        html += '<button type="button" class="copy-btn" data-copy-type="symbol" data-copy="' + escapeHtml(item.symbol) + '">' + escapeHtml(item.name) + ' 특수문자 복사</button>';
        
        // HTML 엔테테를 복사하는 버튼
        // data-copy-type="entity"로 복사 종류 구분
        if (item.entity) {
            html += '<button type="button" class="copy-btn" data-copy-type="entity" data-copy="' + escapeHtml(item.entity) + '">' + escapeHtml(item.name) + ' HTML 엔티티 복사</button>';
        } else {
            html += '<span class="disabled-text" aria-label="HTML 엔티티 없음"></span>';
        }
        
        html += '</td>';
        html += '</tr>';

        // 실제 출력된 개수 증가
        count++;
    }

    // 출력할 데이터가 없으면 안내 문구 출력
    if (count === 0) {
        html = '<tr><td colspan="6" class="empty-message">검색 결과가 없습니다.</td></tr>';
    }

    // 완성된 HTML을 tbody에 삽입
    tableBody.innerHTML = html;
}

// 특수문자를 화면에 표시하는 함수
function getDisplaySymbol(item) {
    // 공백 문자는 화면에서 안 보이기 때문에 □로 대체 표시
    // 단, 스크린리더에는 실제 의미가 전달되도록 숨김 텍스트 제공
    if (item.category === '공백') {
        return '<span aria-hidden="true">□</span><span class="visually-hidden">' + escapeHtml(item.name) + '</span>';
    }

    // 일반 특수문자는 그대로 출력
    return escapeHtml(item.symbol);
}

// HTML 문자열 삽입 시 특수문자 충돌/XSS 위험을 줄이기 위한 이스케이프 함수
// 예를 들어 데이터에 <, >, & 같은 문자가 있으면 HTML 구조가 깨질 수 있음
function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 실제 복사 실행 함수
function copyText(text, type) {
    // 최신 브라우저에서는 navigator.clipboard 사용
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
            // 복사 성공 시 메시지 출력
            showCopyMessage(text, type);
        }).catch(function () {
            // clipboard API가 실패하면 구버전 방식으로 재시도
            fallbackCopy(text, type);
        });
    } else {
        // navigator.clipboard를 지원하지 않으면 fallback 사용
        fallbackCopy(text, type);
    }
}

// 구버전 브라우저 대응 복사 함수
function fallbackCopy(text, type) {
    var textarea = document.createElement('textarea');

    // textarea에 복사할 값을 넣음
    textarea.value = text;

    // 사용자가 수정하지 못하게 readonly 처리
    textarea.setAttribute('readonly', 'readonly');

    // 화면 밖으로 숨김
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';

    // body에 임시 textarea 추가
    document.body.appendChild(textarea);

    // textarea 내용을 선택
    textarea.select();

    try {
        // 선택된 텍스트를 클립보드에 복사
        document.execCommand('copy');

        // 복사 성공 메시지 출력
        showCopyMessage(text, type);
    } catch (e) {
        // 복사 실패 시 안내
        copyStatus.textContent = '복사에 실패했습니다. 직접 선택해서 복사해주세요.';
    }

    // 임시 textarea 제거
    document.body.removeChild(textarea);
}

// 복사 완료 메시지 출력 함수
function showCopyMessage(text, type) {
    // 복사한 대상이 엔테테인지 특수문자인지 구분
    var typeText = type === 'entity' ? 'HTML 엔티티' : '특수문자';

    // 일반 공백은 화면에 보이지 않기 때문에 별도 문구 처리
    if (text === ' ') {
        copyStatus.textContent = '일반 공백 ' + typeText + ' 복사 완료';
        return;
    }

    // role="status", aria-live="polite" 영역에 메시지가 들어가므로
    // 스크린리더 사용자도 복사 완료 상태를 알 수 있음
    copyStatus.textContent = text + ' ' + typeText + ' 복사 완료';
}

// 검색창에 키 입력이 발생할 때마다 테이블 다시 그림
searchInput.onkeyup = function () {
    renderTable();
};

// 카테고리 버튼 클릭 이벤트
// 각 버튼마다 이벤트를 거는 대신, 부모 ul에 한 번만 이벤트를 걸어 이벤트 위임 처리
categoryList.onclick = function (event) {
    var target = event.target || event.srcElement;

    // 클릭한 대상이 버튼이 아니면 종료
    if (!target || target.tagName.toLowerCase() !== 'button') {
        return;
    }

    // 선택된 버튼 스타일과 aria-pressed 상태 변경
    setActiveCategory(target);

    // 현재 카테고리 값 갱신
    currentCategory = target.getAttribute('data-category');
    
    // 변경된 카테고리 기준으로 테이블 다시 그림
    renderTable();
};

// 활성화된 카테고리 버튼 상태 처리
function setActiveCategory(activeButton) {
    var buttons = categoryList.getElementsByTagName('button');

    // 모든 버튼을 비활성 상태로 초기화
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].className = 'category-btn';
        buttons[i].setAttribute('aria-pressed', 'false');
    }

    // 클릭한 버튼만 활성화
    activeButton.className = 'category-btn is-active';
    activeButton.setAttribute('aria-pressed', 'true');
}

// 테이블 안의 복사 버튼 클릭 이벤트
// renderTable로 버튼이 동적으로 생성되기 때문에 이벤트 위임 사용
tableBody.onclick = function (event) {
    var target = event.target || event.srcElement;

    // 클릭한 대상이 버튼이 아니면 종료
    if (!target || target.tagName.toLowerCase() !== 'button') {
        return;
    }

    // data-copy에 들어있는 값을 복사
    // data-copy-type으로 특수문자/엔티티 복사 여부 구분
    copyText(target.getAttribute('data-copy'), target.getAttribute('data-copy-type'));
};

// 최초 화면 진입 시 전체 목록 출력
renderTable();
