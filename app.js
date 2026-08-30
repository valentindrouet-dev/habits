'use strict';

/* ============================================================
   Mes Habitudes — logique de l'application
   Données stockées en localStorage sous la clé "habits.v1" :
   { habits: [{id, name, emoji, color, createdAt}], checks: {id: {"YYYY-MM-DD": 1}} }
   ============================================================ */

const STORE_KEY = 'habits.v1';
const WEEKS_ON_CARD = 26;

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
  '🙏', '❤️', '😊', '📞', '🎮', '🎬', '✈️', '⭐',
];

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_SHORT = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];

const ICON = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.2-4.2L16.5 4.5a2.12 2.12 0 0 1 3 3L8.2 18.8 4 20z"/><path d="M14.5 6.5l3 3"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6.5 7l1 14h9l1-14"/><path d="M10 11v6M14 11v6"/></svg>',
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

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && Array.isArray(s.habits) && s.checks && typeof s.checks === 'object') return s;
    }
  } catch (e) { /* stockage indisponible ou corrompu : on repart de zéro */ }
  return { habits: [], checks: {} };
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

function periodStats(fromKey, toKey) {
  let done = 0, eligible = 0;
  for (const h of state.habits) {
    done += countRange(h.id, fromKey, toKey);
    eligible += eligibleDays(h, fromKey, toKey);
  }
  return { done, eligible, rate: eligible ? done / eligible : 0 };
}

function perfectDays(fromKey, toKey) {
  const t = keyOf(todayDate());
  const hi = toKey < t ? toKey : t;
  if (fromKey > hi) return 0;
  let count = 0;
  let d = parseKey(fromKey);
  const end = parseKey(hi);
  while (d <= end) {
    const k = keyOf(d);
    const existing = state.habits.filter(h => h.createdAt <= k);
    if (existing.length && existing.every(h => isChecked(h.id, k))) count++;
    d = addDays(d, 1);
  }
  return count;
}

/* ---------- État de l'interface ---------- */

