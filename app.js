'use strict';

/* ============================================================
   Mes Habitudes — logique de l'application
   Données en localStorage sous la clé "habits.v1" :
   {
     habits:    [{id, name, emoji, color, createdAt, categoryId, description}],
     checks:    {habitId: {"YYYY-MM-DD": 1}},
     categories:[{id, name, emoji}],
     settings:  {viewMode: 'grid'|'check'|'list', showDone: bool}
   }
   ============================================================ */

const STORE_KEY = 'habits.v1';
const APP_VERSION = '1.4.0';
const WEEKS_TILE = 7;
const WEEKS_WIDE = 26;

/* Zoom : compact / normal / large. Une tuile plus large montre plus d'historique. */
const ZOOM_LEVELS = 3;
const ZOOM_WEEKS = {
  grid: [5, 7, 13],
  list: [34, 26, 17],
};
const ZOOM_DOTS = [7, 7, 14];
const ZOOM_NAMES = ['Compact', 'Normal', 'Large'];

const PALETTE = [
  '#FF6B6B', '#FF9F43', '#FFD166', '#A3E635', '#4ADE80', '#2DD4BF',
  '#38BDF8', '#60A5FA', '#818CF8', '#A78BFA', '#E879F9', '#F472B6',
];

const EMOJIS = [
  '💪', '🏃', '🚴', '🏋️', '🧘', '🚶', '🏊', '⚽',
  '📚', '✍️', '🧠', '🎓', '💻', '🎨', '🎸', '🎹',
  '💧', '🥗', '🍎', '🥦', '🚭', '😴', '🦷', '🚿',
  '🧹', '🍳', '🌱', '🐕', '💊', '☀️', '🌙', '📵',
  '💼', '📝', '📈', '💰', '✉️', '📅', '🎯', '⏰',
  '🎬', '📺', '🎮', '🕹️', '♟️', '🎲', '🎧', '📸',
  '🙏', '❤️', '😊', '📞', '👥', '🍻', '✈️', '⭐',
];

const DAY_LETTERS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
const DOW_SIDE = ['', 'Mar', '', 'Jeu', '', 'Sam', ''];
const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_CAP = ['Jan', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];

const ICON = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.2-4.2L16.5 4.5a2.12 2.12 0 0 1 3 3L8.2 18.8 4 20z"/><path d="M14.5 6.5l3 3"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6.5 7l1 14h9l1-14"/><path d="M10 11v6M14 11v6"/></svg>',
  hash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 3.5 8 20.5M16 3.5l-2 17M4 9h17M3 15h17"/></svg>',
  percent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 5 5 19"/><circle cx="6.8" cy="6.8" r="2.6"/><circle cx="17.2" cy="17.2" r="2.6"/></svg>',
  drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5s6 6.3 6 10.3a6 6 0 0 1-12 0c0-4 6-10.3 6-10.3z"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17l5-5 4 3 7-8"/><path d="M14.5 7H20v5.5"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="6" width="16" height="14" rx="4"/><path d="M4 11h16M9 3.5V7M15 3.5V7"/></svg>',
};

/* ---------- Dates (toujours en heure locale) ---------- */

function todayDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function keyOf(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function parseKey(k) {
  const p = k.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function mondayOf(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}

function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

function fmtLongDate(d) {
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function fmtMonthYear(d) {
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

/* ---------- Stockage ---------- */

function normalize(s) {
  const out = {
    habits: Array.isArray(s.habits) ? s.habits : [],
    checks: (s.checks && typeof s.checks === 'object') ? s.checks : {},
    categories: Array.isArray(s.categories) ? s.categories : [],
    settings: Object.assign({ viewMode: 'grid', showDone: true }, s.settings || {}),
  };
  out.settings.reminder = Object.assign({ enabled: false, time: '20:00' }, out.settings.reminder || {});
  out.settings.zoom = Object.assign({ grid: 1, check: 1, list: 1 }, out.settings.zoom || {});
  for (const m of ['grid', 'check', 'list']) {
    const z = out.settings.zoom[m];
    out.settings.zoom[m] = (z === 0 || z === 1 || z === 2) ? z : 1;
  }
  for (const h of out.habits) {
    if (h.categoryId === undefined) h.categoryId = null;
    if (typeof h.description !== 'string') h.description = '';
  }
  if (!['grid', 'check', 'list'].includes(out.settings.viewMode)) out.settings.viewMode = 'grid';
  return out;
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && typeof s === 'object') return normalize(s);
    }
  } catch (e) { /* stockage indisponible ou corrompu : on repart de zéro */ }
  return normalize({});
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) { /* stockage indisponible (navigation privée…) */ }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const state = load();

/* ---------- Requêtes sur les données ---------- */

function isChecked(id, key) {
  return !!(state.checks[id] && state.checks[id][key]);
}

function setChecked(id, key, val) {
  const m = state.checks[id] || (state.checks[id] = {});
  if (val) m[key] = 1;
  else delete m[key];
  save();
}

function totalChecks(id) {
  return Object.keys(state.checks[id] || {}).length;
}

function countRange(id, fromKey, toKey) {
  const m = state.checks[id] || {};
  let n = 0;
  for (const k in m) if (k >= fromKey && k <= toKey) n++;
  return n;
}

function currentStreak(id) {
  const t = todayDate();
  let d = isChecked(id, keyOf(t)) ? t : addDays(t, -1);
  let s = 0;
  while (isChecked(id, keyOf(d))) {
    s++;
    d = addDays(d, -1);
  }
  return s;
}

function bestStreak(id) {
  const keys = Object.keys(state.checks[id] || {}).sort();
  let best = 0, run = 0, prev = null;
  for (const k of keys) {
    if (prev !== null && keyOf(addDays(parseKey(prev), 1)) === k) run++;
    else run = 1;
    prev = k;
    if (run > best) best = run;
  }
  return best;
}

/* Jours "comptables" pour une habitude sur [fromKey, toKey] :
   entre sa création et aujourd'hui inclus. */
function eligibleDays(h, fromKey, toKey) {
  const t = keyOf(todayDate());
  const lo = fromKey > h.createdAt ? fromKey : h.createdAt;
  const hi = toKey < t ? toKey : t;
  if (lo > hi) return 0;
  return daysBetween(parseKey(lo), parseKey(hi)) + 1;
}

function periodStats(habits, fromKey, toKey) {
  let done = 0, eligible = 0;
  for (const h of habits) {
    done += countRange(h.id, fromKey, toKey);
    eligible += eligibleDays(h, fromKey, toKey);
  }
  return { done, eligible, rate: eligible ? done / eligible : 0 };
}

/* ---------- État de l'interface ---------- */

const now = todayDate();
const ui = {
  tab: 'home',
  catFilter: null,
  selectedDay: todayDate(),
  statsMode: 'month',
  statsMonth: new Date(now.getFullYear(), now.getMonth(), 1),
  statsYear: now.getFullYear(),
  detailId: null,
  detailMonth: new Date(now.getFullYear(), now.getMonth(), 1),
  editId: null,
  editEmoji: '⭐',
  editColor: PALETTE[4],
  editCat: null,
  catEditId: null,
  catEmoji: '🏷️',
  catFromEdit: false,
  sheetStack: [],
  lastRenderDay: keyOf(now),
};

/* ---------- Références DOM ---------- */

const $ = sel => document.querySelector(sel);
const els = {
  title: $('#title'),
  subtitle: $('#subtitle'),
  ring: $('#ring'),
  ringBar: $('#ring-bar'),
  ringLabel: $('#ring-label'),
  home: $('#view-home'),
  stats: $('#view-stats'),
  pill: $('#view-pill'),
  backdrop: $('#backdrop'),
  sheetEdit: $('#sheet-edit'),
  sheetCat: $('#sheet-cat'),
  sheetDetail: $('#sheet-detail'),
  detailBody: $('#detail-body'),
  editTitle: $('#edit-title'),
  editChip: $('#edit-chip'),
  editName: $('#edit-name'),
  editDesc: $('#edit-desc'),
  editCatRow: $('#edit-cat-row'),
  emojiGrid: $('#emoji-grid'),
  colorGrid: $('#color-grid'),
  editSave: $('#edit-save'),
  catTitle: $('#cat-title'),
  catChip: $('#cat-chip'),
  catName: $('#cat-name'),
  catEmojiGrid: $('#cat-emoji-grid'),
  catSave: $('#cat-save'),
  catList: $('#cat-list'),
  sheetSettings: $('#sheet-settings'),
  notifStatus: $('#notif-status'),
  reminderTime: $('#reminder-time'),
  reminderToggle: $('#reminder-toggle'),
  dataInfo: $('#data-info'),
  importText: $('#import-text'),
  importFile: $('#import-file'),
  updateBar: $('#update-bar'),
  updateStatus: $('#update-status'),
  appVersion: $('#app-version'),
};

const SHEETS = { edit: 'sheetEdit', cat: 'sheetCat', detail: 'sheetDetail', settings: 'sheetSettings' };

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function hexAlpha(hex, a) {
  const n = Math.round(a * 255).toString(16).padStart(2, '0');
  return hex + n;
}

/* Habitudes visibles selon les filtres */

function catHabits() {
  return ui.catFilter === null
    ? state.habits
    : state.habits.filter(h => h.categoryId === ui.catFilter);
}

function visibleHabits(selKey) {
  let list = catHabits();
  if (!state.settings.showDone) {
    list = list.filter(h => !isChecked(h.id, selKey));
  }
  return list;
}

/* ---------- Rendu : en-tête ---------- */

function renderHeader() {
  const t = todayDate();
  if (ui.tab === 'home') {
    els.title.textContent = 'Habitudes';
    const selKey = keyOf(ui.selectedDay);
    const isToday = selKey === keyOf(t);
    const total = state.habits.length;
    const done = state.habits.filter(h => isChecked(h.id, selKey)).length;
    els.subtitle.textContent = (total > 0 && done === total)
      ? (isToday ? '🎉 Tout est coché aujourd\'hui !' : '🎉 Journée complète !')
      : fmtLongDate(ui.selectedDay);
    els.ring.hidden = total === 0;
    if (total > 0) {
      const C = 125.66;
      els.ringBar.style.strokeDashoffset = String(C * (1 - done / total));
      els.ringLabel.textContent = done + '/' + total;
      els.ring.classList.toggle('complete', done === total);
    }
  } else {
    els.title.textContent = 'Statistiques';
    els.subtitle.textContent = 'Vos progrès en un coup d\'œil';
    els.ring.hidden = true;
  }
}

/* ---------- Rangée de catégories ---------- */

function chipsHtml(opts) {
  const withExtras = !!(opts && opts.home);
  let chips =
    '<button class="fchip' + (ui.catFilter === null ? ' active' : '') + '" data-chip="">Toutes</button>' +
    state.categories.map(c =>
      '<button class="fchip' + (ui.catFilter === c.id ? ' active' : '') + '" data-chip="' + c.id + '">' +
        '<span class="e">' + c.emoji + '</span>' + escapeHtml(c.name) +
      '</button>'
    ).join('');
  if (withExtras) {
    chips += '<button class="fchip add-cat" data-add-cat aria-label="Nouvelle catégorie">' + ICON.plus + '</button>';
  }
  return (
    '<div class="chips-row">' +
      '<div class="chips-scroll">' + chips + '</div>' +
      (withExtras
        ? '<button class="fchip done-toggle' + (state.settings.showDone ? ' active' : '') + '" data-done-toggle>Fait</button>'
        : '') +
    '</div>'
  );
}

/* ---------- Cellules de grilles ---------- */

function cellHtml(h, k, tKey, selKey, cls) {
  let bg;
  if (k > tKey) bg = hexAlpha(h.color, 0.05);
  else if (isChecked(h.id, k)) bg = h.color;
  else bg = hexAlpha(h.color, 0.13);
  const mark = k === selKey ? ' today' : '';
  return '<i class="' + cls + mark + '" style="background:' + bg + '"></i>';
}

function zoomOf(mode) {
  return state.settings.zoom[mode !== undefined ? mode : state.settings.viewMode];
}

function weeksGridHtml(h, weeks, cls, selKey) {
  const t = todayDate();
  const tKey = keyOf(t);
  const start = addDays(mondayOf(t), -(weeks - 1) * 7);
  let html = '';
  for (let w = 0; w < weeks; w++) {
    for (let r = 0; r < 7; r++) {
      html += cellHtml(h, keyOf(addDays(start, w * 7 + r)), tKey, selKey, cls);
    }
  }
  return html;
}

/* ---------- Rendu : accueil ---------- */

function checkBtnHtml(h, done, cls) {
  return (
    '<button class="' + cls + (done ? ' done' : '') + '" data-check="' + h.id + '"' +
    ' style="background:' + (done ? h.color : hexAlpha(h.color, 0.15)) + '"' +
    ' aria-label="Cocher ' + escapeHtml(h.name) + '">' +
    (done ? h.emoji : ICON.check) +
    '</button>'
  );
}

function habitSubline(h) {
  const s = currentStreak(h.id);
  if (s > 0) return '🔥 ' + s + (s > 1 ? ' jours' : ' jour') + ' d\'affilée';
  const total = totalChecks(h.id);
  if (total > 0) return total + ' fois au total';
  return 'Commencez aujourd\'hui !';
}

function tileHtml(h, selKey, sub, weeks) {
  return (
    '<article class="tile" data-card="' + h.id + '">' +
      '<div class="tile-top">' +
        checkBtnHtml(h, isChecked(h.id, selKey), 'tile-check') +
        '<div class="tile-info">' +
          '<h3>' + escapeHtml(h.name) + '</h3>' +
          '<p>' + sub + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="mini-grid" style="--weeks:' + weeks + '">' +
        weeksGridHtml(h, weeks, 'c', selKey) +
      '</div>' +
    '</article>'
  );
}

function checkRowHtml(h, selKey, nDots) {
  const anchor = parseKey(selKey);
  let dots = '';
  for (let i = nDots - 1; i >= 0; i--) {
    const k = keyOf(addDays(anchor, -i));
    dots += '<i style="background:' + (isChecked(h.id, k) ? h.color : hexAlpha(h.color, 0.15)) + '"></i>';
  }
  return (
    '<article class="crow" data-card="' + h.id + '">' +
      checkBtnHtml(h, isChecked(h.id, selKey), 'tile-check') +
      '<div class="crow-info">' +
        '<h3>' + escapeHtml(h.name) + '</h3>' +
        '<p>' + habitSubline(h) + '</p>' +
      '</div>' +
      '<div class="week-dots">' + dots + '</div>' +
    '</article>'
  );
}

function cardHtml(h, selKey, weeks) {
  return (
    '<article class="card" data-card="' + h.id + '">' +
      '<div class="card-top">' +
        '<div class="chip" style="background:' + hexAlpha(h.color, 0.16) + '">' + h.emoji + '</div>' +
        '<div class="card-info">' +
          '<h3>' + escapeHtml(h.name) + '</h3>' +
          '<p>' + habitSubline(h) + '</p>' +
        '</div>' +
        checkBtnHtml(h, isChecked(h.id, selKey), 'check') +
      '</div>' +
      '<div class="grid26" style="--weeks:' + weeks + '">' +
        weeksGridHtml(h, weeks, 'c', selKey) +
      '</div>' +
    '</article>'
  );
}

function dayNavHtml() {
  const t = todayDate();
  const sel = ui.selectedDay;
  const isToday = keyOf(sel) === keyOf(t);
  const back = daysBetween(sel, t);
  let label;
  if (isToday) label = "Aujourd'hui";
  else if (back === 1) label = 'Hier';
  else label = sel.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  return (
    '<div class="day-nav">' +
      '<button class="icon-btn" data-day-nav="-1" aria-label="Jour précédent">' + ICON.left + '</button>' +
      '<button class="day-chip' + (isToday ? '' : ' past') + '" data-day-reset>' +
        ICON.calendar + label +
        (isToday ? '' : '<span class="back-hint">· il y a ' + back + ' j</span>') +
      '</button>' +
      '<button class="icon-btn" data-day-nav="1" aria-label="Jour suivant"' + (isToday ? ' disabled' : '') + '>' + ICON.right + '</button>' +
    '</div>'
  );
}

function renderHome(animateId) {
  if (!state.habits.length) {
    els.home.innerHTML =
      '<div class="empty fade-in">' +
        '<div class="empty-icon">🌱</div>' +
        '<h3>Aucune habitude pour l\'instant</h3>' +
        '<p>Appuyez sur le bouton + en haut pour créer votre première habitude.</p>' +
      '</div>';
    syncPill();
    return;
  }

  const selKey = keyOf(ui.selectedDay);
  const list = visibleHabits(selKey);
  let content;
  if (!list.length) {
    content =
      '<div class="empty small">' +
        '<div class="empty-icon">' + (state.settings.showDone ? '🗂️' : '🎉') + '</div>' +
        '<h3>' + (state.settings.showDone ? 'Rien dans cette catégorie' : 'Tout est fait ici !') + '</h3>' +
        '<p>' + (state.settings.showDone
          ? 'Ajoutez une habitude ou choisissez une autre catégorie.'
          : 'Les habitudes cochées sont masquées. Réactivez « Fait » pour les voir.') + '</p>' +
      '</div>';
  } else {
    const mode = state.settings.viewMode;
    const z = zoomOf(mode);
    if (mode === 'grid') {
      const weeks = ZOOM_WEEKS.grid[z];
      /* en grand, la tuile a la place d'afficher la série plutôt que le mois */
      const sub = h => (z === 2 ? habitSubline(h) : ui.selectedDay.toLocaleDateString('fr-FR', { month: 'long' }));
      content = '<div class="tile-grid z' + z + '" data-sortable>' +
        list.map(h => tileHtml(h, selKey, sub(h), weeks)).join('') + '</div>';
    } else if (mode === 'check') {
      content = '<div class="check-list z' + z + '" data-sortable>' +
        list.map(h => checkRowHtml(h, selKey, ZOOM_DOTS[z])).join('') + '</div>';
    } else {
      content = '<div class="card-list z' + z + '" data-sortable>' +
        list.map(h => cardHtml(h, selKey, ZOOM_WEEKS.list[z])).join('') + '</div>';
    }
  }

  els.home.innerHTML = chipsHtml({ home: true }) + dayNavHtml() + content;
  syncPill();

  if (animateId) {
    const btn = els.home.querySelector('[data-check="' + animateId + '"]');
    if (btn) btn.classList.add('pop');
  }
}

function syncPill() {
  els.pill.hidden = ui.tab !== 'home' || !state.habits.length;
  for (const b of els.pill.children) {
    const active = b.dataset.view === state.settings.viewMode;
    b.classList.toggle('active', active);
    let lvl = b.querySelector('.lvl');
    if (!lvl) {
      lvl = document.createElement('span');
      lvl.className = 'lvl';
      lvl.innerHTML = '<i></i><i></i><i></i>';
      b.appendChild(lvl);
    }
    const z = zoomOf(b.dataset.view);
    [...lvl.children].forEach((dot, i) => dot.classList.toggle('on', i <= z));
    b.setAttribute('aria-label', (active ? 'Taille : ' + ZOOM_NAMES[z] + ' — appuyez pour changer' : b.dataset.view));
  }
}

/* Bulle éphémère annonçant le niveau de zoom */
let zoomToast, zoomToastTimer;

function showZoomToast() {
  if (!zoomToast) {
    zoomToast = document.createElement('div');
    zoomToast.id = 'zoom-toast';
    document.body.appendChild(zoomToast);
  }
  zoomToast.textContent = ZOOM_NAMES[zoomOf()];
  zoomToast.classList.add('show');
  clearTimeout(zoomToastTimer);
  zoomToastTimer = setTimeout(() => zoomToast.classList.remove('show'), 900);
}

function setZoom(level, opts) {
  const mode = state.settings.viewMode;
  const z = Math.max(0, Math.min(ZOOM_LEVELS - 1, level));
  if (z === state.settings.zoom[mode]) return false;
  state.settings.zoom[mode] = z;
  save();
  renderHome();
  if (!opts || opts.toast !== false) showZoomToast();
  return true;
}

function cycleZoom() {
  const mode = state.settings.viewMode;
  setZoom((state.settings.zoom[mode] + 1) % ZOOM_LEVELS);
}

/* ---------- Rendu : statistiques ---------- */

function statPairHtml(a, b) {
  return (
    '<div class="stat-tiles">' +
      '<div class="stat-tile"><div class="badge">' + a.icon + '</div><b>' + a.value + '</b><span>' + a.label + '</span></div>' +
      '<div class="stat-tile"><div class="badge">' + b.icon + '</div><b>' + b.value + '</b><span>' + b.label + '</span></div>' +
    '</div>'
  );
}

function yearHeatHtml(habits, y) {
  const t = todayDate();
  const tKey = keyOf(t);
  const start = mondayOf(new Date(y, 0, 1));
  const end = new Date(y, 11, 31);
  const weeks = Math.ceil((daysBetween(start, end) + 1) / 7);
  let labels = '';
  for (let m = 0; m < 12; m++) {
    const col = Math.floor(daysBetween(start, new Date(y, m, 1)) / 7);
    labels += '<span style="left:' + (col * 14) + 'px">' + MONTH_CAP[m] + '</span>';
  }
  let cells = '';
  for (let w = 0; w < weeks; w++) {
    for (let r = 0; r < 7; r++) {
      const d = addDays(start, w * 7 + r);
      const k = keyOf(d);
      let bg = 'transparent';
      if (d.getFullYear() === y) {
        if (k > tKey) bg = 'rgba(255,255,255,0.025)';
        else {
          const existing = habits.filter(h => h.createdAt <= k);
          const done = existing.filter(h => isChecked(h.id, k)).length;
          const f = existing.length ? done / existing.length : 0;
          bg = f > 0 ? 'rgba(139,92,246,' + (0.14 + 0.72 * f).toFixed(2) + ')' : 'rgba(255,255,255,0.05)';
        }
      }
      cells += '<i class="c' + (k === tKey ? ' today' : '') + '" style="background:' + bg + '"></i>';
    }
  }
  return (
    '<div class="stats-card">' +
      '<div class="ygrid-wrap" id="ygrid-scroll">' +
        '<div class="ylabels" style="width:' + (weeks * 14) + 'px">' + labels + '</div>' +
        '<div class="ygrid">' + cells + '</div>' +
      '</div>' +
    '</div>'
  );
}

function monthHeatHtml(habits, y, m) {
  const t = todayDate();
  const tKey = keyOf(t);
  const nDays = daysInMonth(y, m);
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  let cells = '';
  for (let i = 0; i < lead; i++) cells += '<div class="hc blank"></div>';
  for (let day = 1; day <= nDays; day++) {
    const k = keyOf(new Date(y, m, day));
    const cls = ['hc'];
    let style = '';
    if (k > tKey) {
      cls.push('future');
    } else {
      const existing = habits.filter(h => h.createdAt <= k);
      const done = existing.filter(h => isChecked(h.id, k)).length;
      const f = existing.length ? done / existing.length : 0;
      if (f > 0) {
        cls.push('lit');
        style = ' style="background:rgba(139,92,246,' + (0.16 + 0.62 * f).toFixed(2) + ')"';
      }
    }
    if (k === tKey) cls.push('today');
    cells += '<div class="' + cls.join(' ') + '"' + style + '>' + day + '</div>';
  }
  return (
    '<div class="stats-card">' +
      '<div class="heat-head">' + DAY_LETTERS.map(l => '<span>' + l.replace('.', '') + '</span>').join('') + '</div>' +
      '<div class="heat">' + cells + '</div>' +
    '</div>'
  );
}

function habitRowsHtml(habits, fromKey, toKey) {
  if (!habits.length) return '';
  return (
    '<div class="stats-card">' +
      '<div class="stats-card-title"><h3>Par habitude</h3></div>' +
      habits.map(h => {
        const done = countRange(h.id, fromKey, toKey);
        const elig = eligibleDays(h, fromKey, toKey);
        const pct = elig ? Math.round((done / elig) * 100) : 0;
        return (
          '<div class="hstat" data-card="' + h.id + '">' +
            '<div class="chip sm" style="background:' + hexAlpha(h.color, 0.16) + '">' + h.emoji + '</div>' +
            '<div class="hstat-main">' +
              '<div class="hstat-top">' +
                '<span class="name">' + escapeHtml(h.name) + '</span>' +
                '<span class="val">' + done + '/' + elig + ' · ' + pct + '%</span>' +
              '</div>' +
              '<div class="hbar"><i style="width:' + pct + '%;background:' + h.color + '"></i></div>' +
            '</div>' +
          '</div>'
        );
      }).join('') +
    '</div>'
  );
}

function renderStats() {
  if (!state.habits.length) {
    els.stats.innerHTML =
      '<div class="empty fade-in">' +
        '<div class="empty-icon">📊</div>' +
        '<h3>Pas encore de données</h3>' +
        '<p>Créez des habitudes et cochez-les pour voir vos statistiques ici.</p>' +
      '</div>';
    return;
  }

  const t = todayDate();
  const habits = catHabits();
  const isMonth = ui.statsMode === 'month';

  let fromKey, toKey, label, canNext;
  if (isMonth) {
    const y = ui.statsMonth.getFullYear();
    const m = ui.statsMonth.getMonth();
    fromKey = keyOf(new Date(y, m, 1));
    toKey = keyOf(new Date(y, m, daysInMonth(y, m)));
    label = fmtMonthYear(ui.statsMonth);
    canNext = y < t.getFullYear() || (y === t.getFullYear() && m < t.getMonth());
  } else {
    fromKey = ui.statsYear + '-01-01';
    toKey = ui.statsYear + '-12-31';
    label = String(ui.statsYear);
    canNext = ui.statsYear < t.getFullYear();
  }

  const st = periodStats(habits, fromKey, toKey);
  let curStreak = 0, best = 0;
  for (const h of habits) {
    curStreak = Math.max(curStreak, currentStreak(h.id));
    best = Math.max(best, bestStreak(h.id));
  }

  const countTiles = statPairHtml(
    { icon: ICON.hash, value: st.done, label: 'Réalisations' },
    { icon: ICON.percent, value: Math.round(st.rate * 100), label: 'Taux de réussite' }
  );
  const streakTiles = statPairHtml(
    { icon: ICON.drop, value: curStreak, label: 'Série en cours' },
    { icon: ICON.drop, value: best, label: 'Meilleure série' }
  );

  els.stats.innerHTML =
    chipsHtml({ home: false }) +
    '<div class="segmented">' +
      '<button data-mode="month" class="' + (isMonth ? 'active' : '') + '">Mois</button>' +
      '<button data-mode="year" class="' + (!isMonth ? 'active' : '') + '">Année</button>' +
    '</div>' +
    '<div class="period-nav">' +
      '<button class="icon-btn" data-period="-1" aria-label="Période précédente">' + ICON.left + '</button>' +
      '<span class="period-label">' + label + '</span>' +
      '<button class="icon-btn" data-period="1" aria-label="Période suivante"' + (canNext ? '' : ' disabled') + '>' + ICON.right + '</button>' +
    '</div>' +
    (isMonth
      ? countTiles +
        monthHeatHtml(habits, ui.statsMonth.getFullYear(), ui.statsMonth.getMonth()) +
        streakTiles
      : yearHeatHtml(habits, ui.statsYear) +
        countTiles +
        '<div class="stats-card">' +
          '<div class="stats-card-title"><h3>Réalisations / Mois</h3><div class="badge">' + ICON.trend + '</div></div>' +
          '<div class="chart-wrap" id="area-chart"></div>' +
          '<div class="chart-labels">' + MONTH_LETTERS.map((l, m) =>
            '<em class="' + (ui.statsYear === t.getFullYear() && m === t.getMonth() ? 'now' : '') + '">' + l + '</em>'
          ).join('') + '</div>' +
        '</div>' +
        streakTiles) +
    habitRowsHtml(habits, fromKey, toKey);

  if (!isMonth) {
    buildAreaChart(habits, ui.statsYear);
    const scroller = $('#ygrid-scroll');
    if (scroller && ui.statsYear === t.getFullYear()) {
      const start = mondayOf(new Date(ui.statsYear, 0, 1));
      const col = Math.floor(daysBetween(start, mondayOf(t)) / 7);
      scroller.scrollLeft = Math.max(0, (col + 1) * 14 - scroller.clientWidth + 4);
    }
  }
}

function buildAreaChart(habits, y) {
  const wrap = $('#area-chart');
  if (!wrap) return;
  const W = wrap.clientWidth;
  if (!W) return;
  const H = 150, padY = 14;

  const counts = [];
  for (let m = 0; m < 12; m++) {
    const from = keyOf(new Date(y, m, 1));
    const to = keyOf(new Date(y, m, daysInMonth(y, m)));
    let n = 0;
    for (const h of habits) n += countRange(h.id, from, to);
    counts.push(n);
  }
  const max = Math.max(1, ...counts);
  const pts = counts.map((n, m) => [
    (W * (m + 0.5)) / 12,
    H - padY - ((H - 2 * padY) * n) / max,
  ]);

  let line = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const dx = (x2 - x1) * 0.45;
    line += 'C' + (x1 + dx).toFixed(1) + ' ' + y1.toFixed(1) + ',' + (x2 - dx).toFixed(1) + ' ' + y2.toFixed(1) + ',' + x2.toFixed(1) + ' ' + y2.toFixed(1);
  }
  const area = line + 'L' + pts[11][0].toFixed(1) + ' ' + H + 'L' + pts[0][0].toFixed(1) + ' ' + H + 'Z';

  wrap.innerHTML =
    '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
      '<defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="rgba(139,92,246,0.4)"/>' +
        '<stop offset="1" stop-color="rgba(139,92,246,0)"/>' +
      '</linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#ag)"/>' +
      '<path d="' + line + '" fill="none" stroke="#A78BFA" stroke-width="2.5" stroke-linecap="round"/>' +
      pts.map(p => '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3" fill="#C4B5FD"/>').join('') +
    '</svg>';
}

