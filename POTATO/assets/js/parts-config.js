// =============================================
// parts-config.js — 탭 & 레이어 설정
//
// 파츠 이미지 목록은 여기서 관리하지 않습니다.
// 이미지는 IndexedDB에 저장되며 업로드 페이지에서 관리합니다.
// 여기서는 탭 구성과 레이어 순서만 정의합니다.
// =============================================

const PARTS_CONFIG = {

    // 탭 순서 및 표시 이름
    // 탭을 추가하려면 이 배열에만 추가하면 됩니다.
    tabs: [
        { id: "face",       label: "얼굴" },
        { id: "ear",        label: "귀"   },
        { id: "outfit",     label: "옷"   },
        { id: "pose",       label: "포즈" },
        { id: "background", label: "배경" }
    ],

    // 캔버스에 그릴 레이어 순서
    // 배경 → 포즈 → 옷 → 얼굴 → 귀 순으로 쌓습니다.
    layerOrder: ["background", "pose", "outfit", "face", "ear"]

};