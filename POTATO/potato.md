# 이모티콘 메이커 (POTATO) — 기능 명세서

> 배포 URL: https://leesoli0122.github.io/PORTFOLIO/POTATO/
> 마지막 업데이트: 2026-04

---

## 프로젝트 개요

- **목적**: 프로크리에이트로 그린 파츠 이미지를 조합해 카카오톡 이모티콘 / 미리캔버스용 PNG를 제작하는 개인용 웹 앱
- **사용 환경**: iPad Safari + PC 브라우저 (최신 브라우저 기준)
- **기술 스택**: 바닐라 HTML / CSS / JavaScript
- **이미지 저장**: IndexedDB (서버 없음, 기기 내 저장)
- **배포**: GitHub Pages

---

## 폴더 구조

```
POTATO/
├── index.html                  # 메인 페이지
├── views/
│   ├── maker.html              # 캐릭터 만들기
│   ├── upload.html             # 파츠 업로드
│   └── gallery.html            # 갤러리
└── assets/
    ├── css/
    │   ├── base/
    │   │   ├── reset.css       # 리셋 + CSS 변수
    │   │   └── animations.css  # 공통 애니메이션
    │   ├── components/
    │   │   ├── button.css
    │   │   ├── tab.css
    │   │   ├── header.css
    │   │   ├── card.css
    │   │   ├── modal.css
    │   │   └── toast.css
    │   ├── pages/
    │   │   ├── main.css
    │   │   ├── maker.css
    │   │   ├── upload.css
    │   │   └── gallery.css
    │   └── responsive.css
    └── js/
        ├── core/
        │   ├── db.js           # IndexedDB 전담
        │   └── save-manager.js # PNG 저장 전담
        ├── config/
        │   └── parts-config.js # 탭/레이어 순서 설정
        └── pages/
            ├── maker.js
            ├── upload.js
            └── gallery.js
```

---

## 페이지별 기능 명세

### 1. 메인 페이지 (index.html)
- 캐릭터 만들기 / 파츠 업로드 / 갤러리 버튼으로 구성
- 배경 블롭 데코, 로고 플로팅 애니메이션

---

### 2. 파츠 업로드 페이지 (upload.html)

#### 기본 기능
- 탭 선택 (얼굴 / 귀 / 옷 / 포즈 / 배경) 후 파일 업로드
- 파일 선택 또는 드래그 앤 드롭 (iPad: 탭으로 파일 선택)
- PNG / JPEG / WebP 지원, 여러 장 동시 업로드 가능
- 업로드한 이미지는 IndexedDB에 저장 (base64 dataURL)
- 등록된 파츠 그리드로 표시

#### 추가 기능 (신규)

**파츠 이름 수정**
- 각 파츠 카드에 ✏️ 버튼 추가
- 클릭 시 인라인 텍스트 입력 필드로 전환
- 확인(Enter) / 취소(Escape) 처리
- 수정된 이름은 IndexedDB에 저장

**파츠 순서 정렬**
- 각 파츠 카드에 ▲ / ▼ 버튼 추가
- 버튼 클릭으로 같은 탭 내에서 순서 변경
- 순서 정보는 IndexedDB의 `order` 필드로 관리
- 목록은 order 기준 오름차순으로 렌더링

---

### 3. 캐릭터 만들기 페이지 (maker.html)

#### 기본 기능
- 탭별 파츠 선택 → 캔버스 실시간 반영
- 레이어 순서: 배경 → 포즈 → 옷 → 얼굴 → 귀
- 파츠 즐겨찾기 (⭐ 토글)
- 즐겨찾기만 보기 필터
- 랜덤 조합 버튼
- 초기화 버튼

#### 저장 및 내보내기 (신규)

**플랫폼별 내보내기 버튼**
- 💾 카카오 저장: 360×360px PNG로 저장
- 💾 OGQ 저장: 740×740px PNG로 저장
- 저장 시 갤러리 DB에 자동 기록 (플랫폼 정보 포함)

**권장 사이즈 안내 문구**
- 저장 버튼 아래 또는 툴팁으로 표시
- 카카오: 360×360px (최대 1MB, PNG)
- 네이버 OGQ: 740×740px (최대 1MB, PNG / 투명 배경 권장)

---

### 4. 갤러리 페이지 (gallery.html)

#### 기본 기능
- 저장된 완성작 그리드 표시
- 카드 클릭 시 모달 (다운로드 / 삭제)
- 저장일 표시

#### 추가 기능 (신규)

**완성작 이름 붙이기**
- 저장 시 또는 갤러리 카드에서 이름 입력 가능
- 이름 미입력 시 기본값: `emoji_YYYYMMDD_HHMMSS`
- 갤러리 카드 하단에 이름 표시