/* ---------- Rendu : feuille détail ---------- */

function detailGridHtml(h) {
  const t = todayDate();
  const tKey = keyOf(t);
  const start = addDays(mondayOf(t), -(WEEKS_WIDE - 1) * 7);
  let labels = '';
  for (let i = 0; i < WEEKS_WIDE * 7; i += 1) {
    const d = addDays(start, i);
    if (d.getDate() === 1) {
      const col = Math.floor(i / 7);
      labels += '<span style="left:' + (col * 15) + 'px">' + MONTH_CAP[d.getMonth()] + '</span>';
    }
  }
  let cells = '';
  for (let w = 0; w < WEEKS_WIDE; w++) {
    for (let r = 0; r < 7; r++) {
      cells += cellHtml(h, keyOf(addDays(start, w * 7 + r)), tKey, tKey, 'c');
    }
  }
  return (
    '<div class="dgrid-row">' +
      '<div class="dow-col" style="padding-top:18px">' + DOW_SIDE.map(l => '<span>' + l + '</span>').join('') + '</div>' +
      '<div class="dgrid-wrap" id="dgrid-scroll">' +
        '<div class="dlabels" style="width:' + (WEEKS_WIDE * 15) + 'px">' + labels + '</div>' +
        '<div class="dgrid">' + cells + '</div>' +
      '</div>' +
    '</div>'
  );
}

