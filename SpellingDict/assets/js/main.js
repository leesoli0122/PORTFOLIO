/* ==========================================================================
    나만의 맞춤법 사전 — 초성 검색 / 필터 / 정렬 / CRUD / 모달 / 토스트
========================================================================== */


/* --------------------------------------------------------------------------
    초성 검색 유틸리티
-------------------------------------------------------------------------- */

/**
 * 한글 유니코드 구조
 * - 한글 음절 범위: 0xAC00 ~ 0xD7A3
 * - 초성 19개 인덱스에 대응하는 유니코드 초성 자모
 */
const CHOSUNG_LIST = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ',
    'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ',
    'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

/**
 * 한글 음절에서 초성을 추출합니다.
 * @param {string} char - 단일 문자
 * @returns {string} 초성 자모 또는 원래 문자
 */
function getChosung(char) {
    const code = char.charCodeAt(0);

    /* 한글 음절 범위 확인 (가 ~ 힣) */
    if (code < 0xAC00 || code > 0xD7A3) return char;

    /* 초성 인덱스 = (코드 - 0xAC00) / (중성 수 21 * 종성 수 28) */
    const chosungIndex = Math.floor((code - 0xAC00) / (21 * 28));
    return CHOSUNG_LIST[chosungIndex];
}

/**
 * 문자열 전체를 초성 문자열로 변환합니다.
 * 예: '로서' → 'ㄹㅅ'
 * @param {string} str
 * @returns {string}
 */
function toChosung(str) {
    return str.split('').map(getChosung).join('');
}

/**
 * 입력값이 초성으로만 이루어진 문자열인지 확인합니다.
 * @param {string} str
 * @returns {boolean}
 */
function isChosungOnly(str) {
    return [...str].every(char => CHOSUNG_LIST.includes(char));
}

/**
 * 검색어가 대상 문자열에 포함되는지 확인합니다.
 * - 일반 검색: 검색어가 대상에 포함되면 true
 * - 초성 검색: 대상의 초성 문자열에 검색어가 포함되면 true
 * @param {string} target - 검색 대상 문자열
 * @param {string} query  - 검색어
 * @returns {boolean}
 */
function matchQuery(target, query) {
    if (!query) return true;

    const normalizedTarget = target.toLowerCase();
    const normalizedQuery  = query.toLowerCase();

    /* 초성 검색 */
    if (isChosungOnly(query)) {
        return toChosung(normalizedTarget).includes(normalizedQuery);
    }

    /* 일반 검색 */
    return normalizedTarget.includes(normalizedQuery);
}

/**
 * 텍스트에서 검색어를 찾아 <mark> 태그로 감싸 반환합니다.
 * @param {string} text
 * @param {string} query
 * @returns {string} HTML 문자열
 */
function highlightText(text, query) {
    if (!query) return escapeHtml(text);

    const escaped = escapeHtml(text);

    if (isChosungOnly(query)) return escaped;

    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return escaped.replace(regex, '<mark class="highlight">$1</mark>');
}

/**
 * HTML 특수문자를 이스케이프합니다.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * 정규식 특수문자를 이스케이프합니다.
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


/* --------------------------------------------------------------------------
    타입 정의 (JSDoc)
-------------------------------------------------------------------------- */

/**
 * @typedef {Object} WordEntry
 * @property {number}   id        - 고유 ID
 * @property {string}   title     - 단어 쌍 (예: '로서 / 로써')
 * @property {string}   category  - 카테고리
 * @property {string}   desc      - 상세 설명
 * @property {Array<{mark: 'correct'|'wrong'|'none', text: string}>} examples - 예시 목록
 */

/* 단어 데이터는 data.js에서 관리합니다. (INITIAL_DATA 변수 참조) */


/* --------------------------------------------------------------------------
    앱 상태 (State)
-------------------------------------------------------------------------- */