**카테고리 분류**
- 사용자가 직접 카테고리 이름 입력하여 생성
- 갤러리 상단에 카테고리 탭 표시 (전체 + 사용자 생성 탭)
- 각 완성작에 카테고리 지정 가능 (저장 시 또는 갤러리에서 변경)
- 카테고리 삭제 시 해당 완성작은 '미분류'로 이동
- 카테고리 정보는 IndexedDB `categories` 스토어에 저장

---

## IndexedDB 스토어 구조

```javascript
// parts 스토어
{
  id: number,         // autoIncrement
  tabId: string,      // 'face' | 'ear' | 'outfit' | 'pose' | 'background'
  name: string,       // 표시 이름 (수정 가능)
  dataURL: string,    // base64 이미지
  order: number,      // 정렬 순서 (낮을수록 앞)
  createdAt: number   // timestamp
}

// gallery 스토어
{
  id: number,         // autoIncrement
  dataURL: string,    // base64 이미지
  name: string,       // 완성작 이름
  categoryId: number | null,  // 카테고리 ID
  platform: string,   // 'kakao' | 'ogq' | 'default'
  size: number,       // 저장 사이즈 (360 | 740)
  createdAt: number
}

// categories 스토어
{
  id: number,         // autoIncrement
  name: string,       // 카테고리 이름
  createdAt: number
}

// favs 스토어
{
  partId: number      // keyPath
}
```

---

## 레이어 순서 (캔버스 렌더링)

```
배경(background) → 포즈(pose) → 옷(outfit) → 얼굴(face) → 귀(ear)
```

---

## 플랫폼별 권장 사이즈

| 플랫폼 | 사이즈 | 최대 용량 | 배경 | 비고 |
|---|---|---|---|---|
| 카카오톡 이모티콘 | 360×360px | 1MB | 투명 가능 | 기본 저장 사이즈 |
| 네이버 OGQ마켓 | 740×740px | 1MB | 투명 권장 | 업스케일 저장 |

---

## 개발 규칙

- 공백: 4칸 스페이스
- CSS: 컴포넌트 단위 분리 (base / components / pages)
- JS: 페이지별 독립 파일 (pages/), 공용 로직은 core/
- 모든 이미지는 IndexedDB에 base64로 저장 (외부 서버 없음)
- 구버전 브라우저 대응 불필요, 최신 브라우저 기준

---

## 개발 단계 계획

### 완료된 단계 (1~9단계)

| 단계 | 내용 | 상태 |
|---|---|---|
| 1단계 | 기술 스택 결정 (바닐라 HTML/CSS/JS 확정) | ✅ 완료 |
| 2단계 | 기능 정의 및 화면 구조 설계 | ✅ 완료 |
| 3단계 | 데이터 구조 및 파츠 관리 방식 설계 | ✅ 완료 |
| 4단계 | 개발 환경 및 프로젝트 구조 설정 | ✅ 완료 |
| 5단계 | 기본 화면 구현 (레이아웃, 탭, 반응형) | ✅ 완료 |
| 6단계 | 파츠 선택 및 실시간 캔버스 반영 | ✅ 완료 |
| 7단계 | PNG 저장 기능 구현 | ✅ 완료 |
| 8단계 | iPad 사용 및 GitHub Pages 배포 | ✅ 완료 |
| 9단계 | 최종 점검 / 페이지 분리 / 폴더 구조 리팩토링 | ✅ 완료 |

---

### 추가 단계 (10~14단계)

단계 진행 규칙:
- 내가 "n단계 실행해줘" 또는 "다음 단계 실행해줘"라고 말하면 그 단계에 해당하는 작업만 진행
- 한 번에 1개 단계만 진행
- 아직 요청하지 않은 단계의 내용은 미리 작성하지 말 것
- 단계가 끝나면 다음 단계 이름만 짧게 안내

---

#### 10단계: DB 구조 업그레이드

**목표**: 신규 기능(이름 수정, 순서 정렬, 카테고리, 플랫폼 저장)에 필요한 DB 스토어 및 필드를 추가한다.

**작업 내용**:
- DB 버전을 1 → 2로 올려 기존 데이터를 유지하면서 마이그레이션
- `parts` 스토어: `order` 필드 추가 (기존 데이터는 id순으로 order 부여)
- `gallery` 스토어: `name`, `categoryId`, `platform`, `size` 필드 추가
- `categories` 스토어 신규 생성 `{ id, name, createdAt }`
- `db.js`에 신규 CRUD 메서드 추가
  - `updatePartName(id, name)`
  - `updatePartOrder(id, order)`
  - `getPartsByTabSorted(tabId)` — order 기준 정렬 조회
  - `addCategory(name)` / `getAllCategories()` / `deleteCategory(id)`
  - `updateGalleryItem(id, fields)` — name, categoryId 수정

