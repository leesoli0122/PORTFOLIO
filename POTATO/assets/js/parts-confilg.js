// =============================================
// parts-config.js
// 파츠 목록을 정의하는 설정 파일
// 새 파츠를 추가할 때 이 파일만 수정하면 됩니다.
// =============================================

const PARTS_CONFIG = {
    // 탭 순서 및 표시 이름 정의
    tabs: [
        { id: "background", label: "배경" },
        { id: "pose",       label: "포즈" },
        { id: "outfit",     label: "옷"   },
        { id: "face",       label: "얼굴" },
        { id: "ear",        label: "귀"   }
    ],

    // 각 탭의 파츠 목록
    // id     : 파일명 (확장자 포함) — assets/images/parts/{탭id}/ 안에 있어야 함
    // label  : 목록에 표시될 이름
    // 파츠가 없으면 items 배열을 비워두세요 ([])
    parts: {
        background: [
            { id: "bg_white.png",  label: "흰 배경"   },
            { id: "bg_yellow.png", label: "노란 배경"  },
            { id: "bg_pink.png",   label: "핑크 배경"  }
        ],
        pose: [
            { id: "pose_01.png", label: "기본 포즈"  },
            { id: "pose_02.png", label: "손 흔들기"  },
            { id: "pose_03.png", label: "하트 포즈"  }
        ],
        outfit: [
            { id: "outfit_01.png", label: "기본 옷"   },
            { id: "outfit_02.png", label: "후드티"    },
            { id: "outfit_03.png", label: "드레스"    }
        ],
        face: [
            { id: "face_01.png", label: "기본 얼굴"  },
            { id: "face_02.png", label: "웃는 얼굴"  },
            { id: "face_03.png", label: "우는 얼굴"  },
            { id: "face_04.png", label: "화난 얼굴"  }
        ],
        ear: [
            { id: "ear_01.png", label: "고양이 귀"  },
            { id: "ear_02.png", label: "강아지 귀"  },
            { id: "ear_03.png", label: "곰 귀"      }
        ]
    }
};