function calendarHtml(h) {
  const t = todayDate();
  const tKey = keyOf(t);
  const y = ui.detailMonth.getFullYear();
  const m = ui.detailMonth.getMonth();
  const nDays = daysInMonth(y, m);
  const first = new Date(y, m, 1);
  const lead = (first.getDay() + 6) % 7;
  const cellsTotal = Math.ceil((lead + nDays) / 7) * 7;

  let cells = '';
  for (let i = 0; i < cellsTotal; i++) {
    const d = addDays(first, i - lead);
    const k = keyOf(d);
    const inMonth = d.getMonth() === m;
    const done = inMonth && isChecked(h.id, k);
    const cls = ['day'];
    let style = '';
    if (!inMonth) cls.push('out');
    else if (k > tKey) cls.push('future');
    else {
      if (done) style = ' style="background:' + hexAlpha(h.color, 0.16) + '"';
      if (k === tKey) cls.push('now');
    }
    const tappable = inMonth && k <= tKey;
    cells +=
      '<div class="' + cls.join(' ') + '"' + style + (tappable ? ' data-day="' + k + '"' : '') + '>' +
        d.getDate() +
        '<span class="dot"' + (done ? ' style="background:' + h.color + '"' : '') + '></span>' +
      '</div>';
  }

  const canNext = y < t.getFullYear() || (y === t.getFullYear() && m < t.getMonth());
  return (
    '<div class="cal-head">' + DAY_LETTERS.map(l => '<span>' + l + '</span>').join('') + '</div>' +
    '<div class="cal">' + cells + '</div>' +
    '<div class="cal-nav">' +
      '<div class="dchip">' + ICON.calendar + fmtMonthYear(ui.detailMonth) + '</div>' +
      '<div class="spacer"></div>' +
      '<button class="icon-btn" data-cal-nav="-1" aria-label="Mois précédent">' + ICON.left + '</button>' +
      '<button class="icon-btn" data-cal-nav="1" aria-label="Mois suivant"' + (canNext ? '' : ' disabled') + '>' + ICON.right + '</button>' +
    '</div>'
  );
}

