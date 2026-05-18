/**
 * 포켓몬 띠부띠부씰 디지털 도감 — main.js
 * ─────────────────────────────────────────
 * • 포켓몬 데이터 (1~9세대)
 * • 초성 검색 알고리즘
 * • 로컬스토리지 연동 수집 상태 관리
 * • 책장 ↔ 스티커북 뷰 전환
 * • 페이지 넘기기
 * • 필터링 (보유/미보유/속성)
 * • 뱃지 시스템
 * • 공유 기능
 * • 효과음 (Web Audio API)
 */

'use strict';

/* ══════════════════════════════════════════════════════════════
   1. CONSTANTS & CONFIG
══════════════════════════════════════════════════════════════ */
const STORAGE_KEY = 'pokemon_dex_owned';
const STICKERS_PER_PAGE = 20; // 한 페이지당 (좌 10 + 우 10)
const PAGE_POKEMON_COUNT = 10; // 한 면당

const GEN_CONFIG = [
  { id: 1, label: '1세대',   subtitle: 'Red & Blue',    range: [1, 151],   color: '#e53935', glowColor: 'rgba(229,57,53,0.3)',   coverBg: '#2a1a1a' },
  { id: 2, label: '2세대',   subtitle: 'Gold & Silver',  range: [152, 251], color: '#fb8c00', glowColor: 'rgba(251,140,0,0.3)',   coverBg: '#2a1f10' },
  { id: 3, label: '3세대',   subtitle: 'Ruby & Sapphire', range: [252, 386], color: '#43a047', glowColor: 'rgba(67,160,71,0.3)',   coverBg: '#122212' },
  { id: 4, label: '4세대',   subtitle: 'Diamond & Pearl', range: [387, 493], color: '#1e88e5', glowColor: 'rgba(30,136,229,0.3)',  coverBg: '#0f1a2e' },
  { id: 5, label: '5세대',   subtitle: 'Black & White',   range: [494, 649], color: '#8e24aa', glowColor: 'rgba(142,36,170,0.3)',  coverBg: '#1c0a2a' },
  { id: 6, label: '6세대',   subtitle: 'X & Y',           range: [650, 721], color: '#00acc1', glowColor: 'rgba(0,172,193,0.3)',   coverBg: '#071a22' },
  { id: 7, label: '7세대',   subtitle: 'Sun & Moon',       range: [722, 809], color: '#f4511e', glowColor: 'rgba(244,81,30,0.3)',   coverBg: '#2a1208' },
  { id: 8, label: '8세대',   subtitle: 'Sword & Shield',   range: [810, 905], color: '#3949ab', glowColor: 'rgba(57,73,171,0.3)',   coverBg: '#0a0e2a' },
  { id: 9, label: '9세대',   subtitle: 'Scarlet & Violet', range: [906, 1025],color: '#00897b', glowColor: 'rgba(0,137,123,0.3)',   coverBg: '#062220' },
];

const GEN_MASCOTS = {
  1: '25',   // 피카츄
  2: '249',  // 루기아
  3: '384',  // 레쿠쟈
  4: '483',  // 디아루가
  5: '643',  // 레시라무
  6: '716',  // 제르네아스
  7: '791',  // 솔가레오
  8: '888',  // 자시안
  9: '1000', // 코라이돈(데이터에 따라 유동)
};

