var symbolList = [

    /* ================= 공백 ================= */
    { category: '공백', symbol: ' ', name: '일반 공백', shortcut: 'space', entity: '&nbsp;' },
    { category: '공백', symbol: '　', name: '전각 공백', shortcut: '', entity: '&#12288;' },
    { category: '공백', symbol: ' ', name: '얇은 공백', shortcut: '', entity: '&thinsp;' },

    /* ================= 별 / 하트 / 체크 ================= */
    { category: '기호', symbol: '☆', name: '빈 별', shortcut: '', entity: '&#9734;' },
    { category: '기호', symbol: '★', name: '검은 별', shortcut: '', entity: '&#9733;' },
    { category: '기호', symbol: '⭐', name: '별 이모지', shortcut: '', entity: '' },
    { category: '기호', symbol: '🌟', name: '빛나는 별', shortcut: '', entity: '' },
    { category: '기호', symbol: '💫', name: '회전 별', shortcut: '', entity: '' },
    { category: '기호', symbol: '✨', name: '반짝임', shortcut: '', entity: '' },
    { category: '기호', symbol: '✳', name: '별표 기호', shortcut: '', entity: '&#10035;' },
    { category: '기호', symbol: '✴', name: '검은 별표', shortcut: '', entity: '&#10036;' },

    { category: '기호', symbol: '♡', name: '빈 하트', shortcut: '', entity: '&#9825;' },
    { category: '기호', symbol: '♥', name: '검은 하트', shortcut: '', entity: '&hearts;' },

    { category: '기호', symbol: '♧', name: '클로버 빈', shortcut: '', entity: '' },
    { category: '기호', symbol: '♣', name: '클로버', shortcut: '', entity: '&clubs;' },
    { category: '기호', symbol: '♤', name: '스페이드 빈', shortcut: '', entity: '' },
    { category: '기호', symbol: '♠', name: '스페이드', shortcut: '', entity: '&spades;' },

    { category: '기호', symbol: '※', name: '참고표', shortcut: '', entity: '&#8251;' },

    { category: '기호', symbol: '✓', name: '체크', shortcut: '', entity: '&#10003;' },
    { category: '기호', symbol: '✔', name: '굵은 체크', shortcut: '', entity: '&#10004;' },
    { category: '기호', symbol: '☑', name: '체크박스 체크', shortcut: '', entity: '' },
    { category: '기호', symbol: '☒', name: '체크박스 X', shortcut: '', entity: '' },

    /* ================= 불릿 ================= */
    { category: '문장부호', symbol: 'ㆍ', name: '한글 중점', shortcut: '', entity: '' },
    { category: '문장부호', symbol: '∙', name: '수학 점', shortcut: '', entity: '&#8729;' },
    { category: '문장부호', symbol: '•', name: '불릿', shortcut: 'option + 8', entity: '&bull;' },
    { category: '문장부호', symbol: '◦', name: '작은 원 불릿', shortcut: '', entity: '&#9702;' },

    /* ================= 화살표 ================= */
    { category: '화살표', symbol: '→', name: '오른쪽', shortcut: '', entity: '&rarr;' },
    { category: '화살표', symbol: '←', name: '왼쪽', shortcut: '', entity: '&larr;' },
    { category: '화살표', symbol: '↑', name: '위', shortcut: '', entity: '&uarr;' },
    { category: '화살표', symbol: '↓', name: '아래', shortcut: '', entity: '&darr;' },

    { category: '화살표', symbol: '↔', name: '좌우', shortcut: '', entity: '&harr;' },
    { category: '화살표', symbol: '↕', name: '상하', shortcut: '', entity: '&#8597;' },

    { category: '화살표', symbol: '↗', name: '우상향', shortcut: '', entity: '&#8599;' },
    { category: '화살표', symbol: '↙', name: '좌하향', shortcut: '', entity: '&#8601;' },
    { category: '화살표', symbol: '↖', name: '좌상향', shortcut: '', entity: '&#8598;' },
    { category: '화살표', symbol: '↘', name: '우하향', shortcut: '', entity: '&#8600;' },

    { category: '화살표', symbol: '⇄', name: '좌우 반복', shortcut: '', entity: '&#8644;' },
    { category: '화살표', symbol: '⇆', name: '좌우 교차', shortcut: '', entity: '&#8646;' },

    { category: '화살표', symbol: '⇒', name: '강조 오른쪽', shortcut: '', entity: '&rArr;' },
    { category: '화살표', symbol: '⇏', name: '강조 오른쪽 X', shortcut: '', entity: '&#8655;' },
    { category: '화살표', symbol: '⇐', name: '강조 왼쪽', shortcut: '', entity: '&lArr;' },
    { category: '화살표', symbol: '⇑', name: '강조 위', shortcut: '', entity: '&#8657;' },
    { category: '화살표', symbol: '⇓', name: '강조 아래', shortcut: '', entity: '&#8659;' },
    { category: '화살표', symbol: '⇔', name: '강조 양방향', shortcut: '', entity: '&hArr;' },

    { category: '화살표', symbol: '➜', name: '굵은 화살표', shortcut: '', entity: '&#10140;' },
    { category: '화살표', symbol: '➡', name: '이모지 화살표', shortcut: '', entity: '' },
    { category: '화살표', symbol: '➤', name: '삼각 화살표', shortcut: '', entity: '&#10148;' },

    { category: '화살표', symbol: '⇦', name: '굵은 왼쪽', shortcut: '', entity: '&#8678;' },
    { category: '화살표', symbol: '⇧', name: '굵은 위', shortcut: '', entity: '&#8679;' },
    { category: '화살표', symbol: '⇨', name: '굵은 오른쪽', shortcut: '', entity: '&#8680;' },
    { category: '화살표', symbol: '⇩', name: '굵은 아래', shortcut: '', entity: '&#8681;' },

    { category: '화살표', symbol: '🔚', name: 'END', shortcut: '', entity: '' },
    { category: '화살표', symbol: '🔙', name: 'BACK', shortcut: '', entity: '' },
    { category: '화살표', symbol: '🔛', name: 'ON', shortcut: '', entity: '' },
    { category: '화살표', symbol: '🔝', name: 'TOP', shortcut: '', entity: '' },
    { category: '화살표', symbol: '🔜', name: 'SOON', shortcut: '', entity: '' },

    { category: '화살표', symbol: '☚', name: '손 왼쪽', shortcut: '', entity: '' },
    { category: '화살표', symbol: '☛', name: '손 오른쪽', shortcut: '', entity: '' },
    { category: '화살표', symbol: '☜', name: '손 왼쪽 채움', shortcut: '', entity: '' },
    { category: '화살표', symbol: '☝', name: '손 위', shortcut: '', entity: '' },
    { category: '화살표', symbol: '☞', name: '손 오른쪽 채움', shortcut: '', entity: '' },
    { category: '화살표', symbol: '☟', name: '손 아래', shortcut: '', entity: '' },

    /* ================= 도형 ================= */
    { category: '도형', symbol: '◇', name: '마름모 빈', shortcut: '', entity: '&#9671;' },
    { category: '도형', symbol: '◆', name: '마름모', shortcut: '', entity: '&#9670;' },
    { category: '도형', symbol: '□', name: '사각형 빈', shortcut: '', entity: '&#9633;' },
    { category: '도형', symbol: '■', name: '사각형', shortcut: '', entity: '&#9632;' },
    { category: '도형', symbol: '◈', name: '마름모 강조', shortcut: '', entity: '&#9672;' },
    { category: '도형', symbol: '▣', name: '사각 강조', shortcut: '', entity: '&#9643;' },

    { category: '도형', symbol: '△', name: '삼각형 빈', shortcut: '', entity: '&#9651;' },
    { category: '도형', symbol: '▲', name: '삼각형', shortcut: '', entity: '&#9650;' },
    { category: '도형', symbol: '▽', name: '삼각형 아래 빈', shortcut: '', entity: '&#9661;' },
    { category: '도형', symbol: '▼', name: '삼각형 아래', shortcut: '', entity: '&#9660;' },

    { category: '도형', symbol: '◁', name: '왼쪽 삼각형 빈', shortcut: '', entity: '&#9665;' },
    { category: '도형', symbol: '◀', name: '왼쪽 삼각형', shortcut: '', entity: '&#9664;' },
    { category: '도형', symbol: '▷', name: '오른쪽 삼각형 빈', shortcut: '', entity: '&#9655;' },
    { category: '도형', symbol: '▶', name: '오른쪽 삼각형', shortcut: '', entity: '&#9654;' },

    { category: '도형', symbol: '○', name: '원형 빈', shortcut: '', entity: '&#9675;' },
    { category: '도형', symbol: '●', name: '원형', shortcut: '', entity: '&#9679;' },
    { category: '도형', symbol: '⊙', name: '중앙 점 원', shortcut: '', entity: '&#8857;' },
    { category: '도형', symbol: '◐', name: '반원 좌', shortcut: '', entity: '&#9680;' },
    { category: '도형', symbol: '◑', name: '반원 우', shortcut: '', entity: '&#9681;' },
    { category: '도형', symbol: '◎', name: '이중 원', shortcut: '', entity: '&#9678;' }

];