function renderDetail() {
  const h = state.habits.find(x => x.id === ui.detailId);
  if (!h) return;
  const s = currentStreak(h.id);

  els.detailBody.innerHTML =
    '<div class="detail-head">' +
      '<div class="chip lg" style="background:' + hexAlpha(h.color, 0.16) + '">' + h.emoji + '</div>' +
      '<div class="card-info">' +
        '<h3>' + escapeHtml(h.name) + '</h3>' +
        '<p>' + (h.description ? escapeHtml(h.description) : 'Pas de description') + '</p>' +
      '</div>' +
      '<button class="icon-btn" data-close aria-label="Fermer">' + ICON.close + '</button>' +
    '</div>' +
    detailGridHtml(h) +
    '<div class="detail-chips">' +
      '<div class="dchip">🔥 ' + s + '</div>' +
      '<div class="dchip">🏆 ' + bestStreak(h.id) + '</div>' +
      '<div class="dchip">Σ ' + totalChecks(h.id) + '</div>' +
      '<div class="spacer"></div>' +
      '<button class="icon-btn" data-edit aria-label="Modifier">' + ICON.pencil + '</button>' +
      '<button class="icon-btn" data-delete aria-label="Supprimer">' + ICON.trash + '</button>' +
    '</div>' +
    '<div class="divider"></div>' +
    calendarHtml(h);

  const scroller = $('#dgrid-scroll');
  if (scroller) scroller.scrollLeft = scroller.scrollWidth;
}

/* ---------- Feuilles (ouverture / fermeture) ---------- */

function openSheet(which) {
  if (!ui.sheetStack.includes(which)) ui.sheetStack.push(which);
  els.backdrop.classList.add('show');
  const el = els[SHEETS[which]];
  el.classList.add('show');
  el.setAttribute('aria-hidden', 'false');
  document.body.classList.add('locked');
}

function closeTopSheet() {
  const which = ui.sheetStack.pop();
  if (which) {
    const el = els[SHEETS[which]];
    el.classList.remove('show');
    el.setAttribute('aria-hidden', 'true');
  }
  if (!ui.sheetStack.length) {
    els.backdrop.classList.remove('show');
    document.body.classList.remove('locked');
  }
}

function closeAllSheets() {
  while (ui.sheetStack.length) closeTopSheet();
}

/* ---------- Édition d'habitude ---------- */

function openEdit(id) {
  ui.editId = id;
  if (id) {
    const h = state.habits.find(x => x.id === id);
    if (!h) return;
    ui.editEmoji = h.emoji;
    ui.editColor = h.color;
    ui.editCat = h.categoryId;
    els.editName.value = h.name;
    els.editDesc.value = h.description || '';
    els.editTitle.textContent = 'Modifier l\'habitude';
    els.editSave.textContent = 'Enregistrer';
  } else {
    ui.editEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    ui.editColor = PALETTE[state.habits.length % PALETTE.length];
    ui.editCat = ui.catFilter;
    els.editName.value = '';
    els.editDesc.value = '';
    els.editTitle.textContent = 'Nouvelle habitude';
    els.editSave.textContent = 'Créer l\'habitude';
  }
  syncEditControls();
  openSheet('edit');
  if (!id) setTimeout(() => els.editName.focus(), 350);
}

function syncEditControls() {
  els.editChip.textContent = ui.editEmoji;
  els.editChip.style.background = hexAlpha(ui.editColor, 0.2);
  els.editSave.disabled = els.editName.value.trim() === '';
  els.editSave.style.background = ui.editColor;
  els.editCatRow.innerHTML =
    '<button type="button" class="fchip' + (ui.editCat === null ? ' active' : '') + '" data-cat-select="">Aucune</button>' +
    state.categories.map(c =>
      '<button type="button" class="fchip' + (ui.editCat === c.id ? ' active' : '') + '" data-cat-select="' + c.id + '">' +
        '<span class="e">' + c.emoji + '</span>' + escapeHtml(c.name) +
      '</button>'
    ).join('') +
    '<button type="button" class="fchip" data-new-cat>' + ICON.plus.replace('viewBox', 'style="width:15px;height:15px" viewBox') + ' Nouvelle</button>';
  for (const b of els.emojiGrid.children) b.classList.toggle('sel', b.dataset.emoji === ui.editEmoji);
  for (const b of els.colorGrid.children) b.classList.toggle('sel', b.dataset.color === ui.editColor);
}

function saveEdit() {
  const name = els.editName.value.trim();
  if (!name) return;
  const desc = els.editDesc.value.trim();
  if (ui.editId) {
    const h = state.habits.find(x => x.id === ui.editId);
    if (h) {
      h.name = name;
      h.emoji = ui.editEmoji;
      h.color = ui.editColor;
      h.categoryId = ui.editCat;
      h.description = desc;
    }
  } else {
    state.habits.push({
      id: uid(),
      name,
      emoji: ui.editEmoji,
      color: ui.editColor,
      createdAt: keyOf(todayDate()),
      categoryId: ui.editCat,
      description: desc,
    });
  }
  save();
  closeAllSheets();
  renderAll();
}

/* ---------- Catégories ---------- */

function openCatSheet(catId, fromEdit) {
  ui.catFromEdit = !!fromEdit;
  loadCatForm(catId);
  openSheet('cat');
  if (!catId) setTimeout(() => els.catName.focus(), 350);
}

function loadCatForm(catId) {
  ui.catEditId = catId;
  if (catId) {
    const c = state.categories.find(x => x.id === catId);
    if (!c) return;
    ui.catEmoji = c.emoji;
    els.catName.value = c.name;
    els.catTitle.textContent = 'Modifier la catégorie';
    els.catSave.textContent = 'Enregistrer';
  } else {
    ui.catEmoji = '🏷️';
    els.catName.value = '';
    els.catTitle.textContent = 'Nouvelle catégorie';
    els.catSave.textContent = 'Créer la catégorie';
  }
  syncCatControls();
}