const state = {
    /** @type {WordEntry[]} 전체 데이터 */
    data: [],

    /** 현재 검색어 */
    query: '',

    /** 현재 선택된 카테고리 ('전체' | 카테고리명) */
    category: '전체',

    /** 현재 정렬 ('default' | 'asc' | 'desc') */
    sort: 'default',

    /** 다음 항목에 부여할 ID */
    nextId: 19,
};


/* --------------------------------------------------------------------------
    로컬스토리지 유틸
-------------------------------------------------------------------------- */

const STORAGE_KEY = 'spelling-dict-data';

/** 데이터를 로컬스토리지에 저장합니다. */
function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    } catch (e) {
        console.warn('로컬스토리지 저장 실패:', e);
    }
}

/** 로컬스토리지에서 데이터를 불러옵니다. */
function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.warn('로컬스토리지 로드 실패:', e);
        return null;
    }
}


/* --------------------------------------------------------------------------
    데이터 필터 / 정렬
-------------------------------------------------------------------------- */

/**
 * 현재 state를 기반으로 필터 + 정렬된 데이터를 반환합니다.
 * @returns {WordEntry[]}
 */
function getFilteredData() {
    let result = [...state.data];

    /* 카테고리 필터 */
    if (state.category !== '전체') {
        result = result.filter(item => item.category === state.category);
    }

    /* 검색어 필터 (title + desc + 예시 텍스트 대상) */
    if (state.query) {
        result = result.filter(item => {
            const searchTargets = [
                item.title,
                item.desc,
                ...item.examples.map(e => e.text),
            ].join(' ');
            return matchQuery(searchTargets, state.query);
        });
    }

    /* 정렬 */
    if (state.sort === 'asc') {
        result.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    } else if (state.sort === 'desc') {
        result.sort((a, b) => b.title.localeCompare(a.title, 'ko'));
    }

    return result;
}


/* --------------------------------------------------------------------------
    렌더링
-------------------------------------------------------------------------- */

/**
 * 카드 한 장의 HTML 문자열을 반환합니다.
 * @param {WordEntry} item
 * @param {string} query - 하이라이트용 검색어
 * @returns {string}
 */
function renderCard(item, query) {
    /* 카테고리 뱃지 클래스 (CSS 클래스용 공백 제거) */
    const badgeClass = `category-badge--${item.category.replace(/\s/g, '')}`;

    /* 예시 목록 HTML */
    const examplesHtml = item.examples.map(ex => {
        const markSymbol  = ex.mark === 'correct' ? '◯' : ex.mark === 'wrong' ? '✗' : '';
        const markClass   = ex.mark === 'correct'
            ? 'mark-correct'
            : ex.mark === 'wrong'
            ? 'mark-wrong'
            : '';

        return `
            <li class="example-item">
                ${markSymbol ? `<span class="example-item-mark ${markClass}" aria-label="${ex.mark === 'correct' ? '올바른 예' : '잘못된 예'}">${markSymbol}</span>` : ''}
                <span class="example-item-text">${highlightText(ex.text, query)}</span>
            </li>
        `;
    }).join('');

    return `
        <li class="word-card" data-id="${item.id}" data-category="${escapeHtml(item.category)}">
            <div class="word-card-header">
                <div class="title-wrap">
                    <h2 class="title">${highlightText(item.title, query)}</h2>
                    <span class="category-badge ${badgeClass}" aria-label="카테고리: ${escapeHtml(item.category)}">
                        ${escapeHtml(item.category)}
                    </span>
                </div>
                <div class="actions">
                    <button type="button" class="btn-icon" data-action="delete" data-id="${item.id}" aria-label="${escapeHtml(item.title)} 삭제" title="삭제">&#10005;</button>
                </div>
            </div>

            <p class="card-desc">${highlightText(item.desc, query)}</p>

            <hr class="card-divider" />

            <div class="card-examples">
                <p class="card-examples-title">사용 예시</p>
                <ul role="list" aria-label="${escapeHtml(item.title)} 사용 예시">
                    ${examplesHtml}
                </ul>
            </div>
        </li>
    `;
}