**수정 파일**: `assets/js/core/db.js`

---

#### 11단계: 파츠 이름 수정 기능 구현

**목표**: 업로드 페이지에서 등록된 파츠의 이름을 인라인으로 수정할 수 있게 한다.

**작업 내용**:
- 각 파츠 카드에 ✏️ 편집 버튼 추가
- 버튼 클릭 시 이름 라벨 → `<input>` 필드로 전환
- Enter 키 또는 포커스 아웃 시 저장, Escape 시 취소
- `db.updatePartName(id, name)` 호출 후 카드 라벨 업데이트
- 메이커 페이지의 파츠 목록에도 수정된 이름 반영
- 빈 문자열 저장 방지 (기존 이름 유지)

**수정 파일**: `assets/js/pages/upload.js`, `assets/css/components/card.css`

---

#### 12단계: 파츠 순서 정렬 기능 구현

**목표**: 업로드 페이지에서 같은 탭 내 파츠 순서를 ▲ / ▼ 버튼으로 변경할 수 있게 한다.

**작업 내용**:
- 각 파츠 카드에 ▲ / ▼ 버튼 추가
- ▲ 클릭: 현재 파츠와 바로 앞 파츠의 order 값 교환
- ▼ 클릭: 현재 파츠와 바로 뒤 파츠의 order 값 교환
- 첫 번째 파츠의 ▲, 마지막 파츠의 ▼ 버튼은 비활성화
- `db.updatePartOrder(id, order)` 호출 후 목록 재렌더링
- 메이커 페이지 파츠 목록도 order 기준으로 표시

**수정 파일**: `assets/js/pages/upload.js`, `assets/css/components/card.css`

---

#### 13단계: 플랫폼별 내보내기 기능 구현

**목표**: 카카오(360px)와 OGQ(740px) 사이즈에 맞춰 각각 저장할 수 있게 하고, 권장 사이즈 안내 문구를 표시한다.

**작업 내용**:
- 메이커 페이지 저장 버튼을 두 개로 분리
  - 🐾 카카오 저장 (360×360px)
  - 🟢 OGQ 저장 (740×740px)
- `save-manager.js`에 `canvasSize` 파라미터 추가
- 저장 시 갤러리 DB에 `platform`, `size` 값 함께 기록
- 저장 버튼 아래 권장 사이즈 안내 문구 표시
  - 카카오: 360×360px · 최대 1MB · PNG
  - OGQ: 740×740px · 최대 1MB · PNG · 투명 배경 권장
- 저장 성공 시 이름 입력 모달 표시 (14단계 갤러리 이름 연동 준비)

**수정 파일**: `views/maker.html`, `assets/js/pages/maker.js`, `assets/js/core/save-manager.js`, `assets/css/pages/maker.css`

---

#### 14단계: 갤러리 이름 붙이기 + 카테고리 분류 구현

**목표**: 완성작에 이름을 붙이고 카테고리로 분류해서 갤러리를 체계적으로 관리할 수 있게 한다.

**작업 내용**:

완성작 이름 붙이기:
- 저장 직후 이름 입력 모달 표시
- 이름 미입력 시 기본값 `emoji_YYYYMMDD_HHMMSS` 자동 적용
- 갤러리 카드 하단에 이름 표시
- 갤러리 모달에서 이름 수정 가능 (✏️ 버튼)

카테고리 분류:
- 갤러리 상단에 카테고리 탭 표시 (전체 / 미분류 / 사용자 생성 탭)
- + 버튼으로 카테고리 이름 입력 → 생성
- 각 완성작 카드에서 카테고리 지정/변경 가능
- 카테고리 탭 길게 누르면 삭제 옵션 표시
- 카테고리 삭제 시 해당 완성작은 '미분류'로 이동

**수정 파일**: `views/gallery.html`, `assets/js/pages/gallery.js`, `assets/css/pages/gallery.css`, `assets/css/components/modal.css`

---

## 진행 현황

```
✅ 1단계  기술 스택 결정
✅ 2단계  기능/화면 설계
✅ 3단계  데이터 구조 설계
✅ 4단계  개발 환경 설정
✅ 5단계  기본 화면 구현
✅ 6단계  파츠 선택 및 실시간 반영
✅ 7단계  PNG 저장 기능
✅ 8단계  iPad 배포
✅ 9단계  최종 점검 / 리팩토링
⬜ 10단계 DB 구조 업그레이드
⬜ 11단계 파츠 이름 수정
⬜ 12단계 파츠 순서 정렬
⬜ 13단계 플랫폼별 내보내기
⬜ 14단계 갤러리 이름 + 카테고리
```