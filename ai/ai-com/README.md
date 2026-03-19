# Overview (개요)
- 프로젝트 이름: MG캐피탈 웹퍼블리싱 소스 공통
- 프로젝트 설명: MG캐피탈 홈페이지 리뉴얼 프로젝트 종료 후, 웹퍼블리싱 소스를 재사용 가능한 공통 포맷으로 구조화한 가이드 프로젝트.

<br/>
<br/>

# Browser Support
<p>금융권 환경을 고려하여 다음 브라우저를 지원 예정</p>

- IE11

- Chrome 104 이하

- Edge (Chromium 기반)

- 최신 Chrome

<p>대응 전략</p>

- IE 전용 스타일은 `ie.css`에서 별도 관리

- 최신 기능은 `@supports`를 활용하여 분기 처리

- 최신 브라우저 우선 설계 → 하위 브라우저 보완 방식 적용

- ie.css는 향후 추가 요구사항 및 브라우저 이슈에 따라 지속적으로 보완 예정

<br/>
<br/>

# Module Examples
## 스타일 변경 시 기존 약 90% 이상 시간 단축

<details>
<summary>input</summary>
<figure style="display:flex; gap:10px;">
    <img width="48%" src="https://github.com/user-attachments/assets/366cdf15-c3b3-448a-b46b-820a4bc607f5">
    <img width="48%" src="https://github.com/user-attachments/assets/040b9d17-0ffc-4493-86e7-f3768057e1f0">
</figure>
</details>

<details>
<summary>button</summary>
<figure style="display:flex; gap:10px;">
    <img width="48%" src="https://github.com/user-attachments/assets/7216ae12-0027-425b-9409-eb9f6f9b9a50">
    <img width="48%" src="https://github.com/user-attachments/assets/ba552bce-e665-463b-8817-918548067b76">
</figure>
</details>

<details>
<summary>tab</summary>
<figure style="display:flex; gap:10px;">
    <img width="48%" src="https://github.com/user-attachments/assets/d5a5ba6e-71f4-4c0d-b16b-2b6f89bd3fb3">
    <img width="48%" src="https://github.com/user-attachments/assets/3a5fca1b-6a51-4e07-b8ae-24528770d189">
</figure>
</details>

<br/>
<br/>

<!-- 
# Technology Stack (기술 스택)
## Language
|  |  |
|-----------------|-----------------|
| HTML5    |<img src="https://github.com/user-attachments/assets/2e122e74-a28b-4ce7-aff6-382959216d31" alt="HTML5" width="100">| 
| CSS3    |   <img src="https://github.com/user-attachments/assets/c531b03d-55a3-40bf-9195-9ff8c4688f13" alt="CSS3" width="100">|
| Javascript    |  <img src="https://github.com/user-attachments/assets/4a7d7074-8c71-48b4-8652-7431477669d1" alt="Javascript" width="100"> |  -->

<!-- <br/>

## Frotend
|  |  |  |
|-----------------|-----------------|-----------------|
| Swiper    |  <img src="https://swiperjs.com/images/swiper-logo.svg" alt="Swiper" width="100"> |11.2.10|
| jquery    |  <img src="https://img.shields.io/badge/jQuery-0769AD?style=flat-square&logo=jQuery&logoColor=white" alt="jquery" width="100"> |1.12.4|

<br/>
<br/> -->

# UI Components (기본 공통 컴포넌트)
- **Alert**: 알림창 및 경고 메시지 UI 컴포넌트
    <details>
    <summary>이미지</summary>
    <img width="1895" height="917" alt="image" src="https://github.com/user-attachments/assets/44212c56-1a8d-4006-a9d0-08697e81c1ca" />
    </details>

- **Button**: 다양한 스타일의 버튼 컴포넌트
    <details>
    <summary>이미지</summary>
    <img width="1326" height="1708" alt="image" src="https://github.com/user-attachments/assets/7216ae12-0027-425b-9409-eb9f6f9b9a50" />
    </details>

- **Input**: 입력 필드 및 폼 컴포넌트
    <details>
    <summary>이미지</summary>
    <img width="1291" height="2410" alt="image" src="https://github.com/user-attachments/assets/366cdf15-c3b3-448a-b46b-820a4bc607f5" />
    </details>

