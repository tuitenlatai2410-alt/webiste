/* =========================================================
   QUỲNH NHƯ FLORIST — intro3d.js
   Chữ 3D "Quỳnh Như / Florist" kiểu thạch (jelly) hồng bóng, trong suốt, ánh xà cừ,
   từng chữ nảy lên kiểu lò xo + sao lấp lánh, trái tim + pháo hoa cánh hoa.
   Chỉ được nạp lười bởi main.js.
   ========================================================= */
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

const LINES = ['Quỳnh Như', 'Florist'];
const MAX_ROT = THREE.MathUtils.degToRad(15);
const BG_TOP = '#FDF0F2', BG_BOTTOM = '#F9DFE6';

export async function play({ canvas, hello, fontUrl, fontData, lowPower, input }) {
  const fontJSON = fontData || await fetch(fontUrl).then((r) => {
    if (!r.ok) throw new Error('font ' + r.status);
    return r.json();
  });
  const font = new FontLoader().parse(fontJSON);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping; // giữ đúng sắc hồng

  const scene = new THREE.Scene();
  const disposables = [];
  const keep = (x) => { disposables.push(x); return x; };

  // Nền hồng phấn (chữ trong suốt sẽ "nhìn xuyên" thấy nền này)
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = 4; bgCanvas.height = 256;
  const bctx = bgCanvas.getContext('2d');
  const bg = bctx.createLinearGradient(0, 0, 0, 256);
  bg.addColorStop(0, BG_TOP); bg.addColorStop(1, BG_BOTTOM);
  bctx.fillStyle = bg; bctx.fillRect(0, 0, 4, 256);
  const bgTex = keep(new THREE.CanvasTexture(bgCanvas));
  bgTex.colorSpace = THREE.SRGBColorSpace;
  scene.background = bgTex;

  const pmrem = keep(new THREE.PMREMGenerator(renderer));
  // Môi trường phản chiếu tự dựng: bầu trời hồng–trắng + hộp sáng bo tròn → vệt sáng mềm, tròn như bong bóng
  const envScene = new THREE.Scene();
  const skyGeo = new THREE.SphereGeometry(20, 32, 16), skyCol = [];
  const cTop = new THREE.Color(0xffffff), cMid = new THREE.Color(0xffe3ec), cBot = new THREE.Color(0xf3a6c4);
  for (let i = 0; i < skyGeo.attributes.position.count; i++) {
    const y = skyGeo.attributes.position.getY(i) / 20, c = y > 0 ? cMid.clone().lerp(cTop, y) : cMid.clone().lerp(cBot, -y);
    skyCol.push(c.r, c.g, c.b);
  }
  skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(skyCol, 3));
  envScene.add(new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const box = (w, h, x, y, z, col, k) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
    m.scale.set(w, h, 1); m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m);
  };
  box(3.2, 2.2, -5, 6, 6, 0xffffff, 4);   // đèn chính trên-trái
  box(1.2, 1.2, 6, 4, 5, 0xffffff, 2.4);    // điểm sáng nhỏ bên phải
  box(4, 1.5, 3, -5, 4, 0xffc4a8, 1.6);     // ánh đào ấm phía dưới
  box(5, 3, 0, 2, -8, 0xffd6e6, 1.4);       // viền sáng phía sau
  const envRT = keep(pmrem.fromScene(envScene, 0.02));
  envScene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  scene.environment = envRT.texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  // Ánh sáng chủ yếu từ môi trường (cho vệt sáng trắng bóng như bong bóng) + chút ánh đào ấm ở mép
  scene.add(new THREE.HemisphereLight(0xffffff, 0xffd9e4, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.5); key.position.set(-3, 5, 6); scene.add(key);
  const warm = new THREE.PointLight(0xffb38a, 6, 25); warm.position.set(5, -3, 3); scene.add(warm);

  /* ---- Chất liệu thạch hồng ---- */
  const jelly = keep(new THREE.MeshPhysicalMaterial({
    color: lowPower ? 0xf27fae : 0xffbcd5,
    roughness: 0.03,
    metalness: 0,
    transmission: lowPower ? 0 : 0.62,
    thickness: 1.1,
    ior: 1.5,
    attenuationColor: new THREE.Color(0xff6fa3),
    attenuationDistance: 1.3,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    iridescence: lowPower ? 0.6 : 1,
    iridescenceIOR: 1.4,
    iridescenceThicknessRange: [180, 560],
    specularIntensity: 1,
    envMapIntensity: lowPower ? 1.05 : 1.7,
  }));

  /* ---- Tạo khối "bơm phồng" như bong bóng từ hình 2D ----
     Vẽ hình lên canvas → tính trường khoảng cách tới mép (SDF) → nâng bề mặt theo cung tròn:
     mép mỏng, giữa phồng, góc tự bo tròn. Mặt trước + mặt sau hàn kín ở mép. */
  const INF = 1e20;
  function edt1d(f, n, d, v, z) {
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < n; q++) {
      let sv = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (sv <= z[k]) { k--; sv = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = sv; z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
  }
  function edt(grid, W, H) { // bình phương khoảng cách Euclid (Felzenszwalb)
    const n = Math.max(W, H), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
    for (let x = 0; x < W; x++) { for (let y = 0; y < H; y++) f[y] = grid[y * W + x]; edt1d(f, H, d, v, z); for (let y = 0; y < H; y++) grid[y * W + x] = d[y]; }
    for (let y = 0; y < H; y++) { for (let x = 0; x < W; x++) f[x] = grid[y * W + x]; edt1d(f, W, d, v, z); for (let x = 0; x < W; x++) grid[y * W + x] = d[x]; }
  }
  function inflate(shapes, { R = 0.1, grow = 0.03, zk = 1.15, ppu = 220, cell = lowPower ? 3 : 2 } = {}) {
    const groups = shapes.map((sh) => [sh.getPoints(16), ...sh.holes.map((h) => h.getPoints(16))]);
    const pts = groups.flat();
    let minX = INF, minY = INF, maxX = -INF, maxY = -INF;
    pts.forEach((ps) => ps.forEach((p) => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }));
    const pad = grow + 0.04;
    minX -= pad; minY -= pad; maxX += pad; maxY += pad;
    const W = Math.ceil((maxX - minX) * ppu), H = Math.ceil((maxY - minY) * ppu);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c2 = cv.getContext('2d', { willReadFrequently: true });
    c2.setTransform(ppu, 0, 0, -ppu, -minX * ppu, maxY * ppu);
    // Tô từng hình riêng (viền ngoài + lỗ của nó) → các nét chồng nhau của font biến thiên được hợp lại, không bị thủng
    groups.forEach((grp) => {
      c2.beginPath();
      grp.forEach((ps) => { ps.forEach((p, i) => (i ? c2.lineTo(p.x, p.y) : c2.moveTo(p.x, p.y))); c2.closePath(); });
      c2.fill('evenodd');
    });
    const img = c2.getImageData(0, 0, W, H).data;
    const inG = new Float64Array(W * H), outG = new Float64Array(W * H);
    for (let i = 0; i < W * H; i++) { const on = img[i * 4 + 3] > 127; inG[i] = on ? INF : 0; outG[i] = on ? 0 : INF; }
    edt(inG, W, H); edt(outG, W, H);
    const sdf = new Float32Array(W * H); // dương bên trong, đơn vị = đơn vị chữ
    for (let i = 0; i < W * H; i++) sdf[i] = (inG[i] > 0 ? Math.sqrt(inG[i]) - 0.5 : 0.5 - Math.sqrt(outG[i])) / ppu + grow;
    // Làm mờ trường khoảng cách → sống lưng giữa nét được bo tròn, không còn nếp gấp
    const rad = Math.max(2, Math.round(ppu * 0.028)), tmp = new Float32Array(W * H);
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 0; y < H; y++) { let acc = 0; const o = y * W;
        for (let x = -rad; x <= rad; x++) acc += sdf[o + Math.min(W - 1, Math.max(0, x))];
        for (let x = 0; x < W; x++) { tmp[o + x] = acc / (2 * rad + 1); acc += sdf[o + Math.min(W - 1, x + rad + 1)] - sdf[o + Math.max(0, x - rad)]; } }
      for (let x = 0; x < W; x++) { let acc = 0;
        for (let y = -rad; y <= rad; y++) acc += tmp[Math.min(H - 1, Math.max(0, y)) * W + x];
        for (let y = 0; y < H; y++) { sdf[y * W + x] = acc / (2 * rad + 1); acc += tmp[Math.min(H - 1, y + rad + 1) * W + x] - tmp[Math.max(0, y - rad) * W + x]; } }
    }
    const S = (x, y) => { // lấy mẫu song tuyến
      x = Math.max(0, Math.min(W - 1.001, x)); y = Math.max(0, Math.min(H - 1.001, y));
      const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, i = y0 * W + x0;
      return (sdf[i] * (1 - fx) + sdf[i + 1] * fx) * (1 - fy) + (sdf[i + W] * (1 - fx) + sdf[i + W + 1] * fx) * fy;
    };
    const prof = (d) => (d <= 0 ? 0 : d < R ? Math.sqrt(R * R - (R - d) * (R - d)) : R + (d - R) * 0.35) * zk;
    const gw = Math.floor((W - 1) / cell) + 1, gh = Math.floor((H - 1) / cell) + 1;
    const lim = -cell * 1.25 / ppu;
    const front = new Int32Array(gw * gh).fill(-1), back = new Int32Array(gw * gh).fill(-1);
    const P = [], ID = [];
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      let px = i * cell, py = j * cell, d = S(px, py);
      if (d < lim) continue;
      if (d < 0.004) { // kéo điểm sát mép về đúng đường viền → mép mượt, không răng cưa
        for (let it = 0; it < 3; it++) {
          const gx = S(px + 1, py) - S(px - 1, py), gy = S(px, py + 1) - S(px, py - 1), gl = Math.hypot(gx, gy) || 1;
          const dd = S(px, py);
          px -= (gx / gl) * dd * ppu; py -= (gy / gl) * dd * ppu;
        }
        d = 0;
      }
      const X = minX + px / ppu, Y = maxY - py / ppu, Z = prof(d);
      front[j * gw + i] = P.length / 3; P.push(X, Y, Z);
      if (Z > 1e-5) { back[j * gw + i] = P.length / 3; P.push(X, Y, -Z); } else back[j * gw + i] = front[j * gw + i];
    }
    for (let j = 0; j < gh - 1; j++) for (let i = 0; i < gw - 1; i++) {
      const a = j * gw + i, b = a + 1, c = a + gw, d = c + 1;
      const tri = (p, q, r) => {
        if (front[p] < 0 || front[q] < 0 || front[r] < 0) return;
        if (back[p] === front[p] && back[q] === front[q] && back[r] === front[r]) return; // cả 3 nằm trên mép
        ID.push(front[p], front[r], front[q]); ID.push(back[p], back[q], back[r]);
      };
      tri(a, b, c); tri(b, d, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setIndex(ID);
    g.computeVertexNormals();
    return g;
  }

  /* ---- Từng chữ là một khối riêng để nảy kiểu thạch ---- */
  const root = new THREE.Group();       // xoay theo chuột / nghiêng máy
  scene.add(root);
  const letters = [];
  const LH = 1.14, TRACK = 0.06, scale = 1;
  const res = fontJSON.resolution;
  const lineWidths = [];
  LINES.forEach((line, li) => {
    const chars = [...line];
    let x = 0;
    const items = [];
    chars.forEach((ch) => {
      const g = fontJSON.glyphs[ch];
      const adv = (g ? g.ha / res : 0.3) * scale;
      if (ch !== ' ') {
        const shapes = font.generateShapes(ch, scale);
        const geo = keep(inflate(shapes, { R: 0.1, grow: 0.035, zk: 1.2 }));
        geo.computeBoundingBox();
        const bb = geo.boundingBox, c = new THREE.Vector3();
        bb.getCenter(c);
        geo.translate(-c.x, -c.y, -c.z);
        const mesh = new THREE.Mesh(geo, jelly);
        items.push({ mesh, cx: x + c.x, cy: c.y });
      }
      x += adv + TRACK;
    });
    const width = x - TRACK;
    lineWidths.push(width);
    const y = ((LINES.length - 1) / 2 - li) * LH;
    items.forEach((it) => {
      const holder = new THREE.Group();
      holder.position.set(it.cx - width / 2, y + it.cy - 0.28, 0);
      holder.add(it.mesh);
      root.add(holder);
      letters.push({ holder, mesh: it.mesh, base: holder.position.clone() });
    });
  });

  const w0 = lineWidths[0];
  const yTop = LH / 2;
  const decos = []; // không dùng icon trang trí — chỉ chữ + cánh hoa

  /* ---- Bóng đổ mềm phía sau ---- */
  const shCanvas = document.createElement('canvas'); shCanvas.width = shCanvas.height = 128;
  const sctx = shCanvas.getContext('2d');
  const rg = sctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  rg.addColorStop(0, 'rgba(214,92,140,0.30)'); rg.addColorStop(0.55, 'rgba(214,92,140,0.12)'); rg.addColorStop(1, 'rgba(214,92,140,0)');
  sctx.fillStyle = rg; sctx.fillRect(0, 0, 128, 128);
  const shTex = keep(new THREE.CanvasTexture(shCanvas));
  const shMat = keep(new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false }));
  const shGeo = keep(new THREE.PlaneGeometry(1, 1));
  const shadow = new THREE.Mesh(shGeo, shMat);
  shadow.scale.set(w0 * 1.25, LH * 2.4, 1);
  shadow.position.set(0.12, -0.25, -0.6);
  shadow.renderOrder = -1;
  scene.add(shadow);

  /* ---- Cánh hoa hồng (InstancedMesh): bắn ra như pháo hoa rồi rơi lả lướt ---- */
  // Hình cánh hoa hồng: tròn đầu, nhọn ở chân
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0.04, -0.5);
  petalShape.bezierCurveTo(0.36, -0.42, 0.56, -0.06, 0.5, 0.2);
  petalShape.bezierCurveTo(0.45, 0.44, 0.22, 0.52, 0.03, 0.45);
  petalShape.bezierCurveTo(-0.17, 0.53, -0.46, 0.42, -0.5, 0.14);
  petalShape.bezierCurveTo(-0.54, -0.14, -0.28, -0.44, 0.04, -0.5);
  const petalGeo = keep(new THREE.ShapeGeometry(petalShape, 12));
  { // uốn cong như cánh hoa thật + UV 0..1
    const pos = petalGeo.attributes.position, uv = petalGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i, -0.22 * x * x + 0.1 * (y + 0.5) * (y + 0.5));
      uv.setXY(i, x + 0.5, y + 0.5);
    }
    petalGeo.computeVertexNormals();
  }
  // Vân cánh hoa vẽ bằng canvas: giữa nhạt, viền hồng, chân hồng đậm, gân mờ
  const pc = document.createElement('canvas'); pc.width = pc.height = 128;
  const px = pc.getContext('2d');
  let gr = px.createRadialGradient(60, 52, 6, 64, 64, 80);
  gr.addColorStop(0, '#fff3f7'); gr.addColorStop(0.55, '#fbd0df'); gr.addColorStop(1, '#f19dbd');
  px.fillStyle = gr; px.fillRect(0, 0, 128, 128);
  gr = px.createRadialGradient(68, 124, 2, 68, 124, 46);
  gr.addColorStop(0, 'rgba(214,52,118,.95)'); gr.addColorStop(0.45, 'rgba(232,103,154,.45)'); gr.addColorStop(1, 'rgba(232,103,154,0)');
  px.fillStyle = gr; px.fillRect(0, 0, 128, 128);
  px.strokeStyle = 'rgba(255,255,255,.28)'; px.lineWidth = 0.8;
  for (let k = -5; k <= 5; k++) { px.beginPath(); px.moveTo(68, 126); px.quadraticCurveTo(68 + k * 6, 70, 64 + k * 11, 8); px.stroke(); }
  for (let k = 0; k < 90; k++) { px.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.12) + ')'; px.fillRect(Math.random() * 128, Math.random() * 128, 2, 2); }
  const petalTex = keep(new THREE.CanvasTexture(pc));
  petalTex.colorSpace = THREE.SRGBColorSpace;
  petalTex.flipY = false;
  const petalMat = keep(new THREE.MeshStandardMaterial({ map: petalTex, emissiveMap: petalTex, emissive: 0xffffff, emissiveIntensity: 0.55, side: THREE.DoubleSide, roughness: 0.55, metalness: 0, envMapIntensity: 0.6 }));

  const N1 = lowPower ? 28 : 56, N2 = lowPower ? 10 : 22, N3 = lowPower ? 10 : 20, N = N1 + N2 + N3;
  const petals = new THREE.InstancedMesh(petalGeo, petalMat, N);
  petals.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  petals.frustumCulled = false;
  scene.add(petals);
  const tints = [0xffffff, 0xffe6ee, 0xffd6e4, 0xf9c4d6, 0xfff0f5].map((c) => new THREE.Color(c));
  const P = [];
  for (let i = 0; i < N; i++) {
    petals.setColorAt(i, tints[i % tints.length]);
    P.push({ born: -1, pos: new THREE.Vector3(), vel: new THREE.Vector3(), rot: new THREE.Euler(), spin: new THREE.Vector3(), size: 0, life: 3, sway: 0, phase: 0 });
  }
  const dummy = new THREE.Object3D();
  dummy.scale.setScalar(0); dummy.updateMatrix();
  for (let i = 0; i < N; i++) petals.setMatrixAt(i, dummy.matrix);
  const view = { hw: 4, hh: 3 }; // nửa bề rộng / chiều cao khung nhìn tại z = 0 (cập nhật trong layout)
  function seed(p, t) {
    p.born = t + Math.random() * 0.08;
    p.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    p.spin.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3);
    p.size = 0.07 + Math.random() * 0.06;
    p.sway = 0.5 + Math.random() * 0.7; p.phase = Math.random() * 6.28;
  }
  function burst(from, to, t, power) { // pháo hoa: bắn ra từ tâm
    for (let i = from; i < to; i++) {
      const p = P[i], a = Math.random() * Math.PI * 2, sp = (2.2 + Math.random() * 3.2) * power;
      seed(p, t);
      p.pos.set((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.2, 0.8);
      p.vel.set(Math.cos(a) * sp, Math.sin(a) * sp * 0.9 + 0.8, (Math.random() - 0.3) * 1.6);
      p.life = 2.6 + Math.random() * 0.6;
    }
  }
  function rain(from, to, t) { // cánh hoa rơi từ trên xuống
    for (let i = from; i < to; i++) {
      const p = P[i];
      seed(p, t + Math.random() * 1.6);
      p.pos.set((Math.random() * 2 - 1) * view.hw * 0.95, view.hh + 0.3 + Math.random() * 0.6, (Math.random() - 0.5) * 1.5);
      p.vel.set((Math.random() - 0.5) * 0.3, -0.5 - Math.random() * 0.3, 0);
      p.life = 3.4;
    }
  }

  /* ---- Bố cục theo màn hình ---- */
  const contentW = w0 + 0.15, contentH = LH * 2 + 0.9;
  function layout() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const fillW = camera.aspect < 0.9 ? 0.98 : 0.68;
    const dW = contentW / (fillW * 2 * tan * camera.aspect);
    const dH = contentH / (0.62 * 2 * tan);
    camera.position.set(0, 0, Math.max(dW, dH));
    view.hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z; view.hw = view.hh * camera.aspect;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    if (hello) { // đặt nhãn "Chào mừng bạn đến với" phía trên chữ
      const top = new THREE.Vector3(0, yTop + 0.75, 0).project(camera);
      const y = (1 - (top.y + 1) / 2) * h;
      hello.style.position = 'absolute';
      hello.style.left = '50%'; hello.style.transform = 'translateX(-50%)';
      hello.style.top = Math.max(64, y - 44) + 'px';
    }
  }
  layout();
  window.addEventListener('resize', layout);

  /* ---- Vòng lặp: lò xo + nảy kiểu thạch ---- */
  const rot = { rx: 0, vrx: 0, ry: 0, vry: 0 };
  letters.forEach((L, i) => { L.s = 0; L.v = 0; L.delay = 0.05 + i * 0.055; });
  let t0 = -1, last = 0, raf = 0, b1 = false, b2 = false, alive = true;

  function frame(now) {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    if (t0 < 0) { t0 = now; last = now; }
    const t = (now - t0) / 1000, dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    const tx = (input ? input.ty : 0) * MAX_ROT * 0.8, ty = (input ? input.tx : 0) * MAX_ROT;
    for (let rem = dt; rem > 1e-6; rem -= 1 / 120) {
      const h = Math.min(rem, 1 / 120);
      rot.vrx += (-55 * (rot.rx - tx) - 6 * rot.vrx) * h; rot.rx += rot.vrx * h;
      rot.vry += (-55 * (rot.ry - ty) - 6 * rot.vry) * h; rot.ry += rot.vry * h;
      letters.forEach((L) => {
        if (t < L.delay) return;
        L.v += (-170 * (L.s - 1) - 9 * L.v) * h; L.s += L.v * h; // scale 0 → ~1.1 → ~0.96 → 1
      });
      decos.forEach((D) => {
        if (t < D.d.delay) return;
        D.v += (-150 * (D.s - 1) - 8 * D.v) * h; D.s += D.v * h;
      });
    }
    root.rotation.set(rot.rx, rot.ry, 0);

    letters.forEach((L, i) => {
      const s = Math.max(L.s, 0.0001);
      // co giãn kiểu thạch: khi đang bật lên thì dài ra, khi chững lại thì bè ra
      const squash = THREE.MathUtils.clamp(L.v * 0.012, -0.14, 0.14);
      L.mesh.scale.set(s * (1 - squash), s * (1 + squash), s);
      L.holder.position.y = L.base.y + Math.sin(t * 2.2 + i * 0.55) * 0.025 * Math.min(1, t);
    });
    decos.forEach((D) => {
      const s = Math.max(D.s, 0.0001) * D.d.s;
      D.g.scale.setScalar(s);
      D.g.position.y = D.d.y + Math.sin(t * 1.8 + D.i) * 0.06;
      D.g.rotation.y = Math.sin(t * 1.2 + D.i) * 0.5;
    });
    shadow.material.opacity = Math.min(1, t * 2);

    if (!b1 && t > 0.45) { b1 = true; burst(0, N1, t, 1); rain(N1 + N2, N, t); }
    if (!b2 && t > 1.15) { b2 = true; burst(N1, N1 + N2, t, 0.65); }
    for (let i = 0; i < N; i++) {
      const p = P[i];
      if (p.born < 0 || t < p.born) continue;
      const age = t - p.born;
      if (age > p.life) { dummy.scale.setScalar(0); dummy.updateMatrix(); petals.setMatrixAt(i, dummy.matrix); continue; }
      // lực cản lớn → bung ra rồi khựng lại; trọng lực nhẹ + tốc độ rơi giới hạn → rơi lả lướt, đung đưa
      p.vel.multiplyScalar(Math.exp(-2.4 * dt));
      p.vel.y = Math.max(p.vel.y - 1.6 * dt, -0.85);
      p.pos.addScaledVector(p.vel, dt);
      p.pos.x += Math.sin(t * 2.4 * p.sway + p.phase) * 0.35 * p.sway * dt;
      p.rot.x += p.spin.x * dt; p.rot.y += p.spin.y * dt; p.rot.z += (p.spin.z + Math.cos(t * 2 + p.phase)) * dt;
      const grow = Math.min(age / 0.15, 1), fade = 1 - THREE.MathUtils.smoothstep(age / p.life, 0.7, 1);
      dummy.position.copy(p.pos); dummy.rotation.copy(p.rot);
      dummy.scale.setScalar(p.size * grow * fade);
      dummy.updateMatrix(); petals.setMatrixAt(i, dummy.matrix);
    }
    petals.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }
  // Biên dịch shader trước để khung hình đầu không bị giật
  letters.forEach((L) => L.mesh.scale.setScalar(0.0001));
  decos.forEach((D) => D.g.scale.setScalar(0.0001));
  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);

  return {
    dispose() {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', layout);
      disposables.forEach((d) => { try { d.dispose(); } catch (e) { /* bỏ qua */ } });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
