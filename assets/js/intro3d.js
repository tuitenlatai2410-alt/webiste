/* =========================================================
   QUỲNH NHƯ FLORIST — intro3d.js
   Chữ 3D "Quỳnh Như Florist" hồng bóng, bung ra kiểu lò xo
   + pháo hoa cánh hoa (InstancedMesh). Chỉ được nạp lười bởi main.js.
   ========================================================= */
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const TEXT = 'Quỳnh Như Florist';
const MAX_ROT = THREE.MathUtils.degToRad(15);

export async function play({ canvas, hello, fontUrl, lowPower, input }) {
  const fontJSON = await fetch(fontUrl).then((r) => {
    if (!r.ok) throw new Error('font ' + r.status);
    return r.json();
  });
  const font = new FontLoader().parse(fontJSON);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping; // giữ đúng sắc hồng thương hiệu

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(renderer), 0.04);
  scene.environment = envRT.texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(3, 4, 6); scene.add(key);
  const rim = new THREE.PointLight(0xf7c9da, 30, 20); rim.position.set(-4, 2, 3); scene.add(rim);
  const under = new THREE.PointLight(0xc2437a, 20, 20); under.position.set(2, -3, 3); scene.add(under);

  /* ---- Chữ 3D ---- */
  const textMat = new THREE.MeshPhysicalMaterial({
    color: 0xe8679a, metalness: 0.05, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.55,
  });
  const geoOpts = { font, size: 1, height: 0.3, curveSegments: lowPower ? 5 : 8, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.03, bevelSegments: lowPower ? 2 : 4 };
  const textGroup = new THREE.Group();
  const holder = new THREE.Group(); // nhận xoay + nảy
  holder.add(textGroup); scene.add(holder);
  const geometries = [];
  let lines = [];

  function buildText(twoLines) {
    textGroup.clear();
    geometries.forEach((g) => g.dispose()); geometries.length = 0;
    lines = twoLines ? ['Quỳnh Như', 'Florist'] : [TEXT];
    const lh = 1.18;
    lines.forEach((line, i) => {
      const g = new TextGeometry(line, geoOpts);
      g.computeBoundingBox(); g.center();
      geometries.push(g);
      const m = new THREE.Mesh(g, textMat);
      m.position.y = ((lines.length - 1) / 2 - i) * lh;
      textGroup.add(m);
    });
  }

  /* ---- Cánh hoa (InstancedMesh) ---- */
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, -0.5);
  petalShape.bezierCurveTo(0.45, -0.25, 0.42, 0.3, 0, 0.5);
  petalShape.bezierCurveTo(-0.42, 0.3, -0.45, -0.25, 0, -0.5);
  const petalGeo = new THREE.ShapeGeometry(petalShape, 6);
  const petalMat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.45, metalness: 0, envMapIntensity: 0.7, transparent: true });
  const N1 = lowPower ? 40 : 80, N2 = lowPower ? 12 : 24, N = N1 + N2;
  const petals = new THREE.InstancedMesh(petalGeo, petalMat, N);
  petals.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  petals.frustumCulled = false;
  scene.add(petals);
  const palette = [0xe8679a, 0xf7c9da, 0xc2437a, 0xffffff, 0xf4f2f4, 0xd9d6da].map((c) => new THREE.Color(c));
  const P = [];
  for (let i = 0; i < N; i++) {
    petals.setColorAt(i, palette[i % palette.length]);
    P.push({ born: -1, pos: new THREE.Vector3(), vel: new THREE.Vector3(), rot: new THREE.Euler(), spin: new THREE.Vector3(), size: 0, life: 1.8 });
  }
  const dummy = new THREE.Object3D();
  function hideAll() {
    dummy.scale.setScalar(0); dummy.updateMatrix();
    for (let i = 0; i < N; i++) petals.setMatrixAt(i, dummy.matrix);
    petals.instanceMatrix.needsUpdate = true;
  }
  hideAll();
  function burst(from, to, t, power) {
    for (let i = from; i < to; i++) {
      const p = P[i], a = Math.random() * Math.PI * 2, sp = (2.8 + Math.random() * 4.2) * power;
      p.born = t + Math.random() * 0.08;
      p.pos.set((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.3, 0.6);
      p.vel.set(Math.cos(a) * sp, Math.sin(a) * sp * 0.85 + 1.2, (Math.random() - 0.3) * 2.2);
      p.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      p.spin.set((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 6);
      p.size = 0.13 + Math.random() * 0.13;
      p.life = 1.5 + Math.random() * 0.5;
    }
  }

  /* ---- Bố cục theo kích thước màn hình ---- */
  let twoLineMode = null;
  function layout() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const wantTwo = camera.aspect < 0.9;
    if (wantTwo !== twoLineMode) { twoLineMode = wantTwo; buildText(wantTwo); }
    const box = new THREE.Box3().setFromObject(textGroup), size = box.getSize(new THREE.Vector3());
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const fillW = camera.aspect < 0.9 ? 0.84 : 0.72;
    const dW = size.x / (fillW * 2 * tan * camera.aspect);
    const dH = size.y / (0.42 * 2 * tan);
    camera.position.set(0, 0, Math.max(dW, dH) + size.z);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    // Đặt dòng "Chào mừng bạn đến với" ngay trên chữ 3D
    if (hello) {
      const top = new THREE.Vector3(0, box.max.y * 1.1, 0).project(camera);
      const y = (1 - (top.y + 1) / 2) * h;
      hello.style.transform = 'none';
      hello.style.position = 'absolute';
      hello.style.left = '0'; hello.style.right = '0';
      hello.style.top = Math.max(16, y - 58) + 'px';
    }
  }
  layout();
  window.addEventListener('resize', layout);

  /* ---- Lò xo ---- */
  const spring = { s: 0, v: 0, rx: 0, vrx: 0, ry: 0, vry: 0 };
  let t0 = -1, last = 0, raf = 0, burst1 = false, burst2 = false, alive = true;

  function frame(now) {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    if (t0 < 0) { t0 = now; last = now; }
    const t = (now - t0) / 1000, dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    // Lò xo được chia bước nhỏ để máy yếu vẫn đúng nhịp thời gian thật
    const tx = (input ? input.ty : 0) * MAX_ROT * 0.8, ty = (input ? input.tx : 0) * MAX_ROT;
    for (let rem = dt; rem > 1e-6; rem -= 1 / 120) {
      const h = Math.min(rem, 1 / 120);
      // Chữ xuất hiện: scale 0 → ~1.08 → ~0.97 → 1
      spring.v += (-140 * (spring.s - 1) - 11 * spring.v) * h; spring.s += spring.v * h;
      // Xoay theo chuột / nghiêng máy (tối đa ±15°) và nảy lại
      spring.vrx += (-60 * (spring.rx - tx) - 7 * spring.vrx) * h; spring.rx += spring.vrx * h;
      spring.vry += (-60 * (spring.ry - ty) - 7 * spring.vry) * h; spring.ry += spring.vry * h;
    }
    holder.scale.setScalar(Math.max(spring.s, 0.0001));
    holder.rotation.set(spring.rx + Math.sin(t * 1.3) * 0.03, spring.ry + Math.sin(t * 0.9) * 0.05, 0);
    holder.position.y = Math.sin(t * 1.6) * 0.04;

    if (!burst1 && t > 0.3) { burst1 = true; burst(0, N1, t, 1); }
    if (!burst2 && t > 1.05) { burst2 = true; burst(N1, N, t, 0.7); }

    for (let i = 0; i < N; i++) {
      const p = P[i];
      if (p.born < 0 || t < p.born) continue;
      const age = t - p.born;
      if (age > p.life) { dummy.scale.setScalar(0); dummy.updateMatrix(); petals.setMatrixAt(i, dummy.matrix); continue; }
      const drag = Math.exp(-1.6 * dt);
      p.vel.multiplyScalar(drag); p.vel.y -= 3.2 * dt;
      p.pos.addScaledVector(p.vel, dt);
      p.rot.x += p.spin.x * dt; p.rot.y += p.spin.y * dt; p.rot.z += p.spin.z * dt;
      const grow = Math.min(age / 0.12, 1), fade = 1 - THREE.MathUtils.smoothstep(age / p.life, 0.55, 1);
      dummy.position.copy(p.pos); dummy.rotation.copy(p.rot);
      dummy.scale.setScalar(p.size * grow * fade);
      dummy.updateMatrix(); petals.setMatrixAt(i, dummy.matrix);
    }
    petals.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }
  // Biên dịch shader trước để khung hình đầu không bị giật
  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);

  return {
    dispose() {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', layout);
      geometries.forEach((g) => g.dispose());
      petalGeo.dispose(); petalMat.dispose(); textMat.dispose();
      envRT.dispose(); pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