function syncCatControls() {
  els.catChip.textContent = ui.catEmoji;
  els.catChip.style.background = 'rgba(139,92,246,0.18)';
  els.catSave.disabled = els.catName.value.trim() === '';
  for (const b of els.catEmojiGrid.children) b.classList.toggle('sel', b.dataset.catEmoji === ui.catEmoji);
  els.catList.innerHTML = state.categories.length
    ? '<p class="label">Catégories existantes</p>' +
      state.categories.map(c =>
        '<div class="cat-item">' +
          '<span class="e">' + c.emoji + '</span>' +
          '<span class="n">' + escapeHtml(c.name) + '</span>' +
          '<button class="icon-btn" data-cat-load="' + c.id + '" aria-label="Modifier">' + ICON.pencil + '</button>' +
          '<button class="icon-btn" data-cat-del="' + c.id + '" aria-label="Supprimer">' + ICON.trash + '</button>' +
        '</div>'
      ).join('')
    : '';
}

function saveCat() {
  const name = els.catName.value.trim();
  if (!name) return;
  if (ui.catEditId) {
    const c = state.categories.find(x => x.id === ui.catEditId);
    if (c) { c.name = name; c.emoji = ui.catEmoji; }
  } else {
    const c = { id: uid(), name, emoji: ui.catEmoji };
    state.categories.push(c);
    if (ui.catFromEdit) ui.editCat = c.id;
  }
  save();
  closeTopSheet();
  if (ui.catFromEdit) syncEditControls();
  renderHome();
  renderStats();
}

function deleteCat(id) {
  state.categories = state.categories.filter(c => c.id !== id);
  for (const h of state.habits) if (h.categoryId === id) h.categoryId = null;
  if (ui.catFilter === id) ui.catFilter = null;
  if (ui.editCat === id) ui.editCat = null;
  if (ui.catEditId === id) loadCatForm(null);
  save();
  syncCatControls();
  renderHome();
  renderStats();
}

/* ---------- Détail / suppression ---------- */

function openDetail(id) {
  ui.detailId = id;
  const t = todayDate();
  ui.detailMonth = new Date(t.getFullYear(), t.getMonth(), 1);
  renderDetail();
  openSheet('detail');
}

let deleteArmTimer = null;

function deleteHabit(id) {
  state.habits = state.habits.filter(h => h.id !== id);
  delete state.checks[id];
  save();
  closeAllSheets();
  renderAll();
}

/* ---------- Réglages : sauvegarde ---------- */

function exportPayload() {
  return JSON.stringify({
    app: 'mes-habitudes',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state,
  }, null, 2);
}

function backupName() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return 'habitudes-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '.json';
}

function flash(el, msg, ok) {
  const prev = el.textContent;
  el.textContent = msg;
  el.style.color = ok === false ? 'var(--danger)' : '#4ADE80';
  setTimeout(() => { el.textContent = prev; el.style.color = ''; }, 2600);
}

/* Hôte qui interdit les téléchargements directs (aperçu en bac à sable) :
   on passe par son API d'enregistrement quand elle existe. */
let hostSave;

async function getHostSave() {
  if (hostSave !== undefined) return hostSave;
  hostSave = null;
  try {
    if (window.claude && typeof window.claude.use === 'function') {
      hostSave = await window.claude.use('downloads');
    }
  } catch (e) { hostSave = null; }
  return hostSave;
}

async function exportToFile() {
  const text = exportPayload();
  const name = backupName();

  const host = await getHostSave();
  if (host) {
    try {
      await host.save({ filename: name, data: text });
      flash(els.dataInfo, '✓ Sauvegarde enregistrée');
    } catch (e) {
      const declined = e && e.code === 'declined';
      flash(els.dataInfo, declined ? 'Enregistrement annulé' : '✗ Enregistrement impossible', false);
    }
    return;
  }

  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  flash(els.dataInfo, '✓ Sauvegarde téléchargée');
}

async function exportToClipboard() {
  const text = exportPayload();
  try {
    await navigator.clipboard.writeText(text);
    flash(els.dataInfo, '✓ Sauvegarde copiée');
  } catch (e) {
    /* presse-papier refusé : on affiche le texte pour un copier manuel */
    els.importText.value = text;
    els.importText.select();
    flash(els.dataInfo, 'Copiez le texte ci-dessous', false);
  }
}

function importFromText(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    flash(els.dataInfo, '✗ JSON invalide', false);
    return false;
  }
  const src = (parsed && parsed.data) ? parsed.data : parsed;
  if (!src || typeof src !== 'object' || !Array.isArray(src.habits)) {
    flash(els.dataInfo, '✗ Sauvegarde non reconnue', false);
    return false;
  }
  const next = normalize(src);
  state.habits = next.habits;
  state.checks = next.checks;
  state.categories = next.categories;
  state.settings = next.settings;
  ui.catFilter = null;
  ui.selectedDay = todayDate();
  save();
  els.importText.value = '';
  syncSettings();
  scheduleReminder();
  renderAll();
  flash(els.dataInfo, '✓ ' + state.habits.length + ' habitudes restaurées');
  return true;
}

function syncSettings() {
  const r = state.settings.reminder;
  els.reminderTime.value = r.time;
  els.reminderToggle.classList.toggle('on', r.enabled);
  els.reminderToggle.setAttribute('aria-checked', r.enabled ? 'true' : 'false');

  let checks = 0;
  for (const id in state.checks) checks += Object.keys(state.checks[id]).length;
  els.dataInfo.textContent = state.habits.length + ' habitudes · ' + checks + ' coches enregistrées';

  els.appVersion.textContent = 'Mes Habitudes ' + APP_VERSION;
  if (!els.updateStatus.dataset.busy) {
    els.updateStatus.textContent = navigator.serviceWorker && navigator.serviceWorker.controller
      ? 'Installée · fonctionne hors-ligne'
      : 'Ouverte depuis le navigateur';
  }

  const supported = 'Notification' in window;
  const perm = supported ? Notification.permission : 'unsupported';
  if (!supported) els.notifStatus.textContent = 'Non pris en charge par ce navigateur';
  else if (perm === 'denied') els.notifStatus.textContent = 'Notifications bloquées dans les réglages du navigateur';
  else if (r.enabled) els.notifStatus.textContent = 'Actif tous les jours à ' + r.time;
  else els.notifStatus.textContent = 'Désactivé';
}

/* ---------- Réglages : rappel quotidien ---------- */

let reminderTimer = null;

function nextReminderAt() {
  const [hh, mm] = state.settings.reminder.time.split(':').map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  if (d <= new Date()) d.setDate(d.getDate() + 1);
  return d;
}

function pendingCount() {
  const tKey = keyOf(todayDate());
  return state.habits.filter(h => !isChecked(h.id, tKey)).length;
}

function showNotification(body) {
  const opts = { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'habits-daily' };
  /* le service worker est requis sur Android ; sinon, notification directe */
  if (navigator.serviceWorker && navigator.serviceWorker.ready) {
    navigator.serviceWorker.ready
      .then(reg => reg.showNotification('Mes Habitudes', opts))
      .catch(() => { try { new Notification('Mes Habitudes', opts); } catch (e) {} });
  } else {
    try { new Notification('Mes Habitudes', opts); } catch (e) {}
  }
}

function fireReminder() {
  const left = pendingCount();
  if (left > 0 && 'Notification' in window && Notification.permission === 'granted') {
    showNotification(left === 1
      ? 'Il reste 1 habitude à cocher aujourd\'hui.'
      : 'Il reste ' + left + ' habitudes à cocher aujourd\'hui.');
  }
  scheduleReminder();
}

