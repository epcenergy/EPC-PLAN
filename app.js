/* EPC PLAN – κύρια εφαρμογή */
(function () {
  'use strict';
  const SY = window.EPC_SYMBOLS, RD = window.EPC_RENDER, G = RD.G, DB = window.EPC_DB, EX = window.EPC_EXPORT;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = RD.esc;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const APP_VERSION = '1.3.0';

  // ---------- εικονίδια ----------
  const IC = {
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
    rot: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 11-3-6.2"/><path d="M20 4v5h-5"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h8"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    undo: '<svg viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 010 10h-3"/></svg>',
    rect: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14"/></svg>',
    poly: '<svg viewBox="0 0 24 24"><path d="M4 4h10v6h6v10H4z"/></svg>',
    square: '<svg viewBox="0 0 24 24"><path d="M4 20V4h16"/><path d="M8 20v-4h4"/></svg>',
    split: '<svg viewBox="0 0 24 24"><path d="M3 12h7M14 12h7"/><circle cx="12" cy="12" r="2"/><path d="M12 4v4M12 16v4"/></svg>',
    flip: '<svg viewBox="0 0 24 24"><path d="M12 3v18"/><path d="M8 7L3 12l5 5M16 7l5 5-5 5"/></svg>',
    flipv: '<svg viewBox="0 0 24 24"><path d="M3 12h18"/><path d="M7 8l5-5 5 5M7 16l5 5 5-5"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
    grid: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4zM4 12h16M12 4v16"/></svg>',
    camera: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    image: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></svg>',
    pdf: '<svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/><path d="M9 14h6M9 18h4"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    move: '<svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/></svg>',
    save: '<svg viewBox="0 0 24 24"><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h8V3M8 21v-7h8v7"/></svg>',
    upload: '<svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/></svg>',
    share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/></svg>',
    download: '<svg viewBox="0 0 24 24"><path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/></svg>',
    layers: '<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
    link: '<svg viewBox="0 0 24 24"><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="6" r="2.5"/><path d="M7 16l2-2M11 12l2-2M15 8l2-2"/></svg>',
    swap: '<svg viewBox="0 0 24 24"><path d="M4 8h14l-4-4M20 16H6l4 4"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  };
  const symIcon = (id, px = 40) => `<span class="ic">${SY.iconSVG(id, px)}</span>`;

  // ---------- κοινά UI ----------
  let toastT = 0;
  function toast(msg, ms = 2200) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms);
  }
  function busy(on, txt) { $('#busy').classList.toggle('show', !!on); if (txt) $('#busyText').textContent = txt; }

  const Sheet = {
    onClose: null,
    open(html, { tall = false, onClose = null } = {}) {
      $('#sheetBody').innerHTML = html;
      $('#sheet').classList.toggle('tall', tall);
      $('#sheet').classList.add('show');
      $('#sheetBack').classList.add('show');
      $('#sheetBody').scrollTop = 0;
      this.onClose = onClose;
      return $('#sheetBody');
    },
    close() {
      $('#sheet').classList.remove('show');
      $('#sheetBack').classList.remove('show');
      const fn = this.onClose; this.onClose = null;
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      if (fn) fn();
    },
    isOpen() { return $('#sheet').classList.contains('show'); },
  };
  $('#sheetBack').addEventListener('click', () => Sheet.close());
  // σύρσιμο προς τα κάτω για κλείσιμο
  (function () {
    let y0 = null;
    $('#sheet .grab').addEventListener('pointerdown', e => { y0 = e.clientY; });
    window.addEventListener('pointerup', e => { if (y0 != null && e.clientY - y0 > 40) Sheet.close(); y0 = null; });
  })();

  function confirmBox(msg, okText = 'Ναι', danger = true) {
    return new Promise(res => {
      const b = Sheet.open(`<h3>${esc(msg)}</h3><div class="row2" style="margin-top:14px"><button class="btn" data-a="no">Άκυρο</button><button class="btn ${danger ? 'primary' : 'primary'}" data-a="yes" style="${danger ? 'background:#c0392b;border-color:#c0392b' : ''}">${esc(okText)}</button></div>`,
        { onClose: () => res(false) });
      b.querySelector('[data-a=no]').onclick = () => Sheet.close();
      b.querySelector('[data-a=yes]').onclick = () => { Sheet.onClose = null; Sheet.close(); res(true); };
    });
  }
  function promptBox(title, value, chips = [], placeholder = '') {
    return new Promise(res => {
      const b = Sheet.open(`<h3>${esc(title)}</h3>
        <label class="fld"><input id="pbIn" value="${esc(value || '')}" placeholder="${esc(placeholder)}"></label>
        ${chips.length ? `<div class="chips" style="margin:6px 0 12px">${chips.map(c => `<button class="chip" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}
        <div class="row2"><button class="btn" data-a="no">Άκυρο</button><button class="btn primary" data-a="ok">OK</button></div>`, { onClose: () => res(null) });
      const inp = b.querySelector('#pbIn');
      b.querySelectorAll('[data-v]').forEach(c => (c.onclick = () => { inp.value = c.dataset.v; }));
      b.querySelector('[data-a=no]').onclick = () => Sheet.close();
      const ok = () => { Sheet.onClose = null; const v = inp.value.trim(); Sheet.close(); res(v); };
      b.querySelector('[data-a=ok]').onclick = ok;
      inp.onkeydown = e => { if (e.key === 'Enter') ok(); };
    });
  }

  function show(screen) {
    $$('.screen').forEach(s => s.classList.toggle('active', s.id === screen));
    if (screen === 'editor') requestAnimationFrame(() => { resizeStage(); });
  }

  async function deliver(blob, filename) {
    const file = new File([blob], filename, { type: blob.type });
    const canShare = navigator.canShare && navigator.canShare({ files: [file] });
    const b = Sheet.open(`<h3>${IC.check.replace('<svg', '<svg width="26" height="26" style="stroke:#27ae60;fill:none;stroke-width:2.6"')} Έτοιμο</h3>
      <p class="note" style="margin-top:0">${esc(filename)} · ${(blob.size / 1024).toFixed(0)} KB</p>
      <div class="btn-col" style="margin-top:8px">
        ${canShare ? `<button class="btn primary" data-a="share">Κοινοποίηση (Viber, email…)</button>` : ''}
        <button class="btn ${canShare ? '' : 'primary'}" data-a="dl">Αποθήκευση στο κινητό</button>
        <button class="btn" data-a="open">Άνοιγμα</button>
      </div>`);
    b.querySelector('[data-a=dl]').onclick = () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    };
    b.querySelector('[data-a=open]').onclick = () => { window.open(URL.createObjectURL(blob), '_blank'); };
    const sh = b.querySelector('[data-a=share]');
    if (sh) sh.onclick = async () => {
      try { await navigator.share({ files: [file], title: filename }); } catch (e) { if (e.name !== 'AbortError') toast('Δεν έγινε κοινοποίηση'); }
    };
  }
  const safeName = (s) => (s || 'EPC-PLAN').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_').slice(0, 60) || 'EPC-PLAN';

  // ================= ΔΕΔΟΜΕΝΑ =================
  let projects = [];
  let cur = null;      // τρέχον έργο
  let floor = null;    // τρέχουσα κάτοψη
  let saveT = 0;

  function newFloor(name) {
    return { id: uid(), name, rooms: [], items: [], links: [], openings: [], photo: null, created: Date.now() };
  }
  function newProject() {
    return {
      id: uid(), name: '', client: '', phone: '', address: '', created: Date.now(), updated: Date.now(),
      floors: [newFloor('Ισόγειο')], circuits: {}, view: { circuits: true, heights: true, notes: true, grid: true },
    };
  }
  function saveSoon() {
    if (!cur) return;
    cur.updated = Date.now();
    clearTimeout(saveT);
    saveT = setTimeout(() => DB.put(cur).catch(() => toast('Σφάλμα αποθήκευσης!')), 350);
  }
  function saveNow() { if (cur) { clearTimeout(saveT); return DB.put(cur).catch(() => { }); } }
  window.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); });
  window.addEventListener('pagehide', saveNow);

  // ================= ΑΡΧΙΚΗ =================
  function thumbSVG(p) {
    const fl = p.floors && p.floors[0];
    if (!fl || (!fl.rooms.length && !fl.items.length)) return `<img src="./icon-192.png" style="width:44px;height:44px;border-radius:50%">`;
    const b = RD.floorBounds(fl);
    const pad = Math.max(b.w, b.h) * 0.06;
    let s = '';
    fl.rooms.forEach(r => (s += `<path d="${RD.roomPathD(r.pts)}" fill="#fff" stroke="#00468c" stroke-width="${Math.max(b.w, b.h) / 60}"/>`));
    return `<svg viewBox="${b.x0 - pad} ${b.y0 - pad} ${b.w + pad * 2} ${b.h + pad * 2}" preserveAspectRatio="xMidYMid meet">${s}</svg>`;
  }
  async function loadProjects() {
    try { projects = await DB.all(); } catch (e) { projects = []; toast('Δεν είναι διαθέσιμη η αποθήκευση'); }
    projects.sort((a, b) => (b.updated || 0) - (a.updated || 0));
    renderHome();
  }
  function renderHome() {
    const q = ($('#projSearch').value || '').toLowerCase().trim();
    const list = projects.filter(p => !q || [p.name, p.client, p.address, p.phone].join(' ').toLowerCase().includes(q));
    const el = $('#projList');
    if (!projects.length) {
      el.innerHTML = `<div class="empty"><img src="./icon-192.png" alt=""><br><b>Κανένα έργο ακόμα</b><br>Πάτα «Νέο έργο» για να ξεκινήσεις.<br>Κάθε έργο κρατάει τις κατόψεις του (π.χ. Ισόγειο, 1ος).</div>`;
      return;
    }
    if (!list.length) { el.innerHTML = `<div class="empty">Δεν βρέθηκε έργο.</div>`; return; }
    el.innerHTML = list.map(p => {
      const fl = (p.floors || []).length;
      const items = (p.floors || []).reduce((n, f) => n + f.items.length, 0);
      const d = new Date(p.updated || p.created).toLocaleDateString('el-GR');
      return `<div class="pcard" data-id="${p.id}">
        <div class="thumb">${thumbSVG(p)}</div>
        <div class="meta"><b>${esc(p.name || 'Χωρίς όνομα')}</b>
          <small>${esc([p.client, p.address].filter(Boolean).join(' · ') || '—')}</small>
          <small>${fl} ${fl === 1 ? 'κάτοψη' : 'κατόψεις'} · ${items} σύμβολα · ${d}</small></div>
        <button class="more" data-more="${p.id}" aria-label="Επιλογές"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></button>
      </div>`;
    }).join('');
  }
  $('#projSearch').addEventListener('input', renderHome);
  $('#projList').addEventListener('click', e => {
    const more = e.target.closest('[data-more]');
    if (more) { projectMenu(projects.find(p => p.id === more.dataset.more)); return; }
    const c = e.target.closest('.pcard');
    if (c) openProject(projects.find(p => p.id === c.dataset.id));
  });
  $('#newProjBtn').onclick = async () => {
    const name = await promptBox('Νέο έργο', '', [], 'Όνομα έργου (π.χ. Οικία Παπαδόπουλου)');
    if (name === null) return;
    const p = newProject();
    p.name = name || 'Νέο έργο';
    await DB.put(p);
    projects.unshift(p);
    openProject(p);
  };
  $('#homeMenuBtn').onclick = () => {
    const b = Sheet.open(`<h3>EPC PLAN</h3><div class="menu-list">
      <button class="menu-item" data-a="import">${IC.upload}<span class="grow">Επαναφορά από αντίγραφο ασφαλείας<small>Άνοιγμα αρχείου .epcplan.json</small></span></button>
      <button class="menu-item" data-a="about">${IC.info}<span class="grow">Πληροφορίες<small>Έκδοση ${APP_VERSION}</small></span></button>
    </div>`);
    b.querySelector('[data-a=import]').onclick = () => { Sheet.close(); $('#fileBackup').click(); };
    b.querySelector('[data-a=about]').onclick = () => {
      Sheet.open(`<h3>EPC PLAN ${APP_VERSION}</h3><p class="note">Κατόψεις ηλεκτρολογικών εγκαταστάσεων από χειρόγραφο σκίτσο.<br>Τα έργα αποθηκεύονται μόνο σε αυτό το κινητό. Κράτα τακτικά αντίγραφο ασφαλείας από το μενού κάθε έργου.<br><br>Σύμβολα κατά τις συμβάσεις IEC 60617 / ΕΛΟΤ για σχέδια εγκαταστάσεων.</p>`);
    };
  };
  function projectMenu(p) {
    const b = Sheet.open(`<h3>${esc(p.name || 'Έργο')}</h3><div class="menu-list">
      <button class="menu-item" data-a="open">${IC.edit}<span class="grow">Άνοιγμα</span></button>
      <button class="menu-item" data-a="dup">${IC.copy}<span class="grow">Αντιγραφή έργου</span></button>
      <button class="menu-item" data-a="backup">${IC.save}<span class="grow">Αντίγραφο ασφαλείας</span></button>
      <button class="menu-item danger" data-a="del">${IC.trash}<span class="grow">Διαγραφή έργου</span></button>
    </div>`);
    b.querySelector('[data-a=open]').onclick = () => { Sheet.close(); openProject(p); };
    b.querySelector('[data-a=dup]').onclick = async () => {
      const c = clone(p); c.id = uid(); c.name = (p.name || 'Έργο') + ' (αντίγραφο)'; c.created = c.updated = Date.now();
      await DB.put(c); projects.unshift(c); Sheet.close(); renderHome(); toast('Δημιουργήθηκε αντίγραφο');
    };
    b.querySelector('[data-a=backup]').onclick = () => backupProject(p);
    b.querySelector('[data-a=del]').onclick = async () => {
      if (!(await confirmBox(`Διαγραφή του έργου «${p.name || ''}»;`, 'Διαγραφή'))) return;
      await DB.del(p.id); projects = projects.filter(x => x.id !== p.id); renderHome(); toast('Διαγράφηκε');
    };
  }
  function backupProject(p) {
    const blob = new Blob([JSON.stringify({ app: 'EPC PLAN', format: 1, saved: new Date().toISOString(), project: p })], { type: 'application/json' });
    const d = new Date();
    deliver(blob, `${safeName(p.name)}_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.epcplan.json`);
  }
  $('#fileBackup').addEventListener('change', async e => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      const p = data.project || data;
      if (!p || !p.floors) throw new Error('bad');
      if (projects.some(x => x.id === p.id)) {
        const rep = await confirmBox(`Το έργο «${p.name}» υπάρχει ήδη. Αντικατάσταση;`, 'Αντικατάσταση');
        if (!rep) { p.id = uid(); p.name += ' (επαναφορά)'; }
      }
      p.view = p.view || { circuits: true, heights: true, notes: true, grid: true };
      p.circuits = p.circuits || {};
      await DB.put(p);
      await loadProjects();
      toast('Το έργο επαναφέρθηκε');
    } catch (err) { toast('Μη έγκυρο αρχείο αντιγράφου'); }
  });

  // ================= ΕΡΓΟ =================
  function openProject(p) {
    cur = p;
    cur.view = cur.view || {};
    if (cur.view.symScale == null) cur.view.symScale = 1.3;
    RD.setSymScale(cur.view.symScale);
    $('#projTitle').textContent = p.name || 'Έργο';
    $('#pName').value = p.name || ''; $('#pClient').value = p.client || '';
    $('#pPhone').value = p.phone || ''; $('#pAddress').value = p.address || '';
    renderFloors();
    show('project');
  }
  [['pName', 'name'], ['pClient', 'client'], ['pPhone', 'phone'], ['pAddress', 'address']].forEach(([id, k]) => {
    $('#' + id).addEventListener('input', e => { if (!cur) return; cur[k] = e.target.value; if (k === 'name') $('#projTitle').textContent = cur.name || 'Έργο'; saveSoon(); });
  });
  $$('[data-back=home]').forEach(b => b.onclick = async () => { await saveNow(); cur = null; await loadProjects(); show('home'); });
  const FLOOR_NAMES = ['Υπόγειο', 'Ισόγειο', 'Ημιώροφος', '1ος όροφος', '2ος όροφος', '3ος όροφος', 'Σοφίτα', 'Δώμα', 'Αποθήκη', 'Κατάστημα'];
  function renderFloors() {
    const el = $('#floorList');
    el.innerHTML = cur.floors.map(fl => `<div class="pcard" data-fid="${fl.id}">
      <div class="thumb">${thumbSVG({ floors: [fl] })}</div>
      <div class="meta"><b>${esc(fl.name)}</b><small>${fl.rooms.length} χώροι · ${fl.items.length} σύμβολα · ${(fl.links || []).length} συνδέσεις</small></div>
      <button class="more" data-fmore="${fl.id}" aria-label="Επιλογές"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></button>
    </div>`).join('') || `<div class="empty">Δεν υπάρχει κάτοψη. Πρόσθεσε όροφο.</div>`;
  }
  $('#floorList').addEventListener('click', e => {
    const m = e.target.closest('[data-fmore]');
    if (m) { floorMenu(cur.floors.find(f => f.id === m.dataset.fmore)); return; }
    const c = e.target.closest('[data-fid]');
    if (c) openEditor(cur.floors.find(f => f.id === c.dataset.fid));
  });
  async function addFloor() {
    const used = cur.floors.map(f => f.name);
    const name = await promptBox('Νέα κάτοψη / όροφος', FLOOR_NAMES.find(n => !used.includes(n)) || '', FLOOR_NAMES);
    if (!name) return null;
    const fl = newFloor(name);
    cur.floors.push(fl); saveSoon(); renderFloors();
    return fl;
  }
  $('#addFloorBtn').onclick = addFloor;
  function floorMenu(fl) {
    const b = Sheet.open(`<h3>${esc(fl.name)}</h3><div class="menu-list">
      <button class="menu-item" data-a="ren">${IC.edit}<span class="grow">Μετονομασία</span></button>
      <button class="menu-item" data-a="dup">${IC.copy}<span class="grow">Αντιγραφή κάτοψης</span></button>
      <button class="menu-item" data-a="up">${IC.layers}<span class="grow">Μετακίνηση πάνω στη λίστα</span></button>
      <button class="menu-item danger" data-a="del">${IC.trash}<span class="grow">Διαγραφή κάτοψης</span></button></div>`);
    b.querySelector('[data-a=ren]').onclick = async () => {
      const n = await promptBox('Όνομα κάτοψης', fl.name, FLOOR_NAMES);
      if (n) { fl.name = n; saveSoon(); renderFloors(); }
    };
    b.querySelector('[data-a=dup]').onclick = () => {
      const c = clone(fl); c.id = uid(); c.name = fl.name + ' (αντίγραφο)';
      cur.floors.splice(cur.floors.indexOf(fl) + 1, 0, c); saveSoon(); renderFloors(); Sheet.close();
    };
    b.querySelector('[data-a=up]').onclick = () => {
      const i = cur.floors.indexOf(fl);
      if (i > 0) { cur.floors.splice(i, 1); cur.floors.splice(i - 1, 0, fl); saveSoon(); renderFloors(); }
      Sheet.close();
    };
    b.querySelector('[data-a=del]').onclick = async () => {
      if (!(await confirmBox(`Διαγραφή της κάτοψης «${fl.name}»;`, 'Διαγραφή'))) return;
      cur.floors = cur.floors.filter(f => f !== fl); saveSoon(); renderFloors();
    };
  }
  $('#projMenuBtn').onclick = () => {
    const b = Sheet.open(`<h3>${esc(cur.name || 'Έργο')}</h3><div class="menu-list">
      <button class="menu-item" data-a="backup">${IC.save}<span class="grow">Αντίγραφο ασφαλείας<small>Αρχείο για Viber/email ή άλλο κινητό</small></span></button>
      <button class="menu-item danger" data-a="del">${IC.trash}<span class="grow">Διαγραφή έργου</span></button></div>`);
    b.querySelector('[data-a=backup]').onclick = () => backupProject(cur);
    b.querySelector('[data-a=del]').onclick = async () => {
      if (!(await confirmBox(`Διαγραφή του έργου «${cur.name || ''}»;`, 'Διαγραφή'))) return;
      await DB.del(cur.id); cur = null; await loadProjects(); show('home');
    };
  };
  $('#projBackupBtn').onclick = () => backupProject(cur);
  $('#projPdfBtn').onclick = () => pdfSheet();
  $('#projCircBtn').onclick = () => circuitsSheet();

  // ================= ΕΠΕΞΕΡΓΑΣΙΑ =================
  const ST = {
    mode: 'select', roomTool: 'rect', placing: null, openingType: 'door',
    sel: {}, linkFrom: null, view: { x: 0, y: 0, s: 1 }, draft: null, pointerWorld: null,
    hist: [], hi: -1, recent: [],
  };
  try { ST.recent = JSON.parse(localStorage.getItem('epc_recent') || '[]'); } catch (e) { }
  if (!ST.recent.length) ST.recent = ['lamp', 'sw1', 'sw2', 'sw_ar', 'sock', 'sock2'];
  const svg = $('#plan'), world = $('#world'), layer = $('#layer'), stageEl = $('#stage');
  let stageW = 300, stageH = 300;
  // το layer είναι 30% μεγαλύτερο από την οθόνη σε κάθε πλευρά, ώστε στο σύρσιμο να μη φαίνονται κενά
  const PADF = 0.3;
  const offX = () => stageW * PADF, offY = () => stageH * PADF;

  function resizeStage() {
    const r = stageEl.getBoundingClientRect();
    stageW = r.width; stageH = r.height;
    draw();
  }
  window.addEventListener('resize', () => { if ($('#editor').classList.contains('active')) resizeStage(); });

  function openEditor(fl) {
    floor = fl;
    floor.links = floor.links || []; floor.openings = floor.openings || [];
    $('#edTitle').textContent = fl.name;
    ST.sel = {}; ST.linkFrom = null; ST.draft = null; ST.placing = null;
    ST.hist = [snapshot()]; ST.hi = 0;
    show('editor');
    requestAnimationFrame(() => { resizeStage(); fitView(); setMode(floor.rooms.length ? 'select' : 'room'); updateEmpty(); });
  }
  $('#edBack').onclick = async () => {
    finishDraft(false);
    await saveNow();
    floor = null; renderFloors(); show('project');
  };
  $('#floorBtn').onclick = () => {
    const b = Sheet.open(`<h3>Κατόψεις</h3><div class="menu-list">${cur.floors.map(f => `<button class="menu-item" data-f="${f.id}">${IC.layers}<span class="grow">${esc(f.name)}<small>${f.rooms.length} χώροι · ${f.items.length} σύμβολα</small></span>${f === floor ? IC.check : ''}</button>`).join('')}
      <button class="menu-item" data-a="add">${IC.plus}<span class="grow">Νέα κάτοψη / όροφος</span></button>
      <button class="menu-item" data-a="ren">${IC.edit}<span class="grow">Μετονομασία τρέχουσας</span></button></div>`);
    b.querySelectorAll('[data-f]').forEach(x => x.onclick = () => { Sheet.close(); saveNow(); openEditor(cur.floors.find(f => f.id === x.dataset.f)); });
    b.querySelector('[data-a=add]').onclick = async () => { const fl = await addFloor(); if (fl) openEditor(fl); };
    b.querySelector('[data-a=ren]').onclick = async () => {
      const n = await promptBox('Όνομα κάτοψης', floor.name, FLOOR_NAMES);
      if (n) { floor.name = n; $('#edTitle').textContent = n; saveSoon(); }
    };
  };

  // ----- ιστορικό -----
  function snapshot() { return JSON.stringify({ rooms: floor.rooms, items: floor.items, links: floor.links, openings: floor.openings }); }
  function commit() {
    ST.hist = ST.hist.slice(0, ST.hi + 1);
    ST.hist.push(snapshot());
    if (ST.hist.length > 80) ST.hist.shift();
    ST.hi = ST.hist.length - 1;
    saveSoon(); updateUndo(); updateEmpty();
  }
  function restore(s) {
    const o = JSON.parse(s);
    floor.rooms = o.rooms; floor.items = o.items; floor.links = o.links; floor.openings = o.openings;
    ST.sel = {}; ST.linkFrom = null;
    saveSoon(); updateUndo(); updateCtx(); draw(); updateEmpty();
  }
  function updateUndo() { $('#undoBtn').disabled = ST.hi <= 0; $('#redoBtn').disabled = ST.hi >= ST.hist.length - 1; }
  $('#undoBtn').onclick = () => { if (ST.draft) { finishDraft(false); return; } if (ST.hi > 0) { ST.hi--; restore(ST.hist[ST.hi]); toast('Αναίρεση', 900); } };
  $('#redoBtn').onclick = () => { if (ST.hi < ST.hist.length - 1) { ST.hi++; restore(ST.hist[ST.hi]); } };

  function updateEmpty() {
    const el = $('#emptyHelp');
    const empty = floor && !floor.rooms.length && !floor.items.length && !floor.photo;
    el.classList.toggle('show', !!empty && !ST.draft);
    if (empty) {
      el.innerHTML = `<h4>Ξεκίνα την κάτοψη</h4><ol>
        <li>Φωτογράφισε το χειρόγραφο σκίτσο.</li>
        <li>Έλεγξε τις 4 γωνίες του χαρτιού και πάτα «Ίσιωμα».</li>
        <li>Οι χώροι αντιγράφονται αυτόματα με ίσιους τοίχους – δίνεις όνομα σε καθέναν με ένα πάτημα.</li>
        <li>Βάλε σύμβολα και ένωσε φωτιστικά με διακόπτες.</li></ol>
        <div class="row2"><button class="btn primary" id="ehCam">${'Φωτογραφία'}</button><button class="btn" id="ehSkip">Χωρίς φωτογραφία</button></div>`;
      $('#ehCam').onclick = () => photoSource();
      $('#ehSkip').onclick = () => { el.classList.remove('show'); setMode('room'); };
    }
  }

  // ----- προβολή -----
  const toWorld = (sx, sy) => [(sx - ST.view.x) / ST.view.s, (sy - ST.view.y) / ST.view.s];
  function fitView(topFrac) {
    const frac = typeof topFrac === 'number' ? topFrac : 1;
    let b = null;
    if (floor.rooms.length || floor.items.length) b = RD.floorBounds(floor);
    if (frac === 1 && floor.photo && floor.photo.visible !== false) {
      const p = floor.photo, pb = { x0: p.x, y0: p.y, x1: p.x + p.w, y1: p.y + p.h };
      b = b ? { x0: Math.min(b.x0, pb.x0), y0: Math.min(b.y0, pb.y0), x1: Math.max(b.x1, pb.x1), y1: Math.max(b.y1, pb.y1) } : pb;
    }
    if (!b) b = { x0: 0, y0: 0, x1: 800, y1: 600 };
    const w = b.x1 - b.x0, h = b.y1 - b.y0, pad = 24;
    const sh = stageH * frac;
    const s = Math.min((stageW - pad * 2) / Math.max(w, 50), (sh - pad * 2) / Math.max(h, 50));
    ST.view.s = Math.max(0.05, Math.min(8, s));
    ST.view.x = stageW / 2 - ((b.x0 + b.x1) / 2) * ST.view.s;
    ST.view.y = sh / 2 - ((b.y0 + b.y1) / 2) * ST.view.s;
    draw();
  }
  $('#fitBtn').onclick = () => fitView();

  let rafP = false;
  function draw() {
    if (rafP) return;
    rafP = true;
    requestAnimationFrame(() => { rafP = false; drawNow(); });
  }
  // μόνιμα στοιχεία: η φωτογραφία ΔΕΝ ξαναφορτώνεται σε κάθε σχεδίαση (αυτό έκανε την εφαρμογή να κολλάει)
  const NS = 'http://www.w3.org/2000/svg';
  const photoEl = document.createElementNS(NS, 'image'); photoEl.setAttribute('preserveAspectRatio', 'none');
  const contentEl = document.createElementNS(NS, 'g');
  const overlayEl = document.createElementNS(NS, 'g');
  world.append(photoEl, contentEl, overlayEl);
  // μία ομάδα ανά στρώση· κάθε στοιχείο έχει κλειδί και αλλάζει μόνο αν άλλαξε το περιεχόμενό του
  const layerEls = {}, keyed = {};
  RD.LAYERS.forEach(l => { const g = document.createElementNS(NS, 'g'); contentEl.appendChild(g); layerEls[l] = g; keyed[l] = new Map(); });
  const parseG = document.createElementNS(NS, 'g');
  function patchLayer(l, parts) {
    const g = layerEls[l], map = keyed[l], seen = new Set();
    let prev = null;
    for (const [key, str] of parts) {
      seen.add(key);
      let ent = map.get(key);
      if (!ent || ent.str !== str) {
        parseG.innerHTML = `<g>${str}</g>`;
        const node = parseG.firstChild;
        if (ent) g.replaceChild(node, ent.node); else g.insertBefore(node, prev ? prev.nextSibling : g.firstChild);
        ent = { str, node }; map.set(key, ent);
      }
      prev = ent.node;
    }
    for (const [key, ent] of map) if (!seen.has(key)) { ent.node.remove(); map.delete(key); }
  }
  function resetLayers() { RD.LAYERS.forEach(l => { layerEls[l].textContent = ''; keyed[l].clear(); }); }
  let photoHref = null;
  ST.rendered = { x: 0, y: 0, s: 1 };
  // πλήρης προβολή (μετά από κάθε κίνηση)
  function drawView() {
    if (!floor) return;
    const v = ST.view, ox = offX(), oy = offY();
    world.setAttribute('transform', `translate(${v.x + ox},${v.y + oy}) scale(${v.s})`);
    // πλέγμα ως φόντο CSS (πολύ πιο ελαφρύ από SVG pattern)
    layer.classList.toggle('nogrid', cur.view.grid === false);
    const B = 100 * v.s, b = 20 * v.s, px = `${v.x + ox}px ${v.y + oy}px`;
    const minor = b >= 9 ? `${b}px ${b}px` : `${B}px ${B}px`;
    layer.style.backgroundSize = `${B}px ${B}px, ${B}px ${B}px, ${minor}, ${minor}`;
    layer.style.backgroundPosition = `${px}, ${px}, ${px}, ${px}`;
    layer.style.transform = '';
    ST.rendered = { ...v };
  }
  // κατά το σύρσιμο/ζουμ: μόνο μετασχηματισμός CSS (γίνεται από την κάρτα γραφικών, χωρίς επανασχεδίαση)
  function gestureView() {
    if (!floor) return;
    const v = ST.view, R0 = ST.rendered, ox = offX(), oy = offY();
    const k = v.s / R0.s;
    const tx = (v.x + ox) - k * (R0.x + ox), ty = (v.y + oy) - k * (R0.y + oy);
    layer.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${k})`;
  }
  let rafV = false;
  function drawViewSoon() { if (rafV) return; rafV = true; requestAnimationFrame(() => { rafV = false; gestureView(); }); }
  function drawNow() {
    if (!floor) return;
    drawView();
    const s = ST.view.s;
    const ph = floor.photo;
    if (ph && ph.visible !== false) {
      if (photoHref !== ph.data) { photoEl.setAttribute('href', ph.data); photoHref = ph.data; }
      photoEl.setAttribute('x', ph.x); photoEl.setAttribute('y', ph.y);
      photoEl.setAttribute('width', ph.w); photoEl.setAttribute('height', ph.h);
      photoEl.setAttribute('opacity', ph.opacity);
      photoEl.setAttribute('transform', `rotate(${ph.rot || 0} ${ph.x + ph.w / 2} ${ph.y + ph.h / 2})`);
      photoEl.style.display = '';
    } else photoEl.style.display = 'none';
    let out = '';
    if (ph && ph.visible !== false && ST.mode === 'photo') out += `<rect x="${ph.x}" y="${ph.y}" width="${ph.w}" height="${ph.h}" fill="none" stroke="${RD.ACCENT}" stroke-width="${3 / s}" stroke-dasharray="${8 / s} ${6 / s}" transform="rotate(${ph.rot || 0} ${ph.x + ph.w / 2} ${ph.y + ph.h / 2})"/>`;
    if (ST.drawnFloor !== floor.id) { resetLayers(); ST.drawnFloor = floor.id; }
    const P = RD.floorParts(floor, { scale: s, sel: ST.sel, linkFrom: ST.linkFrom, showCircuits: cur.view.circuits, showHeights: cur.view.heights, showNotes: cur.view.notes });
    RD.LAYERS.forEach(l => patchLayer(l, P[l]));
    out += overlaySVG();
    overlayEl.innerHTML = out;
  }

  function overlaySVG() {
    const s = ST.view.s;
    let o = '';
    const hr = 11 / s;
    if (ST.sel.kind === 'room' && ST.mode === 'select') {
      const r = room(ST.sel.id);
      if (r) {
        const n = r.pts.length;
        for (let i = 0; i < n; i++) {
          const a = r.pts[i], b = r.pts[(i + 1) % n];
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          if (Math.hypot(b[0] - a[0], b[1] - a[1]) * s > 50) {
            const horiz = Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]);
            const w = (horiz ? 26 : 12) / s, h = (horiz ? 12 : 26) / s;
            o += `<rect x="${mx - w / 2}" y="${my - h / 2}" width="${w}" height="${h}" rx="${4 / s}" fill="${RD.BLUE}" stroke="#fff" stroke-width="${2 / s}"/>`;
          }
        }
        r.pts.forEach(p => (o += `<circle cx="${p[0]}" cy="${p[1]}" r="${hr}" fill="#fff" stroke="${RD.ACCENT}" stroke-width="${3.5 / s}"/>`));
      }
    }
    const d = ST.draft;
    if (d && d.type === 'rect' && d.a && d.b) {
      const x = Math.min(d.a[0], d.b[0]), y = Math.min(d.a[1], d.b[1]), w = Math.abs(d.b[0] - d.a[0]), h = Math.abs(d.b[1] - d.a[1]);
      o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(0,70,140,.12)" stroke="${RD.BLUE}" stroke-width="${4 / s}"/>`;
    }
    if (d && d.type === 'poly' && d.pts.length) {
      const pts = d.pts.slice();
      if (d.hover) pts.push(d.hover);
      o += `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="rgba(0,70,140,.08)" stroke="${RD.BLUE}" stroke-width="${4 / s}" stroke-linejoin="round"/>`;
      d.pts.forEach((p, i) => (o += `<circle cx="${p[0]}" cy="${p[1]}" r="${(i === 0 ? 13 : 7) / s}" fill="${i === 0 ? '#27ae60' : '#fff'}" stroke="${RD.BLUE}" stroke-width="${2.5 / s}"/>`));
    }
    if (ST.guides) ST.guides.forEach(g => {
      if (g.x != null) o += `<line x1="${g.x}" y1="-100000" x2="${g.x}" y2="100000" stroke="#e74c3c" stroke-width="${1 / s}" stroke-dasharray="${5 / s} ${4 / s}"/>`;
      if (g.y != null) o += `<line x1="-100000" y1="${g.y}" x2="100000" y2="${g.y}" stroke="#e74c3c" stroke-width="${1 / s}" stroke-dasharray="${5 / s} ${4 / s}"/>`;
    });
    return o;
  }

  const room = (id) => floor.rooms.find(r => r.id === id);
  const item = (id) => floor.items.find(i => i.id === id);
  const opening = (id) => floor.openings.find(o => o.id === id);

  // ----- κούμπωμα (snap) -----
  const GRID = 10;
  const snapG = (v, g = GRID) => Math.round(v / g) * g + 0; // +0: όχι «-0»
  // κουμπώνει σε πλέγμα και σε ευθυγράμμιση με κορυφές άλλων χώρων
  // ownPts: σταθερά σημεία του ίδιου χώρου (από την αρχή του συρσίματος) – ποτέ τα σημεία που κινούνται,
  // αλλιώς η γωνία «κολλάει» στην προηγούμενη θέση της και κινείται με τινάγματα
  function snapPoint(p, excludeRoom, ownPts = []) {
    const tol = 10 / ST.view.s;
    let x = snapG(p[0]), y = snapG(p[1]);
    let bx = null, by = null, dx = tol, dy = tol;
    const test = (q) => {
      if (Math.abs(q[0] - p[0]) < dx) { dx = Math.abs(q[0] - p[0]); bx = q[0]; }
      if (Math.abs(q[1] - p[1]) < dy) { dy = Math.abs(q[1] - p[1]); by = q[1]; }
    };
    floor.rooms.forEach(r => { if (r.id !== excludeRoom) r.pts.forEach(test); });
    ownPts.forEach(test);
    ST.guides = [];
    if (bx != null) { x = bx; ST.guides.push({ x: bx }); }
    if (by != null) { y = by; ST.guides.push({ y: by }); }
    return [x, y];
  }
  // κοντινότερος τοίχος
  function nearestWall(p, maxD) {
    let best = null;
    const containing = floor.rooms.filter(r => G.inside(p, r.pts)).map(r => r.id);
    floor.rooms.forEach(r => {
      const n = r.pts.length;
      for (let i = 0; i < n; i++) {
        const a = r.pts[i], b = r.pts[(i + 1) % n];
        const sd = G.segDist(p, a, b);
        // προτίμηση στους τοίχους του χώρου όπου βρίσκεται το δάχτυλο
        const d = sd.d - (containing.includes(r.id) ? 0.01 : 0) + (containing.length && !containing.includes(r.id) ? maxD * 0.5 : 0);
        if (sd.d < maxD && (!best || d < best.score)) {
          const ex = b[0] - a[0], ey = b[1] - a[1], len = Math.hypot(ex, ey) || 1;
          let nx = -ey / len, ny = ex / len;
          if (!G.inside([sd.x + nx * 3, sd.y + ny * 3], r.pts)) { nx = -nx; ny = -ny; }
          best = { score: d, x: sd.x, y: sd.y, nx, ny, ang: Math.atan2(ey, ex) * 180 / Math.PI, room: r, i, t: sd.t, len };
        }
      }
    });
    return best;
  }
  function placeOnWall(it, p) {
    const s = SY.byId[it.type];
    if (s.mount === 'wall') {
      const w = nearestWall(p, Math.max(16, 26 / ST.view.s));
      if (w) {
        it.x = w.x; it.y = w.y;
        it.rot = Math.round(Math.atan2(w.nx, -w.ny) * 180 / Math.PI);
        return true;
      }
    }
    it.x = snapG(p[0], 5); it.y = snapG(p[1], 5);
    return false;
  }
  function placeOpening(o, p) {
    const w = nearestWall(p, Math.max(20, 40 / ST.view.s));
    if (!w) return false;
    // κράτα το κούφωμα μέσα στα όρια του τοίχου
    const half = Math.min(o.w / 2, w.len / 2);
    const a = w.room.pts[w.i], b = w.room.pts[(w.i + 1) % w.room.pts.length];
    let t = w.t * w.len;
    t = Math.max(half, Math.min(w.len - half, t));
    t = snapG(t, 5);
    o.x = a[0] + (b[0] - a[0]) * (t / w.len); o.y = a[1] + (b[1] - a[1]) * (t / w.len);
    // τοπικό -y προς το εσωτερικό του χώρου
    let ang = w.ang;
    const r = ang * Math.PI / 180;
    const inX = Math.sin(r), inY = -Math.cos(r);
    if (inX * w.nx + inY * w.ny < 0) ang += 180;
    o.rot = ((ang % 360) + 360) % 360;
    return true;
  }

  // ----- εύρεση στοιχείου στο σημείο -----
  function linkPath(l) {
    const a = item(l.a), b = item(l.b);
    if (!a || !b) return null;
    const [ax, ay] = RD.itemCenter(a), [bx, by] = RD.itemCenter(b);
    const mx = (ax + bx) / 2, my = (ay + by) / 2, dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    const k = Math.min(30, len * 0.12);
    const qx = mx - (dy / len) * k, qy = my + (dx / len) * k;
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      pts.push([(1 - t) * (1 - t) * ax + 2 * (1 - t) * t * qx + t * t * bx, (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * qy + t * t * by]);
    }
    return pts;
  }
  function hitTest(p, opts = {}) {
    const s = ST.view.s;
    const hr = Math.max(8, 24 / s);
    // λαβές επιλεγμένου χώρου
    if (!opts.noHandles && ST.sel.kind === 'room') {
      const r = room(ST.sel.id);
      if (r) {
        let bi = -1, bd = hr;
        r.pts.forEach((q, i) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; bi = i; } });
        if (bi >= 0) return { kind: 'vertex', id: r.id, i: bi };
        const n = r.pts.length;
        for (let i = 0; i < n; i++) {
          const a = r.pts[i], b = r.pts[(i + 1) % n];
          if (Math.hypot(b[0] - a[0], b[1] - a[1]) * s <= 50) continue;
          const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          if (Math.hypot(m[0] - p[0], m[1] - p[1]) < hr) return { kind: 'edge', id: r.id, i };
        }
      }
    }
    // σύμβολα
    let best = null, bd = Math.max(14 * RD.SK, 26 / s);
    floor.items.forEach(it => {
      const c = RD.itemCenter(it);
      const d = Math.hypot(c[0] - p[0], c[1] - p[1]);
      if (d < bd) { bd = d; best = { kind: 'item', id: it.id }; }
    });
    if (best) return best;
    if (opts.itemsOnly) return null;
    // κουφώματα
    for (const o of floor.openings) {
      const r = -o.rot * Math.PI / 180;
      const dx = p[0] - o.x, dy = p[1] - o.y;
      const lx = dx * Math.cos(r) - dy * Math.sin(r), ly = dx * Math.sin(r) + dy * Math.cos(r);
      if (Math.abs(lx) < o.w / 2 + 6 && ly < Math.max(12, 18 / s) && ly > -Math.max(o.w * (o.type === 'door' ? 0.9 : 0.4), 18 / s)) return { kind: 'opening', id: o.id };
    }
    // συνδέσεις
    const lt = Math.max(8, 16 / s);
    for (const l of floor.links) {
      const pts = linkPath(l);
      if (!pts) continue;
      for (let i = 0; i < pts.length - 1; i++) if (G.segDist(p, pts[i], pts[i + 1]).d < lt) return { kind: 'link', id: l.id };
    }
    // χώροι (ο μικρότερος που περιέχει το σημείο)
    let rb = null, ra = Infinity;
    floor.rooms.forEach(r => { if (G.inside(p, r.pts)) { const a = Math.abs(G.area(r.pts)); if (a < ra) { ra = a; rb = r; } } });
    if (rb) return { kind: 'room', id: rb.id };
    return null;
  }

  // ================= ΧΕΙΡΙΣΜΟΣ ΑΦΗΣ =================
  const ptrs = new Map();
  let act = null;   // τρέχουσα ενέργεια ενός δαχτύλου
  let pinch = null;
  let lastTap = { t: 0, id: null };

  const local = (e) => { const r = stageEl.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };

  svg.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    svg.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, local(e));
    if (ptrs.size === 2) {
      // ξεκίνημα zoom – ακύρωση τρέχουσας ενέργειας
      if (act && act.moved && act.dirty) commit();
      if (act && act.kind === 'rect') ST.draft = null;
      act = null; ST.guides = null;
      const [a, b] = [...ptrs.values()];
      pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), c: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], v: { ...ST.view } };
      draw();
      return;
    }
    if (ptrs.size > 2) return;
    const sp = local(e), wp = toWorld(...sp);
    act = { start: sp, startW: wp, last: sp, t: Date.now(), moved: false, kind: 'pan', v: { ...ST.view } };
    beginAction(act, wp);
  });
  svg.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) {
      if (e.pointerType === 'mouse' && ST.draft && ST.draft.type === 'poly') { ST.draft.hover = polySnap(toWorld(...local(e))); draw(); }
      return;
    }
    ptrs.set(e.pointerId, local(e));
    if (pinch && ptrs.size >= 2) {
      const [a, b] = [...ptrs.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const s = Math.max(0.05, Math.min(10, pinch.v.s * d / pinch.d));
      // το σημείο κόσμου κάτω από το αρχικό κέντρο ακολουθεί το νέο κέντρο
      const wx = (pinch.c[0] - pinch.v.x) / pinch.v.s, wy = (pinch.c[1] - pinch.v.y) / pinch.v.s;
      ST.view.s = s; ST.view.x = c[0] - wx * s; ST.view.y = c[1] - wy * s;
      drawViewSoon();
      return;
    }
    if (!act) return;
    const sp = local(e);
    if (!act.moved && Math.hypot(sp[0] - act.start[0], sp[1] - act.start[1]) > 7) act.moved = true;
    act.last = sp;
    if (act.moved) moveAction(act, toWorld(...sp), sp);
  });
  const endPtr = e => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.delete(e.pointerId);
    if (pinch) { if (ptrs.size < 2) { pinch = null; draw(); } if (ptrs.size === 0) act = null; return; }
    if (!act) return;
    const a = act; act = null;
    ST.guides = null;
    if (e.type === 'pointercancel') { if (a.dirty) commit(); draw(); return; }
    if (!a.moved && Date.now() - a.t < 600) tapAction(a, a.startW);
    else endAction(a);
    draw();
  };
  svg.addEventListener('pointerup', endPtr);
  svg.addEventListener('pointercancel', endPtr);
  // ροδέλα για υπολογιστή
  svg.addEventListener('wheel', e => {
    e.preventDefault();
    const sp = local(e), k = Math.exp(-e.deltaY * 0.0015);
    const w = toWorld(...sp);
    ST.view.s = Math.max(0.05, Math.min(10, ST.view.s * k));
    ST.view.x = sp[0] - w[0] * ST.view.s; ST.view.y = sp[1] - w[1] * ST.view.s;
    drawViewSoon();
    clearTimeout(ST.wheelT); ST.wheelT = setTimeout(draw, 150);
  }, { passive: false });

  function beginAction(a, wp) {
    const m = ST.mode;
    if (ST.splitting) { a.kind = 'pan'; return; }
    if (m === 'symbol' || m === 'link') {
      // σύρσιμο υπάρχοντος συμβόλου επιτρέπεται και εδώ
      const h = hitTest(wp, { itemsOnly: true, noHandles: true });
      if (h && h.kind === 'item' && m === 'symbol') {
        const it = item(h.id);
        a.kind = 'item'; a.id = h.id; a.off = [it.x - wp[0], it.y - wp[1]];
        return;
      }
      a.kind = 'pan'; return;
    }
    if (m === 'select') {
      const h = hitTest(wp);
      if (h && (h.kind === 'vertex' || h.kind === 'edge')) {
        const r = room(h.id);
        a.kind = h.kind; a.room = r; a.i = h.i; a.orig = clone(r.pts);
      } else if (h && h.kind === 'item') {
        a.kind = 'item'; a.id = h.id; a.hit = h;
        const it = item(h.id); a.orig = { x: it.x, y: it.y, rot: it.rot };
        a.off = [it.x - wp[0], it.y - wp[1]];
      } else if (h && h.kind === 'opening') {
        a.kind = 'opening'; a.id = h.id; a.hit = h;
      } else if (h && h.kind === 'room' && ST.sel.kind === 'room' && ST.sel.id === h.id) {
        a.kind = 'roommove'; a.room = room(h.id); a.hit = h;
        a.orig = clone(a.room.pts);
        // τα σύμβολα & κουφώματα του χώρου ακολουθούν
        a.items = floor.items.filter(it => G.inside(RD.itemCenter(it), a.room.pts) || G.inside([it.x, it.y], a.room.pts)).map(it => ({ it, x: it.x, y: it.y }));
        a.ops = floor.openings.filter(o => a.room.pts.some((q, i) => G.segDist([o.x, o.y], q, a.room.pts[(i + 1) % a.room.pts.length]).d < 4)).map(o => ({ o, x: o.x, y: o.y }));
      } else {
        a.kind = 'pan'; a.hit = h;
      }
    } else if (m === 'room') {
      if (ST.roomTool === 'rect') {
        a.kind = 'rect';
        ST.draft = { type: 'rect', a: snapPoint(wp), b: null };
      } else a.kind = 'pan';
    } else if (m === 'photo') {
      if (floor.photo) { a.kind = 'photo'; a.orig = { x: floor.photo.x, y: floor.photo.y }; }
    } else {
      a.kind = 'pan';
    }
  }
  function moveAction(a, wp, sp) {
    const dW = [wp[0] - a.startW[0], wp[1] - a.startW[1]];
    switch (a.kind) {
      case 'pan':
        ST.view.x = a.v.x + (sp[0] - a.start[0]); ST.view.y = a.v.y + (sp[1] - a.start[1]);
        drawViewSoon();
        return;
      case 'rect':
        ST.draft.b = snapPoint(wp);
        break;
      case 'vertex': dragVertex(a, wp); a.dirty = true; break;
      case 'edge': dragEdge(a, dW); a.dirty = true; break;
      case 'roommove': {
        const dx = snapG(dW[0]), dy = snapG(dW[1]);
        a.room.pts = a.orig.map(p => [p[0] + dx, p[1] + dy]);
        a.items.forEach(o => { o.it.x = o.x + dx; o.it.y = o.y + dy; });
        a.ops.forEach(o => { o.o.x = o.x + dx; o.o.y = o.y + dy; });
        a.dirty = true;
        break;
      }
      case 'item': {
        const it = item(a.id);
        if (ST.sel.id !== it.id) { ST.sel = { kind: 'item', id: it.id }; updateCtx(); }
        const wall = SY.byId[it.type].mount === 'wall';
        placeOnWall(it, wall ? wp : [wp[0] + a.off[0], wp[1] + a.off[1]]);
        a.dirty = true;
        break;
      }
      case 'opening': {
        const o = opening(a.id);
        if (ST.sel.id !== o.id) { ST.sel = { kind: 'opening', id: o.id }; updateCtx(); }
        placeOpening(o, wp); a.dirty = true;
        break;
      }
      case 'photo':
        floor.photo.x = a.orig.x + dW[0]; floor.photo.y = a.orig.y + dW[1]; a.dirty = true;
        break;
    }
    draw();
  }
  function endAction(a) {
    if (a.kind === 'rect') {
      const d = ST.draft; ST.draft = null;
      if (d && d.b) {
        const x0 = Math.min(d.a[0], d.b[0]), y0 = Math.min(d.a[1], d.b[1]), x1 = Math.max(d.a[0], d.b[0]), y1 = Math.max(d.a[1], d.b[1]);
        if (x1 - x0 >= 30 && y1 - y0 >= 30) createRoom([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
        else toast('Σύρε το δάχτυλο διαγώνια για να σχεδιάσεις τον χώρο');
      }
      return;
    }
    if (a.kind === 'vertex' || a.kind === 'edge') {
      a.room.pts = G.simplify(a.room.pts);
    }
    if (a.kind === 'photo') { saveSoon(); return; }
    if (a.dirty) commit();
    updateCtx();
  }
  function tapAction(a, wp) {
    const m = ST.mode;
    if (ST.splitting) { doSplit(wp); return; }
    if (m === 'select') {
      const h = a.hit !== undefined ? a.hit : hitTest(wp);
      const hh = (h && (h.kind === 'vertex' || h.kind === 'edge')) ? null : h;
      if (h && (h.kind === 'vertex' || h.kind === 'edge')) return; // λαβή – τίποτα
      const now = Date.now();
      if (hh && lastTap.id === hh.id && now - lastTap.t < 380) { openProps(); lastTap = { t: 0 }; return; }
      lastTap = { t: now, id: hh && hh.id };
      ST.sel = hh ? { kind: hh.kind, id: hh.id } : {};
      updateCtx();
    } else if (m === 'room' && ST.roomTool === 'poly') {
      polyTap(wp);
    } else if (m === 'symbol') {
      if (!ST.placing) { hint('Διάλεξε πρώτα σύμβολο από την κάτω μπάρα'); return; }
      const it = makeItem(ST.placing);
      placeOnWall(it, wp);
      floor.items.push(it);
      commit(); draw();
      if (navigator.vibrate) navigator.vibrate(15);
    } else if (m === 'link') {
      linkTap(wp);
    } else if (m === 'opening') {
      const h = hitTest(wp, { noHandles: true });
      if (h && h.kind === 'opening') { ST.sel = { kind: 'opening', id: h.id }; updateCtx(); return; }
      const def = SY.OPENINGS.find(o => o.id === ST.openingType);
      const o = { id: uid(), type: def.id, x: 0, y: 0, rot: 0, w: def.w, flip: 0 };
      if (!placeOpening(o, wp)) { toast('Πάτα πάνω σε τοίχο'); return; }
      floor.openings.push(o);
      ST.sel = { kind: 'opening', id: o.id };
      commit(); updateCtx();
    }
  }

  // ----- σύρσιμο γωνίας / τοίχου -----
  function edgeIsHoriz(a, b, fallbackOther) {
    const dx = Math.abs(b[0] - a[0]), dy = Math.abs(b[1] - a[1]);
    if (dx < 0.01 && dy < 0.01) return fallbackOther;
    return dx >= dy;
  }
  function dragVertex(a, wp) {
    const r = a.room, n = r.pts.length, i = a.i, o = a.orig;
    const p = snapPoint(wp, r.id, o.filter((_, k) => k !== i && k !== (i - 1 + n) % n && k !== (i + 1) % n));
    const pts = clone(o);
    if (r.free) { pts[i] = p; }
    else {
      const ip = (i - 1 + n) % n, inx = (i + 1) % n;
      const hp = edgeIsHoriz(o[ip], o[i], !edgeIsHoriz(o[i], o[inx], true));
      const hn = edgeIsHoriz(o[i], o[inx], !hp);
      pts[i] = p;
      if (hp) pts[ip][1] = p[1]; else pts[ip][0] = p[0];
      if (hn) pts[inx][1] = p[1]; else pts[inx][0] = p[0];
    }
    r.pts = pts;
  }
  function dragEdge(a, dW) {
    const r = a.room, n = r.pts.length, i = a.i, j = (i + 1) % n, o = a.orig;
    const pts = clone(o);
    const A = o[i], B = o[j];
    if (!r.free && edgeIsHoriz(A, B, true) && Math.abs(B[1] - A[1]) < 0.01) {
      const fixed = o.filter((_, k) => k !== i && k !== j);
      let ny = snapPoint([A[0], A[1] + dW[1]], r.id, fixed)[1];
      ST.guides = (ST.guides || []).filter(g => g.y != null);
      pts[i][1] = ny; pts[j][1] = ny;
    } else if (!r.free && Math.abs(B[0] - A[0]) < 0.01) {
      const fixed = o.filter((_, k) => k !== i && k !== j);
      let nx = snapPoint([A[0] + dW[0], A[1]], r.id, fixed)[0];
      ST.guides = (ST.guides || []).filter(g => g.x != null);
      pts[i][0] = nx; pts[j][0] = nx;
    } else {
      // λοξός τοίχος: μετακίνηση κάθετα στον τοίχο
      const ex = B[0] - A[0], ey = B[1] - A[1], len = Math.hypot(ex, ey) || 1;
      const nx = -ey / len, ny = ex / len;
      const d = snapG(dW[0] * nx + dW[1] * ny, 5);
      pts[i] = [A[0] + nx * d, A[1] + ny * d]; pts[j] = [B[0] + nx * d, B[1] + ny * d];
    }
    r.pts = pts;
  }

  // ----- σχεδίαση πολυγώνου -----
  function polySnap(wp) {
    const d = ST.draft;
    let p = snapPoint(wp);
    if (d && d.pts.length && d.ortho !== false) {
      const last = d.pts[d.pts.length - 1];
      if (Math.abs(p[0] - last[0]) > Math.abs(p[1] - last[1])) p[1] = last[1]; else p[0] = last[0];
      // κλείσιμο: ευθυγράμμιση με το πρώτο σημείο
      const first = d.pts[0], tol = 16 / ST.view.s;
      if (Math.abs(p[0] - first[0]) < tol && p[1] !== last[1]) p[0] = first[0];
      if (Math.abs(p[1] - first[1]) < tol && p[0] !== last[0]) p[1] = first[1];
    }
    return p;
  }
  function polyTap(wp) {
    if (!ST.draft || ST.draft.type !== 'poly') ST.draft = { type: 'poly', pts: [], ortho: !ST.freeDraw };
    const d = ST.draft;
    const first = d.pts[0];
    if (first && d.pts.length >= 3 && Math.hypot(wp[0] - first[0], wp[1] - first[1]) < 24 / ST.view.s) { finishDraft(true); return; }
    const p = polySnap(wp);
    const last = d.pts[d.pts.length - 1];
    if (last && Math.hypot(p[0] - last[0], p[1] - last[1]) < 5) return;
    d.pts.push(p);
    d.hover = null;
    $('#emptyHelp').classList.remove('show');
    updateCtx(); draw();
  }
  function finishDraft(close) {
    const d = ST.draft;
    ST.draft = null;
    if (close && d && d.type === 'poly' && d.pts.length >= 3) {
      let pts = d.pts.slice();
      if (d.ortho) {
        // τελευταίο κλείσιμο ορθογώνια
        const first = pts[0], last = pts[pts.length - 1];
        if (first[0] !== last[0] && first[1] !== last[1]) {
          const prevH = Math.abs(last[1] - pts[pts.length - 2][1]) < 0.01;
          pts.push(prevH ? [last[0], first[1]] : [first[0], last[1]]);
        }
        pts = G.orthogonalize(pts);
      }
      pts = G.simplify(pts);
      if (pts.length >= 3 && Math.abs(G.area(pts)) > 400) createRoom(pts, !d.ortho);
    }
    updateCtx(); draw(); updateEmpty();
  }
  const ROOM_NAMES = ['Σαλόνι', 'Κουζίνα', 'Σαλόνι-Κουζίνα', 'Τραπεζαρία', 'Υπνοδωμάτιο', 'Μπάνιο', 'WC', 'Διάδρομος', 'Χολ', 'Είσοδος', 'Μπαλκόνι', 'Βεράντα', 'Γραφείο', 'Αποθήκη', 'Λεβητοστάσιο', 'Πλυσταριό', 'Ντουλάπα', 'Γκαράζ', 'Κλιμακοστάσιο', 'Αυλή'];
  function nextNumbered(base) {
    let n = 1;
    const names = floor.rooms.map(r => r.name);
    while (names.includes(`${base} ${n}`)) n++;
    return `${base} ${n}`;
  }
  function createRoom(pts, free = false) {
    const r = { id: uid(), name: nextNumbered('Χώρος'), pts, free };
    floor.rooms.push(r);
    ST.sel = { kind: 'room', id: r.id };
    commit();
    draw();
    roomNameSheet(r, true);
  }
  function roomNameSheet(r, isNew) {
    const chips = [nextNumbered('Δωμάτιο'), ...ROOM_NAMES];
    const b = Sheet.open(`<h3>${isNew ? 'Όνομα νέου χώρου' : 'Όνομα χώρου'}</h3>
      <label class="fld"><input id="rnIn" value="${esc(r.name)}"></label>
      <div class="chips" style="margin:4px 0 14px">${chips.map(c => `<button class="chip" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <button class="btn primary" style="width:100%" data-a="ok">OK</button>`);
    const inp = b.querySelector('#rnIn');
    const apply = (v) => { r.name = v.trim() || r.name; commit(); draw(); Sheet.close(); };
    b.querySelectorAll('[data-v]').forEach(c => c.onclick = () => apply(c.dataset.v));
    b.querySelector('[data-a=ok]').onclick = () => apply(inp.value);
    inp.onkeydown = e => { if (e.key === 'Enter') apply(inp.value); };
    if (!isNew) setTimeout(() => inp.select(), 250);
  }

  const BASIC = ['sw1', 'sw2', 'sw_ar', 'sock', 'sock2', 'sock_wp', 'lamp', 'wall_lamp', 'spot'];
  function makeItem(type) {
    const it = { id: uid(), type, x: 0, y: 0, rot: 0, circuit: '', height: '', note: '' };
    const s = SY.byId[type];
    if (s.labelDefault) it.label = nextPanelLabel(s);
    if (ST.lastCircuit && ST.lastCircuit[type]) it.circuit = ST.lastCircuit[type];
    return it;
  }

  // ----- σύνδεση -----
  function linkTap(wp) {
    const h = hitTest(wp, { itemsOnly: true, noHandles: true });
    if (!h) { ST.linkFrom = null; updateCtx(); draw(); return; }
    const it = item(h.id);
    if (!ST.linkFrom) { ST.linkFrom = it.id; updateCtx(); draw(); return; }
    if (ST.linkFrom === it.id) { ST.linkFrom = null; updateCtx(); draw(); return; }
    const a = item(ST.linkFrom), b = it;
    const ka = SY.byId[a.type].kind, kb = SY.byId[b.type].kind;
    const lampLamp = ka === 'lamp' && kb === 'lamp';
    if (!lampLamp && (ka === 'switch') === (kb === 'switch')) {
      // δεν ενώνονται (π.χ. διακόπτης με διακόπτη): αλλάζει απλώς η αφετηρία
      ST.linkFrom = it.id; updateCtx(); draw(); return;
    }
    const first = lampLamp ? a : (ka === 'switch' ? a : b), second = first === a ? b : a;
    const ex = floor.links.find(l => (l.a === a.id && l.b === b.id) || (l.a === b.id && l.b === a.id));
    if (ex) { floor.links = floor.links.filter(l => l !== ex); toast('Η σύνδεση αφαιρέθηκε'); }
    else { floor.links.push({ id: uid(), a: first.id, b: second.id }); if (navigator.vibrate) navigator.vibrate(20); }
    if (lampLamp) ST.linkFrom = b.id;              // αλυσίδα: συνεχίζει από το τελευταίο φωτιστικό
    else if (ka === 'switch') ST.linkFrom = a.id;  // από διακόπτη: ενώνεις κι άλλα φωτιστικά
    else { ST.linkFrom = null; if (!ex) toast('Η σειρά φωτιστικών κατέληξε στον διακόπτη'); } // η αλυσίδα έκλεισε
    commit(); updateCtx(); draw();
  }

  // ================= ΛΕΙΤΟΥΡΓΙΕΣ / ΜΠΑΡΕΣ =================
  function setMode(m) {
    if (ST.draft && m !== 'room') finishDraft(false);
    ST.mode = m;
    if (m !== 'link') ST.linkFrom = null;
    if ((m !== 'select' && m !== 'symbol' && m !== 'opening') || (m !== 'select' && ST.sel.kind === 'room')) ST.sel = {};
    $$('#modebar button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
    updateCtx(); draw();
    const hints = {
      room: ST.roomTool === 'rect' ? 'Σύρε διαγώνια για ορθογώνιο χώρο' : 'Πάτα τις γωνίες του χώρου με τη σειρά',
      symbol: ST.placing ? 'Πάτα όπου θες να μπει: ' + SY.byId[ST.placing].name : 'Διάλεξε σύμβολο από την κάτω μπάρα',
      link: 'Διακόπτης → φωτιστικά, ή φωτιστικά σε σειρά → διακόπτης',
      opening: 'Πάτα πάνω σε τοίχο για να μπει το κούφωμα',
      photo: 'Σύρε τη φωτογραφία για να τη μετακινήσεις',
    };
    hint(hints[m] || '');
  }
  let hintT = 0;
  function hint(t, ms = 2600) {
    const h = $('#hint');
    if (!t) { h.classList.remove('show'); return; }
    h.textContent = t; h.classList.add('show');
    clearTimeout(hintT); hintT = setTimeout(() => h.classList.remove('show'), ms);
  }
  $$('#modebar button').forEach(b => b.onclick = () => {
    const m = b.dataset.mode;
    if (m === 'symbol' && ST.mode === 'symbol') { symbolPalette(); return; }
    setMode(m);
  });

  function chip(html, a, cls = '') { return `<button class="chip ${cls}" data-a="${a}">${html}</button>`; }
  function updateCtx() {
    const bar = $('#ctxbar');
    let h = '';
    const m = ST.mode, sel = ST.sel;
    if (m === 'room') {
      const d = ST.draft;
      if (d && d.type === 'poly' && d.pts.length) {
        h = chip(IC.undo + 'Σημείο', 'polyundo') + chip(IC.check + 'Κλείσιμο', 'polyclose', d.pts.length >= 3 ? 'ok' : '') + chip(IC.x + 'Ακύρωση', 'polycancel', 'warn') +
          `<span class="ctx-text">${d.pts.length} γωνίες</span>`;
      } else {
        h = chip(IC.rect + 'Ορθογώνιο', 'tool-rect', ST.roomTool === 'rect' ? 'on' : '') + chip(IC.poly + 'Γωνία-γωνία', 'tool-poly', ST.roomTool === 'poly' ? 'on' : '');
        if (ST.roomTool === 'poly') h += chip(IC.square + (ST.freeDraw ? 'Ελεύθερο' : '90°'), 'freedraw', ST.freeDraw ? '' : 'on');
        if (floor.photo) h += chip(IC.image + 'Φωτογραφία', 'photo');
      }
    } else if (m === 'symbol') {
      // σταθερά βασικά σύμβολα (δεν αλλάζουν θέση) + «Όλα» + όσα άλλα χρησιμοποιήθηκαν πρόσφατα
      const symChip = id => `<button class="chip sym ${ST.placing === id ? 'on' : ''}" data-sym="${id}" aria-label="${esc(SY.byId[id].name)}">${symIcon(id, 34)}</button>`;
      h = BASIC.map(symChip).join('') + chip(IC.list + 'Όλα', 'palette');
      h += ST.recent.filter(id => SY.byId[id] && !BASIC.includes(id)).slice(0, 6).map(symChip).join('');
    } else if (m === 'link') {
      const f = ST.linkFrom && item(ST.linkFrom);
      h = `<span class="ctx-text">${f ? `Από: <b>${esc(SY.byId[f.type].name)}</b>. ${SY.byId[f.type].kind === 'switch' ? 'Πάτα φωτιστικά για σύνδεση.' : 'Πάτα επόμενο φωτιστικό ή τον διακόπτη για να κλείσει η σειρά.'}` : 'Πάτα διακόπτη → φωτιστικά, ή φωτιστικό → φωτιστικό → … → διακόπτη.'}</span>`;
      if (f) h += chip(IC.x + 'Τέλος', 'linkdone');
    } else if (m === 'opening') {
      if (sel.kind === 'opening') h = openingChips() + `<span style="width:1px;align-self:stretch;background:#e0e6ee;flex:none"></span>`;
      h += SY.OPENINGS.map(o => `<button class="chip ${ST.openingType === o.id ? 'on' : ''}" data-op="${o.id}">${esc(o.name)}</button>`).join('');
    } else if (m === 'photo') {
      h = `<span class="ctx-text">Σύρε για μετακίνηση. Μέγεθος/περιστροφή από τις ρυθμίσεις.</span>` + chip(IC.gear + 'Ρυθμίσεις', 'photoset') + chip(IC.check + 'Τέλος', 'photodone', 'ok');
    } else if (m === 'select') {
      if (sel.kind === 'item') h = itemChips();
      else if (sel.kind === 'room') {
        h = chip(IC.edit + 'Όνομα', 'rname') + chip(IC.square + 'Ίσιωμα', 'rsquare') + chip(IC.split + 'Σπάσιμο τοίχου', 'rsplit') + chip(IC.gear, 'props') + chip(IC.copy, 'rdup') + chip(IC.trash, 'rdel', 'warn');
      } else if (sel.kind === 'opening') h = openingChips();
      else if (sel.kind === 'link') h = `<span class="ctx-text">Σύνδεση διακόπτη – φωτιστικού</span>` + chip(IC.trash + 'Διαγραφή', 'ldel', 'warn');
      else h = `<span class="ctx-text" style="color:#6b7788">Πάτα χώρο ή σύμβολο για επιλογή. Σύρε σύμβολο για μετακίνηση. Δύο δάχτυλα: ζουμ.</span>`;
    }
    bar.innerHTML = h;
    bar.classList.toggle('show', !!h);
    requestAnimationFrame(() => { const r = stageEl.getBoundingClientRect(); if (Math.abs(r.height - stageH) > 1 || Math.abs(r.width - stageW) > 1) resizeStage(); });
  }
  function itemChips() {
    return chip(IC.gear + 'Ιδιότητες', 'props', 'on') + chip(IC.rot, 'irot') + chip(IC.copy, 'idup') + chip(IC.link, 'ilink') + chip(IC.trash, 'idel', 'warn');
  }
  function openingChips() {
    return chip(IC.flip, 'oflipx') + chip(IC.flipv, 'oflipy') + chip(IC.minus, 'ow-') + chip(IC.plus, 'ow+') + chip(IC.trash, 'odel', 'warn');
  }
  $('#ctxbar').addEventListener('click', e => {
    const sb = e.target.closest('[data-sym]');
    if (sb) { pickSymbol(sb.dataset.sym); return; }
    const ob = e.target.closest('[data-op]');
    if (ob) { ST.openingType = ob.dataset.op; ST.sel = {}; updateCtx(); hint('Πάτα πάνω σε τοίχο'); return; }
    const b = e.target.closest('[data-a]');
    if (!b) return;
    const a = b.dataset.a;
    const sel = ST.sel;
    const it = sel.kind === 'item' ? item(sel.id) : null;
    const r = sel.kind === 'room' ? room(sel.id) : null;
    const o = sel.kind === 'opening' ? opening(sel.id) : null;
    switch (a) {
      case 'tool-rect': ST.roomTool = 'rect'; finishDraft(false); setMode('room'); break;
      case 'tool-poly': ST.roomTool = 'poly'; setMode('room'); break;
      case 'freedraw': ST.freeDraw = !ST.freeDraw; updateCtx(); if (ST.freeDraw) hint('Ελεύθερο σχήμα: λοξοί τοίχοι επιτρέπονται'); break;
      case 'polyundo': if (ST.draft) { ST.draft.pts.pop(); if (!ST.draft.pts.length) ST.draft = null; updateCtx(); draw(); } break;
      case 'polyclose': finishDraft(true); break;
      case 'polycancel': finishDraft(false); break;
      case 'photo': photoSheet(); break;
      case 'palette': symbolPalette(); break;
      case 'linkdone': ST.linkFrom = null; updateCtx(); draw(); break;
      case 'photoset': photoSheet(); break;
      case 'photodone': setMode('select'); break;
      case 'props': openProps(); break;
      case 'irot': if (it) { it.rot = ((it.rot || 0) + 90) % 360; commit(); draw(); } break;
      case 'idup': if (it) duplicateItem(it); break;
      case 'ilink': if (it) { setMode('link'); ST.linkFrom = it.id; updateCtx(); draw(); } break;
      case 'idel': if (it) deleteItem(it); break;
      case 'rname': if (r) roomNameSheet(r, false); break;
      case 'rsquare': if (r) { squareRoom(r); toast('Ο χώρος ισιώθηκε στις 90°'); } break;
      case 'rsplit': if (r) splitPrompt(r); break;
      case 'rdup': if (r) {
        const c = clone(r); c.id = uid(); c.name = r.name + ' (2)';
        const bb = G.bbox(r.pts); c.pts = c.pts.map(p => [p[0] + bb.w + 20, p[1]]);
        floor.rooms.push(c); ST.sel = { kind: 'room', id: c.id }; commit(); draw();
      } break;
      case 'rdel': if (r) deleteRoom(r); break;
      case 'oflipx': if (o) { o.flip ^= 1; commit(); draw(); } break;
      case 'oflipy': if (o) { o.flip ^= 2; commit(); draw(); } break;
      case 'ow-': if (o) { o.w = Math.max(40, o.w - 10); commit(); draw(); } break;
      case 'ow+': if (o) { o.w = Math.min(400, o.w + 10); commit(); draw(); } break;
      case 'odel': if (o) { floor.openings = floor.openings.filter(x => x !== o); ST.sel = {}; commit(); updateCtx(); draw(); } break;
      case 'ldel': floor.links = floor.links.filter(l => l.id !== sel.id); ST.sel = {}; commit(); updateCtx(); draw(); break;
    }
  });

  function duplicateItem(it) {
    const c = clone(it); c.id = uid();
    const s = SY.byId[c.type];
    if (s.mount === 'wall') {
      // δίπλα, πάνω στον ίδιο τοίχο
      const r = (c.rot || 0) * Math.PI / 180;
      c.x += Math.cos(r) * 36; c.y += Math.sin(r) * 36;
    } else { c.x += 36; }
    if (s.kind === 'panel') c.label = nextPanelLabel(s);
    floor.items.push(c); ST.sel = { kind: 'item', id: c.id }; commit(); updateCtx(); draw();
  }
  function squareRoom(r) {
    r.pts = G.simplify(G.orthogonalize(r.pts).map(p => [snapG(p[0]), snapG(p[1])]));
    r.free = false; commit(); draw();
  }
  function deleteItem(it) {
    floor.items = floor.items.filter(x => x !== it);
    floor.links = floor.links.filter(l => l.a !== it.id && l.b !== it.id);
    ST.sel = {}; commit(); updateCtx(); draw();
  }
  async function deleteRoom(r) {
    const inside = floor.items.filter(it => G.inside(RD.itemCenter(it), r.pts));
    let withItems = false;
    if (inside.length) {
      const b = await new Promise(res => {
        const s = Sheet.open(`<h3>Διαγραφή «${esc(r.name)}»</h3><p class="note">Ο χώρος έχει ${inside.length} σύμβολα.</p>
          <div class="btn-col"><button class="btn" data-v="room">Μόνο ο χώρος (τα σύμβολα μένουν)</button>
          <button class="btn danger" data-v="all">Χώρος και σύμβολα</button><button class="btn" data-v="no">Άκυρο</button></div>`, { onClose: () => res('no') });
        s.querySelectorAll('[data-v]').forEach(x => x.onclick = () => { Sheet.onClose = null; Sheet.close(); res(x.dataset.v); });
      });
      if (b === 'no') return;
      withItems = b === 'all';
    }
    floor.rooms = floor.rooms.filter(x => x !== r);
    if (withItems) {
      const ids = new Set(inside.map(i => i.id));
      floor.items = floor.items.filter(i => !ids.has(i.id));
      floor.links = floor.links.filter(l => !ids.has(l.a) && !ids.has(l.b));
    }
    ST.sel = {}; commit(); updateCtx(); draw();
  }
  // σπάσιμο τοίχου: εισάγει «σκαλοπάτι» ώστε να γίνει σχήμα Γ
  function splitPrompt(r) {
    if (ST.mode !== 'select') setMode('select');
    ST.sel = { kind: 'room', id: r.id };
    ST.splitting = r.id;
    draw();
    hint('Πάτα στο σημείο του τοίχου που θες να σπάσει', 4000);
  }
  function doSplit(wp) {
    const r = room(ST.splitting);
    ST.splitting = null;
    if (!r) return;
    {
      const n = r.pts.length;
      let best = null;
      for (let i = 0; i < n; i++) {
        const sd = G.segDist(wp, r.pts[i], r.pts[(i + 1) % n]);
        if (!best || sd.d < best.d) best = Object.assign(sd, { i });
      }
      if (!best || best.d > 40 / ST.view.s || best.t < 0.05 || best.t > 0.95) { toast('Πάτα πάνω σε τοίχο του επιλεγμένου χώρου'); return; }
      const A = r.pts[best.i], B = r.pts[(best.i + 1) % n];
      const horiz = Math.abs(B[1] - A[1]) < Math.abs(B[0] - A[0]);
      const P = horiz ? [snapG(best.x), A[1]] : [A[0], snapG(best.y)];
      r.pts.splice(best.i + 1, 0, P.slice(), P.slice());
      ST.sel = { kind: 'room', id: r.id };
      commit(); updateCtx(); draw();
      hint('Τώρα σύρε το μπλε πλαίσιο του νέου τμήματος τοίχου', 4000);
    }
  }

  // ----- παλέτα συμβόλων -----
  function pickSymbol(id) {
    ST.placing = id;
    ST.recent = [id, ...ST.recent.filter(x => x !== id)].slice(0, 10);
    try { localStorage.setItem('epc_recent', JSON.stringify(ST.recent)); } catch (e) { }
    if (ST.mode !== 'symbol') setMode('symbol');
    ST.sel = {};
    updateCtx(); draw();
    hint(`Πάτα για να βάλεις: ${SY.byId[id].name}`);
  }
  function symbolPalette() {
    let cat = ST.palCat || SY.CAT_ORDER[0];
    const b = Sheet.open(`<input class="sym-search" id="symQ" type="search" placeholder="Αναζήτηση συμβόλου…">
      <div class="cat-tabs">${SY.CAT_ORDER.map(c => `<button class="chip ${c === cat ? 'on' : ''}" data-cat="${esc(c)}">${symIcon(SY.CAT_ICON[c], 30)}${esc(c)}</button>`).join('')}</div>
      <div id="symBody"></div>`, { tall: true });
    const body = b.querySelector('#symBody');
    const tile = (s) => `<button class="sym-tile ${ST.placing === s.id ? 'on' : ''}" data-id="${s.id}">${symIcon(s.id, 50)}<span>${esc(s.name)}</span></button>`;
    const renderCat = () => {
      const q = b.querySelector('#symQ').value.trim().toLowerCase();
      let list = SY.list;
      if (q) {
        const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        list = list.filter(s => norm(s.name + ' ' + s.sub + ' ' + s.cat).includes(norm(q)));
        body.innerHTML = list.length ? `<div class="sym-grid">${list.map(tile).join('')}</div>` : '<p class="note">Δεν βρέθηκε σύμβολο.</p>';
        return;
      }
      const recent = ST.recent.filter(id => SY.byId[id]).slice(0, 6);
      let h = '';
      if (recent.length) h += `<div class="sub-title">Πρόσφατα</div><div class="sym-grid">${recent.map(id => tile(SY.byId[id])).join('')}</div>`;
      const subs = [...new Set(list.filter(s => s.cat === cat).map(s => s.sub))];
      subs.forEach(sub => {
        h += `<div class="sub-title">${esc(sub)}</div><div class="sym-grid">${list.filter(s => s.cat === cat && s.sub === sub).map(tile).join('')}</div>`;
      });
      body.innerHTML = h;
    };
    b.querySelectorAll('[data-cat]').forEach(c => c.onclick = () => {
      cat = ST.palCat = c.dataset.cat;
      b.querySelectorAll('[data-cat]').forEach(x => x.classList.toggle('on', x === c));
      b.querySelector('#symQ').value = '';
      renderCat();
    });
    b.querySelector('#symQ').addEventListener('input', renderCat);
    body.addEventListener('click', e => {
      const t = e.target.closest('[data-id]');
      if (!t) return;
      const replaceId = ST.replacing;
      ST.replacing = null;
      Sheet.close();
      if (replaceId) {
        const it = item(replaceId);
        if (it) { it.type = t.dataset.id; const s = SY.byId[it.type]; if (s.labelDefault && !it.label) it.label = nextPanelLabel(s); placeOnWall(it, RD.itemCenter(it)); commit(); draw(); updateCtx(); }
        return;
      }
      pickSymbol(t.dataset.id);
    });
    renderCat();
  }

  function nextPanelLabel(s) {
    const base = (s.labelDefault || '').replace(/\d+$/, '');
    const used = new Set();
    cur.floors.forEach(f => f.items.forEach(i => i.label && used.add(i.label)));
    if (s.id === 'panel') return used.has('ΓΠ') ? nextNum('ΓΠ', used) : 'ΓΠ';
    return nextNum(base, used);
  }
  function nextNum(base, used) { let n = 1; while (used.has(base + n)) n++; return base + n; }

  // ----- ύψη προεπιλογής (διακόπτες 120, πρίζες 40) -----
  function hKind(type) {
    const s = SY.byId[type];
    if (!s) return '';
    if (s.cat === 'Διακόπτες' && s.mount === 'wall') return 'switch';
    if ((s.kind === 'socket' && s.mount === 'wall') || s.sub === 'Πρίζες ασθενών') return 'socket';
    return '';
  }
  function defHeight(type) {
    const k = hKind(type), v = cur.view || {};
    if (k === 'switch') return String(v.hSwitch || '120');
    if (k === 'socket') return String(v.hSocket || '40');
    return '';
  }

  // ----- ιδιότητες -----
  function allCircuits() {
    const set = new Set();
    cur.floors.forEach(f => f.items.forEach(i => i.circuit && set.add(i.circuit)));
    return [...set].sort((a, b) => a.localeCompare(b, 'el', { numeric: true }));
  }
  function suggestCircuits(kind) {
    const used = allCircuits();
    const next = (p) => { let n = 1; while (used.includes(p + n)) n++; return p + n; };
    const sug = [];
    if (kind === 'lamp' || kind === 'switch') sug.push(next('Φ'));
    if (kind === 'socket') sug.push(next('Ρ'));
    if (kind === 'appliance') sug.push(next('Γ'));
    return [...new Set([...used, ...sug])];
  }
  function openProps() {
    const sel = ST.sel;
    if (sel.kind === 'item') itemProps(item(sel.id));
    else if (sel.kind === 'room') roomProps(room(sel.id));
    else if (sel.kind === 'opening') openingProps(opening(sel.id));
  }
  function itemProps(it) {
    if (!it) return;
    const s = SY.byId[it.type];
    const isPanel = s.kind === 'panel';
    const circs = suggestCircuits(s.kind);
    const heights = ['40', '60', '110', '120', '150', '180', '220', 'Οροφή'];
    const dh = defHeight(it.type);
    const links = floor.links.filter(l => l.a === it.id || l.b === it.id).length;
    const b = Sheet.open(`<h3>${symIcon(it.type, 40)}<span>${esc(s.name)}<br><small style="color:#6b7788;font-weight:600;font-size:13px">${esc(s.cat)} · ${esc(s.sub)}${links ? ` · ${links} συνδέσεις` : ''}</small></span></h3>
      ${isPanel ? `<label class="fld"><span>Ονομασία πίνακα</span><input id="ipLabel" value="${esc(it.label || '')}" placeholder="π.χ. ΓΠ, ΥΠ1, ΥΠ κουζίνας"></label>` : `
      <label class="fld"><span>Κύκλωμα (αριθμός ασφάλειας)</span><input id="ipCirc" value="${esc(it.circuit || '')}" placeholder="π.χ. Φ1, Ρ3, Κ1" autocapitalize="characters"></label>
      <div class="chips" style="margin:-4px 0 12px">${circs.map(c => `<button class="chip" data-c="${esc(c)}">${esc(c)}</button>`).join('')}<button class="chip" data-c="">Κανένα</button></div>`}
      <label class="fld"><span>Ύψος τοποθέτησης (εκ.)</span><input id="ipH" value="${esc(it.height || '')}" inputmode="numeric" placeholder="${dh ? 'Προεπιλογή: ' + dh + ' (κενό = προεπιλογή)' : 'π.χ. 30'}"></label>
      <div class="chips" style="margin:-4px 0 12px">${heights.map(h => `<button class="chip" data-h="${h}">${h}</button>`).join('')}</div>
      <label class="fld"><span>Σημείωση</span><input id="ipNote" value="${esc(it.note || '')}" placeholder="π.χ. πάνω από πάγκο, για ψυγείο"></label>
      <div class="act-row">
        <button class="act" data-a="rot">${IC.rot}Περιστροφή</button>
        <button class="act" data-a="swap">${IC.swap}Αλλαγή</button>
        <button class="act" data-a="dup">${IC.copy}Αντιγραφή</button>
        <button class="act danger" data-a="del">${IC.trash}Διαγραφή</button>
      </div>
      <button class="btn primary" style="width:100%;margin-top:14px" data-a="ok">OK</button>`);
    const apply = () => {
      if (!item(it.id)) return;
      const before = JSON.stringify([it.label, it.circuit, it.height, it.note]);
      if (isPanel) it.label = b.querySelector('#ipLabel').value.trim();
      else it.circuit = b.querySelector('#ipCirc').value.trim().toUpperCase();
      it.height = b.querySelector('#ipH').value.trim();
      if (it.height && it.height === dh) it.height = ''; // ίδιο με την προεπιλογή: δεν γράφεται στο σχέδιο
      it.note = b.querySelector('#ipNote').value.trim();
      ST.lastCircuit = ST.lastCircuit || {};
      if (!isPanel) ST.lastCircuit[it.type] = it.circuit;
      if (before !== JSON.stringify([it.label, it.circuit, it.height, it.note])) commit();
      draw();
    };
    b.querySelectorAll('[data-c]').forEach(c => c.onclick = () => { b.querySelector('#ipCirc').value = c.dataset.c; b.querySelectorAll('[data-c]').forEach(x => x.classList.toggle('on', x === c)); });
    b.querySelectorAll('[data-h]').forEach(c => c.onclick = () => { b.querySelector('#ipH').value = c.dataset.h; b.querySelectorAll('[data-h]').forEach(x => x.classList.toggle('on', x === c)); });
    b.querySelector('[data-a=rot]').onclick = () => { it.rot = ((it.rot || 0) + 90) % 360; commit(); draw(); };
    b.querySelector('[data-a=swap]').onclick = () => { apply(); ST.replacing = it.id; Sheet.close(); setTimeout(symbolPalette, 260); };
    b.querySelector('[data-a=dup]').onclick = () => { Sheet.close(); duplicateItem(it); };
    b.querySelector('[data-a=del]').onclick = () => { Sheet.onClose = null; Sheet.close(); deleteItem(it); };
    Sheet.onClose = () => apply();
    b.querySelector('[data-a=ok]').onclick = () => { Sheet.close(); };
  }
  function roomProps(r) {
    if (!r) return;
    const inside = floor.items.filter(it => G.inside(RD.itemCenter(it), r.pts));
    const counts = {};
    inside.forEach(i => (counts[i.type] = (counts[i.type] || 0) + 1));
    const b = Sheet.open(`<h3>${esc(r.name)}</h3>
      <div class="menu-list">
        <button class="menu-item" data-a="name">${IC.edit}<span class="grow">Μετονομασία</span></button>
        <button class="menu-item" data-a="square">${IC.square}<span class="grow">Ίσιωμα στις 90°<small>Ευθυγραμμίζει όλους τους τοίχους</small></span></button>
        <button class="menu-item" data-a="split">${IC.split}<span class="grow">Σπάσιμο τοίχου<small>Για χώρους σε σχήμα Γ</small></span></button>
        <label class="menu-item"><input type="checkbox" id="rpFree" ${r.free ? 'checked' : ''} style="width:22px;height:22px;accent-color:#00468c"><span class="grow">Λοξοί τοίχοι<small>Οι γωνίες κινούνται ελεύθερα (σπάνιες περιπτώσεις)</small></span></label>
        <button class="menu-item danger" data-a="del">${IC.trash}<span class="grow">Διαγραφή χώρου</span></button>
      </div>
      ${inside.length ? `<h4>Σύμβολα στον χώρο (${inside.length})</h4><div class="note">${Object.entries(counts).map(([t, n]) => `${n}× ${esc(SY.byId[t].name)}`).join('<br>')}</div>` : ''}`);
    b.querySelector('[data-a=name]').onclick = () => roomNameSheet(r, false);
    b.querySelector('[data-a=square]').onclick = () => { Sheet.close(); squareRoom(r); toast('Ο χώρος ισιώθηκε στις 90°'); };
    b.querySelector('[data-a=split]').onclick = () => { Sheet.close(); splitPrompt(r); };
    b.querySelector('#rpFree').onchange = (e) => { r.free = e.target.checked; commit(); };
    b.querySelector('[data-a=del]').onclick = () => { Sheet.close(); setTimeout(() => deleteRoom(r), 250); };
  }
  function openingProps(o) {
    if (!o) return;
    const b = Sheet.open(`<h3>${esc(SY.OPENINGS.find(x => x.id === o.type).name)}</h3>
      <div class="chips">${SY.OPENINGS.map(x => `<button class="chip ${x.id === o.type ? 'on' : ''}" data-t="${x.id}">${esc(x.name)}</button>`).join('')}</div>
      <div class="slider-row"><label><span>Πλάτος</span><span id="opW">${o.w}</span></label><input type="range" min="40" max="400" step="5" value="${o.w}" id="opWr"></div>
      <div class="act-row"><button class="act" data-a="fx">${IC.flip}Μεντεσές</button><button class="act" data-a="fy">${IC.flipv}Μέσα/έξω</button><span></span><button class="act danger" data-a="del">${IC.trash}Διαγραφή</button></div>`, { onClose: () => commit() });
    b.querySelectorAll('[data-t]').forEach(c => c.onclick = () => { o.type = c.dataset.t; b.querySelectorAll('[data-t]').forEach(x => x.classList.toggle('on', x === c)); draw(); });
    b.querySelector('#opWr').oninput = (e) => { o.w = +e.target.value; b.querySelector('#opW').textContent = o.w; draw(); };
    b.querySelector('[data-a=fx]').onclick = () => { o.flip ^= 1; draw(); };
    b.querySelector('[data-a=fy]').onclick = () => { o.flip ^= 2; draw(); };
    b.querySelector('[data-a=del]').onclick = () => { floor.openings = floor.openings.filter(x => x !== o); ST.sel = {}; Sheet.close(); updateCtx(); draw(); };
  }

  // ================= ΜΕΝΟΥ ΕΠΕΞΕΡΓΑΣΙΑΣ =================
  $('#edMenuBtn').onclick = () => {
    const v = cur.view;
    const b = Sheet.open(`<h3>${esc(floor.name)}</h3><div class="menu-list">
      <button class="menu-item" data-a="photo">${IC.camera}<span class="grow">Φωτογραφία χειρόγραφου<small>${floor.photo ? 'Ρυθμίσεις, αντικατάσταση, απόκρυψη' : 'Λήψη ή επιλογή από τη συλλογή'}</small></span></button>
      <button class="menu-item" data-a="circ">${IC.list}<span class="grow">Κυκλώματα<small>Περιγραφή και πίνακας κάθε κυκλώματος</small></span></button>
      <button class="menu-item" data-a="pdf">${IC.pdf}<span class="grow">Εξαγωγή PDF<small>Α4 με υπόμνημα και κυκλώματα</small></span></button>
      <button class="menu-item" data-a="png">${IC.image}<span class="grow">Εξαγωγή εικόνας</span></button>
      <button class="menu-item" data-a="square">${IC.square}<span class="grow">Ίσιωμα όλων των χώρων<small>Όλοι οι τοίχοι στις 90° και στο πλέγμα</small></span></button>
    </div>
    <h4>Εμφάνιση</h4>
    <label class="switch-row"><input type="checkbox" data-v="circuits" ${v.circuits !== false ? 'checked' : ''}><span>Αριθμοί κυκλωμάτων</span></label>
    <label class="switch-row"><input type="checkbox" data-v="heights" ${v.heights !== false ? 'checked' : ''}><span>Ύψη τοποθέτησης</span></label>
    <label class="switch-row"><input type="checkbox" data-v="notes" ${v.notes !== false ? 'checked' : ''}><span>Σημειώσεις</span></label>
    <label class="switch-row"><input type="checkbox" data-v="grid" ${v.grid !== false ? 'checked' : ''}><span>Πλέγμα</span></label>
    <div class="slider-row"><label><span>Μέγεθος συμβόλων</span><span id="ssV">${Math.round((v.symScale || 1.3) * 100)}%</span></label><input type="range" min="60" max="250" step="5" value="${Math.round((v.symScale || 1.3) * 100)}" id="ssR"></div>
    <h4>Ύψη προεπιλογής (εκ.)</h4>
    <div class="row2"><label class="fld"><span>Διακόπτες</span><input id="hSw" inputmode="numeric" value="${esc(v.hSwitch || '120')}"></label>
    <label class="fld"><span>Πρίζες</span><input id="hSo" inputmode="numeric" value="${esc(v.hSocket || '40')}"></label></div>
    <p class="note" style="margin-top:0">Δεν γράφονται δίπλα σε κάθε σύμβολο. Μπαίνουν μία φορά στο υπόμνημα του PDF. Γράφεται ύψος μόνο όπου το αλλάξεις.</p>`);
    b.querySelector('#hSw').oninput = e => { v.hSwitch = e.target.value.trim() || '120'; saveSoon(); };
    b.querySelector('#hSo').oninput = e => { v.hSocket = e.target.value.trim() || '40'; saveSoon(); };
    b.querySelector('#ssR').oninput = e => { v.symScale = e.target.value / 100; RD.setSymScale(v.symScale); b.querySelector('#ssV').textContent = e.target.value + '%'; saveSoon(); draw(); };
    b.querySelector('[data-a=photo]').onclick = () => (floor.photo ? photoSheet() : photoSource());
    b.querySelector('[data-a=circ]').onclick = () => circuitsSheet();
    b.querySelector('[data-a=pdf]').onclick = () => pdfSheet(floor.id);
    b.querySelector('[data-a=png]').onclick = async () => {
      Sheet.close(); busy(true, 'Δημιουργία εικόνας…');
      try { const blob = await EX.exportPNG(cur, floor, cur.view); busy(false); deliver(blob, `${safeName(cur.name)}_${safeName(floor.name)}.png`); }
      catch (e) { busy(false); toast('Σφάλμα εξαγωγής'); }
    };
    b.querySelector('[data-a=square]').onclick = () => {
      floor.rooms.forEach(r => { if (!r.free) r.pts = G.simplify(G.orthogonalize(r.pts).map(p => [snapG(p[0]), snapG(p[1])])); });
      commit(); draw(); Sheet.close(); toast('Όλοι οι χώροι ισιώθηκαν');
    };
    b.querySelectorAll('[data-v]').forEach(c => c.onchange = () => { cur.view[c.dataset.v] = c.checked; saveSoon(); draw(); });
  };

  // ================= ΚΥΚΛΩΜΑΤΑ =================
  function circuitsSheet() {
    const rows = EX.circuitRows(cur).filter(r => r.raw !== '—');
    const unassigned = EX.circuitRows(cur).find(r => r.raw === '—');
    const panels = new Set();
    cur.floors.forEach(f => f.items.forEach(i => { if (SY.byId[i.type] && SY.byId[i.type].kind === 'panel' && i.label) panels.add(i.label); }));
    cur.circuits = cur.circuits || {};
    const b = Sheet.open(`<h3>Κυκλώματα</h3>
      ${rows.length ? '' : '<p class="note">Δεν έχουν οριστεί κυκλώματα. Βάλε αριθμό κυκλώματος σε κάθε σύμβολο από τις «Ιδιότητες» (π.χ. Φ1 για φωτισμό, Ρ1 για πρίζες).</p>'}
      ${rows.map(r => `<div class="circ-row"><div class="top"><span class="code">${esc(r.code)}</span><span class="pts">${r.n} σημεία · ${esc(r.rooms)}</span></div>
        <div class="grid2"><input data-desc="${esc(r.code)}" value="${esc(r.desc)}" placeholder="Περιγραφή (π.χ. Φωτισμός σαλονιού)"><input data-panel="${esc(r.code)}" value="${esc(r.panel)}" placeholder="Πίνακας" list="panelList"></div></div>`).join('')}
      <datalist id="panelList">${[...panels].map(p => `<option value="${esc(p)}">`).join('')}</datalist>
      ${unassigned ? `<p class="note">${unassigned.n} σύμβολα χωρίς κύκλωμα.</p>` : ''}
      <button class="btn primary" style="width:100%;margin-top:6px" data-a="ok">OK</button>`, { tall: rows.length > 3 });
    const upd = (code, k, v) => { cur.circuits[code] = cur.circuits[code] || {}; cur.circuits[code][k] = v; saveSoon(); };
    b.querySelectorAll('[data-desc]').forEach(i => i.oninput = () => upd(i.dataset.desc, 'desc', i.value));
    b.querySelectorAll('[data-panel]').forEach(i => i.oninput = () => upd(i.dataset.panel, 'panel', i.value));
    b.querySelector('[data-a=ok]').onclick = () => Sheet.close();
  }

  // ================= PDF =================
  function pdfSheet(onlyFloor) {
    const b = Sheet.open(`<h3>Εξαγωγή PDF</h3>
      <h4>Κατόψεις</h4>
      ${cur.floors.map(f => `<label class="switch-row"><input type="checkbox" data-f="${f.id}" ${!onlyFloor || onlyFloor === f.id ? 'checked' : ''}><span>${esc(f.name)} <small style="color:#6b7788">(${f.items.length} σύμβολα)</small></span></label>`).join('')}
      <h4>Περιεχόμενο</h4>
      <label class="switch-row"><input type="checkbox" id="pdC" checked><span>Πίνακας κυκλωμάτων</span></label>
      <label class="switch-row"><input type="checkbox" id="pdCi" ${cur.view.circuits !== false ? 'checked' : ''}><span>Αριθμοί κυκλωμάτων στο σχέδιο</span></label>
      <label class="switch-row"><input type="checkbox" id="pdH" ${cur.view.heights !== false ? 'checked' : ''}><span>Ύψη στο σχέδιο</span></label>
      <label class="switch-row"><input type="checkbox" id="pdN" ${cur.view.notes !== false ? 'checked' : ''}><span>Σημειώσεις στο σχέδιο</span></label>
      <button class="btn primary" style="width:100%;margin-top:14px" data-a="go">Δημιουργία PDF</button>`);
    b.querySelector('[data-a=go]').onclick = async () => {
      const ids = [...b.querySelectorAll('[data-f]')].filter(c => c.checked).map(c => c.dataset.f);
      if (!ids.length) { toast('Διάλεξε τουλάχιστον μία κάτοψη'); return; }
      const opts = { circuits: b.querySelector('#pdC').checked, showCircuits: b.querySelector('#pdCi').checked, showHeights: b.querySelector('#pdH').checked, showNotes: b.querySelector('#pdN').checked };
      Sheet.close(); busy(true, 'Δημιουργία PDF…');
      try {
        await saveNow();
        const blob = await EX.exportPDF(cur, ids, opts);
        busy(false);
        deliver(blob, `${safeName(cur.name)}.pdf`);
      } catch (e) { console.error(e); busy(false); toast('Σφάλμα δημιουργίας PDF'); }
    };
  }

  // ================= ΦΩΤΟΓΡΑΦΙΑ =================
  function photoSource() {
    const b = Sheet.open(`<h3>Φωτογραφία χειρόγραφου</h3><div class="menu-list">
      <button class="menu-item" data-a="cam">${IC.camera}<span class="grow">Λήψη με την κάμερα</span></button>
      <button class="menu-item" data-a="gal">${IC.image}<span class="grow">Από τη συλλογή</span></button></div>
      <p class="note">Συμβουλή: φωτογράφισε από πάνω, με καλό φως, να φαίνονται και οι 4 γωνίες του χαρτιού.</p>`);
    b.querySelector('[data-a=cam]').onclick = () => { Sheet.close(); $('#fileCam').click(); };
    b.querySelector('[data-a=gal]').onclick = () => { Sheet.close(); $('#fileImg').click(); };
  }
  ['fileCam', 'fileImg'].forEach(id => $('#' + id).addEventListener('change', async e => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    busy(true, 'Φόρτωση φωτογραφίας…');
    try {
      const img = await loadImage(URL.createObjectURL(f));
      busy(false);
      Warp.open(img);
    } catch (err) { busy(false); toast('Δεν άνοιξε η φωτογραφία'); }
  }));
  function loadImage(src) {
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  }
  function setPhoto(canvas) {
    const data = canvas.toDataURL('image/jpeg', 0.72);
    const aspect = canvas.height / canvas.width;
    const prev = floor.photo;
    // αρχικό μέγεθος: σαν σχέδιο ~1000 μονάδες πλάτος
    const w = 1000, h = w * aspect;
    let x, y;
    if (prev) { x = prev.x; y = prev.y; }
    else if (floor.rooms.length) { const b = RD.floorBounds(floor); x = (b.x0 + b.x1) / 2 - w / 2; y = (b.y0 + b.y1) / 2 - h / 2; }
    else { x = 0; y = 0; }
    floor.photo = { data, x, y, w: prev ? prev.w : w, h: prev ? prev.w * aspect : h, rot: 0, opacity: 0.55, visible: true };
    saveSoon(); updateEmpty(); fitView();
    autoRooms(canvas);
  }

  // ----- αυτόματη αντιγραφή χώρων από τη φωτογραφία -----
  async function autoRooms(canvas) {
    const ph = floor.photo;
    if (!ph) return;
    let mode = 'replace';
    if (floor.rooms.length) {
      mode = await new Promise(res => {
        const b = Sheet.open(`<h3>Αυτόματη αντιγραφή χώρων</h3><p class="note">Η κάτοψη έχει ήδη ${floor.rooms.length} χώρους.</p>
          <div class="btn-col"><button class="btn primary" data-v="replace">Αντικατάσταση με τους νέους</button>
          <button class="btn" data-v="add">Προσθήκη στους υπάρχοντες</button>
          <button class="btn" data-v="no">Όχι, θα σχεδιάσω μόνος μου</button></div>`, { onClose: () => res('no') });
        b.querySelectorAll('[data-v]').forEach(x => x.onclick = () => { Sheet.onClose = null; Sheet.close(); res(x.dataset.v); });
      });
      if (mode === 'no') { setMode('room'); return; }
    }
    busy(true, 'Αναγνώριση χώρων…');
    await new Promise(r => setTimeout(r, 40));
    let res;
    try { res = window.EPC_DETECT.detect(canvas); } catch (e) { console.error(e); res = { rooms: [] }; }
    busy(false);
    if (!res.rooms.length) {
      setMode('room');
      Sheet.open(`<h3>Δεν βρέθηκαν κλειστοί χώροι</h3><p class="note">Για να τους βρίσκει μόνη της η εφαρμογή:<br>• κάθε χώρος να είναι κλειστό κουτί (οι πόρτες μπαίνουν μετά από το πρόγραμμα)<br>• γραμμές με στυλό, όχι πολύ αχνό μολύβι<br>• φωτογραφία από πάνω, με καλό φως<br><br>Μπορείς να σχεδιάσεις τους χώρους πάνω στη φωτογραφία με το «Χώρος».</p>`);
      return;
    }
    const kx = ph.w / res.W, ky = ph.h / res.H;
    const toW = p => [snapG(ph.x + p[0] * kx), snapG(ph.y + p[1] * ky)];
    if (mode === 'replace') {
      floor.rooms = [];
    }
    const ids = [];
    res.rooms.forEach(pts => {
      const w = G.simplify(pts.map(toW));
      if (w.length < 4 || Math.abs(G.area(w)) < 900) return;
      const r = { id: uid(), name: nextNumbered('Χώρος'), pts: w, free: false };
      floor.rooms.push(r); ids.push(r.id);
    });
    ph.opacity = 0.25;
    commit();
    setMode('select');
    toast(`Βρέθηκαν ${ids.length} χώροι`, 2500);
    nameWizard(ids, 0);
  }

  // ονομασία χώρων ένας-ένας με ένα πάτημα
  function nameWizard(ids, i) {
    if (i >= ids.length) { ST.sel = {}; $('#sheetBack').classList.remove('light'); fitView(); updateCtx(); return; }
    const r = room(ids[i]);
    if (!r) { nameWizard(ids, i + 1); return; }
    ST.sel = { kind: 'room', id: r.id };
    fitView(0.4);
    const used = floor.rooms.map(x => x.name);
    const chips = [nextNumbered('Δωμάτιο'), ...ROOM_NAMES];
    const b = Sheet.open(`<h3 style="margin-bottom:4px">Χώρος ${i + 1} από ${ids.length}: πώς λέγεται;</h3>
      <p class="note" style="margin:0 0 10px">Ο χώρος φαίνεται χρωματισμένος στο σχέδιο.</p>
      <div class="chips wiz">${chips.map(c => `<button class="chip ${used.includes(c) && c !== r.name ? 'used' : ''}" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="row2" style="margin-top:12px"><input id="wzIn" class="sym-search" style="margin:0" placeholder="Άλλο όνομα…"><button class="btn primary" data-a="ok" style="flex:0 0 70px">OK</button></div>
      <div class="row2" style="margin-top:10px"><button class="btn" data-a="skip">Παράλειψη</button><button class="btn" data-a="end">Τέλος</button></div>`,
      { onClose: () => { ST.sel = {}; $('#sheetBack').classList.remove('light'); fitView(); updateCtx(); } });
    $('#sheetBack').classList.add('light');
    const next = (name) => {
      if (name) { r.name = name; commit(); }
      Sheet.onClose = null; Sheet.close();
      setTimeout(() => nameWizard(ids, i + 1), 120);
    };
    b.querySelectorAll('[data-v]').forEach(c => c.onclick = () => next(c.dataset.v));
    const inp = b.querySelector('#wzIn');
    b.querySelector('[data-a=ok]').onclick = () => next(inp.value.trim());
    inp.onkeydown = e => { if (e.key === 'Enter') next(inp.value.trim()); };
    b.querySelector('[data-a=skip]').onclick = () => next('');
    b.querySelector('[data-a=end]').onclick = () => { Sheet.close(); };
  }
  async function autoRoomsFromPhoto() {
    const ph = floor.photo;
    if (!ph) return;
    const img = await loadImage(ph.data);
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    if (ph.rot) toast('Η περιστροφή της φωτογραφίας αγνοείται στην αναγνώριση');
    autoRooms(c);
  }
  function photoSheet() {
    const p = floor.photo;
    if (!p) { photoSource(); return; }
    const b = Sheet.open(`<h3>Φωτογραφία</h3>
      <label class="switch-row"><input type="checkbox" id="phVis" ${p.visible !== false ? 'checked' : ''}><span>Εμφάνιση φωτογραφίας</span></label>
      <div class="slider-row"><label><span>Διαφάνεια</span><span id="phOv">${Math.round(p.opacity * 100)}%</span></label><input type="range" min="10" max="100" value="${Math.round(p.opacity * 100)}" id="phO"></div>
      <div class="slider-row"><label><span>Μέγεθος</span><span id="phSv">${Math.round(p.w)}</span></label><input type="range" min="200" max="4000" step="10" value="${Math.round(p.w)}" id="phS"></div>
      <div class="slider-row"><label><span>Περιστροφή</span><span id="phRv">${p.rot || 0}°</span></label><input type="range" min="-20" max="20" step="0.5" value="${p.rot || 0}" id="phR"></div>
      <div class="act-row">
        <button class="act" data-a="move">${IC.move}Μετακίνηση</button>
        <button class="act" data-a="r90">${IC.rot}90°</button>
        <button class="act" data-a="new">${IC.camera}Νέα</button>
        <button class="act danger" data-a="del">${IC.trash}Αφαίρεση</button>
      </div>
      <button class="btn primary" style="width:100%;margin-top:14px" data-a="auto">Αυτόματη αντιγραφή χώρων</button>
      <p class="note" style="margin-top:12px">Η φωτογραφία δεν εμφανίζεται στο PDF – είναι μόνο οδηγός για τη σχεδίαση.</p>`);
    b.querySelector('[data-a=auto]').onclick = () => { Sheet.close(); setTimeout(autoRoomsFromPhoto, 260); };
    b.querySelector('#phVis').onchange = e => { p.visible = e.target.checked; saveSoon(); draw(); };
    b.querySelector('#phO').oninput = e => { p.opacity = e.target.value / 100; b.querySelector('#phOv').textContent = e.target.value + '%'; draw(); saveSoon(); };
    b.querySelector('#phS').oninput = e => {
      const nw = +e.target.value, k = nw / p.w;
      const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
      p.w = nw; p.h *= k; p.x = cx - p.w / 2; p.y = cy - p.h / 2;
      b.querySelector('#phSv').textContent = nw; draw(); saveSoon();
    };
    b.querySelector('#phR').oninput = e => { p.rot = +e.target.value; b.querySelector('#phRv').textContent = p.rot + '°'; draw(); saveSoon(); };
    b.querySelector('[data-a=move]').onclick = () => { Sheet.close(); setMode('photo'); };
    b.querySelector('[data-a=r90]').onclick = async () => {
      const img = await loadImage(p.data);
      const c = document.createElement('canvas'); c.width = img.height; c.height = img.width;
      const g = c.getContext('2d'); g.translate(c.width, 0); g.rotate(Math.PI / 2); g.drawImage(img, 0, 0);
      const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
      p.data = c.toDataURL('image/jpeg', 0.75); [p.w, p.h] = [p.h, p.w]; p.x = cx - p.w / 2; p.y = cy - p.h / 2;
      saveSoon(); draw();
    };
    b.querySelector('[data-a=new]').onclick = () => photoSource();
    b.querySelector('[data-a=del]').onclick = async () => {
      if (await confirmBox('Αφαίρεση της φωτογραφίας; (το σχέδιο μένει)', 'Αφαίρεση')) { floor.photo = null; saveSoon(); draw(); updateEmpty(); if (ST.mode === 'photo') setMode('select'); }
    };
  }

  // ----- ίσιωμα προοπτικής (4 γωνίες) -----
  const Warp = {
    img: null, src: null, pts: null, drag: -1, view: null,
    open(img) {
      // σμίκρυνση για ταχύτητα
      const max = 2200;
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      this.src = c;
      const w = c.width, h = c.height, ix = w * 0.06, iy = h * 0.06;
      this.pts = [[ix, iy], [w - ix, iy], [w - ix, h - iy], [ix, h - iy]];
      this.autoDetect();
      $('#warp').classList.add('show');
      requestAnimationFrame(() => this.draw());
    },
    // απλή αυτόματη εύρεση του λευκού χαρτιού
    autoDetect() {
      try {
        const c = this.src, k = 200 / Math.max(c.width, c.height);
        const sw = Math.round(c.width * k), sh = Math.round(c.height * k);
        const t = document.createElement('canvas'); t.width = sw; t.height = sh;
        const g = t.getContext('2d'); g.drawImage(c, 0, 0, sw, sh);
        const d = g.getImageData(0, 0, sw, sh).data;
        const lum = new Float32Array(sw * sh);
        let sum = 0;
        // λογαριθμική φωτεινότητα: το χαρτί ξεχωρίζει από το τραπέζι ακόμα και κάτω από σκιά
        for (let i = 0; i < sw * sh; i++) { const l = d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11; lum[i] = Math.log(1 + l) / Math.log(256) * 255; sum += lum[i]; }
        // κατώφλι Otsu
        const hist = new Array(256).fill(0); lum.forEach(v => hist[v | 0]++);
        let total = sw * sh, sumB = 0, wB = 0, max = 0, thr = 128, sumAll = 0;
        for (let i = 0; i < 256; i++) sumAll += i * hist[i];
        for (let i = 0; i < 256; i++) {
          wB += hist[i]; if (!wB) continue; const wF = total - wB; if (!wF) break;
          sumB += i * hist[i]; const mB = sumB / wB, mF = (sumAll - sumB) / wF;
          const between = wB * wF * (mB - mF) * (mB - mF);
          if (between > max) { max = between; thr = i; }
        }
        // γωνίες: φωτεινά σημεία που μεγιστοποιούν x+y, x-y κ.λπ.
        const best = [null, null, null, null], score = [-Infinity, -Infinity, -Infinity, -Infinity];
        let count = 0;
        for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
          if (lum[y * sw + x] < thr) continue;
          count++;
          const s = [-x - y, x - y, x + y, -x + y];
          for (let q = 0; q < 4; q++) if (s[q] > score[q]) { score[q] = s[q]; best[q] = [x, y]; }
        }
        if (count < sw * sh * 0.15 || count > sw * sh * 0.97 || best.some(b => !b)) return;
        const area = Math.abs(G.area(best));
        if (area < sw * sh * 0.2) return;
        this.pts = best.map(([x, y]) => [x / k, y / k]);
      } catch (e) { }
    },
    layout() {
      const cv = $('#warpCanvas'), r = cv.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      const pad = 26 * dpr;
      const s = Math.min((cv.width - pad * 2) / this.src.width, (cv.height - pad * 2) / this.src.height);
      this.view = { s, x: (cv.width - this.src.width * s) / 2, y: (cv.height - this.src.height * s) / 2, dpr };
    },
    draw() {
      this.layout();
      const cv = $('#warpCanvas'), g = cv.getContext('2d'), v = this.view;
      g.fillStyle = '#111'; g.fillRect(0, 0, cv.width, cv.height);
      g.drawImage(this.src, v.x, v.y, this.src.width * v.s, this.src.height * v.s);
      const P = this.pts.map(([x, y]) => [v.x + x * v.s, v.y + y * v.s]);
      g.fillStyle = 'rgba(0,0,0,0.45)';
      g.beginPath(); g.rect(0, 0, cv.width, cv.height);
      g.moveTo(P[0][0], P[0][1]); for (let i = 3; i >= 1; i--) g.lineTo(P[i][0], P[i][1]); g.closePath();
      g.fill('evenodd');
      g.strokeStyle = '#f7a93a'; g.lineWidth = 3 * v.dpr;
      g.beginPath(); P.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.stroke();
      P.forEach((p, i) => {
        g.beginPath(); g.arc(p[0], p[1], 16 * v.dpr, 0, Math.PI * 2);
        g.fillStyle = i === this.drag ? 'rgba(247,169,58,.9)' : 'rgba(247,169,58,.45)'; g.fill();
        g.lineWidth = 3 * v.dpr; g.strokeStyle = '#fff'; g.stroke();
      });
      // μεγεθυντικός φακός κατά το σύρσιμο
      if (this.drag >= 0) {
        const p = this.pts[this.drag], R = 60 * v.dpr, zoom = 2.5;
        const cx = R + 12 * v.dpr, cy = R + 12 * v.dpr;
        g.save(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
        g.fillStyle = '#000'; g.fillRect(cx - R, cy - R, R * 2, R * 2);
        const zs = v.s * zoom;
        g.drawImage(this.src, cx - p[0] * zs, cy - p[1] * zs, this.src.width * zs, this.src.height * zs);
        g.restore();
        g.strokeStyle = '#f7a93a'; g.lineWidth = 2 * v.dpr;
        g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
        g.beginPath(); g.moveTo(cx - 10 * v.dpr, cy); g.lineTo(cx + 10 * v.dpr, cy); g.moveTo(cx, cy - 10 * v.dpr); g.lineTo(cx, cy + 10 * v.dpr); g.stroke();
      }
    },
    toImg(e) {
      const cv = $('#warpCanvas'), r = cv.getBoundingClientRect(), v = this.view;
      const x = (e.clientX - r.left) * v.dpr, y = (e.clientY - r.top) * v.dpr;
      return [(x - v.x) / v.s, (y - v.y) / v.s];
    },
    close() { $('#warp').classList.remove('show'); this.src = null; },
    rotate() {
      const c = this.src, n = document.createElement('canvas');
      n.width = c.height; n.height = c.width;
      const g = n.getContext('2d'); g.translate(n.width, 0); g.rotate(Math.PI / 2); g.drawImage(c, 0, 0);
      // περιστροφή και των σημείων
      this.pts = this.pts.map(([x, y]) => [c.height - y, x]);
      this.pts = [this.pts[3], this.pts[0], this.pts[1], this.pts[2]];
      this.src = n; this.draw();
    },
    // ομογραφία από 4 σημεία
    homography(src, dst) {
      const A = [], b = [];
      for (let i = 0; i < 4; i++) {
        const [x, y] = src[i], [u, v] = dst[i];
        A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
        A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
      }
      // Gauss
      const n = 8;
      for (let i = 0; i < n; i++) {
        let m = i; for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[m][i])) m = k;
        [A[i], A[m]] = [A[m], A[i]]; [b[i], b[m]] = [b[m], b[i]];
        for (let k = i + 1; k < n; k++) { const f = A[k][i] / A[i][i]; for (let j = i; j < n; j++) A[k][j] -= f * A[i][j]; b[k] -= f * b[i]; }
      }
      const h = new Array(n);
      for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let j = i + 1; j < n; j++) s -= A[i][j] * h[j]; h[i] = s / A[i][i]; }
      return [...h, 1];
    },
    warp(enhance) {
      const P = this.pts;
      const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
      let W = (d(P[0], P[1]) + d(P[3], P[2])) / 2, H = (d(P[0], P[3]) + d(P[1], P[2])) / 2;
      const k = Math.min(1, 1800 / Math.max(W, H));
      W = Math.round(W * k); H = Math.round(H * k);
      // από έξοδο → πηγή
      const h = this.homography([[0, 0], [W, 0], [W, H], [0, H]], P);
      const sc = this.src, sw = sc.width, shh = sc.height;
      const sd = sc.getContext('2d').getImageData(0, 0, sw, shh).data;
      const out = document.createElement('canvas'); out.width = W; out.height = H;
      const og = out.getContext('2d'), od = og.createImageData(W, H), o = od.data;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const z = h[6] * x + h[7] * y + 1;
        const u = (h[0] * x + h[1] * y + h[2]) / z, v = (h[3] * x + h[4] * y + h[5]) / z;
        const ui = u | 0, vi = v | 0, j = (y * W + x) * 4;
        if (ui < 0 || vi < 0 || ui >= sw - 1 || vi >= shh - 1) { o[j] = o[j + 1] = o[j + 2] = 255; o[j + 3] = 255; continue; }
        const fx = u - ui, fy = v - vi, i0 = (vi * sw + ui) * 4, i1 = i0 + 4, i2 = i0 + sw * 4, i3 = i2 + 4;
        for (let c = 0; c < 3; c++) {
          o[j + c] = (sd[i0 + c] * (1 - fx) + sd[i1 + c] * fx) * (1 - fy) + (sd[i2 + c] * (1 - fx) + sd[i3 + c] * fx) * fy;
        }
        o[j + 3] = 255;
      }
      if (enhance) this.enhance(o, W, H);
      og.putImageData(od, 0, 0);
      return out;
    },
    // ενίσχυση: αφαίρεση σκιών (τοπικό φόντο) και αύξηση αντίθεσης
    enhance(o, W, H) {
      const g = new Float32Array(W * H);
      for (let i = 0; i < W * H; i++) g[i] = o[i * 4] * 0.3 + o[i * 4 + 1] * 0.59 + o[i * 4 + 2] * 0.11;
      // φόντο με μεγάλο θόλωμα (box blur μέσω integral image)
      const r = Math.max(8, Math.round(Math.max(W, H) / 40));
      const I = new Float64Array((W + 1) * (H + 1));
      for (let y = 0; y < H; y++) { let row = 0; for (let x = 0; x < W; x++) { row += g[y * W + x]; I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + row; } }
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const x0 = Math.max(0, x - r), x1 = Math.min(W, x + r + 1), y0 = Math.max(0, y - r), y1 = Math.min(H, y + r + 1);
        const bg = (I[y1 * (W + 1) + x1] - I[y0 * (W + 1) + x1] - I[y1 * (W + 1) + x0] + I[y0 * (W + 1) + x0]) / ((x1 - x0) * (y1 - y0));
        let v = g[y * W + x] / Math.max(bg, 1) * 255; // κανονικοποίηση
        v = (v - 150) * 2.2 + 128; // αντίθεση
        v = Math.max(0, Math.min(255, v));
        const j = (y * W + x) * 4;
        o[j] = o[j + 1] = o[j + 2] = v;
      }
    },
  };
  (function () {
    const cv = $('#warpCanvas');
    cv.addEventListener('pointerdown', e => {
      cv.setPointerCapture(e.pointerId);
      const p = Warp.toImg(e), v = Warp.view;
      let bi = -1, bd = 40 / v.s * v.dpr;
      Warp.pts.forEach((q, i) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; bi = i; } });
      Warp.drag = bi;
      Warp.off = bi >= 0 ? [Warp.pts[bi][0] - p[0], Warp.pts[bi][1] - p[1]] : null;
      Warp.draw();
    });
    cv.addEventListener('pointermove', e => {
      if (Warp.drag < 0) return;
      const p = Warp.toImg(e);
      const s = Warp.src;
      Warp.pts[Warp.drag] = [Math.max(0, Math.min(s.width, p[0] + Warp.off[0])), Math.max(0, Math.min(s.height, p[1] + Warp.off[1]))];
      Warp.draw();
    });
    const up = () => { if (Warp.drag >= 0) { Warp.drag = -1; Warp.draw(); } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    window.addEventListener('resize', () => { if (Warp.src) Warp.draw(); });
    $('#warpCancel').onclick = () => Warp.close();
    $('#warpRotate').onclick = () => Warp.rotate();
    $('#warpSkip').onclick = () => {
      const c = Warp.src;
      const k = Math.min(1, 1800 / Math.max(c.width, c.height));
      const o = document.createElement('canvas'); o.width = c.width * k; o.height = c.height * k;
      o.getContext('2d').drawImage(c, 0, 0, o.width, o.height);
      if ($('#warpEnhance').checked) {
        const g = o.getContext('2d'), d = g.getImageData(0, 0, o.width, o.height);
        Warp.enhance(d.data, o.width, o.height); g.putImageData(d, 0, 0);
      }
      Warp.close(); setPhoto(o);
    };
    $('#warpOk').onclick = () => {
      busy(true, 'Ίσιωμα…');
      setTimeout(() => {
        try { const out = Warp.warp($('#warpEnhance').checked); Warp.close(); busy(false); setPhoto(out); }
        catch (e) { busy(false); toast('Σφάλμα στο ίσιωμα'); }
      }, 30);
    };
  })();

  // ================= ΕΚΚΙΝΗΣΗ =================
  ['gesturestart', 'gesturechange'].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
  window.addEventListener('popstate', () => { });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  loadProjects();

  // για δοκιμές
  window.__EPC = { ST, get floor() { return floor; }, get cur() { return cur; }, openEditor, openProject, setMode, pickSymbol, fitView, draw: drawNow, toWorld, commit };
})();
