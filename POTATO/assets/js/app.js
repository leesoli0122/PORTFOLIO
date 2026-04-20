// =============================================
// app.js
// 상태 관리, 렌더링, 이벤트 처리를 담당합니다.
// =============================================

// --------------------------------------------------
// 1. 전역 상태 (앱의 현재 상황을 기억하는 객체)
// --------------------------------------------------
// selectedParts : 현재 선택된 파츠를 기록합니다.
//   - key   : 탭 id (face, ear, outfit, pose, background)
//   - value : 파일명 문자열 or null (선택 안 됨)
// activeTab    : 현재 열린 탭 id
// --------------------------------------------------
const state = {
    selectedParts: {
        background: null,
        pose:       null,
        outfit:     null,
        face:       null,
        ear:        null
    },
    activeTab: "face"   // 앱 시작 시 기본으로 열릴 탭
};


// --------------------------------------------------
// 2. DOM 참조 (자주 쓰는 요소를 미리 변수에 담아둡니다)
// --------------------------------------------------
const canvas          = document.getElementById("preview-canvas");
const ctx             = canvas.getContext("2d");
const tabButtons      = document.querySelectorAll(".tab-btn");
const partsGrid       = document.getElementById("parts-grid");
const tabTitle        = document.getElementById("tab-title");


// --------------------------------------------------
// 3. 레이어 순서 정의
// 배경 → 포즈 → 옷 → 얼굴 → 귀 순으로 그립니다.
// 이 순서대로 캔버스에 쌓아 올립니다.
// --------------------------------------------------
const LAYER_ORDER = ["background", "pose", "outfit", "face", "ear"];


// --------------------------------------------------
// 4. 이미지 경로 생성 헬퍼
// --------------------------------------------------
function getImagePath(tabId, fileName) {
    return `assets/images/parts/${tabId}/${fileName}`;
}


// --------------------------------------------------
// 5. 캔버스 렌더링
// selectedParts를 기반으로 캔버스를 처음부터 다시 그립니다.
// --------------------------------------------------
function renderCanvas() {
    // 5-1. 캔버스를 투명하게 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 5-2. 레이어 순서대로 이미지 로드 → 그리기
    //      Promise 배열을 만들어 순서 보장
    const drawPromises = LAYER_ORDER.map(layerId => {
        const fileName = state.selectedParts[layerId];
        if (!fileName) return Promise.resolve();   // 선택 안 된 레이어는 건너뜀

        return new Promise(resolve => {
            const img = new Image();
            img.src = getImagePath(layerId, fileName);

            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve();
            };

            img.onerror = () => {
                // 이미지 파일이 없을 때 콘솔에만 표시하고 계속 진행
                console.warn(`이미지를 불러올 수 없습니다: ${img.src}`);
                resolve();
            };
        });
    });

    // 5-3. 모든 레이어를 순서대로 처리 (Promise 체인)
    //      reduce를 사용해 직렬(순서대로) 실행을 보장합니다.
    drawPromises.reduce((chain, p) => chain.then(() => p), Promise.resolve());
}


// --------------------------------------------------
// 6. 파츠 목록 렌더링
// 선택된 탭에 해당하는 파츠 카드를 오른쪽 목록에 그립니다.
// --------------------------------------------------
function renderPartsList(tabId) {
    partsGrid.innerHTML = "";   // 기존 목록 초기화

    const tabInfo = PARTS_CONFIG.tabs.find(t => t.id === tabId);
    if (tabTitle && tabInfo) {
        tabTitle.textContent = tabInfo.label;
    }

    const items = PARTS_CONFIG.parts[tabId] || [];

    if (items.length === 0) {
        partsGrid.innerHTML = `
            <p class="empty-message">
                아직 등록된 파츠가 없습니다.<br>
                parts-config.js에 추가해주세요.
            </p>`;
        return;
    }

    items.forEach(part => {
        const card = document.createElement("div");
        card.className = "part-card";
        card.dataset.tabId  = tabId;
        card.dataset.partId = part.id;

        // 현재 선택된 파츠라면 selected 클래스 추가
        if (state.selectedParts[tabId] === part.id) {
            card.classList.add("selected");
        }

        // 썸네일 이미지
        const img = document.createElement("img");
        img.src   = getImagePath(tabId, part.id);
        img.alt   = part.label;
        img.loading = "lazy";

        img.onerror = () => {
            // 이미지 없을 때 대체 텍스트 표시
            img.style.display = "none";
            const placeholder = document.createElement("div");
            placeholder.className = "img-placeholder";
            placeholder.textContent = "?";
            card.insertBefore(placeholder, card.firstChild);
        };

        // 파츠 이름 라벨
        const label = document.createElement("span");
        label.className   = "part-label";
        label.textContent = part.label;

        card.appendChild(img);
        card.appendChild(label);

        // 카드 클릭 이벤트 등록
        card.addEventListener("click", () => onPartSelect(tabId, part.id, card));

        partsGrid.appendChild(card);
    });
}


// --------------------------------------------------
// 7. 파츠 선택 처리
// 카드를 클릭했을 때 호출됩니다.
// --------------------------------------------------
function onPartSelect(tabId, partId, clickedCard) {
    const isSameCard = state.selectedParts[tabId] === partId;

    if (isSameCard) {
        // 이미 선택된 파츠를 다시 클릭하면 → 선택 해제
        state.selectedParts[tabId] = null;
        clickedCard.classList.remove("selected");
    } else {
        // 같은 탭의 기존 선택 카드에서 selected 클래스 제거
        const prevSelected = partsGrid.querySelector(".part-card.selected");
        if (prevSelected) {
            prevSelected.classList.remove("selected");
        }

        // 새 카드 선택
        state.selectedParts[tabId] = partId;
        clickedCard.classList.add("selected");
    }

    // 캔버스 다시 그리기
    renderCanvas();
}


// --------------------------------------------------
// 8. 탭 전환 처리
// --------------------------------------------------
function onTabSwitch(tabId) {
    state.activeTab = tabId;

    // 탭 버튼 active 상태 업데이트
    tabButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    // 파츠 목록 다시 렌더링
    renderPartsList(tabId);
}


// --------------------------------------------------
// 9. 전체 초기화 버튼
// --------------------------------------------------
function resetAll() {
    LAYER_ORDER.forEach(layerId => {
        state.selectedParts[layerId] = null;
    });
    renderCanvas();
    renderPartsList(state.activeTab);   // 현재 탭 선택 해제도 반영
}


// --------------------------------------------------
// 10. 이벤트 리스너 등록
// --------------------------------------------------
// initEventListeners() 안에 추가
function initEventListeners() {
    // 탭 버튼 클릭
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => onTabSwitch(btn.dataset.tab));
    });

    // 초기화 버튼
    const resetBtn = document.getElementById("btn-reset");
    if (resetBtn) {
        resetBtn.addEventListener("click", resetAll);
    }

    // 저장 버튼
    const saveBtn = document.getElementById("btn-save");
    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            saveBtn.disabled    = true;
            saveBtn.textContent = "저장 중...";

            await SaveManager.saveAsPNG(state.selectedParts, LAYER_ORDER);

            saveBtn.disabled    = false;
            saveBtn.textContent = "💾 저장";
        });
    }
}


// --------------------------------------------------
// 11. 앱 초기화 (페이지 로드 시 실행)
// --------------------------------------------------
function init() {
    initEventListeners();
    onTabSwitch(state.activeTab);   // 기본 탭으로 시작
    renderCanvas();                 // 빈 캔버스로 시작
}

// DOM 준비 완료 후 init 실행
document.addEventListener("DOMContentLoaded", init);