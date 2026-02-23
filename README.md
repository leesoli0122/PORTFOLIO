<h1>GUIDE-HTML</h1>

<p>UI 컴포넌트를 정리하면서 <b>SPA 구조, 상태 관리, 자동 초기화 패턴</b>을 직접 설계한 개인 학습 프로젝트.</p>

---

## 1. Architecture Overview
```text
index.html
   ↓
common.js 로드
   ↓
현재 hash 확인
   ↓
/guide 내부 HTML fetch
   ↓
DOM 삽입
   ↓
runComponentInit()
   ↓
components.js 내 init 실행
   ↓
statusManager.init()
```
---

## 2. Folder Structure
``` bash
/assets
    /css
        common.css        # 전체 스타일
        layout.css        # 레이아웃
        components.css    # 컴포넌트 공통

    /js
        index.js          # 상태 관리 모듈
        common.js         # SPA + 전체 제어
        components.js     # 컴포넌트 init 모음
/views
    /guide
        /data
        /feedback
        /input
        /surfaces
    index.html
```
---

## 3. Core Design Decisions
### 3.1 Hash 기반 SPA
- 페이지 새로고침 없이 컴포넌트 전환
- URL 유지 가능
- 새로고침 시 현재 페이지 복원 가능

#### 선택 이유:
- 구조 이해 목적
- 간단하지만 SPA 개념을 체험하기 위함

### 3.2 파일명 기반 자동 초기화 패턴
- HTML 파일명 기준으로 init 함수 자동 실행.
- 예:
``` bash
aspect-ratio.html
→ aspectRatio
→ initAspectRatio()
```

#### 장점:
- 새 컴포넌트 추가 시 공통 코드 수정 불필요
- 확장성 높음
- 구조가 단순함