/**
 * 카드 리스트 전체를 다시 렌더링합니다.
 */
function renderList() {
    const $list    = document.getElementById('cardList');
    const filtered = getFilteredData();

    if (filtered.length === 0) {
        $list.innerHTML = `
            <li class="list-empty" role="status" aria-live="polite">
                <span class="empty-icon" aria-hidden="true">&#128269;</span>
                <p>${state.query ? `'${escapeHtml(state.query)}'에 대한 검색 결과가 없습니다.` : '단어가 없습니다. 새 단어를 추가해 보세요.'}</p>
            </li>
        `;
    } else {
        $list.innerHTML = filtered.map(item => renderCard(item, state.query)).join('');
    }

    /* 결과 수 업데이트 */
    document.getElementById('resultCount').textContent = filtered.length;
    document.getElementById('resultInfo').innerHTML =
        state.category !== '전체' || state.query
            ? `<strong>${filtered.length}</strong>개의 단어`
            : `전체 <strong>${filtered.length}</strong>개의 단어`;
}

/**
 * 사이드바 및 상단 통계의 카운트 뱃지를 업데이트합니다.
 */
function updateCounts() {
    const categories = ['조사류', '어미류', '띄어쓰기', '혼동 단어', '외래어 표기'];
    const idMap = {
        '조사류'    : 'count조사류',
        '어미류'    : 'count어미류',
        '띄어쓰기'  : 'count띄어쓰기',
        '혼동 단어' : 'count혼동단어',
        '외래어 표기': 'count외래어표기',
    };

    document.getElementById('countAll').textContent   = state.data.length;
    document.getElementById('statTotal').textContent  = state.data.length;

    categories.forEach(cat => {
        const count = state.data.filter(d => d.category === cat).length;
        const el    = document.getElementById(idMap[cat]);
        if (el) el.textContent = count;
    });
}


/* --------------------------------------------------------------------------
    CRUD
-------------------------------------------------------------------------- */

/**
 * 단어 항목을 추가합니다.
 * @param {Omit<WordEntry, 'id'>} entry
 */
function addWord(entry) {
    const newItem = { id: state.nextId++, ...entry };
    state.data.unshift(newItem); /* 최신 항목이 맨 앞에 */
    saveToStorage();
    updateCounts();
    renderList();
    showToast('단어가 추가됐습니다.', 'success');
}

/**
 * ID에 해당하는 단어 항목을 삭제합니다.
 * @param {number} id
 */
function deleteWord(id) {
    const index = state.data.findIndex(d => d.id === id);
    if (index === -1) return;

    const title = state.data[index].title;
    state.data.splice(index, 1);
    saveToStorage();
    updateCounts();
    renderList();
    showToast(`'${title}'가 삭제됐습니다.`, 'success');
}


/* --------------------------------------------------------------------------
    모달
-------------------------------------------------------------------------- */

/** 예시 필드를 하나 생성하여 반환합니다. */
function createExampleField(value = '') {
    const row = document.createElement('div');
    row.className = 'example-field-row';
    row.innerHTML = `
        <select class="form-select example-mark-select" aria-label="정오 표시 선택" style="max-width:80px; flex-shrink:0;">
            <option value="correct">◯</option>
            <option value="wrong">✗</option>
            <option value="none">-</option>
        </select>
        <input
            type="text"
            class="form-input example-text-input"
            placeholder="예시 문장을 입력하세요."
            maxlength="100"
            value="${escapeHtml(value)}"
            aria-label="예시 문장"
        />
        <button type="button" class="btn-remove-example" aria-label="예시 항목 삭제">&#10005;</button>
    `;

    /* 삭제 버튼 */
    row.querySelector('.btn-remove-example').addEventListener('click', () => {
        row.remove();
    });

    return row;
}