/* ══════════════════════════════════════════════════════════════
   2. CHOSUNG SEARCH ALGORITHM
══════════════════════════════════════════════════════════════ */
const CHOSUNG_LIST = [
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ',
  'ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];

const HANGUL_START = 0xAC00;
const HANGUL_END   = 0xD7A3;

/**
 * 한글 음절에서 초성 추출
 * @param {string} char - 단일 문자
 * @returns {string} 초성 또는 원래 문자
 */
function getChosung(char) {
  const code = char.charCodeAt(0);
  if (code >= HANGUL_START && code <= HANGUL_END) {
    return CHOSUNG_LIST[Math.floor((code - HANGUL_START) / 588)];
  }
  return char;
}

/**
 * 문자열에서 초성 배열 생성
 * @param {string} str
 * @returns {string} 초성 문자열
 */
function extractChosung(str) {
  return [...str].map(getChosung).join('');
}

/**
 * 초성 검색 여부 판단 (입력이 모두 자음으로만 구성됐는지)
 * @param {string} query
 * @returns {boolean}
 */
function isChosungOnly(query) {
  return [...query].every(char => CHOSUNG_LIST.includes(char));
}

/**
 * 포켓몬 검색 필터
 * @param {string} query
 * @param {string} filterType - 'all' | 'owned' | 'unowned'
 * @param {string} filterAttr - '' | 속성명
 * @param {Set} ownedSet
 * @returns {Array}
 */
function searchPokemon(query, filterType, filterAttr, ownedSet) {
  let results = [...POKEMON_DATA];

  // 소유 필터
  if (filterType === 'owned') {
    results = results.filter(p => ownedSet.has(p.no));
  } else if (filterType === 'unowned') {
    results = results.filter(p => !ownedSet.has(p.no));
  }

  // 속성 필터
  if (filterAttr && filterAttr !== 'all') {
    results = results.filter(p => p.type.includes(filterAttr));
  }

  // 검색어 필터
  if (query && query.trim() !== '') {
    const q = query.trim();
    if (isChosungOnly(q)) {
      // 초성 검색
      results = results.filter(p => {
        const nameChosung = extractChosung(p.name);
        return nameChosung.includes(q);
      });
    } else {
      // 일반 이름 검색
      results = results.filter(p =>
        p.name.includes(q) ||
        String(p.no).includes(q)
      );
    }
  }

  return results;
}

/* ══════════════════════════════════════════════════════════════
   3. LOCAL STORAGE
══════════════════════════════════════════════════════════════ */
function loadOwned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveOwned(ownedSet) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ownedSet]));
  } catch (e) {
    console.warn('localStorage 저장 실패:', e);
  }
}

function toggleOwned(pokemonNo, ownedSet) {
  if (ownedSet.has(pokemonNo)) {
    ownedSet.delete(pokemonNo);
    return false; // 해제
  } else {
    ownedSet.add(pokemonNo);
    return true; // 등록
  }
}

/* ══════════════════════════════════════════════════════════════
   4. WEB AUDIO — 효과음 (SFX)
══════════════════════════════════════════════════════════════ */
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * 스티커 붙이기 효과음 (단순 oscillator)
 */
function playStickerSound(isPlace) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (isPlace) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch {}
}

/**
 * 책 넘기기 효과음
 */
function playPageFlipSound() {
  try {
    const ctx = getAudioCtx();
    const bufferSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.4;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.5;

    source.connect(filter);
    filter.connect(ctx.destination);
    source.start();
  } catch {}
}

/* ══════════════════════════════════════════════════════════════
   5. TOAST NOTIFICATION
══════════════════════════════════════════════════════════════ */
function showToast(message, icon = '✓') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('is-hiding');
    toast.addEventListener('animationend', () => toast.remove());
  }, 2200);
}