- **Popup**: 모달 및 팝업 윈도우 컴포넌트
    <details>
    <summary>이미지</summary>
    <img width="1893" height="917" alt="image" src="https://github.com/user-attachments/assets/7dd3896a-7ac0-442f-9928-be6ced3f1b73" />
    </details>

- **Tab**: 탭 네비게이션 컴포넌트
    <details>
    <summary>이미지</summary>
    <img width="1297" height="1222" alt="image" src="https://github.com/user-attachments/assets/d5a5ba6e-71f4-4c0d-b16b-2b6f89bd3fb3" />
    </details>

- **Table**: 데이터 테이블 컴포넌트
    <details>
    <summary>이미지</summary>
    <img width="1266" height="3018" alt="image" src="https://github.com/user-attachments/assets/22f423bd-bce1-48fa-942e-23b414d1de0d" />
    </details>

- **Toggle**: 토글 스위치 컴포넌트
    <details>
    <summary>이미지</summary>
    <img width="1295" height="1067" alt="image" src="https://github.com/user-attachments/assets/38db6ace-f354-4452-8856-fcd778554d41" />
    </details>

- **Terms**: 약관 동의 UI 컴포넌트
    <details>
    <summary>이미지</summary>
    <img width="1289" height="616" alt="image" src="https://github.com/user-attachments/assets/1796c6dc-b5bd-47cd-93ea-618d326049d5" />
    </details>

<br/>
<br/>

# Getting Started
- css 로드 순서
```html
  <link rel="stylesheet" href="assets/css/com/common.css">
  <link rel="stylesheet" href="assets/css/com/style.css">
```
- js 로드 순서
```html
  <script src="assets/js/lib/jquery-1.12.4.js"></script>
  <script src="assets/js/lib/swiper-bundle.min.js"></script>
  <script src="assets/js/ui-util.js"></script>
```

<br/>
<br/>

# Project Structure (프로젝트 구조)
<h2>구조 전략</h2>

- 컴포넌트 단위 분리

- 유틸 클래스 분리 관리

- IE 대응 CSS 별도 분리


```plaintext
PUB-GUIDE/
├── index.html                           # worklist
├── assets/                              # 정적 파일 및 라이브러리
│   ├── css/                             # 스타일시트
│   │   ├── swiper-bundle.min.css        # Swiper 라이브러리 CSS
│   │   └── com/                         # 공통 컴포넌트 CSS
│   │       ├── button.css               
│   │       ├── common.css               
│   │       ├── default.css              
│   │       ├── fonts.css                
│   │       ├── ie.css                   
│   │       ├── input.css                
│   │       ├── layout.css               
│   │       ├── nav.css                  
│   │       ├── style.css                
│   │       ├── tab.css                  
│   │       ├── table.css                
│   │       └── ui-util.css              
│   ├── fonts/                           # 폰트 파일
│   ├── images/                          # 이미지 파일
│   │   └── com/                         # 공통 이미지
│   │       ├── ie11/                    # IE11 호환 이미지
│   │       └── svg/                     # SVG 파일
│   └── js/                              # 자바스크립트 파일
│       ├── include.js                   # 인클루드 로직
│       ├── lib/                         # 라이브러리
│       │   ├── jquery-1.12.4.js         # jQuery 라이브러리
│       │   ├── jquery-ui.min.js         # jQuery UI 라이브러리
│       │   ├── swiper-bundle.min.js     # Swiper 라이브러리
│       │   └── ui_plugin.js             # UI 플러그인
│       └── ui/                          # UI 스크립트
│           ├── ui-util.js               
│           └── com/                     # 공통 UI 스크립트
│               ├── accordion.js         
│               ├── datepicker.js        
│               ├── fake_select.js       
│               ├── finance.js           
│               ├── input.js             
│               ├── layout.js            
│               ├── nav.js               
│               ├── popup.js             
│               ├── popup_1.js           
│               ├── popup_new.js         
│               ├── tab.js               
│               ├── table.js             
│               └── terms.js             
├── guide/                               # worklist 및 예시
│   ├── css/                             
│   │   ├── pub-worklist.css             # worklist 스타일
│   │   └── sample.css                   # 예시 스타일
│   ├── js/                              
│   │   ├── jquery-1.11.3.min.js         
│   │   └── jquery.form.min.js           
│   └── sample/                          # HTML 예시 파일
└── views/                               # 페이지 뷰
    └── COMMON/                          # 공통 컴포넌트
        ├── footer.html                  # 푸터
        └── header.html                  # 헤더
```

