/* EPC PLAN – αυτόματη αναγνώριση χώρων από φωτογραφία σκίτσου (μόνο μέσα στο κινητό, χωρίς internet)
   Βήματα: καθαρισμός φόντου → μελάνι → αφαίρεση γραμμάτων (μικρά κομμάτια) → κλείσιμο μικρών κενών
   → εύρεση κλειστών περιοχών → περίγραμμα → ίσιωμα στις 90° → επέκταση ως τον άξονα του τοίχου
   → κοινό «κούμπωμα» τοίχων μεταξύ χώρων. */
(function () {
  'use strict';

  function grayNormalized(img, W, H) {
    const g = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) g[i] = img[i * 4] * 0.3 + img[i * 4 + 1] * 0.59 + img[i * 4 + 2] * 0.11;
    // διαίρεση με το τοπικό φόντο → σκιές και κακός φωτισμός εξαφανίζονται
    const r = Math.max(8, Math.round(Math.max(W, H) / 30));
    const I = new Float64Array((W + 1) * (H + 1));
    for (let y = 0; y < H; y++) { let row = 0; for (let x = 0; x < W; x++) { row += g[y * W + x]; I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + row; } }
    const out = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(W, x + r + 1), y0 = Math.max(0, y - r), y1 = Math.min(H, y + r + 1);
      const bg = (I[y1 * (W + 1) + x1] - I[y0 * (W + 1) + x1] - I[y1 * (W + 1) + x0] + I[y0 * (W + 1) + x0]) / ((x1 - x0) * (y1 - y0));
      out[y * W + x] = g[y * W + x] / Math.max(bg, 1);
    }
    return out; // ~1 για χαρτί, μικρότερο για μελάνι
  }

  // τετράγωνη διαστολή (διατηρεί τις ορθές γωνίες)
  function dilate(m, W, H, r) {
    if (r <= 0) return m.slice();
    const t = new Uint8Array(W * H), o = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) {
      let last = -1e9;
      for (let x = 0; x < W; x++) { if (m[y * W + x]) last = x; if (x - last <= r) t[y * W + x] = 1; }
      last = 1e9;
      for (let x = W - 1; x >= 0; x--) { if (m[y * W + x]) last = x; if (last - x <= r) t[y * W + x] = 1; }
    }
    for (let x = 0; x < W; x++) {
      let last = -1e9;
      for (let y = 0; y < H; y++) { if (t[y * W + x]) last = y; if (y - last <= r) o[y * W + x] = 1; }
      last = 1e9;
      for (let y = H - 1; y >= 0; y--) { if (t[y * W + x]) last = y; if (last - y <= r) o[y * W + x] = 1; }
    }
    return o;
  }

  // ετικέτες συνεκτικών περιοχών
  function label(m, W, H, value, eight) {
    const lab = new Int32Array(W * H).fill(-1);
    const comps = [];
    const st = new Int32Array(W * H);
    for (let s = 0; s < W * H; s++) {
      if (m[s] !== value || lab[s] >= 0) continue;
      const id = comps.length;
      let sp = 0; st[sp++] = s; lab[s] = id;
      let n = 0, x0 = W, y0 = H, x1 = 0, y1 = 0, border = false;
      while (sp) {
        const p = st[--sp], x = p % W, y = (p / W) | 0;
        n++;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (x === 0 || y === 0 || x === W - 1 || y === H - 1) border = true;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          if (!eight && dx && dy) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const q = ny * W + nx;
          if (m[q] === value && lab[q] < 0) { lab[q] = id; st[sp++] = q; }
        }
      }
      comps.push({ id, n, x0, y0, x1, y1, border, start: s });
    }
    return { lab, comps };
  }

  // περίγραμμα (Moore) μιας περιοχής
  function trace(lab, id, W, H, start) {
    const dx = [1, 1, 0, -1, -1, -1, 0, 1], dy = [0, 1, 1, 1, 0, -1, -1, -1];
    const ins = (x, y) => x >= 0 && y >= 0 && x < W && y < H && lab[y * W + x] === id;
    const sx = start % W, sy = (start / W) | 0;
    let x = sx, y = sy, d = 0;
    const pts = [[x, y]];
    let firstDir = -1;
    for (let it = 0; it < W * H * 2; it++) {
      let moved = false;
      const s0 = (d + 6) % 8;
      for (let k = 0; k < 8; k++) {
        const nd = (s0 + k) % 8;
        if (ins(x + dx[nd], y + dy[nd])) {
          x += dx[nd]; y += dy[nd]; d = nd; moved = true;
          break;
        }
      }
      if (!moved) break;
      if (x === sx && y === sy) {
        if (firstDir === -1) break;
        if (d === firstDir || it > 4) break;
      }
      if (firstDir === -1) firstDir = d;
      pts.push([x, y]);
    }
    return pts;
  }

  function dp(pts, eps) {
    if (pts.length < 3) return pts;
    const keep = new Uint8Array(pts.length);
    keep[0] = keep[pts.length - 1] = 1;
    const st = [[0, pts.length - 1]];
    while (st.length) {
      const [a, b] = st.pop();
      const [ax, ay] = pts[a], [bx, by] = pts[b];
      const L = Math.hypot(bx - ax, by - ay) || 1;
      let md = -1, mi = -1;
      for (let i = a + 1; i < b; i++) {
        const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / L;
        if (d > md) { md = d; mi = i; }
      }
      if (md > eps) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
    }
    return pts.filter((_, i) => keep[i]);
  }
  function dpClosed(pts, eps) {
    if (pts.length < 4) return pts;
    // σπάσιμο στο πιο απομακρυσμένο σημείο από το πρώτο
    let far = 0, fd = -1;
    pts.forEach((p, i) => { const d = Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]); if (d > fd) { fd = d; far = i; } });
    const a = dp(pts.slice(0, far + 1), eps), b = dp(pts.slice(far).concat([pts[0]]), eps);
    return a.slice(0, -1).concat(b.slice(0, -1));
  }

  const area = (p) => { let a = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; a += x1 * y2 - x2 * y1; } return a / 2; };

  function orthogonalize(pts) {
    const n = pts.length, p = pts.map(q => q.slice());
    const hz = [];
    for (let i = 0; i < n; i++) { const a = p[i], b = p[(i + 1) % n]; hz.push(Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1])); }
    for (let it = 0; it < 4; it++) for (let i = 0; i < n; i++) {
      const a = p[i], b = p[(i + 1) % n];
      if (hz[i]) { const y = (a[1] + b[1]) / 2; a[1] = y; b[1] = y; } else { const x = (a[0] + b[0]) / 2; a[0] = x; b[0] = x; }
    }
    return p;
  }
  function simplify(pts, minLen = 0.5) {
    let p = pts.slice(), ch = true;
    while (ch && p.length > 3) {
      ch = false;
      for (let i = 0; i < p.length; i++) {
        const a = p[(i - 1 + p.length) % p.length], b = p[i], c = p[(i + 1) % p.length];
        const cr = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
        if (Math.hypot(b[0] - a[0], b[1] - a[1]) < minLen || Math.abs(cr) < 0.5) { p.splice(i, 1); ch = true; break; }
      }
    }
    return p;
  }
  // αφαίρεση μικρών «σκαλοπατιών» από το χέρι
  function cleanSteps(pts, tol) {
    let p = simplify(orthogonalize(pts));
    for (let pass = 0; pass < 30 && p.length > 4; pass++) {
      const n = p.length;
      let bi = -1, bl = tol;
      for (let i = 0; i < n; i++) {
        const a = p[i], b = p[(i + 1) % n];
        const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (l < bl) { bl = l; bi = i; }
      }
      if (bi < 0) break;
      const i0 = (bi - 1 + n) % n, i1 = bi, i2 = (bi + 1) % n, i3 = (bi + 2) % n;
      const A = p[i1], B = p[i2];
      const horiz = Math.abs(B[1] - A[1]) < Math.abs(B[0] - A[0]) || Math.abs(B[1] - A[1]) < 0.01;
      // οι γειτονικοί τοίχοι ενώνονται στη μέση
      if (horiz) { const x = (A[0] + B[0]) / 2; p[i0][0] = x; p[i3][0] = x; }
      else { const y = (A[1] + B[1]) / 2; p[i0][1] = y; p[i3][1] = y; }
      p = p.filter((_, k) => k !== i1 && k !== i2);
      p = simplify(orthogonalize(p));
    }
    return p;
  }
  // μετακίνηση κάθε τοίχου προς τα έξω κατά d
  function expand(pts, d) {
    const n = pts.length, p = pts.map(q => q.slice());
    const sgn = area(pts) > 0 ? 1 : -1; // σε συντεταγμένες οθόνης: θετικό = δεξιόστροφο
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const ex = b[0] - a[0], ey = b[1] - a[1], L = Math.hypot(ex, ey) || 1;
      // εξωτερική κάθετος
      const nx = (ey / L) * sgn, ny = (-ex / L) * sgn;
      if (Math.abs(ey) < Math.abs(ex)) { p[i][1] = a[1] + ny * d; p[(i + 1) % n][1] = a[1] + ny * d; }
      else { p[i][0] = a[0] + nx * d; p[(i + 1) % n][0] = a[0] + nx * d; }
    }
    return p;
  }
  // κοινές τιμές για τοίχους που σχεδόν συμπίπτουν (οι διπλανοί χώροι μοιράζονται τοίχο)
  function cluster(vals, tol) {
    const s = [...new Set(vals)].sort((a, b) => a - b);
    const map = new Map();
    let grp = [];
    const flush = () => { if (!grp.length) return; const m = grp.reduce((a, b) => a + b, 0) / grp.length; grp.forEach(v => map.set(v, m)); grp = []; };
    s.forEach(v => { if (grp.length && v - grp[0] > tol) flush(); grp.push(v); });
    flush();
    return map;
  }

  /**
   * canvas: ισιωμένη φωτογραφία. Επιστρέφει χώρους σε pixel του canvas.
   */
  function detect(canvas) {
    const MAX = 720;
    const k = Math.min(1, MAX / Math.max(canvas.width, canvas.height));
    const W = Math.round(canvas.width * k), H = Math.round(canvas.height * k);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    g.drawImage(canvas, 0, 0, W, H);
    const img = g.getImageData(0, 0, W, H).data;
    const n = grayNormalized(img, W, H);
    const S = Math.max(W, H), Smin = Math.min(W, H);

    // μελάνι
    let ink = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) ink[i] = n[i] < 0.72 ? 1 : 0;
    // καθάρισμα περιθωρίου (άκρες χαρτιού, σκιές)
    const mg = Math.round(S * 0.012);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x < mg || y < mg || x >= W - mg || y >= H - mg) ink[y * W + x] = 0;
    // ένωση μικρών διακοπών της πένας
    const ink1 = dilate(ink, W, H, 1);
    // κράτα μόνο μεγάλα κομμάτια = τοίχοι (τα γράμματα είναι μικρά και φεύγουν)
    const L = label(ink1, W, H, 1, true);
    const minWall = Smin * 0.16;
    const keep = new Uint8Array(L.comps.length);
    L.comps.forEach(cp => { if (Math.max(cp.x1 - cp.x0, cp.y1 - cp.y0) >= minWall) keep[cp.id] = 1; });
    const walls = new Uint8Array(W * H);
    let wallPx = 0;
    for (let i = 0; i < W * H; i++) if (L.lab[i] >= 0 && keep[L.lab[i]]) { walls[i] = 1; wallPx++; }
    if (wallPx < S * 2) return { rooms: [], W, H, k };

    // πάχος γραμμής (εκτίμηση)
    let runs = 0, runSum = 0;
    for (let y = 0; y < H; y += 3) { let r = 0; for (let x = 0; x < W; x++) { if (walls[y * W + x]) r++; else { if (r > 0 && r < S * 0.05) { runs++; runSum += r; } r = 0; } } }
    const stroke = runs ? runSum / runs : 3;

    // κλείσιμο κενών (πόρτες που δεν σχεδιάστηκαν κλειστές)
    const R = Math.round(S * 0.024);
    const wd = dilate(walls, W, H, R);
    const F = label(wd, W, H, 0, false);
    const minArea = W * H * 0.004;
    const rooms = [];
    F.comps.forEach(cp => {
      if (cp.border || cp.n < minArea) return;
      // πολύ λεπτές λωρίδες = θόρυβος
      if (Math.min(cp.x1 - cp.x0, cp.y1 - cp.y0) < S * 0.02) return;
      let pts = trace(F.lab, cp.id, W, H, cp.start);
      if (pts.length < 8) return;
      pts = dpClosed(pts, Math.max(3, S * 0.012));
      if (pts.length < 3) return;
      pts = cleanSteps(pts, S * 0.035);
      if (pts.length < 4) return;
      pts = expand(pts, R + stroke / 2 + 0.5);
      if (Math.abs(area(pts)) < minArea) return;
      rooms.push(pts);
    });
    if (!rooms.length) return { rooms: [], W, H, k };

    // κοινοί τοίχοι
    const tol = S * 0.03;
    const xs = cluster(rooms.flatMap(r => r.map(p => p[0])), tol);
    const ys = cluster(rooms.flatMap(r => r.map(p => p[1])), tol);
    let out = rooms.map(r => simplify(r.map(p => [xs.get(p[0]), ys.get(p[1])]), 1));
    out = out.filter(r => r.length >= 4 && Math.abs(area(r)) > minArea);
    // σειρά: πάνω→κάτω, αριστερά→δεξιά
    const cen = r => { let x = 0, y = 0; r.forEach(p => { x += p[0]; y += p[1]; }); return [x / r.length, y / r.length]; };
    out.sort((a, b) => { const ca = cen(a), cb = cen(b); return Math.abs(ca[1] - cb[1]) > S * 0.08 ? ca[1] - cb[1] : ca[0] - cb[0]; });
    // σε pixel του αρχικού canvas
    return { rooms: out.map(r => r.map(p => [p[0] / k, p[1] / k])), W: canvas.width, H: canvas.height };
  }

  window.EPC_DETECT = { detect };
})();