/* ══════════════════════════════════════════════════════════════
   6. DOM HELPERS
══════════════════════════════════════════════════════════════ */
function getPokemonImageUrl(no) {
  // PokeAPI 공식 스프라이트 (CDN)
  const padded = String(no).padStart(3, '0');
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${no}.png`;
}

function getGenConfig(genId) {
  return GEN_CONFIG.find(g => g.id === genId);
}

function getPokemonsByGen(genId) {
  return POKEMON_DATA.filter(p => p.gen === genId);
}

/* ══════════════════════════════════════════════════════════════
   7. STATISTICS
══════════════════════════════════════════════════════════════ */
function calcStats(ownedSet) {
  const total = POKEMON_DATA.length;
  const owned = POKEMON_DATA.filter(p => ownedSet.has(p.no)).length;
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;

  const genStats = GEN_CONFIG.map(g => {
    const genPokemon = getPokemonsByGen(g.id);
    const genOwned = genPokemon.filter(p => ownedSet.has(p.no)).length;
    const genPct = genPokemon.length > 0 ? Math.round((genOwned / genPokemon.length) * 100) : 0;
    return { ...g, total: genPokemon.length, owned: genOwned, pct: genPct, isMaster: genPct === 100 && genPokemon.length > 0 };
  });

  return { total, owned, pct, genStats };
}

/* ══════════════════════════════════════════════════════════════
   8. RENDER — STICKER ITEM
══════════════════════════════════════════════════════════════ */
function renderStickerItem(pokemon, isOwned, genColor) {
  const mainType = pokemon.type[0];
  const typeList = pokemon.type.map(t => `<span class="sticker-item-type" data-type="${t}">${t}</span>`).join('');
  const imgUrl = getPokemonImageUrl(pokemon.no);

  const el = document.createElement('li');
  el.className = `sticker-item ${isOwned ? 'is-owned' : 'is-unowned'}`;
  el.dataset.no = pokemon.no;
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label', `${pokemon.name} - ${isOwned ? '보유 중' : '미보유'}`);
  el.setAttribute('aria-pressed', isOwned ? 'true' : 'false');
  el.style.setProperty('--gen-color', genColor);

  el.innerHTML = `
    <span class="sticker-item-no">#${String(pokemon.no).padStart(3,'0')}</span>
    <span class="sticker-item-check" aria-hidden="true">✓</span>
    <div class="sticker-item-img-wrap">
      <img
        class="sticker-item-img"
        src="${imgUrl}"
        alt="${pokemon.name}"
        loading="lazy"
        width="80"
        height="80"
        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'%3E%3Ccircle cx=\'40\' cy=\'40\' r=\'30\' fill=\'%23ddd\'/%3E%3Ctext x=\'40\' y=\'45\' text-anchor=\'middle\' fill=\'%23999\' font-size=\'10\'%3E?%3C/text%3E%3C/svg%3E'"
      />
    </div>
    <span class="sticker-item-name">${pokemon.name}</span>
    <div>${typeList}</div>
  `;

  return el;
}

/* ══════════════════════════════════════════════════════════════
   9. RENDER — BOOK PAGES
══════════════════════════════════════════════════════════════ */
function renderBookPages(genId, currentPage, ownedSet, container) {
  const genCfg = getGenConfig(genId);
  const pokemons = getPokemonsByGen(genId);
  const perPage = PAGE_POKEMON_COUNT;
  const totalPages = Math.ceil(pokemons.length / (perPage * 2));
  const pageIndex = currentPage - 1;

  const leftPokemons  = pokemons.slice(pageIndex * perPage * 2, pageIndex * perPage * 2 + perPage);
  const rightPokemons = pokemons.slice(pageIndex * perPage * 2 + perPage, (pageIndex + 1) * perPage * 2);
  const leftOwned  = leftPokemons.filter(p => ownedSet.has(p.no)).length;
  const rightOwned = rightPokemons.filter(p => ownedSet.has(p.no)).length;

  container.innerHTML = '';
  container.style.setProperty('--gen-color', genCfg.color);

  // Left page
  const leftPage = document.createElement('div');
  leftPage.className = 'book-page book-page--left';
  leftPage.innerHTML = `
    <div class="book-page__header">
      <span class="book-page__gen-label">${genCfg.label} — ${genCfg.subtitle}</span>
      <span class="book-page-count">${leftOwned} / ${leftPokemons.length}</span>
    </div>
  `;
  const leftGrid = document.createElement('ul');
  leftGrid.className = 'sticker-grid';
  leftGrid.setAttribute('aria-label', `${genCfg.label} 스티커 (왼쪽 페이지)`);
  leftPokemons.forEach(p => leftGrid.appendChild(renderStickerItem(p, ownedSet.has(p.no), genCfg.color)));
  leftPage.appendChild(leftGrid);

  // Page nav
  const navEl = document.createElement('div');
  navEl.className = 'book-page-nav';
  navEl.innerHTML = `
    <button class="page-nav-btn" id="prevPageBtn" aria-label="이전 페이지" ${currentPage <= 1 ? 'disabled' : ''}>◀</button>
    <span class="book-page__page-num">${currentPage} / ${totalPages}</span>
    <button class="page-nav-btn" id="nextPageBtn" aria-label="다음 페이지" ${currentPage >= totalPages ? 'disabled' : ''}>▶</button>
  `;
  leftPage.appendChild(navEl);
  container.appendChild(leftPage);

  // Right page
  const rightPage = document.createElement('div');
  rightPage.className = 'book-page book-page--right';
  rightPage.innerHTML = `
    <div class="book-page__header">
      <span class="book-page__gen-label">${genCfg.label}</span>
      <span class="book-page-count">${rightOwned} / ${rightPokemons.length}</span>
    </div>
  `;
  const rightGrid = document.createElement('ul');
  rightGrid.className = 'sticker-grid';
  rightGrid.setAttribute('aria-label', `${genCfg.label} 스티커 (오른쪽 페이지)`);
  rightPokemons.forEach(p => rightGrid.appendChild(renderStickerItem(p, ownedSet.has(p.no), genCfg.color)));
  rightPage.appendChild(rightGrid);
  container.appendChild(rightPage);
}

/* ══════════════════════════════════════════════════════════════
   10. RENDER — LIBRARY (책장)
══════════════════════════════════════════════════════════════ */
function renderLibrary(stats, container) {
  container.innerHTML = '';
  stats.genStats.forEach(gs => {
    const card = document.createElement('article');
    card.className = `book-card ${gs.isMaster ? 'is-master' : ''}`;
    card.dataset.gen = gs.id;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${gs.label} 도감 열기 - ${gs.owned}/${gs.total} 수집`);
    card.style.setProperty('--gen-color', gs.color);
    card.style.setProperty('--gen-glow', gs.glowColor);
    card.style.setProperty('--gen-cover-bg', gs.coverBg);

    const mascotNo = GEN_MASCOTS[gs.id] || gs.range[0];
    const mascotUrl = getPokemonImageUrl(mascotNo);

    card.innerHTML = `
      <div class="book-card__inner">
        <div class="book-card__spine">
          <span class="book-card__spine-text">${gs.label} 도감</span>
        </div>
        <div class="book-card__cover">
          <span class="book-card__master-badge" aria-label="마스터 달성">👑</span>
          <span class="book-card__gen-badge">G${gs.id}</span>
          <h2 class="book-card__title">${gs.label}</h2>
          <p class="book-card__subtitle">${gs.subtitle}</p>
          <img
            class="book-card__mascot"
            src="${mascotUrl}"
            alt="${gs.label} 대표 포켓몬"
            loading="lazy"
            width="80"
            height="80"
            onerror="this.style.display='none'"
          />
          <div class="book-card__progress">
            <span class="book-card__progress-bar">
              <span class="book-card__progress-fill" style="width:${gs.pct}%"></span>
            </span>
            <span class="book-card__progress-text">${gs.owned} / ${gs.total} · ${gs.pct}%</span>
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

/* ══════════════════════════════════════════════════════════════
   11. RENDER — SIDEBAR NAV
══════════════════════════════════════════════════════════════ */
function renderSidebarNav(stats, container, activeGenId) {
  container.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = `sidebar-nav-item ${!activeGenId ? 'is-active' : ''}`;
  allBtn.dataset.action = 'showLibrary';
  allBtn.setAttribute('aria-label', '전체 책장 보기');
  allBtn.innerHTML = `
    <span class="sidebar__nav-dot" style="background:#888"></span>
    전체 도감
    <span class="sidebar__nav-badge">${stats.total}</span>
  `;
  container.appendChild(allBtn);

  stats.genStats.forEach(gs => {
    const btn = document.createElement('button');
    btn.className = `sidebar-nav-item ${gs.isMaster ? 'is-master' : ''} ${activeGenId === gs.id ? 'is-active' : ''}`;
    btn.dataset.gen = gs.id;
    btn.dataset.action = 'openGen';
    btn.setAttribute('aria-label', `${gs.label} 도감 - ${gs.pct}% 수집`);
    btn.innerHTML = `
      <span class="sidebar__nav-dot" style="background:${gs.color}"></span>
      ${gs.label}
      <span class="sidebar__nav-badge">${gs.pct}%</span>
    `;
    container.appendChild(btn);
  });
}

/* ══════════════════════════════════════════════════════════════
   12. RENDER — SIDEBAR STATS
══════════════════════════════════════════════════════════════ */
function renderSidebarStats(stats) {
  const totalEl = document.getElementById('sidebarTotal');
  const ownedEl = document.getElementById('sidebarOwned');
  const pctEl   = document.getElementById('sidebarPct');
  const fillEl  = document.getElementById('sidebarBarFill');
  if (totalEl) totalEl.textContent = stats.total;
  if (ownedEl) ownedEl.textContent = stats.owned;
  if (pctEl)   pctEl.textContent   = stats.pct + '%';
  if (fillEl)  fillEl.style.width  = stats.pct + '%';
}

/* ══════════════════════════════════════════════════════════════
   13. APP STATE & CONTROLLER
══════════════════════════════════════════════════════════════ */
const App = {
  ownedSet: new Set(),
  currentGenId: null,
  currentPage: 1,
  filterType: 'all',    // all | owned | unowned
  filterAttr: '',
  searchQuery: '',

  init() {
    this.ownedSet = loadOwned();
    this.bindStaticDOM();
    this.renderAll();
    this.bindDynamicEvents();
    this.bindSearchEvents();
    this.bindFilterEvents();
    this.bindScrollTop();
    this.bindSidebarToggle();
    // 책장 UI 초기화 (BookShelf는 DOMContentLoaded 이후 별도 init)
  },

  renderAll(activeGenId = null) {
    const stats = calcStats(this.ownedSet);
    renderSidebarStats(stats);

    const sidebarNav = document.getElementById('sidebarNav');
    if (sidebarNav) renderSidebarNav(stats, sidebarNav, activeGenId);

    // 책장 진행률 바 업데이트 (HTML 하드코딩 책장과 연동)
    BookShelf.updateProgressBars();
  },

  openGen(genId) {
    // 책장 클릭과 동일하게 모달 팝업으로 통일
    BookShelf.openPanel(genId);

    // 사이드바 active 표시만 업데이트
    document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('is-active'));
    document.querySelector(`.sidebar-nav-item[data-gen="${genId}"]`)?.classList.add('is-active');
  },

  showLibrary() {
    this.currentGenId = null;
    this.currentPage  = 1;
    this.searchQuery  = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    document.querySelector('.search-wrap')?.classList.remove('has-value');

    document.getElementById('searchResultView')?.classList.remove('is-active');
    document.getElementById('libraryView')?.classList.add('is-active');

    this.renderAll(null);

    document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('is-active'));
    document.querySelector('.sidebar-nav-item[data-action="showLibrary"]')?.classList.add('is-active');
  },

  goToPage(direction) {
    if (!this.currentGenId) return;
    const pokemons = getPokemonsByGen(this.currentGenId);
    const totalPages = Math.ceil(pokemons.length / (PAGE_POKEMON_COUNT * 2));
    const newPage = this.currentPage + direction;
    if (newPage < 1 || newPage > totalPages) return;

    this.currentPage = newPage;
    playPageFlipSound();

    const bookPages = document.getElementById('bookPages');
    if (!bookPages) return;

    bookPages.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    bookPages.style.opacity = '0';
    bookPages.style.transform = `translateX(${direction > 0 ? '20px' : '-20px'})`;

    setTimeout(() => {
      renderBookPages(this.currentGenId, this.currentPage, this.ownedSet, bookPages);
      this.bindStickerEvents();
      this.bindPageNavEvents();
      requestAnimationFrame(() => {
        bookPages.style.opacity = '1';
        bookPages.style.transform = 'translateX(0)';
      });
    }, 200);
  },

  toggleSticker(pokemonNo) {
    const isNowOwned = toggleOwned(pokemonNo, this.ownedSet);
    saveOwned(this.ownedSet);
    playStickerSound(isNowOwned);

    // Update DOM
    const el = document.querySelector(`.sticker-item[data-no="${pokemonNo}"]`);
    if (el) {
      el.classList.toggle('is-owned', isNowOwned);
      el.classList.toggle('is-unowned', !isNowOwned);
      el.setAttribute('aria-pressed', isNowOwned ? 'true' : 'false');
      el.setAttribute('aria-label', `${el.querySelector('.sticker-item-name')?.textContent} - ${isNowOwned ? '보유 중' : '미보유'}`);
      el.classList.add('is-placing');
      el.addEventListener('animationend', () => el.classList.remove('is-placing'), { once: true });
    }

    const pokemon = POKEMON_DATA.find(p => p.no === pokemonNo);
    const name = pokemon ? pokemon.name : `#${pokemonNo}`;
    showToast(
      isNowOwned ? `${name} 획득! ✨` : `${name} 제거됨`,
      isNowOwned ? '⭐' : '📦'
    );

    // Check master
    if (this.currentGenId) {
      const genCfg = getGenConfig(this.currentGenId);
      const genPokemons = getPokemonsByGen(this.currentGenId);
      const allOwned = genPokemons.every(p => this.ownedSet.has(p.no));
      if (allOwned) {
        showToast(`🎉 ${genCfg.label} 마스터 달성!`, '👑');
      }
    }

    this.renderAll(this.currentGenId);
    this.updatePageCounts();
  },

  updatePageCounts() {
    if (!this.currentGenId) return;
    // 빠른 count 업데이트 (재렌더 없이)
    document.querySelectorAll('.book-page').forEach((page, i) => {
      const grid = page.querySelector('.sticker-grid');
      if (!grid) return;
      const items = grid.querySelectorAll('.sticker-item');
      const owned = [...items].filter(el => el.classList.contains('is-owned')).length;
      const countEl = page.querySelector('.book-page-count');
      if (countEl) countEl.textContent = `${owned} / ${items.length}`;
    });
  },

  runSearch() {
    const query = this.searchQuery.trim();
    if (!query && this.filterType === 'all' && !this.filterAttr) {
      if (this.currentGenId) {
        // 책 뷰 유지
      } else {
        this.showLibrary();
      }
      return;
    }

    const results = searchPokemon(query, this.filterType, this.filterAttr, this.ownedSet);

    document.getElementById('libraryView')?.classList.remove('is-active');
    const resultView = document.getElementById('searchResultView');
    if (resultView) resultView.classList.add('is-active');

    const countEl = document.getElementById('searchResultCount');
    if (countEl) countEl.textContent = results.length;

    const gridEl = document.getElementById('searchResultGrid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    if (results.length === 0) {
      gridEl.innerHTML = `
        <li class="no-result" style="grid-column:1/-1">
          <span class="no-result__icon">🔍</span>
          <p class="no-result__text">검색 결과가 없습니다</p>
          <p class="no-result__sub">'${query}' 에 해당하는 포켓몬을 찾지 못했어요</p>
        </li>
      `;
      return;
    }

    results.forEach(p => {
      const genCfg = getGenConfig(p.gen);
      const item = renderStickerItem(p, this.ownedSet.has(p.no), genCfg.color);
      gridEl.appendChild(item);
    });

    this.bindStickerEvents();
  },

  bindStaticDOM() {
    // Breadcrumb back button
    document.getElementById('bcBack')?.addEventListener('click', () => this.showLibrary());
  },

  bindDynamicEvents() {
    // 책장 book 클릭 (HTML 하드코딩 요소 직접 바인딩)
    document.getElementById('shelfUnit')?.addEventListener('click', e => {
      const book = e.target.closest('.book[data-gen]');
      if (!book) return;
      this.openGen(Number(book.dataset.gen));
    });
    document.getElementById('shelfUnit')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const book = e.target.closest('.book[data-gen]');
        if (book) { e.preventDefault(); this.openGen(Number(book.dataset.gen)); }
      }
    });

    // Sidebar nav click
    document.getElementById('sidebarNav')?.addEventListener('click', e => {
      const btn = e.target.closest('.sidebar-nav-item');
      if (!btn) return;
      if (btn.dataset.action === 'showLibrary') { this.showLibrary(); }
      else if (btn.dataset.action === 'openGen') { this.openGen(Number(btn.dataset.gen)); }
    });
  },

  bindStickerEvents() {
    document.querySelectorAll('.sticker-item').forEach(el => {
      const no = Number(el.dataset.no);
      el.onclick = () => this.toggleSticker(no);
      el.onkeydown = e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggleSticker(no); }
      };
    });
  },

  bindPageNavEvents() {
    document.getElementById('prevPageBtn')?.addEventListener('click', () => this.goToPage(-1));
    document.getElementById('nextPageBtn')?.addEventListener('click', () => this.goToPage(1));
  },

  bindSearchEvents() {
    const searchInput = document.getElementById('searchInput');
    const searchWrap  = document.querySelector('.search-wrap');
    const clearBtn    = document.getElementById('searchClear');

    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', e => {
      this.searchQuery = e.target.value;
      searchWrap?.classList.toggle('has-value', this.searchQuery.length > 0);
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this.runSearch(), 200);
    });

    clearBtn?.addEventListener('click', () => {
      searchInput.value = '';
      this.searchQuery  = '';
      searchWrap?.classList.remove('has-value');
      this.showLibrary();
    });
  },

  bindFilterEvents() {
    document.querySelectorAll('.chip[data-filter]').forEach(chip => {
      chip.addEventListener('click', () => {
        const filterGroup = chip.dataset.filterGroup;
        const filterVal   = chip.dataset.filter;

        // Toggle within group
        document.querySelectorAll(`.chip[data-filter-group="${filterGroup}"]`).forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');

        if (filterGroup === 'status') {
          this.filterType = filterVal;
        } else if (filterGroup === 'attr') {
          this.filterAttr = filterVal === 'all' ? '' : filterVal;
        }

        this.runSearch();
      });
    });
  },

  bindScrollTop() {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('is-visible', window.scrollY > 300);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  },

  bindSidebarToggle() {
    const toggle  = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    toggle?.addEventListener('click', () => {
      sidebar?.classList.toggle('is-open');
    });
    backdrop?.addEventListener('click', () => {
      sidebar?.classList.remove('is-open');
    });
  },
};

