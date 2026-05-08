# 나만의 맞춤법 사전

> 마지막 업데이트: 2026-05

---

## 프로젝트 개요

- **목적**: 헷갈리는 맞춤법을 카테고리별로 정리하고 초성 검색 / 정렬로 빠르게 찾아볼 수 있는 개인용 사전
- **사용 환경**: PC 브라우저 / 모바일 브라우저
- **기술 스택**: HTML / CSS / JavaScript
- **데이터 저장 방식**: LocalStorage 사용, 서버 저장 없음
- **배포 방식**: 정적 HTML 파일 직접 실행

이 프로젝트는 개인이 직접 쓰기 위해 만든 맞춤법 정리 도구입니다.  
단어 쌍, 설명, 예시를 카드 형태로 정리하고, 초성 검색으로 빠르게 찾을 수 있게 구성했습니다.  
단어 추가와 삭제가 가능하며, 새로고침 후에도 데이터가 유지됩니다.

---

## 작업 범위와 AI 활용

이 프로젝트는 화면 구조, 마크업 설계, CSS 변수 체계, 컴포넌트 스타일, 클래스 네이밍 컨벤션을 직접 방향을 잡고 진행했습니다.  
JavaScript의 초성 검색 로직, LocalStorage 연동, 동적 렌더링 구조는 AI의 도움을 받아 구현하며 학습했습니다.

### 직접 작업한 부분

- 전체 화면 구성 및 레이아웃 설계
- CSS 변수 체계 설계 (컬러, 폰트, 간격, 반경, 그림자)
- 사이드바, 검색바, 카드, 모달, 토스트 UI 스타일 정리
- 클래스 네이밍 컨벤션 결정 및 수정
- 카테고리 구성과 초기 데이터 18개 작성
- 반응형 레이아웃 (데스크톱 / 태블릿 / 모바일)
- 실제 화면을 보면서 여백, 크기, 문구, 배치 수정

### AI 도움을 받아 구현하거나 정리한 부분

- 초성 검색 유틸리티 (유니코드 기반 초성 추출 로직)
- LocalStorage 저장 및 불러오기 구조
- 카드 동적 렌더링 및 검색어 하이라이트
- 필터 / 정렬 상태 관리 구조
- 모달 열기 / 닫기 및 예시 필드 동적 추가
- 토스트 알림 슬라이드 인 / 아웃 처리
- 테마 토글 (다크 / 라이트) 구현
- 모바일 사이드바 오프캔버스 처리

---

## 폴더 구조

```text
spelling-dict/
├── spelling-dict.md            # 프로젝트 정리 문서
├── views/
│   └── index.html              # 메인 페이지
└── assets/
    ├── css/
    │   ├── reset.css           # 리셋 + CSS 변수 선언
    │   └── style.css           # 컴포넌트 스타일 + 반응형
    ├── js/
    │   ├── data.js             # 단어 데이터 (INITIAL_DATA)
    │   └── main.js             # 앱 로직 전체
    └── images/
```

---

## 현재 구현된 기능

### 1. 검색

- 일반 검색: 단어 쌍, 설명, 예시 문장 전체를 대상으로 검색
- **초성 검색**: `ㄹㅅ` 입력 시 '로서', '로써' 검색 / `ㅁㅎㄷ` 입력 시 '맞히다' 검색
- 검색어 하이라이트 (`<mark class="highlight">`)
- 검색어 지우기 버튼 (X)

### 2. 필터 / 정렬

- 사이드바 카테고리 클릭으로 필터링
- 섹션 타이틀이 선택된 카테고리명으로 자동 변경
- 가나다순 오름차순 / 내림차순 정렬
- 기본순 (추가된 순서)

### 3. 단어 관리 (CRUD)

- 단어 추가: 단어 쌍, 카테고리, 설명, 예시(◯/✗) 입력
- 단어 삭제: 카드 우측 X 버튼 클릭 후 confirm 확인
- LocalStorage에 자동 저장 — 새로고침 후에도 유지

### 4. UI / UX

- 다크 모드 기본, 라이트 모드 토글 전환
- 카드 hover 시 카테고리별 컬러 상단 액센트 라인
- 토스트 알림 (추가 / 삭제 시 슬라이드 인)
- 모바일 오프캔버스 사이드바
- 카테고리별 카운트 뱃지 실시간 업데이트

---

## 데이터 구조