/** 모달을 엽니다. */
function openModal() {
    const $backdrop = document.getElementById('modalBackdrop');
    const $fields   = document.getElementById('examplesFields');

    /* 폼 초기화 */
    document.getElementById('inputTitle').value    = '';
    document.getElementById('inputCategory').value = '';
    document.getElementById('inputDesc').value     = '';
    $fields.innerHTML = '';
    $fields.appendChild(createExampleField());

    $backdrop.classList.add('is-open');
    $backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    /* 포커스 이동 (접근성) */
    setTimeout(() => document.getElementById('inputTitle').focus(), 100);
}

/** 모달을 닫습니다. */
function closeModal() {
    const $backdrop = document.getElementById('modalBackdrop');
    $backdrop.classList.remove('is-open');
    $backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/** 모달 폼을 제출합니다. */
function submitModal() {
    const title    = document.getElementById('inputTitle').value.trim();
    const category = document.getElementById('inputCategory').value;
    const desc     = document.getElementById('inputDesc').value.trim();

    /* 유효성 검사 */
    if (!title) {
        showToast('단어 쌍을 입력해 주세요.', 'error');
        document.getElementById('inputTitle').focus();
        return;
    }
    if (!category) {
        showToast('카테고리를 선택해 주세요.', 'error');
        document.getElementById('inputCategory').focus();
        return;
    }
    if (!desc) {
        showToast('설명을 입력해 주세요.', 'error');
        document.getElementById('inputDesc').focus();
        return;
    }

    /* 예시 수집 */
    const examples = [];
    document.querySelectorAll('.example-field-row').forEach(row => {
        const mark = row.querySelector('.example-mark-select').value;
        const text = row.querySelector('.example-text-input').value.trim();
        if (text) examples.push({ mark, text });
    });

    addWord({ title, category, desc, examples });
    closeModal();
}


/* --------------------------------------------------------------------------
    토스트 알림
-------------------------------------------------------------------------- */

/**
 * 토스트 알림을 표시합니다.
 * @param {string} message
 * @param {'success'|'error'} type
 */
function showToast(message, type = 'success') {
    const $container = document.getElementById('toastContainer');

    const $toast = document.createElement('div');
    $toast.className = `toast toast--${type}`;
    $toast.innerHTML = `
        <span class="toast-icon" aria-hidden="true">${type === 'success' ? '◯' : '✗'}</span>
        <span>${escapeHtml(message)}</span>
    `;

    $container.appendChild($toast);

    /* 슬라이드 인 */
    requestAnimationFrame(() => {
        requestAnimationFrame(() => $toast.classList.add('is-show'));
    });

    /* 3초 후 제거 */
    setTimeout(() => {
        $toast.classList.remove('is-show');
        $toast.addEventListener('transitionend', () => $toast.remove(), { once: true });
    }, 3000);
}


/* --------------------------------------------------------------------------
    테마 토글
-------------------------------------------------------------------------- */

function initTheme() {
    const $toggle = document.getElementById('themeToggle');
    const $label  = document.getElementById('themeLabel');
    const $html   = document.documentElement;

    /* 저장된 테마 불러오기 */
    const savedTheme = localStorage.getItem('spelling-dict-theme') || 'dark';
    applyTheme(savedTheme);

    $toggle.addEventListener('click', () => {
        const current = $html.getAttribute('data-theme');
        const next    = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('spelling-dict-theme', next);
    });

    function applyTheme(theme) {
        $html.setAttribute('data-theme', theme);

        if (theme === 'light') {
            $toggle.classList.add('is-light');
            $toggle.setAttribute('aria-checked', 'true');
            $toggle.setAttribute('aria-label', '다크 모드로 전환');
            $label.textContent = '라이트 모드';
        } else {
            $toggle.classList.remove('is-light');
            $toggle.setAttribute('aria-checked', 'false');
            $toggle.setAttribute('aria-label', '라이트 모드로 전환');
            $label.textContent = '다크 모드';
        }
    }
}


/* --------------------------------------------------------------------------
    사이드바 (모바일 오프캔버스)
-------------------------------------------------------------------------- */

function initSidebar() {
    const $sidebar = document.getElementById('sidebar');
    const $overlay = document.getElementById('sidebarOverlay');
    const $btnOpen = document.getElementById('btnMenuOpen');

    function openSidebar() {
        $sidebar.classList.add('is-open');
        $overlay.classList.add('is-visible');
        $btnOpen.setAttribute('aria-expanded', 'true');
        $sidebar.focus();
    }

    function closeSidebar() {
        $sidebar.classList.remove('is-open');
        $overlay.classList.remove('is-visible');
        $btnOpen.setAttribute('aria-expanded', 'false');
    }

    $btnOpen.addEventListener('click', openSidebar);
    $overlay.addEventListener('click', closeSidebar);

    /* ESC 키로 닫기 */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeSidebar();
    });
}