/* ══════════════════════════════════════════════════════════════
   16. BOOT
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  // BookShelf는 App 초기화 후 실행하여 App.ownedSet 참조 보장
  if (document.getElementById('shelfUnit')) {
    BookShelf.init();
  }
});

/* ══════════════════════════════════════════════════════════════
   17. BOOKSHELF RENDER — 나무 책장 UI (레퍼런스 이미지 기반)
══════════════════════════════════════════════════════════════ */
const BookShelf = {
  curGenId: null,
  curPage: 1,
  PER_PAGE: 15,

  init() {
    this.bindSvg();
    this.bindPanel();
  },

  /**
   * 책장 초기화: 진행률 바 업데이트
   * 클릭 이벤트는 App.bindDynamicEvents()에서 shelfUnit에 위임 처리
   */
  bindSvg() {
    this.updateProgressBars();
  },

  bindPanel() {
    document.getElementById('panelClose')?.addEventListener('click', () => this.closePanel());
    document.getElementById('bookPanelOverlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) this.closePanel();
    });
    document.getElementById('panelPrevBtn')?.addEventListener('click', () => { this.curPage--; this.renderPanel(); });
    document.getElementById('panelNextBtn')?.addEventListener('click', () => { this.curPage++; this.renderPanel(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.closePanel(); });
  },

  /**
   * 16진수 컬러를 더 어둡게
   */
  darken(hex, f) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`;
  },

  /**
   * 세대 데이터 → 책 DOM 생성
   */
  buildBook(genStat) {
    const pct = genStat.total > 0 ? genStat.owned / genStat.total : 0;

    const el = document.createElement('li');
    el.className = `book ${genStat.isMaster ? 'is-master' : ''}`;
    // ▶ 인라인 width 제거 — CSS .book { flex: 1 1 0 } 이 너비를 균등 분배
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `${genStat.label} 도감 — ${genStat.owned}/${genStat.total} 수집`);

    const darkColor = this.darken(genStat.color, 0.55);
    const bgGrad    = `linear-gradient(90deg, ${darkColor} 0%, ${genStat.color} 30%, ${genStat.color}cc 100%)`;

    el.innerHTML = `
      <div class="book-body" style="height:120px;background:${bgGrad}">
        <div class="book-stripe" style="top:14px"></div>
        <div class="book-stripe" style="top:102px"></div>
        <span class="book-spine-text">${genStat.label}</span>
        <div class="book-gen-num" aria-hidden="true">G${genStat.id}</div>
        <div class="book-progress" role="presentation">
          <div class="book-progress-fill" style="width:${Math.round(pct*100)}%"></div>
        </div>
      </div>
      <div class="book-shadow" aria-hidden="true"></div>
    `;

    el.addEventListener('click',    () => this.openPanel(genStat.id));
    el.addEventListener('keydown',  e  => { if (e.key==='Enter'||e.key===' '){ e.preventDefault(); this.openPanel(genStat.id); }});
    return el;
  },

  renderShelves() {
    // SVG inline 방식 — DOM 재구성 없이 진행률 바만 업데이트
    this.updateProgressBars();
  },

  /**
   * SVG 내 pbar1~pbar9 의 width를 수집률에 맞게 업데이트
   * pbar 최대 너비: 1열 = 140, 2열 = 197 (SVG viewBox 좌표 기준)
   */
  updateProgressBars() {
    const stats = calcStats(App.ownedSet);
    stats.genStats.forEach(gs => {
      const pct = gs.total > 0 ? gs.owned / gs.total : 0;
      const bar = document.getElementById(`pbar${gs.id}`);
      if (bar) bar.style.width = Math.round(pct * 100) + '%';
    });
  },

  openPanel(genId) {
    this.curGenId = genId;
    this.curPage  = 1;
    this.renderPanel();
    const overlay = document.getElementById('bookPanelOverlay');
    overlay?.classList.add('is-open');
    document.getElementById('panelClose')?.focus();
  },

  closePanel() {
    document.getElementById('bookPanelOverlay')?.classList.remove('is-open');
    this.updateProgressBars();
  },

  renderPanel() {
    const genCfg   = getGenConfig(this.curGenId);
    const pokemons = getPokemonsByGen(this.curGenId);
    const total    = pokemons.length;
    const ownedN   = pokemons.filter(p => App.ownedSet.has(p.no)).length;
    const pct      = total > 0 ? Math.round(ownedN / total * 100) : 0;
    const totalPages = Math.max(1, Math.ceil(total / this.PER_PAGE));
    if (this.curPage > totalPages) this.curPage = totalPages;

    // ── 왼쪽 커버 스타일 적용
    const coverEl = document.getElementById('bookCoverLeft');
    if (coverEl) {
      coverEl.style.setProperty('--cover-bg', genCfg.coverBg);
      coverEl.style.background = genCfg.coverBg;
    }
    const bindingEl = document.getElementById('bookBinding');
    if (bindingEl) bindingEl.style.background = this.darken(genCfg.color, 0.45);

    const genLabelEl = document.getElementById('coverGenLabel');
    if (genLabelEl) genLabelEl.textContent = 'G' + genCfg.id;

    const titleEl = document.getElementById('panelTitle');
    if (titleEl) titleEl.textContent = genCfg.label;
    const subEl = document.getElementById('panelSub');
    if (subEl) subEl.textContent = genCfg.subtitle;

    // 마스코트 이미지
    const mascotEl = document.getElementById('coverMascot');
    if (mascotEl) {
      const mascotNo = GEN_MASCOTS[genCfg.id] || genCfg.range[0];
      mascotEl.src = getPokemonImageUrl(mascotNo);
      mascotEl.alt = genCfg.label + ' 대표 포켓몬';
      mascotEl.style.display = '';
    }

    // 수집 현황
    const ownedEl = document.getElementById('panelOwned');
    if (ownedEl) ownedEl.textContent = ownedN;
    const totalEl = document.getElementById('panelTotal');
    if (totalEl) totalEl.textContent = total;
    const pctEl   = document.getElementById('panelPct');
    if (pctEl)   pctEl.textContent   = pct + '% 수집';
    const fillEl  = document.getElementById('panelBarFill');
    if (fillEl)   fillEl.style.width = pct + '%';

    // 오른쪽 페이지 헤더
    const pageGenEl = document.getElementById('pageHeaderGen');
    if (pageGenEl) pageGenEl.style.color = genCfg.color;
    if (pageGenEl) pageGenEl.textContent = genCfg.label + ' 도감';
    const pageCountEl = document.getElementById('pageHeaderCount');
    if (pageCountEl) pageCountEl.textContent = `${ownedN} / ${total}`;

    const pageInfoEl = document.getElementById('panelPageInfo');
    if (pageInfoEl) pageInfoEl.textContent = `${this.curPage} / ${totalPages}`;
    const prevBtn = document.getElementById('panelPrevBtn');
    const nextBtn = document.getElementById('panelNextBtn');
    if (prevBtn) prevBtn.disabled = this.curPage <= 1;
    if (nextBtn) nextBtn.disabled = this.curPage >= totalPages;

    // 그리드
    const grid = document.getElementById('panelStickerGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const slice = pokemons.slice((this.curPage-1)*this.PER_PAGE, this.curPage*this.PER_PAGE);
    slice.forEach(p => grid.appendChild(renderStickerItem(p, App.ownedSet.has(p.no), genCfg.color)));

    // 스티커 이벤트 재바인딩
    grid.querySelectorAll('.sticker-item').forEach(el => {
      const no = Number(el.dataset.no);
      el.onclick   = () => { App.toggleSticker(no); this.syncPanelStats(); };
      el.onkeydown = e => { if (e.key==='Enter'||e.key===' '){ e.preventDefault(); App.toggleSticker(no); this.syncPanelStats(); }};
    });
  },

  syncPanelStats() {
    if (!this.curGenId) return;
    const pokemons = getPokemonsByGen(this.curGenId);
    const total    = pokemons.length;
    const ownedN   = pokemons.filter(p => App.ownedSet.has(p.no)).length;
    const pct      = total > 0 ? Math.round(ownedN / total * 100) : 0;

    const ownedEl     = document.getElementById('panelOwned');
    const pctEl       = document.getElementById('panelPct');
    const fillEl      = document.getElementById('panelBarFill');
    const pageCountEl = document.getElementById('pageHeaderCount');

    if (ownedEl)     ownedEl.textContent     = ownedN;
    if (pctEl)       pctEl.textContent       = pct + '% 수집';
    if (fillEl)      fillEl.style.width      = pct + '%';
    if (pageCountEl) pageCountEl.textContent = `${ownedN} / ${total}`;
  },
};

/* (BookShelf boot은 16번 섹션 BOOT에서 통합 실행) */