function scheduleReminder() {
  clearTimeout(reminderTimer);
  reminderTimer = null;
  if (!state.settings.reminder.enabled) return;
  const delay = nextReminderAt() - new Date();
  /* setTimeout est limité à ~24,8 j : notre délai (< 24 h) tient toujours */
  reminderTimer = setTimeout(fireReminder, Math.max(1000, delay));
}

async function toggleReminder() {
  const r = state.settings.reminder;
  if (r.enabled) {
    r.enabled = false;
    save();
    scheduleReminder();
    syncSettings();
    return;
  }
  if (!('Notification' in window)) {
    syncSettings();
    return;
  }
  let perm = Notification.permission;
  if (perm === 'default') {
    try { perm = await Notification.requestPermission(); } catch (e) { perm = 'denied'; }
  }
  if (perm !== 'granted') {
    syncSettings();
    return;
  }
  r.enabled = true;
  save();
  scheduleReminder();
  syncSettings();
}

/* ---------- Réorganisation par glisser-déposer ---------- */

const drag = { id: null, el: null, timer: null, active: false, startX: 0, startY: 0 };
let suppressClick = false;

function orderedIds() {
  return state.habits.map(h => h.id);
}

function moveHabit(dragId, overId) {
  const ids = orderedIds();
  const from = ids.indexOf(dragId);
  const to = ids.indexOf(overId);
  if (from < 0 || to < 0 || from === to) return false;
  const [h] = state.habits.splice(from, 1);
  state.habits.splice(to, 0, h);
  return true;
}

function cancelDragTimer() {
  clearTimeout(drag.timer);
  drag.timer = null;
}

function endDrag(commit) {
  cancelDragTimer();
  if (drag.el) drag.el.classList.remove('dragging');
  if (drag.active && commit) {
    save();
    renderHome();
    renderStats();
  }
  drag.id = null;
  drag.el = null;
  drag.active = false;
}

function onDragMove(x, y) {
  if (!drag.active) return;
  const under = document.elementFromPoint(x, y);
  const card = under && under.closest('[data-card]');
  if (card && card.dataset.card !== drag.id) {
    if (moveHabit(drag.id, card.dataset.card)) {
      /* on redessine juste l'ordre visuel, sans reconstruire le DOM */
      const container = drag.el.parentElement;
      const ids = orderedIds();
      const nodes = [...container.querySelectorAll('[data-card]')];
      nodes.sort((a, b) => ids.indexOf(a.dataset.card) - ids.indexOf(b.dataset.card));
      for (const n of nodes) container.appendChild(n);
    }
  }
}

function startDragWatch(card, x, y) {
  drag.id = card.dataset.card;
  drag.el = card;
  drag.startX = x;
  drag.startY = y;
  drag.active = false;
  cancelDragTimer();
  drag.timer = setTimeout(() => {
    drag.active = true;
    card.classList.add('dragging');
    if (navigator.vibrate) navigator.vibrate(20);
  }, 350);
}

els.home.addEventListener('pointerdown', e => {
  if (e.target.closest('[data-check]') || !els.home.querySelector('[data-sortable]')) return;
  if (touchPts.size >= 1) return;      /* deuxième doigt : c'est un pincement */
  const card = e.target.closest('[data-card]');
  if (!card) return;
  startDragWatch(card, e.clientX, e.clientY);
});

els.home.addEventListener('pointermove', e => {
  if (!drag.id) return;
  if (!drag.active) {
    /* un vrai défilement annule l'appui long */
    if (Math.abs(e.clientX - drag.startX) > 8 || Math.abs(e.clientY - drag.startY) > 8) {
      cancelDragTimer();
      drag.id = null;
      drag.el = null;
    }
    return;
  }
  e.preventDefault();
  onDragMove(e.clientX, e.clientY);
}, { passive: false });

for (const evt of ['pointerup', 'pointercancel']) {
  els.home.addEventListener(evt, () => {
    const wasActive = drag.active;
    endDrag(true);
    if (wasActive) suppressClick = true;
  });
}

/* ---------- Mises à jour de l'app ---------- */

function showUpdateBar() {
  els.updateBar.hidden = false;
}

function applyUpdate() {
  const reg = window.__swReg;
  /* le nouveau service worker prend la main, puis la page se recharge
     (écouteur 'controllerchange' posé à l'enregistrement) */
  if (reg && reg.waiting) reg.waiting.postMessage('skip-waiting');
  else location.reload();
}

async function checkForUpdate() {
  const reg = window.__swReg;
  els.updateStatus.dataset.busy = '1';
  els.updateStatus.textContent = 'Recherche…';
  if (!reg) {
    delete els.updateStatus.dataset.busy;
    els.updateStatus.textContent = 'Rechargez la page pour mettre à jour';
    return;
  }
  try {
    await reg.update();
    await new Promise(r => setTimeout(r, 600));
    delete els.updateStatus.dataset.busy;
    if (reg.waiting || !els.updateBar.hidden) {
      els.updateStatus.textContent = 'Nouvelle version prête';
      showUpdateBar();
    } else {
      els.updateStatus.textContent = 'À jour ✓';
      setTimeout(syncSettings, 2500);
    }
  } catch (e) {
    delete els.updateStatus.dataset.busy;
    els.updateStatus.textContent = 'Vérification impossible (hors-ligne ?)';
  }
}

window.addEventListener('app-update-ready', showUpdateBar);

/* ---------- Pincement pour zoomer ---------- */

const pinch = { active: false, startDist: 0, startZoom: 1 };
const touchPts = new Map();

function pinchDistance() {
  const [a, b] = [...touchPts.values()];
  return Math.hypot(a.x - b.x, a.y - b.y);
}

els.home.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'touch') return;
  touchPts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (touchPts.size === 2) {
    endDrag(false);            /* un pincement n'est pas un déplacement */
    pinch.active = true;
    pinch.startDist = pinchDistance();
    pinch.startZoom = zoomOf();
  }
});

els.home.addEventListener('pointermove', e => {
  if (!touchPts.has(e.pointerId)) return;
  touchPts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (!pinch.active || touchPts.size !== 2) return;
  e.preventDefault();
  const ratio = pinchDistance() / (pinch.startDist || 1);
  /* écarter les doigts agrandit : ~35 % d'écart par palier */
  let level = pinch.startZoom;
  if (ratio > 1.35) level = pinch.startZoom + 1;
  else if (ratio < 0.74) level = pinch.startZoom - 1;
  if (setZoom(level)) {
    pinch.startDist = pinchDistance();
    pinch.startZoom = zoomOf();
    suppressClick = true;
  }
}, { passive: false });

for (const evt of ['pointerup', 'pointercancel', 'pointerleave']) {
  els.home.addEventListener(evt, e => {
    touchPts.delete(e.pointerId);
    if (touchPts.size < 2) pinch.active = false;
  });
}

/* ---------- Coches ---------- */

function toggleCheck(id, key, opts) {
  const h = state.habits.find(x => x.id === id);
  if (!h) return;
  const next = !isChecked(id, key);
  setChecked(id, key, next);
  if (next && key < h.createdAt) {
    h.createdAt = key; /* coche antérieure à la création : on recule la date de début */
    save();
  }
  if (next && navigator.vibrate) navigator.vibrate(15);
  renderHeader();
  renderHome(opts && opts.fromHome && next ? id : null);
  renderStats();
  if (ui.sheetStack.includes('detail') && ui.detailId === id) renderDetail();
}

/* ---------- Grilles émoji / couleur (une seule fois) ---------- */

function buildPickers() {
  els.emojiGrid.innerHTML = EMOJIS.map(e =>
    '<button type="button" data-emoji="' + e + '" aria-label="' + e + '">' + e + '</button>'
  ).join('');
  els.catEmojiGrid.innerHTML = EMOJIS.map(e =>
    '<button type="button" data-cat-emoji="' + e + '" aria-label="' + e + '">' + e + '</button>'
  ).join('');
  els.colorGrid.innerHTML = PALETTE.map(c =>
    '<button type="button" data-color="' + c + '" style="--c:' + c + ';background:' + c + '" aria-label="' + c + '"></button>'
  ).join('');
}