<br/>
<br/>

# Coding Convention
## 명명 규칙
* **상수**: 영문 대문자 + 스네이크 케이스
```javascript
const MAX_WIDTH = 1200;
const DEFAULT_TIMEOUT = 5000;
```

* **변수 & 함수**: 카멜케이스
```javascript
// 일반 변수
let currentCount = 0;
let isActive = false;
let userList = [];

// DOM 요소: 'el'로 시작
const elButton = document.querySelector('.btn');
const elModal = document.getElementById('modal');

// 배열 - 복수형 이름 사용
const items = [];
const elements = document.querySelectorAll('.item');

// 정규표현식: 'r'로 시작
const rEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rPhoneNumber = /^\d{10,11}$/;

// 이벤트 핸들러: 'on'으로 시작
const onClick = function(e) {};
const onChange = function(e) {};

// 반환 값이 불린인 경우: 'is'로 시작
const isVisible = true;
const isDisabled = false;

// 함수: 동작을 나타내는 동사로 시작
const getData = function() { ... };
const setData = function(data) { ... };
const removeItem = function(id) { ... };
```

<br/>

## 블록 구문
```javascript
// 한 줄짜리 블록일 경우라도 {}를 생략하지 않고, 명확히 줄 바꿈 하여 사용한다
// Good
if (true) {
  return 'hello';
}

// Bad
if (true) return 'hello';
```

<br/>

## 함수
```javascript
// 함수 선언식 또는 함수 표현식 사용
// Good
const fnName = function() { };
function fnName() { }

// jQuery 콜백
$(element).on('click', function(e) {
  // 구현부
});
```

<br/>

## HTML 요소 네이밍
HTML 요소의 class와 id 네이밍 규칙을 준수하여 의미 전달을 명확하게 한다.<br/>
요소명이 길어지더라도 의미 전달의 명확성에 목적을 두어 작성한다.<br/>
- 이름은 영문 소문자로만 시작할 수 있다.
  - ex) btn-apply-on, box-news, box-reply-open 등
- id는 camelcase 방식으로 사용한다.
- 두개의 단어를 사용할 경우에는 이어지는 단어를 대문자로 표기하여 사용한다. (카멜표기법)
- id는 화면에서 한번만 사용이 되므로, 고유기능을 쉽게 인지할 수 있도록 네이밍한다.
  - ex) id="btnSch" ( x )   id="btnGnbSearch" ( o )
- class는 하이픈 방식으로 사용한다. (케밥표기법)
  - ex) class="btn-blackLine-on", class="link-view"
- 유사한 용도인 경우 가장 뒤에 숫자를 붙여 사용할 수 있으며 첫번째 이름은 숫자를 생략할 수 있다.
  - ex) .list-benefit, .list-benefit-02, .list-benefit-03
- 네이밍의 조합은 **'형태-의미-순서-상태'**을 기본 순서로 사용한다.
- ex) .btn-confirm-02-on</li>

<br/>

## 폴더 네이밍
소문자와 하이픈(kebab-case)을 사용하여 일관성 있게 관리한다.
```
// Good
assets/
js/
userdata/

// Bad
Assets/
Js/
UserData/
```

<br/>

## 파일 네이밍
```
// JavaScript 파일
script.js
ui-util.js

// CSS 파일
style.css
button.css

// HTML 파일
index.html
alert.html

// 공통 UI 스크립트의 경우 기능명으로 명명
accordion.js (아코디언)
datepicker.js (날짜 선택기)
popup.js (팝업)
```

<br/>
<br/>

# Improvements (개선점)
<h2>향후 개선 예정 사항</h2>

- CSS 테마 분리 구조 확장
- ES6 기반 리팩토링 검토
- jQuery 의존성 최소화 검토
- 금융권 브라우저 대응 전략 고도화
