/* EPC PLAN – σχεδίαση κάτοψης σε SVG (κοινό για οθόνη και εξαγωγή) */
(function () {
  const SY = () => window.EPC_SYMBOLS;
  const f = (n) => Math.round(n * 100) / 100;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const WALL = 5;
  let SK = 1.3; // μέγεθος συμβόλων (ρύθμιση έργου)
  const setSymScale = (k) => { SK = Math.max(0.5, Math.min(3, +k || 1.3)); };
  const BLUE = '#00468c';
  const ACCENT = '#f39c12';

  // ---------- γεωμετρία ----------
  const G = {
    area(pts) {
      let a = 0;
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
        a += x1 * y2 - x2 * y1;
      }
      return a / 2;
    },
    inside(pt, pts) {
      let c = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    },
    segDist(p, a, b) {
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const l2 = dx * dx + dy * dy || 1;
      let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2;
      t = Math.max(0, Math.min(1, t));
      const x = a[0] + t * dx, y = a[1] + t * dy;
      return { d: Math.hypot(p[0] - x, p[1] - y), x, y, t };
    },
    bbox(pts) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
      return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
    },
    // εσωτερικό σημείο για την ετικέτα (το πιο «βαθύ» σημείο του χώρου)
    labelPoint(pts, avoid = []) {
      const key = JSON.stringify(pts) + '|' + JSON.stringify(avoid);
      const c = G._lp || (G._lp = new Map());
      if (c.has(key)) return c.get(key);
      if (c.size > 300) c.clear();
      const r = G._labelPoint(pts, avoid);
      c.set(key, r);
      return r;
    },
    _labelPoint(pts, avoid) {
      const b = G.bbox(pts);
      let best = [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2], bestD = -1;
      const N = 18;
      for (let i = 1; i < N; i++) for (let j = 1; j < N; j++) {
        const p = [b.x0 + (b.w * i) / N, b.y0 + (b.h * j) / N];
        if (!G.inside(p, pts)) continue;
        let d = Infinity;
        for (let k = 0; k < pts.length; k++) d = Math.min(d, G.segDist(p, pts[k], pts[(k + 1) % pts.length]).d);
        // προτίμηση στο κέντρο
        const cx = Math.hypot(p[0] - (b.x0 + b.x1) / 2, p[1] - (b.y0 + b.y1) / 2);
        let pen = 0;
        // η ετικέτα είναι φαρδιά: ελλειπτική ζώνη αποφυγής γύρω από τα σύμβολα
        avoid.forEach(a => { const da = Math.hypot((a[0] - p[0]) / 2.2, a[1] - p[1]); if (da < 34) pen += (34 - da) * 3; });
        const score = d - cx * 0.05 - pen;
        if (score > bestD) { bestD = score; best = p; }
      }
      return best;
    },
    // ίσιωμα πολυγώνου: κάθε τοίχος γίνεται οριζόντιος ή κάθετος
    orthogonalize(pts) {
      const n = pts.length;
      if (n < 3) return pts;
      const p = pts.map(q => q.slice());
      const horiz = [];
      for (let i = 0; i < n; i++) {
        const a = p[i], b = p[(i + 1) % n];
        horiz.push(Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]));
      }
      // διαδοχικοί τοίχοι ίδιου προσανατολισμού → ένας
      for (let it = 0; it < 4; it++) {
        for (let i = 0; i < n; i++) {
          const a = p[i], b = p[(i + 1) % n];
          if (horiz[i]) { const y = (a[1] + b[1]) / 2; a[1] = y; b[1] = y; }
          else { const x = (a[0] + b[0]) / 2; a[0] = x; b[0] = x; }
        }
      }
      return p;
    },
    // αφαίρεση συνευθειακών / διπλών κορυφών
    simplify(pts) {
      let p = pts.slice();
      let changed = true;
      while (changed && p.length > 3) {
        changed = false;
        for (let i = 0; i < p.length; i++) {
          const a = p[(i - 1 + p.length) % p.length], b = p[i], c = p[(i + 1) % p.length];
          const cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
          if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.5 || Math.abs(cross) < 0.5) { p.splice(i, 1); changed = true; break; }
        }
      }
      return p;
    },
  };

  // κέντρο οπτικό συμβόλου (για γραμμές σύνδεσης, επιλογή, ετικέτες)
  // κέντρο ταινίας LED: το μέσο της διαδρομής
  function polyMid(pts) {
    let tot = 0;
    for (let i = 1; i < pts.length; i++) tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    let h = tot / 2;
    for (let i = 1; i < pts.length; i++) {
      const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (h <= l && l > 0) { const t = h / l; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]; }
      h -= l;
    }
    return pts[0].slice();
  }
  function itemCenter(it) {
    if (it.pts && it.pts.length >= 2) return polyMid(it.pts);
    const s = SY().byId[it.type];
    if (!s || s.mount !== 'wall') return [it.x, it.y];
    const r = (it.rot * Math.PI) / 180;
    // τοπικό (0,-12) → παγκόσμιο
    return [it.x + 12 * SK * Math.sin(r), it.y - 12 * SK * Math.cos(r)];
  }

  function roomPathD(pts) {
    return 'M ' + pts.map(p => f(p[0]) + ' ' + f(p[1])).join(' L ') + ' Z';
  }

  function openingSVG(o) {
    const w = o.w, h = w / 2;
    const sx = o.flip & 1 ? -1 : 1, sy = o.flip & 2 ? -1 : 1;
    const K = '#111';
    let s = `<rect x="${-h}" y="${-WALL / 2 - 1.2}" width="${w}" height="${WALL + 2.4}" fill="#fff" stroke="none"/>`;
    const jamb = `<line x1="${-h}" y1="-4" x2="${-h}" y2="4" stroke="${K}" stroke-width="2"/><line x1="${h}" y1="-4" x2="${h}" y2="4" stroke="${K}" stroke-width="2"/>`;
    const arc = (hx, len, dir) => {
      // dir: +1 φύλλο προς τα δεξιά από τον μεντεσέ στο hx
      const ex = hx + dir * len;
      const sweep = dir > 0 ? 1 : 0;
      return `<line x1="${hx}" y1="0" x2="${hx}" y2="${-len}" stroke="${K}" stroke-width="2"/>` +
        `<path d="M ${hx} ${-len} A ${len} ${len} 0 0 ${sweep} ${ex} 0" fill="none" stroke="${K}" stroke-width="1" stroke-dasharray="4 3"/>`;
    };
    let inner = '';
    switch (o.type) {
      case 'door': inner = jamb + arc(-h, w, 1); break;
      case 'door2': inner = jamb + arc(-h, h, 1) + arc(h, h, -1); break;
      case 'slide':
        inner = jamb + `<rect x="${-h}" y="-3.5" width="${w * 0.55}" height="2.5" fill="#fff" stroke="${K}" stroke-width="1.3"/>` +
          `<rect x="${h - w * 0.55}" y="1" width="${w * 0.55}" height="2.5" fill="#fff" stroke="${K}" stroke-width="1.3"/>`;
        break;
      case 'window':
        inner = `<rect x="${-h}" y="-3.5" width="${w}" height="7" fill="#fff" stroke="${K}" stroke-width="1.4"/><line x1="${-h}" y1="0" x2="${h}" y2="0" stroke="${K}" stroke-width="1"/>`;
        break;
      case 'balcony':
        inner = `<rect x="${-h}" y="-3.5" width="${w}" height="7" fill="#fff" stroke="${K}" stroke-width="1.4"/><line x1="${-h}" y1="0" x2="${h}" y2="0" stroke="${K}" stroke-width="1"/>` +
          `<path d="M ${-h} -3.5 A ${h} ${h} 0 0 1 0 ${-3.5 - h}" fill="none" stroke="${K}" stroke-width="1" stroke-dasharray="4 3"/>` +
          `<path d="M ${h} -3.5 A ${h} ${h} 0 0 0 0 ${-3.5 - h}" fill="none" stroke="${K}" stroke-width="1" stroke-dasharray="4 3"/>`;
        break;
      default: inner = jamb;
    }
    return `<g transform="translate(${f(o.x)},${f(o.y)}) rotate(${f(o.rot)})">${s}<g transform="scale(${sx},${sy})">${inner}</g></g>`;
  }

  function itemSVG(it, opts) {
    const s = SY().byId[it.type];
    if (!s) return '';
    let out;
    if (it.pts && it.pts.length >= 2) {
      // ταινία LED σχεδιασμένη γωνία-γωνία
      const pp = it.pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ');
      out = `<polyline points="${pp}" fill="none" stroke="#ffd34d" stroke-width="${f(7 * SK)}" stroke-linejoin="round" stroke-linecap="round" opacity="0.75"/>`
        + `<polyline points="${pp}" fill="none" stroke="#111" stroke-width="${f(2.4 * SK)}" stroke-dasharray="${f(6 * SK)} ${f(3 * SK)}" stroke-linejoin="round"/>`
        + [it.pts[0], it.pts[it.pts.length - 1]].map(p => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(2.6 * SK)}" fill="#111"/>`).join('');
    } else out = `<g transform="translate(${f(it.x)},${f(it.y)}) rotate(${f(it.rot || 0)}) scale(${SK})">${s.draw(it.rot || 0)}</g>`;
    const k = SK;
    const [cx, cy] = itemCenter(it);
    const tx = (x, y, txt, size, color, weight = 700, anchor = 'start') =>
      `<text x="${f(x)}" y="${f(y)}" font-size="${size}" font-family="Arial,Helvetica,sans-serif" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">${esc(txt)}</text>`;
    if (s.kind === 'panel') {
      const lab = it.label || s.labelDefault || '';
      if (lab) out += tx(cx, cy - 16 * k, lab, 13 * k, BLUE, 800, 'middle');
    }
    if (opts.showCircuits !== false && it.circuit) out += tx(cx + 12 * k, cy - 9 * k, it.circuit, 11 * k, '#c0392b', 800);
    if (opts.showHeights !== false && it.height) out += tx(cx + 12 * k, cy + 15 * k, it.height, 9 * k, '#555', 600);
    if (opts.showNotes !== false && it.note) out += tx(cx - 12 * k, cy + 15 * k, it.note.length > 18 ? it.note.slice(0, 17) + '…' : it.note, 9 * k, '#2c3e50', 600, 'end');
    return out;
  }

  /**
   * Επιστρέφει το εσωτερικό SVG μιας κάτοψης (σε συντεταγμένες κόσμου)
   * opts: { scale, sel:{kind,id}, linkFrom, showCircuits, showHeights, showNotes, exportMode }
   */
  const LINK = '#e3001b';
  // καμπύλη (τόξο) της γραμμής σύνδεσης
  const linkBend = (len) => Math.min(140, len * 0.28);
  const LAYERS = ['fill', 'wall', 'open', 'label', 'link', 'item'];
  /**
   * Τα κομμάτια της κάτοψης ανά στρώση, το καθένα με κλειδί, ώστε η οθόνη να ξανασχεδιάζει μόνο ό,τι άλλαξε.
   * opts: { scale, sel:{kind,id}, linkFrom, showCircuits, showHeights, showNotes, exportMode }
   */
  function floorParts(floor, opts = {}) {
    const sc = opts.scale || 1;
    const sel = opts.sel || {};
    const P = { fill: [], wall: [], open: [], label: [], link: [], item: [] };
    const centers = floor.items.map(itemCenter);
    floor.rooms.forEach(r => {
      const isSel = sel.kind === 'room' && sel.id === r.id;
      const d = roomPathD(r.pts);
      P.fill.push([r.id, `<path d="${d}" fill="${isSel ? 'rgba(0,70,140,0.10)' : (opts.exportMode ? '#fff' : 'rgba(255,255,255,0.78)')}" stroke="none"/>`]);
      P.wall.push([r.id, `<path d="${d}" fill="none" stroke="#222" stroke-width="${WALL}" stroke-linejoin="miter"/>`]);
      const avoid = centers.filter(c => G.inside(c, r.pts));
      const p = G.labelPoint(r.pts, avoid);
      const b = G.bbox(r.pts);
      // το όνομα χωράει πάντα μέσα στον χώρο (δεν βγαίνει στον διπλανό)
      const len = Math.max(1, (r.name || '').length);
      const size = Math.max(5, Math.min(20, Math.min(b.w, b.h) / 6, (b.w * 0.88) / (0.62 * len)));
      P.label.push([r.id, `<text x="${f(p[0])}" y="${f(p[1])}" font-size="${f(size)}" font-family="Arial,Helvetica,sans-serif" font-weight="800" fill="${BLUE}" fill-opacity="0.85" text-anchor="middle" dominant-baseline="central">${esc(r.name || '')}</text>`]);
    });
    (floor.openings || []).forEach(o => {
      let s = openingSVG(o);
      if (sel.kind === 'opening' && sel.id === o.id) {
        s += `<g transform="translate(${f(o.x)},${f(o.y)}) rotate(${f(o.rot)})"><rect x="${-o.w / 2 - 6}" y="-10" width="${o.w + 12}" height="20" fill="none" stroke="${ACCENT}" stroke-width="${2.5 / sc}" stroke-dasharray="${6 / sc} ${4 / sc}"/></g>`;
      }
      P.open.push([o.id, s]);
    });
    const byId = {};
    floor.items.forEach(i => (byId[i.id] = i));
    (floor.links || []).forEach(l => {
      const a = byId[l.a], b = byId[l.b];
      if (!a || !b) return;
      const [ax, ay] = itemCenter(a), [bx, by] = itemCenter(b);
      // ελαφρώς καμπύλη για να ξεχωρίζουν οι γραμμές
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
      const k = linkBend(len);
      const qx = mx - (dy / len) * k, qy = my + (dx / len) * k;
      const isSel = sel.kind === 'link' && sel.id === l.id;
      P.link.push([l.id, `<path d="M ${f(ax)} ${f(ay)} Q ${f(qx)} ${f(qy)} ${f(bx)} ${f(by)}" fill="none" stroke="${isSel ? ACCENT : LINK}" stroke-width="${isSel ? 3 : 1.9}" stroke-dasharray="7 5" stroke-linecap="round"/>`]);
    });
    floor.items.forEach((it, idx) => {
      let s = itemSVG(it, opts);
      const isSel = sel.kind === 'item' && sel.id === it.id;
      const isFrom = opts.linkFrom === it.id;
      if (isSel || isFrom) {
        const [cx, cy] = centers[idx];
        s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(Math.max(18 * SK, 20 / sc))}" fill="none" stroke="${isFrom ? '#27ae60' : ACCENT}" stroke-width="${f(2.5 / sc)}" stroke-dasharray="${f(6 / sc)} ${f(4 / sc)}"/>`;
      }
      P.item.push([it.id, s]);
    });
    return P;
  }
  function floorSVG(floor, opts = {}) {
    const P = floorParts(floor, opts);
    return LAYERS.map(l => P[l].map(x => x[1]).join('')).join('');
  }


  function floorBounds(floor) {
    const pts = [];
    floor.rooms.forEach(r => r.pts.forEach(p => pts.push(p)));
    floor.items.forEach(i => {
      if (i.pts) i.pts.forEach(p => pts.push(p));
      pts.push([i.x - 22 * SK, i.y - 30 * SK]); pts.push([i.x + 30 * SK, i.y + 22 * SK]);
    });
    (floor.openings || []).forEach(o => { pts.push([o.x - o.w, o.y - o.w]); pts.push([o.x + o.w, o.y + o.w]); });
    if (!pts.length) return { x0: 0, y0: 0, x1: 600, y1: 400, w: 600, h: 400 };
    return G.bbox(pts);
  }

  window.EPC_RENDER = { linkBend, LINK, polyMid, floorParts, LAYERS, setSymScale, get SK() { return SK; }, G, floorSVG, floorBounds, itemCenter, roomPathD, esc, BLUE, ACCENT, WALL };
})();
