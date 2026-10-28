/* EPC PLAN – εξαγωγή PDF / εικόνας (χωρίς εξωτερικές βιβλιοθήκες) */
(function () {
  const R = () => window.EPC_RENDER;
  const SY = () => window.EPC_SYMBOLS;
  const W = 2200, H = 1556; // A4 οριζόντια ~190dpi
  const BLUE = '#00468c', ORANGE = '#f7a93a';
  const esc = (s) => R().esc(s);

  let logoData = null;
  async function logo() {
    if (logoData) return logoData;
    try {
      const b = await (await fetch('./icon-192.png')).blob();
      logoData = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); });
    } catch (e) { logoData = ''; }
    return logoData;
  }

  const fmtDate = (d = new Date()) => d.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  function text(x, y, s, size, color = '#111', weight = 400, anchor = 'start', extra = '') {
    return `<text x="${x}" y="${y}" font-size="${size}" font-family="Arial,Helvetica,sans-serif" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" ${extra}>${esc(s)}</text>`;
  }
  function clip(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  function header(project, subtitle, lg, page, pages) {
    let s = `<rect x="0" y="0" width="${W}" height="150" fill="${BLUE}"/>`;
    if (lg) s += `<image href="${lg}" x="30" y="20" width="110" height="110"/>`;
    s += text(165, 70, 'EPC PLAN', 50, '#fff', 800);
    s += text(165, 118, subtitle, 30, ORANGE, 700);
    const right = [];
    right.push(clip(project.name || 'Έργο', 60));
    const cl = [project.client, project.phone].filter(Boolean).join(' · ');
    if (cl) right.push(clip(cl, 70));
    if (project.address) right.push(clip(project.address, 70));
    right.forEach((t, i) => (s += text(W - 40, 50 + i * 38, t, i === 0 ? 36 : 28, '#fff', i === 0 ? 800 : 400, 'end')));
    s += text(W - 40, H - 22, `Ημερομηνία: ${fmtDate()}   ·   Σελίδα ${page}/${pages}`, 22, '#666', 400, 'end');
    s += text(40, H - 22, 'Σχέδιο ηλεκτρολογικής εγκατάστασης – χωρίς κλίμακα', 22, '#666', 400);
    return s;
  }

  function legendRows(floor) {
    const counts = {};
    floor.items.forEach(i => (counts[i.type] = (counts[i.type] || 0) + 1));
    const order = SY().list.map(s => s.id);
    return Object.keys(counts).sort((a, b) => order.indexOf(a) - order.indexOf(b)).map(id => ({ id, n: counts[id] }));
  }

  function symbolIcon(id, x, y, size) {
    const s = SY().byId[id];
    const vb = s.mount === 'wall' ? '-20 -30 40 34' : '-17 -17 34 34';
    return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${vb}">${s.draw(0)}</svg>`;
  }

  function planPage(project, floor, opts, lg, page, pages) {
    const sub = (floor.name || 'Κάτοψη');
    let s = `<rect width="${W}" height="${H}" fill="#fff"/>` + header(project, sub, lg, page, pages);
    // περιοχή σχεδίου
    const px = 40, py = 185, pw = 1520, ph = 1310;
    s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="none" stroke="#c9d3e0" stroke-width="2" rx="8"/>`;
    const b = R().floorBounds(floor);
    const pad = Math.max(b.w, b.h) * 0.06 + 20;
    const vb = `${b.x0 - pad} ${b.y0 - pad} ${b.w + pad * 2} ${b.h + pad * 2}`;
    s += `<svg x="${px + 10}" y="${py + 10}" width="${pw - 20}" height="${ph - 20}" viewBox="${vb}" preserveAspectRatio="xMidYMid meet">${R().floorSVG(floor, Object.assign({ exportMode: true, scale: 1 }, opts))}</svg>`;
    // υπόμνημα
    const lx = 1590, ly = 185, lw = 570;
    s += `<rect x="${lx}" y="${ly}" width="${lw}" height="${ph}" fill="#f5f8fc" stroke="#c9d3e0" stroke-width="2" rx="8"/>`;
    s += text(lx + 24, ly + 50, 'ΥΠΟΜΝΗΜΑ', 32, BLUE, 800);
    s += text(lx + lw - 24, ly + 50, 'Τεμ.', 24, '#555', 700, 'end');
    const rows = legendRows(floor);
    const extraRows = 3;
    const avail = ph - 80 - extraRows * 52;
    let rh = Math.min(62, Math.floor(avail / Math.max(1, rows.length)));
    let cols = 1;
    if (rh < 36) { cols = 2; rh = Math.min(62, Math.floor(avail / Math.ceil(rows.length / 2))); }
    const cw = (lw - 30) / cols;
    const isz = Math.min(52, rh - 6), fs = Math.max(14, Math.min(24, rh * 0.42));
    const perCol = Math.ceil(rows.length / cols);
    rows.forEach((r, i) => {
      const c = Math.floor(i / perCol), k = i % perCol;
      const x = lx + 15 + c * cw, y = ly + 75 + k * rh;
      s += symbolIcon(r.id, x, y + (rh - isz) / 2, isz);
      const nameLen = cols === 1 ? 30 : 16;
      s += text(x + isz + 12, y + rh / 2 + fs * 0.35, clip(SY().byId[r.id].name, nameLen), fs, '#111', 400);
      s += text(x + cw - 14, y + rh / 2 + fs * 0.35, String(r.n), fs, '#111', 800, 'end');
    });
    let ey = ly + 75 + perCol * rh + 20;
    if ((floor.links || []).length) {
      s += `<line x1="${lx + 20}" y1="${ey + 18}" x2="${lx + 70}" y2="${ey + 18}" stroke="#0b5cad" stroke-width="3" stroke-dasharray="10 7"/>`;
      s += text(lx + 85, ey + 26, 'Χειρισμός φωτιστικού από διακόπτη', 22, '#111');
      ey += 46;
    }
    if (opts.showCircuits !== false) { s += text(lx + 20, ey + 26, 'Κόκκινο: αριθμός κυκλώματος', 21, '#c0392b', 700); ey += 36; }
    if (opts.showHeights !== false) { s += text(lx + 20, ey + 26, 'Γκρι: ύψος τοποθέτησης (εκ.)', 21, '#555', 700); }
    return s;
  }

  // ----- κυκλώματα -----
  function circuitRows(project) {
    const map = {};
    (project.floors || []).forEach(fl => {
      const rooms = fl.rooms || [];
      fl.items.forEach(it => {
        const sym = SY().byId[it.type];
        if (!sym || sym.kind === 'panel') return;
        const code = (it.circuit || '').trim() || '—';
        const m = map[code] || (map[code] = { code, types: {}, rooms: new Set(), n: 0 });
        m.n++;
        m.types[it.type] = (m.types[it.type] || 0) + 1;
        const room = rooms.find(r => R().G.inside([it.x, it.y], r.pts) || R().G.inside(R().itemCenter(it), r.pts));
        m.rooms.add((project.floors.length > 1 ? (fl.name || '') + ': ' : '') + (room ? room.name || 'Χώρος' : 'Εκτός χώρου'));
      });
    });
    const meta = project.circuits || {};
    // αν υπάρχει μόνο ένας πίνακας, τον προτείνουμε σε όλα τα κυκλώματα
    const panels = new Set();
    (project.floors || []).forEach(fl => fl.items.forEach(i => { const s = SY().byId[i.type]; if (s && s.kind === 'panel' && s.id !== 'meter' && s.id !== 'pv_inv') panels.add(i.label || s.labelDefault); }));
    const onlyPanel = panels.size === 1 ? [...panels][0] : '';
    const natural = (a, b) => a.code === '—' ? 1 : b.code === '—' ? -1 : a.code.localeCompare(b.code, 'el', { numeric: true });
    return Object.values(map).sort(natural).map(m => ({
      code: m.code === '—' ? 'Χωρίς' : m.code, raw: m.code,
      desc: (meta[m.code] && meta[m.code].desc) || '',
      panel: (meta[m.code] && meta[m.code].panel) || (m.code === '—' ? '' : onlyPanel),
      rooms: [...m.rooms].join(', '),
      points: Object.entries(m.types).map(([t, n]) => `${n}× ${SY().byId[t].name}`).join(', '),
      n: m.n,
    }));
  }

  function wrap(s, maxChars, maxLines) {
    const words = String(s).split(' ');
    const lines = [];
    let cur = '';
    words.forEach(w => {
      if ((cur + ' ' + w).trim().length > maxChars) { if (cur) lines.push(cur); cur = w; }
      else cur = (cur + ' ' + w).trim();
    });
    if (cur) lines.push(cur);
    if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = clip(lines[maxLines - 1] + ' …', maxChars); }
    return lines;
  }

  function circuitPages(project, lg, startPage, pages) {
    const rows = circuitRows(project);
    if (!rows.length) return [];
    const per = 11;
    const out = [];
    for (let p = 0; p * per < rows.length; p++) {
      let s = `<rect width="${W}" height="${H}" fill="#fff"/>` + header(project, 'Πίνακας κυκλωμάτων', lg, startPage + p, pages);
      const cols = [
        { t: 'Κύκλ.', x: 40, w: 150 }, { t: 'Περιγραφή', x: 190, w: 380 }, { t: 'Πίνακας', x: 570, w: 170 },
        { t: 'Χώροι', x: 740, w: 520 }, { t: 'Σημεία', x: 1260, w: 780 }, { t: 'Σύν.', x: 2040, w: 120 },
      ];
      const top = 190, rh = 112;
      s += `<rect x="40" y="${top}" width="${W - 80}" height="56" fill="${BLUE}" rx="6"/>`;
      cols.forEach(c => (s += text(c.x + 14, top + 37, c.t, 26, '#fff', 800)));
      rows.slice(p * per, p * per + per).forEach((r, i) => {
        const y = top + 56 + i * rh;
        if (i % 2) s += `<rect x="40" y="${y}" width="${W - 80}" height="${rh}" fill="#f2f6fb"/>`;
        s += `<line x1="40" y1="${y + rh}" x2="${W - 40}" y2="${y + rh}" stroke="#d5dde8" stroke-width="1.5"/>`;
        const cells = [
          [r.code, 8, 1, '#c0392b', 800], [r.desc, 24, 2, '#111', 400], [r.panel, 10, 2, '#111', 700],
          [r.rooms, 34, 3, '#111', 400], [r.points, 56, 3, '#111', 400], [String(r.n), 6, 1, '#111', 800],
        ];
        cells.forEach((c, k) => {
          const lines = wrap(c[0] || '', c[1], c[2]);
          const y0 = y + rh / 2 - (lines.length - 1) * 15 + 9;
          lines.forEach((ln, j) => (s += text(cols[k].x + 14, y0 + j * 30, ln, 24, c[3], c[4])));
        });
      });
      out.push(s);
    }
    return out;
  }

  function svgToCanvas(inner, scale = 1) {
    return new Promise((res, rej) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${inner}</svg>`;
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = W * scale; c.height = H * scale;
        const g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
        g.drawImage(img, 0, 0, c.width, c.height);
        res(c);
      };
      img.onerror = () => rej(new Error('Αποτυχία σχεδίασης σελίδας'));
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }

  // ----- ελάχιστος δημιουργός PDF με εικόνες JPEG -----
  function dataURLtoBytes(d) {
    const b = atob(d.split(',')[1]);
    const u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return u;
  }
  function buildPDF(images) {
    const enc = (s) => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; };
    const parts = [];
    let len = 0;
    const offsets = [];
    const push = (u) => { parts.push(u); len += u.length; };
    const obj = (n, body) => { offsets[n] = len; push(enc(`${n} 0 obj\n`)); body.forEach(push); push(enc('\nendobj\n')); };
    push(enc('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'));
    const PW = 841.89, PH = 595.28;
    const n = images.length;
    const kids = [];
    for (let i = 0; i < n; i++) kids.push(`${3 + i * 3} 0 R`);
    obj(1, [enc('<< /Type /Catalog /Pages 2 0 R >>')]);
    obj(2, [enc(`<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${n} >>`)]);
    images.forEach((im, i) => {
      const pg = 3 + i * 3, ct = pg + 1, ix = pg + 2;
      obj(pg, [enc(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im${i} ${ix} 0 R >> >> /Contents ${ct} 0 R >>`)]);
      const stream = `q ${PW} 0 0 ${PH} 0 0 cm /Im${i} Do Q`;
      obj(ct, [enc(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)]);
      obj(ix, [enc(`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>\nstream\n`), im.bytes, enc('\nendstream')]);
    });
    const total = 3 + n * 3;
    const xref = len;
    let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
    for (let i = 1; i < total; i++) x += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    x += `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    push(enc(x));
    return new Blob(parts, { type: 'application/pdf' });
  }

  async function pagesFor(project, floorIds, opts) {
    R().setSymScale((project.view && project.view.symScale) || 1.3);
    const lg = await logo();
    const floors = project.floors.filter(f => floorIds.includes(f.id));
    const circ = opts.circuits ? circuitRows(project).length : 0;
    const circPages = circ ? Math.ceil(circ / 11) : 0;
    const total = floors.length + circPages;
    const svgs = floors.map((fl, i) => planPage(project, fl, opts, lg, i + 1, total));
    if (opts.circuits) svgs.push(...circuitPages(project, lg, floors.length + 1, total));
    return svgs;
  }

  async function exportPDF(project, floorIds, opts) {
    const svgs = await pagesFor(project, floorIds, opts);
    const imgs = [];
    for (const s of svgs) {
      const c = await svgToCanvas(s);
      imgs.push({ w: c.width, h: c.height, bytes: dataURLtoBytes(c.toDataURL('image/jpeg', 0.9)) });
    }
    return buildPDF(imgs);
  }

  async function exportPNG(project, floor, opts) {
    R().setSymScale((project.view && project.view.symScale) || 1.3);
    const lg = await logo();
    const c = await svgToCanvas(planPage(project, floor, opts, lg, 1, 1));
    return new Promise(r => c.toBlob(r, 'image/png'));
  }

  window.EPC_EXPORT = { exportPDF, exportPNG, circuitRows };
})();