const now = todayDate();
const ui = {
  tab: 'home',
  statsMode: 'month',
  statsMonth: new Date(now.getFullYear(), now.getMonth(), 1),
  statsYear: now.getFullYear(),
  detailId: null,
  detailYear: now.getFullYear(),
  editId: null,
  editEmoji: '⭐',
  editColor: PALETTE[4],
  openSheet: null,
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
  backdrop: $('#backdrop'),
  sheetEdit: $('#sheet-edit'),
  sheetDetail: $('#sheet-detail'),
  detailBody: $('#detail-body'),
  editTitle: $('#edit-title'),
  editChip: $('#edit-chip'),
  editName: $('#edit-name'),
  emojiGrid: $('#emoji-grid'),
  colorGrid: $('#color-grid'),
  editSave: $('#edit-save'),
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function hexAlpha(hex, a) {
  const n = Math.round(a * 255).toString(16).padStart(2, '0');
  return hex + n;
}

/* ---------- Rendu : en-tête ---------- */

function renderHeader() {
  const t = todayDate();
  if (ui.tab === 'home') {
    els.title.textContent = 'Habitudes';
    const total = state.habits.length;
    const done = state.habits.filter(h => isChecked(h.id, keyOf(t))).length;
    els.subtitle.textContent = (total > 0 && done === total)
      ? '🎉 Tout est coché aujourd\'hui !'
      : fmtLongDate(t);
    els.ring.hidden = total === 0;
    if (total > 0) {
      const f = done / total;
      const C = 125.66;
      els.ringBar.style.strokeDashoffset = String(C * (1 - f));
      els.ringLabel.textContent = done + '/' + total;
      els.ring.classList.toggle('complete', done === total);
    }
  } else {
    els.title.textContent = 'Statistiques';
    els.subtitle.textContent = 'Vos progrès en un coup d\'œil';
    els.ring.hidden = true;
  }
}

/* ---------- Rendu : accueil ---------- */

function cardGridHtml(h) {
  const t = todayDate();
  const tKey = keyOf(t);
  const start = addDays(mondayOf(t), -(WEEKS_ON_CARD - 1) * 7);
  let html = '';
  for (let w = 0; w < WEEKS_ON_CARD; w++) {
    for (let r = 0; r < 7; r++) {
      const d = addDays(start, w * 7 + r);
      const k = keyOf(d);
      if (k > tKey) { html += '<i class="c off"></i>'; continue; }
      const cls = ['c'];
      if (isChecked(h.id, k)) cls.push('on');
      if (k === tKey) cls.push('today');
      html += '<i class="' + cls.join(' ') + '"></i>';
    }
  }
  return html;
}

function habitSubline(h) {
  const s = currentStreak(h.id);
  if (s > 0) return '🔥 ' + s + (s > 1 ? ' jours' : ' jour') + ' d\'affilée';
  const total = totalChecks(h.id);
  if (total > 0) return total + ' fois au total';
  return 'Commencez aujourd\'hui !';
}

function renderHome(animateId) {
  if (!state.habits.length) {
    els.home.innerHTML =
      '<div class="empty fade-in">' +
        '<div class="empty-icon">🌱</div>' +
        '<h3>Aucune habitude pour l\'instant</h3>' +
        '<p>Appuyez sur le bouton + pour créer votre première habitude.</p>' +
      '</div>';
    return;
  }
  const tKey = keyOf(todayDate());
  els.home.innerHTML = state.habits.map(h => {
    const done = isChecked(h.id, tKey);
    return (
      '<article class="card" data-card="' + h.id + '">' +
        '<div class="card-top">' +
          '<div class="chip" style="background:' + hexAlpha(h.color, 0.16) + '">' + h.emoji + '</div>' +
          '<div class="card-info">' +
            '<h3>' + escapeHtml(h.name) + '</h3>' +
            '<p>' + habitSubline(h) + '</p>' +
          '</div>' +
          '<button class="check' + (done ? ' done' : '') + '" data-check="' + h.id + '" style="--c:' + h.color + '" aria-label="Cocher ' + escapeHtml(h.name) + '">' +
            (done ? ICON.check : ICON.plus) +
          '</button>' +
        '</div>' +
        '<div class="grid26" style="--c:' + h.color + '">' + cardGridHtml(h) + '</div>' +
      '</article>'
    );
  }).join('');
  if (animateId) {
    const btn = els.home.querySelector('[data-check="' + animateId + '"]');
    if (btn) btn.classList.add('pop');
  }
}

/* ---------- Rendu : statistiques ---------- */

function monthHeatHtml(y, m) {
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
      const existing = state.habits.filter(h => h.createdAt <= k);
      const done = existing.filter(h => isChecked(h.id, k)).length;
      const f = existing.length ? done / existing.length : 0;
      if (f > 0) {
        cls.push('lit');
        style = ' style="background:rgba(124,108,246,' + (0.15 + 0.65 * f).toFixed(2) + ')"';
      }
    }
    if (k === tKey) cls.push('today');
    cells += '<div class="' + cls.join(' ') + '"' + style + '>' + day + '</div>';
  }
  return (
    '<div class="heat-head">' + DAY_LETTERS.map(l => '<span>' + l + '</span>').join('') + '</div>' +
    '<div class="heat">' + cells + '</div>'
  );
}

function yearBarsHtml(y) {
  const t = todayDate();
  let html = '';
  for (let m = 0; m < 12; m++) {
    const from = keyOf(new Date(y, m, 1));
    const to = keyOf(new Date(y, m, daysInMonth(y, m)));
    const st = periodStats(from, to);
    const pct = Math.round(st.rate * 100);
    const isNow = y === t.getFullYear() && m === t.getMonth();
    html +=
      '<div class="bar-col' + (isNow ? ' now' : '') + '" title="' + MONTH_SHORT[m] + ' : ' + pct + '%">' +
        '<div class="bar-track"><div class="bar-fill' + (pct === 0 ? ' zero' : '') + '" style="height:' + Math.max(pct, 2) + '%"></div></div>' +
        '<em>' + MONTH_LETTERS[m] + '</em>' +
      '</div>';
  }
  return '<div class="bars">' + html + '</div>';
}