/* --------------------------------------------------------------------------
    이벤트 바인딩
-------------------------------------------------------------------------- */

function bindEvents() {

    /* 검색 입력 */
    const $searchInput = document.getElementById('searchInput');
    const $searchClear = document.getElementById('searchClear');

    $searchInput.addEventListener('input', () => {
        state.query = $searchInput.value.trim();
        $searchClear.classList.toggle('is-visible', state.query.length > 0);
        renderList();
    });

    $searchClear.addEventListener('click', () => {
        $searchInput.value = '';
        state.query = '';
        $searchClear.classList.remove('is-visible');
        $searchInput.focus();
        renderList();
    });

    /* 사이드바 네비 (카테고리 클릭) */
    document.getElementById('sidebarNav').addEventListener('click', e => {
        const $item = e.target.closest('.nav-item');
        if (!$item) return;

        state.category = $item.dataset.category;

        /* 사이드바 활성 상태 업데이트 */
        document.querySelectorAll('.nav-item').forEach(t => {
            const isActive = t === $item;
            t.classList.toggle('is-active', isActive);
            t.setAttribute('aria-current', isActive ? 'true' : 'false');
        });

        /* 섹션 타이틀 업데이트 */
        const $title = document.getElementById('sectionTitle');
        if ($title) $title.textContent = state.category === '전체' ? '전체 단어' : state.category;

        renderList();
    });

    /* 정렬 셀렉트 */
    document.getElementById('sortSelect').addEventListener('change', e => {
        state.sort = e.target.value;
        renderList();
    });

    /* 단어 추가 버튼 */
    document.getElementById('btnAddWord').addEventListener('click', openModal);

    /* 모달 닫기 */
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalCancel').addEventListener('click', closeModal);

    /* 모달 외부 클릭 닫기 */
    document.getElementById('modalBackdrop').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeModal();
    });

    /* 모달 저장 */
    document.getElementById('modalSubmit').addEventListener('click', submitModal);

    /* 예시 추가 */
    document.getElementById('btnAddExample').addEventListener('click', () => {
        document.getElementById('examplesFields').appendChild(createExampleField());
    });

    /* 카드 삭제 (이벤트 위임) */
    document.getElementById('cardList').addEventListener('click', e => {
        const $btn = e.target.closest('[data-action="delete"]');
        if (!$btn) return;

        const id = Number($btn.dataset.id);
        if (confirm(`정말 삭제하시겠습니까?`)) {
            deleteWord(id);
        }
    });

    /* ESC 키 — 모달 닫기 */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
}


/* --------------------------------------------------------------------------
    초기화
-------------------------------------------------------------------------- */

function init() {
    /* 저장된 데이터 또는 초기 데이터 로드 */
    const saved = loadFromStorage();
    if (saved && saved.length > 0) {
        state.data   = saved;
        state.nextId = Math.max(...saved.map(d => d.id)) + 1;
    } else {
        state.data   = [...INITIAL_DATA];
        saveToStorage();
    }

    updateCounts();
    renderList();
    bindEvents();
    initTheme();
    initSidebar();
}

/* DOM 로드 완료 후 실행 */
document.addEventListener('DOMContentLoaded', init);