### INITIAL_DATA (data.js)

```javascript
{
    id       : number,       // 고유 ID (1부터 시작, 중복 불가)
    title    : string,       // 단어 쌍 (예: '로서 / 로써')
    category : string,       // 카테고리명 (5종 중 하나)
    desc     : string,       // 상세 설명
    examples : [
        {
            mark : 'correct' | 'wrong' | 'none',  // ◯ / ✗ / 없음
            text : string                          // 예시 문장
        }
    ]
}
```

### LocalStorage

```javascript
// 키: 'spelling-dict-data'
// 값: WordEntry[] JSON 문자열
localStorage.setItem('spelling-dict-data', JSON.stringify(state.data));

// 키: 'spelling-dict-theme'
// 값: 'dark' | 'light'
localStorage.setItem('spelling-dict-theme', 'dark');
```

---

## 카테고리 구성

| 카테고리 | 포인트 컬러 | 초기 데이터 수 |
|---------|-----------|-------------|
| 조사류 | `#7c6ff7` (퍼플) | 3개 |
| 어미류 | `#4ecdc4` (민트) | 3개 |
| 띄어쓰기 | `#f9a826` (옐로) | 3개 |
| 혼동 단어 | `#f06595` (핑크) | 5개 |
| 외래어 표기 | `#69db7c` (그린) | 4개 |

---

## JSDoc 주석 설명

`main.js`에서 사용한 JSDoc 태그와 그 의미를 정리합니다.

### @typedef

타입(객체 구조)을 직접 정의할 때 사용합니다.  
TypeScript의 `type` 또는 `interface`와 비슷한 역할로, JS 환경에서 IDE 자동완성과 타입 힌트를 제공합니다.

```javascript
/**
 * @typedef {Object} WordEntry
 * ...
 */
```

### @property

`@typedef`로 정의한 객체의 각 속성을 설명할 때 사용합니다.  
`{타입} 속성명 - 설명` 형태로 작성합니다.

```javascript
/**
 * @typedef {Object} WordEntry
 * @property {number} id          - 고유 ID
 * @property {string} title       - 단어 쌍 (예: '로서 / 로써')
 * @property {string} category    - 카테고리
 * @property {string} desc        - 상세 설명
 * @property {Array<{mark: 'correct'|'wrong'|'none', text: string}>} examples - 예시 목록
 */
```

### @param

함수의 매개변수(인자)를 설명할 때 사용합니다.  
`{타입} 매개변수명 - 설명` 형태로 작성합니다.

```javascript
/**
 * @param {string} char  - 단일 문자
 * @param {string} query - 검색어
 */
function matchQuery(target, query) { ... }
```

### @returns

함수가 반환하는 값의 타입과 의미를 설명할 때 사용합니다.

```javascript
/**
 * @returns {string}    초성 자모 또는 원래 문자
 * @returns {boolean}   검색어가 포함되면 true
 * @returns {WordEntry[]} 필터 + 정렬된 데이터 배열
 */
```

### 실제 사용 예시

```javascript
/**
 * 검색어가 대상 문자열에 포함되는지 확인합니다.
 * - 일반 검색: 검색어가 대상에 포함되면 true
 * - 초성 검색: 대상의 초성 문자열에 검색어가 포함되면 true
 *
 * @param {string} target - 검색 대상 문자열
 * @param {string} query  - 검색어
 * @returns {boolean}
 */
function matchQuery(target, query) {
    if (!query) return true;
    if (isChosungOnly(query)) {
        return toChosung(target).includes(query);
    }
    return target.toLowerCase().includes(query.toLowerCase());
}
```

---

## 초성 검색 구조

한글 유니코드 구조를 이용해 외부 라이브러리 없이 구현했습니다.

```text
한글 음절 범위: 0xAC00 (가) ~ 0xD7A3 (힣)

초성 인덱스 = (유니코드 코드 - 0xAC00) / (중성 수 21 × 종성 수 28)

예: '로' → 코드 0xB85C
    (0xB85C - 0xAC00) / (21 × 28) = 5 → CHOSUNG_LIST[5] = 'ㄹ'
    '서' → 'ㅅ'
    결과: '로서' → 'ㄹㅅ'
```

```javascript
// 초성 추출 흐름
getChosung(char)        // 단일 문자 → 초성 1자
toChosung(str)          // 문자열 전체 → 초성 문자열
isChosungOnly(str)      // 입력값이 초성만으로 이뤄졌는지 확인
matchQuery(target, query) // 일반/초성 검색 분기
```