function habitRowsHtml(fromKey, toKey) {
  return state.habits.map(h => {
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
          '<div class="hbar"><i style="width:' + pct + '%;--c:' + h.color + ';background:' + h.color + '"></i></div>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

function bestStreakAll() {
  let best = 0;
  for (const h of state.habits) best = Math.max(best, bestStreak(h.id));
  return best;
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

  const st = periodStats(fromKey, toKey);
  const rate = Math.round(st.rate * 100);
  const perfect = perfectDays(fromKey, toKey);
  const record = bestStreakAll();

  els.stats.innerHTML =
    '<div class="fade-in">' +
    '<div class="segmented">' +
      '<button data-mode="month" class="' + (isMonth ? 'active' : '') + '">Mois</button>' +
      '<button data-mode="year" class="' + (!isMonth ? 'active' : '') + '">Année</button>' +
    '</div>' +
    '<div class="period-nav">' +
      '<button class="icon-btn" data-period="-1" aria-label="Période précédente">' + ICON.left + '</button>' +
      '<span class="period-label">' + label + '</span>' +
      '<button class="icon-btn" data-period="1" aria-label="Période suivante"' + (canNext ? '' : ' disabled') + '>' + ICON.right + '</button>' +
    '</div>' +
    '<div class="tiles">' +
      '<div class="tile"><b>' + rate + '%</b><span>Taux de réussite</span></div>' +
      '<div class="tile"><b>' + st.done + '</b><span>Coches au total</span></div>' +
      '<div class="tile"><b>' + perfect + '</b><span>Jours parfaits</span></div>' +
      '<div class="tile"><b>' + record + (record > 1 ? ' jours' : ' jour') + '</b><span>Record d\'affilée</span></div>' +
    '</div>' +
    '<div class="stats-card">' +
      '<p class="section-title">' + (isMonth ? 'Calendrier du mois' : 'Réussite par mois') + '</p>' +
      (isMonth ? monthHeatHtml(ui.statsMonth.getFullYear(), ui.statsMonth.getMonth()) : yearBarsHtml(ui.statsYear)) +
    '</div>' +
    '<div class="stats-card">' +
      '<p class="section-title">Par habitude</p>' +
      habitRowsHtml(fromKey, toKey) +
    '</div>' +
    '</div>';
}

/* ---------- Rendu : feuille détail ---------- */

function yearGridHtml(h, y) {
  const t = todayDate();
  const tKey = keyOf(t);
  const start = mondayOf(new Date(y, 0, 1));
  const end = new Date(y, 11, 31);
  const weeks = Math.ceil((daysBetween(start, end) + 1) / 7);
  let labels = '';
  for (let m = 0; m < 12; m++) {
    const col = Math.floor(daysBetween(start, new Date(y, m, 1)) / 7);
    labels += '<span style="left:' + (col * 13) + 'px">' + MONTH_SHORT[m] + '</span>';
  }
  let cells = '';
  for (let w = 0; w < weeks; w++) {
    for (let r = 0; r < 7; r++) {
      const d = addDays(start, w * 7 + r);
      const k = keyOf(d);
      if (d.getFullYear() !== y || k > tKey) { cells += '<i class="c off"></i>'; continue; }
      const cls = ['c'];
      if (isChecked(h.id, k)) cls.push('on');
      if (k === tKey) cls.push('today');
      cells += '<i class="' + cls.join(' ') + '"></i>';
    }
  }
  return (
    '<div class="ygrid-wrap" id="ygrid-scroll">' +
      '<div class="ylabels" style="width:' + (weeks * 13) + 'px">' + labels + '</div>' +
      '<div class="ygrid" style="--c:' + h.color + '">' + cells + '</div>' +
    '</div>'
  );
}

function renderDetail() {
  const h = state.habits.find(x => x.id === ui.detailId);
  if (!h) return;
  const t = todayDate();
  const tKey = keyOf(t);
  const done = isChecked(h.id, tKey);
  const monthFrom = keyOf(new Date(t.getFullYear(), t.getMonth(), 1));
  const monthTo = keyOf(new Date(t.getFullYear(), t.getMonth(), daysInMonth(t.getFullYear(), t.getMonth())));
  const mDone = countRange(h.id, monthFrom, monthTo);
  const mElig = eligibleDays(h, monthFrom, monthTo);
  const s = currentStreak(h.id);
  const b = bestStreak(h.id);

  els.detailBody.innerHTML =
    '<div class="detail-head">' +
      '<div class="chip lg" style="background:' + hexAlpha(h.color, 0.16) + '">' + h.emoji + '</div>' +
      '<div class="card-info">' +
        '<h3>' + escapeHtml(h.name) + '</h3>' +
        '<p>Depuis le ' + parseKey(h.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) + '</p>' +
      '</div>' +
      '<div class="detail-actions">' +
        '<button class="icon-btn" data-edit aria-label="Modifier">' + ICON.pencil + '</button>' +
        '<button class="icon-btn" data-delete aria-label="Supprimer">' + ICON.trash + '</button>' +
        '<button class="icon-btn" data-close aria-label="Fermer">' + ICON.close + '</button>' +
      '</div>' +
    '</div>' +
    '<div class="tiles">' +
      '<div class="tile"><b>🔥 ' + s + '</b><span>Série actuelle</span></div>' +
      '<div class="tile"><b>' + b + (b > 1 ? ' jours' : ' jour') + '</b><span>Meilleure série</span></div>' +
      '<div class="tile"><b>' + totalChecks(h.id) + '</b><span>Total coché</span></div>' +
      '<div class="tile"><b>' + (mElig ? Math.round((mDone / mElig) * 100) : 0) + '%</b><span>Ce mois-ci</span></div>' +
    '</div>' +
    '<div class="period-nav">' +
      '<button class="icon-btn" data-year="-1" aria-label="Année précédente">' + ICON.left + '</button>' +
      '<span class="period-label">' + ui.detailYear + '</span>' +
      '<button class="icon-btn" data-year="1" aria-label="Année suivante"' + (ui.detailYear < t.getFullYear() ? '' : ' disabled') + '>' + ICON.right + '</button>' +
    '</div>' +
    yearGridHtml(h, ui.detailYear) +
    '<button class="btn-toggle-today' + (done ? ' done' : '') + '" data-toggle-today style="--c:' + h.color + '">' +
      (done ? ICON.check + ' Fait aujourd\'hui' : ICON.plus + ' Cocher aujourd\'hui') +
    '</button>';

  const scroller = $('#ygrid-scroll');
  if (scroller && ui.detailYear === t.getFullYear()) {
    /* caler la semaine courante au bord droit de la zone visible */
    const start = mondayOf(new Date(ui.detailYear, 0, 1));
    const col = Math.floor(daysBetween(start, mondayOf(t)) / 7);
    scroller.scrollLeft = Math.max(0, (col + 1) * 13 - scroller.clientWidth + 4);
  }
}

/* ---------- Feuilles (ouverture / fermeture) ---------- */

function openSheet(which) {
  ui.openSheet = which;
  els.backdrop.classList.add('show');
  (which === 'edit' ? els.sheetEdit : els.sheetDetail).classList.add('show');
  (which === 'edit' ? els.sheetEdit : els.sheetDetail).setAttribute('aria-hidden', 'false');
  document.body.classList.add('locked');
}

function closeSheet() {
  ui.openSheet = null;
  els.backdrop.classList.remove('show');
  for (const sh of [els.sheetEdit, els.sheetDetail]) {
    sh.classList.remove('show');
    sh.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('locked');
}

function openEdit(id) {
  ui.editId = id;
  if (id) {
    const h = state.habits.find(x => x.id === id);
    if (!h) return;
    ui.editEmoji = h.emoji;
    ui.editColor = h.color;
    els.editName.value = h.name;
    els.editTitle.textContent = 'Modifier l\'habitude';
    els.editSave.textContent = 'Enregistrer';
  } else {
    ui.editEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    ui.editColor = PALETTE[state.habits.length % PALETTE.length];
    els.editName.value = '';
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
  for (const b of els.emojiGrid.children) b.classList.toggle('sel', b.dataset.emoji === ui.editEmoji);
  for (const b of els.colorGrid.children) b.classList.toggle('sel', b.dataset.color === ui.editColor);
}

function saveEdit() {
  const name = els.editName.value.trim();
  if (!name) return;
  if (ui.editId) {
    const h = state.habits.find(x => x.id === ui.editId);
    if (h) {
      h.name = name;
      h.emoji = ui.editEmoji;
      h.color = ui.editColor;
    }
  } else {
    state.habits.push({
      id: uid(),
      name,
      emoji: ui.editEmoji,
      color: ui.editColor,
      createdAt: keyOf(todayDate()),
    });
  }
  save();
  closeSheet();
  renderHeader();
  renderHome();
  renderStats();
}

function openDetail(id) {
  ui.detailId = id;
  ui.detailYear = todayDate().getFullYear();
  renderDetail();
  openSheet('detail');
}

let deleteArmTimer = null;

function deleteHabit(id) {
  state.habits = state.habits.filter(h => h.id !== id);
  delete state.checks[id];
  save();
  closeSheet();
  renderHeader();
  renderHome();
  renderStats();
}

/* ---------- Coches ---------- */

function toggleToday(id, opts) {
  const k = keyOf(todayDate());
  const next = !isChecked(id, k);
  setChecked(id, k, next);
  if (next && navigator.vibrate) navigator.vibrate(15);
  renderHeader();
  renderHome(opts && opts.fromHome && next ? id : null);
  renderStats();
  if (ui.openSheet === 'detail' && ui.detailId === id) renderDetail();
}

/* ---------- Grilles émoji / couleur (une seule fois) ---------- */

function buildPickers() {
  els.emojiGrid.innerHTML = EMOJIS.map(e =>
    '<button type="button" data-emoji="' + e + '" aria-label="' + e + '">' + e + '</button>'
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

  const checkBtn = target.closest('[data-check]');
  if (checkBtn) {
    e.stopPropagation();
    toggleToday(checkBtn.dataset.check, { fromHome: true });
    return;
  }

  const tab = target.closest('.tab');
  if (tab) { setTab(tab.dataset.tab); return; }

  if (target.closest('#fab')) { openEdit(null); return; }

  const card = target.closest('[data-card]');
  if (card) { openDetail(card.dataset.card); return; }

  if (target.closest('[data-close]')) { closeSheet(); return; }
  if (target === els.backdrop) { closeSheet(); return; }

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

  const emoji = target.closest('[data-emoji]');
  if (emoji) {
    ui.editEmoji = emoji.dataset.emoji;
    syncEditControls();
    return;
  }

  const color = target.closest('[data-color]');
  if (color) {
    ui.editColor = color.dataset.color;
    syncEditControls();
    return;
  }

  if (target.closest('#edit-save')) { saveEdit(); return; }

  /* Actions de la feuille détail */
  if (target.closest('[data-edit]')) {
    const id = ui.detailId;
    closeSheet();
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

  const yearNav = target.closest('[data-year]');
  if (yearNav && !yearNav.disabled) {
    ui.detailYear += +yearNav.dataset.year;
    renderDetail();
    return;
  }

  if (target.closest('[data-toggle-today]')) {
    toggleToday(ui.detailId);
    return;
  }
});

els.editName.addEventListener('input', syncEditControls);
els.editName.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    els.editName.blur();
    saveEdit();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && ui.openSheet) closeSheet();
});

/* Changement de jour (l'app reste ouverte pendant la nuit, retour au premier plan…) */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && keyOf(todayDate()) !== ui.lastRenderDay) {
    ui.lastRenderDay = keyOf(todayDate());
    renderAll();
  }
});

/* ---------- Démarrage ---------- */

buildPickers();
renderAll();
