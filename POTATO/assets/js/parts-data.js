// 탭 순서와 레이어 순서를 함께 정의
const TABS = [
    { id: "pose",   label: "포즈",  layer: 0 },
    { id: "outfit", label: "옷",    layer: 1 },
    { id: "face",   label: "얼굴",  layer: 2 },
    { id: "ear",    label: "귀",    layer: 3 },
];

  // 파츠 이미지 목록 (나중에 이미지 추가할 때 여기만 수정하면 됨)
const PARTS = {
    pose: [
        { id: "pose_01", src: "parts/pose/pose_01.png", label: "기본 포즈" },
        { id: "pose_02", src: "parts/pose/pose_02.png", label: "손 흔들기" },
    ],
    outfit: [
        { id: "outfit_01", src: "parts/outfit/outfit_01.png", label: "캐주얼" },
    ],
    face: [
        { id: "face_01", src: "parts/face/face_01.png", label: "기본 얼굴" },
        { id: "face_02", src: "parts/face/face_02.png", label: "웃는 얼굴" },
    ],
    ear: [
        { id: "ear_01", src: "parts/ear/ear_01.png", label: "기본 귀" },
    ],
};