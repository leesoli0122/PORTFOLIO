# 포켓몬 띠부띠부씰 디지털 도감

> 세대별 포켓몬 띠부띠부씰 수집 현황을 관리하는 퍼스널 스티커북 웹 서비스

---

## 📂 폴더 구조

```
pokemon-dex/
├── pokemon-dex.md               ← 이 파일
├── views/
│   └── index.html               ← 메인 페이지
└── assets/
    ├── css/
    │   ├── reset.css            ← CSS 변수 + 리셋
    │   └── style.css            ← 전체 컴포넌트 스타일
    ├── js/
    │   └── main.js              ← 전체 인터랙션 + 데이터 로직
    └── images/
        └── (비어 있음 — PokeAPI CDN 이미지 사용)
```

---

## ✨ 구현 기능

### 1단계 — 기초 환경
- [x] CSS 변수 시스템 (`--color-*`, `--font*`, `--font-w-*`)
- [x] 반응형 레이아웃 (`1200px → 360px`)
- [x] CSS 속성 선언 순서 컨벤션 준수

### 2단계 — 책장 UI (Library View)
- [x] 1~9세대 도감 카드 (스파인 + 커버 디자인)
- [x] 세대별 고유 컬러 & 배경
- [x] 마우스 오버 3D 부상 효과
- [x] 진행률 프로그레스 바

### 3단계 — 스티커북 UI (Book View)
- [x] 좌/우 페이지 스프레드 레이아웃
- [x] 미보유: `grayscale(1) opacity(0.35)`
- [x] 보유: 컬러 + 세대색 테두리
- [x] 페이지 넘기기 (opacity + translateX 트랜지션)
- [x] 페이지 번호 네비게이션

### 4단계 — JS 로직
- [x] **초성 검색**: 한글 음절 → 초성 분리 알고리즘
- [x] **일반 이름 검색** 병행
- [x] 로컬스토리지 수집 상태 영속 저장
- [x] 스티커 클릭 토글 + 애니메이션

### 5단계 — 반응형
- [x] 1200px (데스크톱): 3열 책장, 5열 스티커 그리드
- [x] 768px (태블릿): 2열 책장, 4열 그리드
- [x] 576px (모바일): 1열 책장, 3열 그리드
- [x] 모바일 사이드바 토글

### 6단계 — 통계 & 뱃지
- [x] 세대별 수집률 % 표시
- [x] 사이드바 전체 수집 프로그레스 바
- [x] 100% 달성 시 👑 Master 뱃지
- [x] 공유 텍스트 생성 (클립보드 복사)

### 7단계 — UX 디테일
- [x] Web Audio API 효과음 (스티커 붙이기, 페이지 넘기기)
- [x] 토스트 알림
- [x] 필터 칩 (보유/미보유/속성별)

---

## 🔧 실행 방법

로컬 서버 없이도 `views/index.html`을 브라우저에서 바로 열 수 있습니다.  
단, 포켓몬 이미지는 [PokeAPI CDN](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/)에서 로드되므로 인터넷 연결이 필요합니다.

```bash
# VS Code Live Server 또는
open views/index.html
```

---

## ⚠️ 알려진 제한 사항 / 확장 포인트

| 항목 | 현황 | 확장 방법 |
|------|------|-----------|
| 포켓몬 데이터 | 세대별 대표 샘플 (약 100종) | 전체 1025종 JSON 파일 분리 로드 |
| 이미지 | PokeAPI CDN (외부 의존) | 로컬 `assets/images/` 로 다운로드 |
| 공유 | 텍스트 복사 | `html2canvas` 라이브러리로 이미지 캡처 확장 |
| 페이지 플립 효과 | opacity+translate 트랜지션 | CSS 3D rotateY flip 고도화 가능 |

---

## 📐 CSS 컨벤션

```css
/* 속성 선언 순서 */
.selector {
  /* 1. Position */
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  z-index: 10;
  /* 2. Display/Flex */
  display: flex;
  flex-direction: column;
  /* 3. Size */
  width: 100%;
  height: 100%;
  /* 4. Spacing */
  padding: 16px;
  margin: 0;
  /* 5. Border */
  border: 1px solid var(--color-border);
  border-radius: var(--radius-8);
  /* 6. Background */
  background: var(--color-surface);
  /* 7. Font/Text */
  font-size: var(--font16);
  font-weight: var(--font-w-500);
  /* 8. Color */
  color: var(--color-ff);
  /* 9. Line-height */
  line-height: 1.6;
  /* 10. 기타 */
  transition: all 0.3s ease;
}
```