---

## 단계별 정리

| 단계 | 내용 | 상태 |
|------|------|------|
| 0단계 | 기획 확정 (카테고리, 초기 데이터, 디자인 톤) | 완료 |
| 1단계 | reset.css (CSS 변수 선언 + 기본 리셋) | 완료 |
| 2단계 | style.css (컴포넌트 스타일 + 반응형) | 완료 |
| 3단계 | index.html (시맨틱 마크업 + 웹 접근성) | 완료 |
| 4단계 | main.js (초성 검색 / 필터 / 정렬 / CRUD) | 완료, AI 도움 |
| 추가 | data.js 분리 (단어 데이터 전용 파일) | 완료 |
| 추가 | 필터 탭 제거 → 섹션 타이틀로 교체 | 완료 |
| 추가 | 클래스 네이밍 컨벤션 정리 (BEM 제거) | 완료 |

---

## CSS 변수 체계

```css
/* 컬러 — 컬러 코드 앞자리를 활용한 명명 규칙 */
--color-3        : #333333   /* 텍스트 다크 */
--color-f5       : #f5f5f5   /* 텍스트 라이트 */
--color-75       : #757575   /* 서브텍스트 */
--color-cc       : #cccccc   /* 비활성 / 플레이스홀더 */
--color-primary  : #7c6ff7   /* 포인트 퍼플 */
--color-accent   : #4ecdc4   /* 강조 민트 */
--color-4c       : #4caf50   /* 정답 초록 ◯ */
--color-ef       : #ef5350   /* 오답 빨강 ✗ */

/* 폰트 — 숫자를 포함한 변수명 */
--font16  : 1rem             /* 16px 기준 */
--font14  : 0.875rem
--font12  : 0.75rem

/* 두께 */
--font-w-400 : 400
--font-w-600 : 600
--font-w-700 : 700

/* 테마 토큰 — JS로 data-theme 속성만 바꾸면 자동 전환 */
--color-bg      : var(--color-bg-dark)      /* 기본: 다크 */
--color-surface : var(--color-surface-dark)
--color-text    : var(--color-f5)

[data-theme="light"] {
    --color-bg      : var(--color-bg-light)
    --color-surface : var(--color-surface-light)
    --color-text    : var(--color-3)
}
```

---

## 아직 보완할 점

- 단어 수정 기능이 없어 삭제 후 재입력해야 합니다.
- 초성 검색 시 하이라이트가 적용되지 않습니다. (초성과 완성형 문자가 달라 위치 매칭 불가)
- 모바일 Safari에서 `input[type="search"]` X 버튼 중복 표시 가능성이 있습니다.
- `data.js`의 `id`는 수동으로 관리하므로 중복 입력 시 충돌이 발생할 수 있습니다.
- 데이터 초기화(리셋) 버튼이 없어 LocalStorage를 직접 삭제해야 합니다.

---

## 배운 점

- CSS 변수를 역할(테마 토큰)과 원본(컬러 값)으로 분리하면 다크/라이트 모드를 `data-theme` 속성 하나로 전환할 수 있다는 걸 경험했습니다.
- 한글 유니코드 구조를 이해하면 외부 라이브러리 없이도 초성 검색을 구현할 수 있다는 걸 배웠습니다.
- 이벤트 위임(Event Delegation)을 사용하면 동적으로 생성된 요소에도 리스너를 별도로 등록할 필요가 없다는 걸 알게 되었습니다.
- JSDoc의 `@typedef`, `@property`, `@param`, `@returns`를 작성해두면 JS 환경에서도 IDE 자동완성과 타입 힌트를 받을 수 있다는 걸 알게 되었습니다.
- 클래스명을 BEM에서 컨텍스트 스코프(`.sidebar .nav-item`) 방식으로 바꾸면 클래스명이 단순해지고 HTML 가독성이 높아진다는 걸 느꼈습니다.

---

## 한 줄 소개

헷갈리는 맞춤법을 카테고리별로 정리하고 초성 검색으로 빠르게 찾아볼 수 있는 개인용 사전 웹 서비스입니다.  
HTML / CSS 구조와 UI 정리는 직접 진행했고, 초성 검색과 LocalStorage 기반 데이터 관리는 AI 도움을 받아 구현하며 학습했습니다.