/* ---------- Navigation ---------- */

function setTab(tab) {
  ui.tab = tab;
  els.home.hidden = tab !== 'home';
  els.stats.hidden = tab !== 'stats';
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  renderHeader();
  if (tab === 'stats') renderStats();
  syncPill();
  window.scrollTo(0, 0);
}

function renderAll() {
  renderHeader();
  renderHome();
  renderStats();
}

/* ---------- Événements ---------- */

document.addEventListener('click', e => {
  const target = e.target;

  /* un glisser-déposer venant de se terminer ne doit pas ouvrir la fiche */
  if (suppressClick) { suppressClick = false; return; }

  const checkBtn = target.closest('[data-check]');
  if (checkBtn) {
    e.stopPropagation();
    toggleCheck(checkBtn.dataset.check, keyOf(ui.selectedDay), { fromHome: true });
    return;
  }

  const tab = target.closest('.tab');
  if (tab) { setTab(tab.dataset.tab); return; }

  if (target.closest('#add-btn')) { openEdit(null); return; }

  if (target.closest('#settings-btn')) { syncSettings(); openSheet('settings'); return; }

  const dayNav = target.closest('[data-day-nav]');
  if (dayNav && !dayNav.disabled) {
    const next = addDays(ui.selectedDay, +dayNav.dataset.dayNav);
    if (next <= todayDate()) {
      ui.selectedDay = next;
      renderHeader();
      renderHome();
    }
    return;
  }

  if (target.closest('[data-day-reset]')) {
    ui.selectedDay = todayDate();
    renderHeader();
    renderHome();
    return;
  }

  const view = target.closest('[data-view]');
  if (view) {
    if (view.dataset.view === state.settings.viewMode) {
      cycleZoom();          /* déjà sur cette vue : on change la taille */
    } else {
      state.settings.viewMode = view.dataset.view;
      save();
      renderHome();
    }
    return;
  }

  const chip = target.closest('[data-chip]');
  if (chip) {
    ui.catFilter = chip.dataset.chip === '' ? null : chip.dataset.chip;
    renderHome();
    renderStats();
    return;
  }

  if (target.closest('[data-done-toggle]')) {
    state.settings.showDone = !state.settings.showDone;
    save();
    renderHome();
    return;
  }

  if (target.closest('[data-add-cat]')) { openCatSheet(null, false); return; }

  const card = target.closest('[data-card]');
  if (card) { openDetail(card.dataset.card); return; }

  if (target.closest('[data-close]')) { closeTopSheet(); return; }
  if (target.closest('[data-close-cat]')) { closeTopSheet(); if (ui.catFromEdit) syncEditControls(); return; }
  if (target === els.backdrop) { closeTopSheet(); return; }

  const mode = target.closest('[data-mode]');
  if (mode) {
    ui.statsMode = mode.dataset.mode;
    renderStats();
    return;
  }

  const period = target.closest('[data-period]');
  if (period && !period.disabled) {
    const dir = +period.dataset.period;
    if (ui.statsMode === 'month') {
      ui.statsMonth = new Date(ui.statsMonth.getFullYear(), ui.statsMonth.getMonth() + dir, 1);
    } else {
      ui.statsYear += dir;
    }
    renderStats();
    return;
  }

  /* Sélections dans les feuilles d'édition */

  const emoji = target.closest('[data-emoji]');
  if (emoji) { ui.editEmoji = emoji.dataset.emoji; syncEditControls(); return; }

  const catEmoji = target.closest('[data-cat-emoji]');
  if (catEmoji) { ui.catEmoji = catEmoji.dataset.catEmoji; syncCatControls(); return; }

  const color = target.closest('[data-color]');
  if (color) { ui.editColor = color.dataset.color; syncEditControls(); return; }

  const catSel = target.closest('[data-cat-select]');
  if (catSel) {
    ui.editCat = catSel.dataset.catSelect === '' ? null : catSel.dataset.catSelect;
    syncEditControls();
    return;
  }

  if (target.closest('[data-new-cat]')) { openCatSheet(null, true); return; }

  if (target.closest('#edit-save')) { saveEdit(); return; }
  if (target.closest('#cat-save')) { saveCat(); return; }

  const catLoad = target.closest('[data-cat-load]');
  if (catLoad) { loadCatForm(catLoad.dataset.catLoad); return; }

  const catDel = target.closest('[data-cat-del]');
  if (catDel) {
    if (catDel.classList.contains('danger-armed')) {
      deleteCat(catDel.dataset.catDel);
    } else {
      catDel.classList.add('danger-armed');
      setTimeout(() => catDel.classList.remove('danger-armed'), 2500);
    }
    return;
  }

  /* Feuille détail */

  if (target.closest('[data-edit]')) {
    const id = ui.detailId;
    closeAllSheets();
    setTimeout(() => openEdit(id), 200);
    return;
  }

  const del = target.closest('[data-delete]');
  if (del) {
    if (del.classList.contains('danger-armed')) {
      clearTimeout(deleteArmTimer);
      deleteHabit(ui.detailId);
    } else {
      del.classList.add('danger-armed');
      deleteArmTimer = setTimeout(() => del.classList.remove('danger-armed'), 2500);
    }
    return;
  }

  const day = target.closest('[data-day]');
  if (day) { toggleCheck(ui.detailId, day.dataset.day); return; }

  const calNav = target.closest('[data-cal-nav]');
  if (calNav && !calNav.disabled) {
    ui.detailMonth = new Date(ui.detailMonth.getFullYear(), ui.detailMonth.getMonth() + +calNav.dataset.calNav, 1);
    renderDetail();
    return;
  }
});

/* Réglages : rappel + sauvegarde */

els.reminderToggle.addEventListener('click', toggleReminder);

els.reminderTime.addEventListener('change', () => {
  const v = els.reminderTime.value;
  if (!/^\d{2}:\d{2}$/.test(v)) return;
  state.settings.reminder.time = v;
  save();
  scheduleReminder();
  syncSettings();
});

$('#update-now').addEventListener('click', applyUpdate);
$('#check-update').addEventListener('click', checkForUpdate);

$('#export-file').addEventListener('click', exportToFile);
$('#export-copy').addEventListener('click', exportToClipboard);

$('#import-file-btn').addEventListener('click', () => els.importFile.click());

els.importFile.addEventListener('change', () => {
  const file = els.importFile.files && els.importFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => importFromText(String(reader.result));
  reader.onerror = () => flash(els.dataInfo, '✗ Lecture du fichier impossible', false);
  reader.readAsText(file);
  els.importFile.value = '';
});

$('#import-btn').addEventListener('click', e => {
  const btn = e.currentTarget;
  const raw = els.importText.value.trim();
  if (!raw) { flash(els.dataInfo, 'Collez d\'abord une sauvegarde', false); return; }
  if (!btn.classList.contains('danger-armed')) {
    btn.classList.add('danger-armed');
    btn.textContent = 'Confirmer ?';
    setTimeout(() => { btn.classList.remove('danger-armed'); btn.textContent = 'Importer'; }, 2500);
    return;
  }
  btn.classList.remove('danger-armed');
  btn.textContent = 'Importer';
  importFromText(raw);
});

els.editName.addEventListener('input', syncEditControls);
els.catName.addEventListener('input', syncCatControls);

els.editName.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); els.editName.blur(); }
});
els.catName.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); els.catName.blur(); saveCat(); }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && ui.sheetStack.length) closeTopSheet();
});

/* Changement de jour (l'app reste ouverte pendant la nuit, retour au premier plan…) */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  const t = keyOf(todayDate());
  if (t !== ui.lastRenderDay) {
    if (ui.lastRenderDay === keyOf(ui.selectedDay)) ui.selectedDay = todayDate();
    ui.lastRenderDay = t;
    renderAll();
  }
  scheduleReminder();
});

/* ---------- Démarrage ---------- */

buildPickers();
syncSettings();
scheduleReminder();
renderAll();
