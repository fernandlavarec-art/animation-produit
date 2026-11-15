import * as THREE from './lib/three.module.js';
import * as P from './paint.js';
import * as T from './toon.js';

const W = 1920, H = 1080, FPS = 30;
let TOTAL = 900;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const out = document.createElement('canvas'); out.width = W; out.height = H;
const octx = out.getContext('2d');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 700);

// ---------- materials ----------
const STYLES = {
  toon:      { grad: [95, 175, 255], ink: '#0c0c12', inkMul: 1, tex: true, col: c => c },
  flat:      { grad: [205, 232, 255], ink: '#2b2d42', inkMul: 0, tex: false, col: c => P.mixHex(c, '#ffffff', 0.18), char: { ink: '#2b2d42', limb: '#2b2d42', lw: 0.8 } },
  bd:        { grad: [70, 255], ink: '#000000', inkMul: 1.9, tex: true, col: c => { const v = new THREE.Color(c); const h = {}; v.getHSL(h); v.setHSL(h.h, Math.min(1, h.s * 1.35), h.l); return '#' + v.getHexString(); }, char: { ink: '#000000', limb: '#000000', lw: 1.35 } },
  papier:    { grad: [150, 255], ink: '#4a3426', inkMul: 0.9, tex: false, col: c => P.mixHex(c, '#e8d9b8', 0.12), char: { ink: '#4a3426', limb: '#3b2a1e', lw: 0.9, head: '#fbf6ea' } },
  aquarelle: { grad: [165, 215, 255], ink: '#3a3f55', inkMul: 0.3, tex: true, col: c => P.mixHex(c, '#ffffff', 0.08), char: { ink: '#3a3f55', limb: '#2e3247', lw: 0.75 } },
  neon:      { grad: [60, 150, 255], ink: '#ff3fd2', inkMul: 1.1, tex: false, col: c => P.mixHex(P.shadeHex(c, 0.42), '#3b1d6e', 0.35), char: { ink: '#ff3fd2', limb: '#7df9ff', lw: 1.0 } },
};
const STYLE_NAME = window.STYLE || 'flat', STY = STYLES[STYLE_NAME];
Object.assign(T.ST, STY.char || {});
T.ST.v = T.VARIANTS[window.CHARV || 'moderne'];
const gd = []; STY.grad.forEach(v => gd.push(v, v, v, 255));
const grad = new THREE.DataTexture(new Uint8Array(gd), STY.grad.length, 1);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
const toon = (color, map = null, extra = {}) => {
  if (extra.emissive) extra = { ...extra, emissive: STY.col(extra.emissive) };
  let c = '#' + new THREE.Color(color).getHexString();
  if (!STY.tex && map && map.userData.base) { c = map.userData.base; map = null; }
  return new THREE.MeshToonMaterial({ color: STY.col(c), map, gradientMap: grad, ...extra });
};
const inkMat = new THREE.MeshBasicMaterial({ color: STY.ink, side: THREE.BackSide, fog: STYLE_NAME !== 'neon' });
const texCache = {};
const TBASE = { sand: '#ecd29a', asphalt: '#5d6168', side: '#cfc6b8', mfloor: '#9aa1a8', mwall: '#d9dee4', fab: '#2f5fa8', carpet: '#8e9db0', conc: '#d6cfc2', grass: '#7cae4e', tun: '#2a2c33' };
const ctex = (key, fn) => { if (!texCache[key]) { texCache[key] = P.tex(fn()); if (TBASE[key]) texCache[key].userData.base = TBASE[key]; } return texCache[key]; };
function rep(t, rx, ry) { const c = t.clone(); c.repeat.set(rx, ry); c.needsUpdate = true; return c; }

function ink(mesh, t = 0.03) {
  t *= STY.inkMul; if (t <= 0) return mesh;
  mesh.geometry.computeBoundingBox();
  const s = new THREE.Vector3(); mesh.geometry.boundingBox.getSize(s);
  const o = new THREE.Mesh(mesh.geometry, inkMat);
  o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01));
  mesh.add(o); return mesh;
}
// box with bottom at y
function box(g, w, h, d, x, y, z, mat, t = 0.03) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y + h / 2, z); if (t) ink(m, t); g.add(m); return m;
}
function cyl(g, r1, r2, h, x, y, z, mat, t = 0.025, seg = 14) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat);
  m.position.set(x, y + h / 2, z); if (t) ink(m, t); g.add(m); return m;
}
function ball(g, r, x, y, z, mat, t = 0.04, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), mat);
  m.position.set(x, y, z); m.scale.set(sx, sy, sz); if (t) ink(m, t); g.add(m); return m;
}
function facadeMats(front, side) { return [side, side, side, side, front, side]; }

function tree(g, x, z, s = 1, col = '#5aa53f') {
  cyl(g, 0.12 * s, 0.16 * s, 1.8 * s, x, 0, z, toon('#7a5233'));
  ball(g, 1.0 * s, x, 2.4 * s, z, toon(col), 0.05, 1, 0.9, 1);
  ball(g, 0.7 * s, x + 0.6 * s, 2.0 * s, z + 0.2, toon(P.shadeHex(col, 0.9)), 0.05);
}
function palm(g, x, z, s = 1, lean = 0.15) {
  const trunk = new THREE.Group(); trunk.position.set(x, 0, z); trunk.rotation.z = lean; g.add(trunk);
  for (let i = 0; i < 6; i++) cyl(trunk, 0.16 * s - i * 0.01, 0.2 * s - i * 0.01, 1.1 * s, 0, i * 1.05 * s, 0, toon(i % 2 ? '#8a6440' : '#9b744c'), 0.02);
  const top = new THREE.Group(); top.position.set(0, 6.3 * s, 0); trunk.add(top);
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), toon(i % 2 ? '#3f8f3a' : '#4fa443'));
    leaf.scale.set(1.9 * s, 0.12 * s, 0.45 * s); ink(leaf, 0.04);
    const piv = new THREE.Group(); piv.rotation.y = i / 7 * Math.PI * 2; piv.rotation.z = 0; top.add(piv);
    leaf.position.set(1.5 * s, -0.35 * s, 0); leaf.rotation.z = -0.35; piv.add(leaf);
  }
  ball(top, 0.3 * s, 0, 0, 0, toon('#6b4a2a'), 0.03);
}
function lamp(g, x, z, h = 4.2) {
  cyl(g, 0.06, 0.08, h, x, 0, z, toon('#2f3a44'));
  box(g, 0.7, 0.08, 0.12, x + 0.3, h - 0.05, z, toon('#2f3a44'), 0.02);
  box(g, 0.3, 0.14, 0.24, x + 0.55, h - 0.2, z, toon('#fff1c4', null, { emissive: '#ffe3a0', emissiveIntensity: 0.3 }), 0.02);
}

// ---------- cards (2D billboards) ----------
const CARD_W = 1.5, CARD_H = 2.0, ANCHOR = (T.SOLE - 512) / 1024 * 2;
const shadowTex = (() => { const c = P.canvas(128, 64); T.drawShadowBlob(c.getContext('2d')); return P.tex(c, { srgb: false }); })();
const cards = {};
class Card {
  constructor(name) {
    this.c = P.canvas(T.CW, T.CH); this.x = this.c.getContext('2d');
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.m = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.45, side: THREE.DoubleSide });
    const geo = new THREE.PlaneGeometry(CARD_W, CARD_H); geo.translate(0, ANCHOR, 0);
    this.mesh = new THREE.Mesh(geo, this.m); this.mesh.renderOrder = 2;
    this.sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    this.sh.rotation.x = -Math.PI / 2;
    scene.add(this.mesh); scene.add(this.sh); this.name = name;
  }
  hide() { this.mesh.visible = false; this.sh.visible = false; }
}
function card(name) { return cards[name] || (cards[name] = new Card(name)); }
let TINT = [1, 1, 1];
const placed = [];
function put(c, x, y, z, { s = 1, shadow = true, full = false, shw = 1 } = {}) {
  c.mesh.visible = true; c.mesh.position.set(x, y, z); c.mesh.scale.setScalar(s);
  c.full = full; c.m.color.setRGB(...TINT);
  c.sh.visible = shadow; c.sh.position.set(x, y + 0.012, z); c.sh.scale.set(s * shw, s * shw, 1);
  c.t.needsUpdate = true; placed.push(c);
}
function chr(name, outfit, x, y, z, o = {}, opt = {}) {
  const c = card(name); T.drawChar(c.x, { outfit, ...o }); put(c, x, y, z, opt); return c;
}
const walkPh = (d, stride = 0.72) => d / stride * Math.PI;
const blinkAt = (f, seed) => { const p = 46 + (seed * 17) % 27; return ((f + seed * 31) % p) < 4; };
const ss = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * t * (t * (t * 6 - 15) + 10); };
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const back = (t) => { t = clamp01(t); const s = 1.70158; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- light presets ----------
const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 1); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2); scene.add(sun); scene.add(sun.target);
const LIGHTS = {
  day:    { top: '#4f8fdc', hor: '#c4dbf2', fog: '#c4dbf2', near: 35, far: 260, hs: '#e2ecff', hg: '#9a8a6c', hi: 1.25, sc: '#fff3df', si: 2.1, dir: [0.6, 0.75, 0.55], tint: [1, 1, 1] },
  golden: { top: '#e9805c', hor: '#ffd28e', fog: '#ffcb8c', near: 30, far: 230, hs: '#ffd4a6', hg: '#6c5a8e', hi: 1.05, sc: '#ffb067', si: 2.5, dir: [-0.25, 0.32, -0.9], tint: [1, 0.93, 0.83] },
  office: { top: '#dfe8ef', hor: '#dfe8ef', fog: '#dfe8ef', near: 60, far: 400, hs: '#ffffff', hg: '#b6a68e', hi: 1.45, sc: '#fff6e8', si: 1.5, dir: [0.4, 0.8, 0.45], tint: [1, 0.99, 0.97] },
  metro:  { top: '#1d2230', hor: '#1d2230', fog: '#1d2230', near: 60, far: 400, hs: '#eef4ff', hg: '#5d6577', hi: 1.35, sc: '#eef3ff', si: 1.3, dir: [0.2, 0.9, 0.35], tint: [0.97, 0.99, 1.04] },
};
if (STYLE_NAME === 'neon') {
  const N = { top: '#140a33', hor: '#ff5fa2', fog: '#6a2a7e', near: 25, far: 200, hs: '#9a7bff', hg: '#2a1240', hi: 1.1, sc: '#ff8ad8', si: 2.2, dir: [-0.2, 0.35, -0.9], tint: [0.92, 0.86, 1.05] };
  for (const k of ['day', 'golden']) LIGHTS[k] = N;
}
if (STYLE_NAME === 'aquarelle' || STYLE_NAME === 'flat') { LIGHTS.day = { ...LIGHTS.day, top: '#8fc3ee', hor: '#e9f3fb', fog: '#e9f3fb' }; }
if (STYLE_NAME === 'papier') { LIGHTS.day = { ...LIGHTS.day, top: '#9cc4dc', hor: '#efe3c8', fog: '#efe3c8', tint: [0.98, 0.95, 0.88] }; }
const skyCache = {};
function applyLight(k) {
  const L = LIGHTS[k];
  scene.background = skyCache[k] || (skyCache[k] = (k === 'metro' || k === 'office') ? new THREE.Color(L.top) : P.skyTex(L.top, L.hor));
  scene.fog = new THREE.Fog(L.fog, L.near, L.far);
  hemi.color.set(L.hs); hemi.groundColor.set(L.hg); hemi.intensity = L.hi;
  sun.color.set(L.sc); sun.intensity = L.si;
  sun.position.set(...L.dir).multiplyScalar(50).add(camera.position); sun.target.position.copy(camera.position);
  TINT = L.tint;
}

// ---------- sets ----------
const SETS = {};
function makeSet(name, ox) { const g = new THREE.Group(); g.position.x = ox; scene.add(g); SETS[name] = g; return g; }
const OX = { street: 0, wave: 1000, office: 2000, metro: 3000, traffic: 4000, beach: 5000 };
const cloudCards = [];
function cloud(g, x, y, z, s) {
  const c = P.canvas(T.CW, T.CH); T.drawCloud(c.getContext('2d'), x);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5 * s, 2 * s), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, alphaTest: 0.3, fog: false, depthWrite: false }));
  if (STYLE_NAME === 'neon') m.material.color.set('#d58cff'); if (STYLE_NAME === 'papier') m.material.color.set('#f6eedb');
  m.position.set(x, y, z); g.add(m); cloudCards.push(m);
}

// STREET -----------------------------------------------------------
function buildStreet() {
  const g = makeSet('street', OX.street);
  const asp = ctex('asphalt', P.asphalt);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(260, 9), toon('#ffffff', rep(asp, 65, 2.25)));
  road.rotation.x = -Math.PI / 2; road.position.set(30, 0, 0); g.add(road);
  for (let x = -60; x < 140; x += 5) box(g, 2.2, 0.01, 0.16, x, 0.005, 0, toon('#f4f1e6'), 0);
  const side = ctex('side', () => P.tiles('#cfc6b8', { n: 4, seed: 4 }));
  box(g, 260, 0.15, 4.2, 30, 0, -6.6, toon('#ffffff', rep(side, 130, 2.1)), 0);
  box(g, 260, 0.17, 0.25, 30, 0, -4.5, toon('#9a9488'), 0.015);
  box(g, 260, 0.15, 3.5, 30, 0, 6.25, toon('#ffffff', rep(side, 130, 1.75)), 0);
  box(g, 260, 0.17, 0.25, 30, 0, 4.5, toon('#9a9488'), 0.015);
  // back row of buildings (front face at z=-8.7)
  const pal = ['#e9d3a8', '#d99f86', '#c6d4b2', '#efdfc2', '#b9c9d9', '#e6b39b', '#d8c3e0'];
  let x = -60, i = 0;
  while (x < 140) {
    let w = [9, 7, 10, 8, 11, 7.5][i % 6], h = [9, 12, 10.5, 14, 8.5, 11][(i * 5) % 6];
    if (x < 22 && x + w > 22) w = 22 - x;
    if (x >= 22 && x < 38) { // office tower
      const ft = P.tex(P.glassTower({ cols: 8, rows: 16, seed: 77 }));
      const m = box(g, 16, 26, 10, 30, 0, -13.7, facadeMats(toon('#ffffff', ft), toon('#b7c3cc')), 0.06);
      box(g, 16.6, 0.5, 10.6, 30, 26, -13.7, toon('#8d9aa5'), 0.05);
      box(g, 3.4, 3.1, 0.3, 30, 0, -8.75, toon('#3d5a7a', null, { emissive: '#203040', emissiveIntensity: 0.2 }), 0.04);
      box(g, 3.6, 0.25, 1.4, 30, 3.1, -8.3, toon('#e8e2d4'), 0.03);
      const sg = P.tex(P.signTex('BUREAUX', { bg: '#1f6fb2', fg: '#ffffff' }));
      box(g, 7, 1.6, 0.25, 30, 3.8, -8.55, facadeMats(toon('#ffffff', sg), toon('#1f6fb2')), 0.04);
      x = 38; i++; continue;
    }
    const col = pal[i % pal.length];
    const ft = P.tex(P.facade({ color: col, cols: w > 9 ? 4 : 3, rows: Math.round(h / 3), seed: i + 1, door: i % 2 === 0, shutter: i % 3 === 0 ? '#5c8f6b' : null, storeband: i % 3 === 1 ? '#c94f3d' : null }));
    box(g, w - 0.2, h, 8, x + w / 2, 0, -12.7, facadeMats(toon('#ffffff', ft), toon(P.shadeHex(col, 0.85))), 0.05);
    box(g, w + 0.1, 0.35, 8.4, x + w / 2, h, -12.7, toon(P.shadeHex(col, 0.7)), 0.04);
    x += w; i++;
  }
  // far side: low walls + trees
  for (let xx = -50; xx < 130; xx += 11) tree(g, xx + 3, 6.8, 1.1);
  for (let xx = -54; xx < 130; xx += 13) { if (Math.abs(xx - 30) < 4) continue; tree(g, xx, -8.0, 0.95, '#62ad44'); box(g, 1.2, 0.35, 1.2, xx, 0.15, -8.0, toon('#a7774f'), 0.025); }
  for (let xx = -44; xx < 130; xx += 13) lamp(g, xx, -8.3);
  for (let k = 0; k < 9; k++) cloud(g, -80 + k * 30, 32 + (k % 3) * 8, -160, 22);
}

// METRO ------------------------------------------------------------
const tunnelLights = [];
function buildMetro() {
  const g = makeSet('metro', OX.metro);
  const fl = ctex('mfloor', () => P.tiles('#9aa1a8', { n: 8, seam: 0.85, seed: 41 }));
  box(g, 26, 0.1, 3.4, 0, -0.1, 0, toon('#ffffff', rep(fl, 13, 1.7)), 0);
  const mw = ctex('mwall', P.metroWall);
  for (const zz of [-1.65, 1.65]) {
    box(g, 26, 0.95, 0.1, 0, 0, zz, toon('#ffffff', rep(mw, 10, 1)), 0.02);
    box(g, 26, 0.5, 0.1, 0, 1.95, zz, toon('#d9dee4'), 0.02);
    for (let xx = -12; xx <= 12; xx += 2.4) box(g, 0.45, 1.0, 0.12, xx, 0.95, zz, toon('#cfd5dc'), 0.02);
  }
  box(g, 26, 0.1, 3.4, 0, 2.45, 0, toon('#e7ebef'), 0);
  for (let xx = -11; xx <= 11; xx += 3) box(g, 1.8, 0.04, 0.25, xx, 2.41, 0, toon('#ffffff', null, { emissive: '#ffffff', emissiveIntensity: 0.9 }), 0.01);
  const fab = ctex('fab', () => P.fabric());
  box(g, 26, 0.12, 0.5, 0, 0.39, -1.3, toon('#ffffff', rep(fab, 26, 0.5)), 0.02);
  box(g, 26, 0.5, 0.1, 0, 0.5, -1.53, toon('#ffffff', rep(fab, 26, 0.5)), 0.02);
  box(g, 26, 0.39, 0.4, 0, 0, -1.3, toon('#5a6470'), 0.02);
  for (const xx of [-3.8, 3.8]) cyl(g, 0.035, 0.035, 2.45, xx, 0, 0.35, toon('#f2c230'), 0.012, 10);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 26, 10), toon('#f2c230')); bar.rotation.z = Math.PI / 2; bar.position.set(0, 2.1, 0.35); ink(bar, 0.012); g.add(bar);
  const tw = new THREE.Mesh(new THREE.PlaneGeometry(80, 5), toon('#ffffff', rep(ctex('tun', P.tunnel), 8, 1)));
  tw.position.set(0, 1.5, -3.6); g.add(tw);
  for (let k = 0; k < 10; k++) { const m = box(g, 0.5, 0.18, 0.1, 0, 1.75, -3.5, new THREE.MeshBasicMaterial({ color: '#ffd98a' }), 0); m.userData.x0 = k * 6; tunnelLights.push(m); }
  // moving pole for Marc's hand
  SETS.metroPole = cyl(g, 0.035, 0.035, 2.45, 0, 0, 0, toon('#f2c230'), 0.012, 10);
}

// OFFICE -----------------------------------------------------------
let sheetCanvas, sheetTex, clockCanvas, clockTex;
function desk(g, x, z, { monRot = Math.PI, monX = 0, chairZ = 0.7, chairRot = 0, color = '#c9a57a' } = {}) {
  const d = new THREE.Group(); d.position.set(x, 0, z); g.add(d);
  box(d, 1.7, 0.06, 0.8, 0, 0.72, 0, toon(color), 0.02);
  for (const [lx, lz] of [[-0.78, -0.33], [0.78, -0.33], [-0.78, 0.33], [0.78, 0.33]]) box(d, 0.06, 0.72, 0.06, lx, 0, lz, toon('#4a4e57'), 0.012);
  const mon = new THREE.Group(); mon.position.set(monX, 0.78, 0); mon.rotation.y = monRot; d.add(mon);
  box(mon, 0.26, 0.02, 0.18, 0, 0, 0, toon('#3a3d44'), 0.01);
  box(mon, 0.05, 0.22, 0.05, 0, 0.02, 0, toon('#3a3d44'), 0.01);
  box(mon, 0.66, 0.42, 0.05, 0, 0.18, 0, toon('#2c2f36'), 0.015);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.36), new THREE.MeshBasicMaterial({ map: sheetTex }));
  scr.position.set(0, 0.39, 0.028); mon.add(scr);
  box(d, 0.5, 0.02, 0.17, monX * 0.5, 0.78, 0.18, toon('#e6e6e6'), 0.01);
  const ch = new THREE.Group(); ch.position.set(0, 0, chairZ); ch.rotation.y = chairRot; d.add(ch);
  box(ch, 0.5, 0.08, 0.5, 0, 0.42, 0, toon('#2f5fa8'), 0.015);
  box(ch, 0.5, 0.5, 0.07, 0, 0.5, 0.24, toon('#2f5fa8'), 0.015);
  cyl(ch, 0.03, 0.03, 0.42, 0, 0, 0, toon('#333'), 0.01, 8);
  return d;
}
function plant(g, x, z, s = 1) { cyl(g, 0.25 * s, 0.2 * s, 0.5 * s, x, 0, z, toon('#c96f3c')); ball(g, 0.45 * s, x, 0.95 * s, z, toon('#4f9e45'), 0.03, 1, 1.2, 1); ball(g, 0.3 * s, x + 0.25 * s, 1.35 * s, z, toon('#5fb052'), 0.03); }
function buildOffice() {
  const g = makeSet('office', OX.office);
  sheetCanvas = P.canvas(256, 160); P.drawSheet(sheetCanvas.getContext('2d'), 256, 160, 0); sheetTex = P.tex(sheetCanvas);
  clockCanvas = P.canvas(512, 512); P.drawClock(clockCanvas.getContext('2d'), 512, 9); clockTex = P.tex(clockCanvas);
  const cp = ctex('carpet', P.carpet);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), toon('#ffffff', rep(cp, 15, 10))); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, -2); g.add(fl);
  const ow = ctex('owall', P.officeWall);
  box(g, 30, 3.2, 0.2, 0, 0, -6.1, facadeMats(toon('#ffffff', rep(ow, 3, 1)), toon('#efe6d6')), 0.03);
  box(g, 0.2, 3.2, 20, -9, 0, -2, toon('#e9dfcd'), 0.03);
  box(g, 30, 0.12, 0.05, 0, 0, -5.98, toon('#a89a83'), 0);
  // clock
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.38, 48), new THREE.MeshBasicMaterial({ map: clockTex }));
  face.position.set(1.6, 2.45, -5.96); g.add(face);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.035, 10, 48), toon('#30343c')); rim.position.set(1.6, 2.45, -5.97); g.add(rim);
  desk(g, 0, -2.2, { monRot: -0.75, monX: 0.42, chairZ: -0.4, chairRot: Math.PI }); // Marc's desk (he sits behind, facing camera side)
  desk(g, 3.6, -2.4, { monRot: Math.PI }); desk(g, -6.6, -0.6, { monRot: Math.PI, color: '#b99470' });
  desk(g, 2.2, -4.7, { monRot: Math.PI }); desk(g, -1.4, -4.7, { monRot: Math.PI, color: '#b99470' });
  // water cooler
  box(g, 0.45, 1.0, 0.45, -4.3, 0, -5.4, toon('#e8ecef'), 0.02);
  cyl(g, 0.18, 0.18, 0.5, -4.3, 1.0, -5.4, toon('#7cc6ee', null, { transparent: false }), 0.015);
  plant(g, -7.2, -5.3, 1.2); plant(g, 6.0, -5.4, 1.1); plant(g, -8.2, -1.5, 1.0);
  box(g, 1.8, 1.9, 0.5, 5.2, 0, -5.6, toon('#c9b28c'), 0.02); // shelf
  for (let k = 0; k < 6; k++) box(g, 0.22, 0.4, 0.3, 4.6 + k * 0.25, 1.9, -5.6, toon(['#d6342c', '#2f5fa8', '#f2c230', '#4c9a5b'][k % 4]), 0.01);
}

// WAVE PARK --------------------------------------------------------
let water, waterBase, waterCols;
const PROPS = [];
const WATERS = {};
const WATER = { x0: -30, x1: 30, z0: -46, z1: 0 };
function buildWave() {
  const g = makeSet('wave', OX.wave);
  const geo = new THREE.PlaneGeometry(WATER.x1 - WATER.x0, WATER.z1 - WATER.z0, 150, 80); geo.rotateX(-Math.PI / 2);
  geo.translate((WATER.x0 + WATER.x1) / 2, 0, (WATER.z0 + WATER.z1) / 2);
  waterBase = geo.attributes.position.array.slice();
  waterCols = new Float32Array(geo.attributes.position.count * 3); geo.setAttribute('color', new THREE.BufferAttribute(waterCols, 3));
  water = new THREE.Mesh(geo, toon('#ffffff', null, { vertexColors: true })); g.add(water);
  const cc = ctex('conc', P.concrete);
  box(g, 76, 2.6, 12, 0, -2, 6, toon('#ffffff', rep(cc, 38, 6)), 0.04);
  box(g, 8, 2.6, 60, -34, -2, -23, toon('#ffffff', rep(cc, 4, 30)), 0.04);
  box(g, 8, 2.6, 60, 34, -2, -23, toon('#ffffff', rep(cc, 4, 30)), 0.04);
  box(g, 76, 0.12, 0.35, 0, 0.6, 0.15, toon('#3a8fc8'), 0.02); // pool edge trim
  box(g, 68, 7, 5, 0, -2, -49, toon('#4f6f8f'), 0.06);
  const sg = P.tex(P.signTex('WAVE PARK', { bg: '#f6d04d' }));
  box(g, 20, 3.2, 0.4, 0, 3.0, -46.4, facadeMats(toon('#ffffff', sg), toon('#f6d04d')), 0.06);
  for (const z of [-6, -16, -26, -36]) { palm(g, -32, z, 1.0, 0.12); palm(g, 32, z, 1.0, -0.12); }
  palm(g, -20, 9, 1.1, 0.1); palm(g, 14, 9.5, 1.0, -0.15); palm(g, -9, 10, 0.9, -0.08);
  // umbrellas & loungers
  for (const [ux, uz, col] of [[-26, 10.5, '#e2483c'], [-2, 10.5, '#2f9e9a'], [8, 10, '#f2c230'], [22, 10.2, '#e2483c']]) {
    cyl(g, 0.04, 0.04, 2.4, ux, 0.6, uz, toon('#eee'), 0.01, 8);
    const c = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.6, 12), toon(col)); c.position.set(ux, 3.2, uz); ink(c, 0.03); g.add(c);
    box(g, 0.7, 0.3, 1.8, ux + 1.2, 0.6, uz, toon('#f4f1e6'), 0.02);
  }
  for (let xx = -24; xx <= 24; xx += 12) lamp(g, xx, 11.2, 4.5);
  // hills + sun
  for (const [hx, hz, r, col] of [[-60, -110, 40, '#8f7aa8'], [10, -130, 55, '#9c86ad'], [80, -105, 38, '#86749e'], [-20, -85, 22, '#6f9c5a'], [45, -80, 20, '#7aa865']]) ball(g, r, hx, -r * 0.55, hz, toon(col), 0);
  const sunM = new THREE.Mesh(new THREE.CircleGeometry(9, 40), new THREE.MeshBasicMaterial({ color: '#fff3c8', fog: false })); sunM.position.set(-25, 16, -200); g.add(sunM);
  const halo = new THREE.Mesh(new THREE.CircleGeometry(16, 40), new THREE.MeshBasicMaterial({ color: '#ffe0a0', fog: false, transparent: true, opacity: 0.4, depthWrite: false })); halo.position.set(-25, 16, -201); g.add(halo);
  for (let k = 0; k < 6; k++) cloud(g, -90 + k * 36, 26 + (k % 2) * 10, -170, 24);
}
function waveH(x, z, f, crest) {
  let h = 0.05 * Math.sin(x * 0.9 + f * 0.13) * Math.sin(z * 0.7 - f * 0.07) + 0.03 * Math.sin(x * 2.1 - z * 1.3 + f * 0.2);
  if (crest) {
    const d = x - crest.cx, env = Math.exp(-Math.pow((z - crest.z) / crest.wz, 4));
    const p = d > 0 ? Math.exp(-Math.pow(d / 1.3, 2)) : Math.exp(-Math.pow(d / 4.5, 2));
    h += crest.A * p * env;
  }
  return h;
}
function makeWater(g, name, x0, x1, z0, z1, sx, sz) {
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, sx, sz); geo.rotateX(-Math.PI / 2); geo.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const cols = new Float32Array(geo.attributes.position.count * 3); geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const m = new THREE.Mesh(geo, toon('#ffffff', null, { vertexColors: true })); g.add(m);
  WATERS[name] = { mesh: m, base: geo.attributes.position.array.slice(), cols }; return WATERS[name];
}
const WCOL0 = 0;
const WCOL = STYLE_NAME === 'neon' ? ['#1b1f6b', '#2fd6ff', '#ff7af0'] : STYLE_NAME === 'papier' ? ['#4f8fa8', '#8cc3cf', '#fbf6ea'] : ['#2b8fd0', '#58c3ec', '#ffffff'];
function updateSea(w, f, hfn, foamAt = 0.75) {
  const pos = w.mesh.geometry.attributes.position.array, n = pos.length / 3;
  const deep = new THREE.Color(WCOL[0]), mid = new THREE.Color(WCOL[1]), foam = new THREE.Color(WCOL[2]), tmp = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const x = w.base[i * 3], z = w.base[i * 3 + 2];
    const [h, k] = hfn(x, z); pos[i * 3 + 1] = h;
    tmp.copy(deep).lerp(mid, clamp01(0.3 + h * 0.9 + 0.12 * Math.sin(x * 1.3 + z * 1.9 + f * 0.1)));
    if (k > foamAt) tmp.lerp(foam, clamp01((k - foamAt) / 0.15));
    w.cols[i * 3] = tmp.r; w.cols[i * 3 + 1] = tmp.g; w.cols[i * 3 + 2] = tmp.b;
  }
  w.mesh.geometry.attributes.position.needsUpdate = true; w.mesh.geometry.attributes.color.needsUpdate = true; w.mesh.geometry.computeVertexNormals();
}
// beach swells rolling toward the shore (+z); returns [height, foamFactor]
function beachH(x, z, f, big = 1) {
  let h = 0.04 * Math.sin(x * 0.8 + f * 0.12) * Math.sin(z * 0.6 - f * 0.08), k = 0;
  for (let j = 0; j < 4; j++) {
    const c = -64 + ((f * 0.14 + j * 16) % 64), d = z - c;
    const p = d > 0 ? Math.exp(-Math.pow(d / 1.2, 2)) : Math.exp(-Math.pow(d / 5, 2));
    const A = big * 1.3 * clamp01((-z - 2) / 10) * (0.8 + 0.2 * Math.sin(x * 0.15 + j));
    h += A * p; k = Math.max(k, p * clamp01(A / 1.0));
  }
  if (z > -6) k = Math.max(k, 0.9 * clamp01(1 - Math.abs(z + 4.2 + 0.6 * Math.sin(f * 0.06 + x * 0.3)) / 0.9));
  return [h, k];
}
function updateWater(f, crest) {
  const pos = water.geometry.attributes.position.array, n = pos.length / 3;
  const deep = new THREE.Color('#2b8fd0'), mid = new THREE.Color('#58c3ec'), foam = new THREE.Color('#ffffff');
  const tmp = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const x = waterBase[i * 3], z = waterBase[i * 3 + 2];
    const h = waveH(x, z, f, crest); pos[i * 3 + 1] = h;
    const k = crest ? clamp01(h / crest.A) : 0;
    tmp.copy(deep).lerp(mid, clamp01(0.35 + h * 1.2 + 0.15 * Math.sin(x * 1.7 + z * 2.3 + f * 0.1)));
    if (k > 0.72) tmp.lerp(foam, clamp01((k - 0.72) / 0.18));
    waterCols[i * 3] = tmp.r; waterCols[i * 3 + 1] = tmp.g; waterCols[i * 3 + 2] = tmp.b;
  }
  water.geometry.attributes.position.needsUpdate = true; water.geometry.attributes.color.needsUpdate = true;
  water.geometry.computeVertexNormals();
}

// BEACH ------------------------------------------------------------
function hut(g, x, z, col) {
  box(g, 2.2, 2.0, 2.0, x, 0, z, toon('#f4f1e6'), 0.03);
  for (let k = 0; k < 4; k++) box(g, 0.28, 2.0, 2.02, x - 0.84 + k * 0.56, 0, z, toon(col), 0);
  const r = new THREE.Mesh(new THREE.ConeGeometry(1.75, 0.9, 4), toon(P.shadeHex(col, 0.85))); r.rotation.y = Math.PI / 4; r.position.set(x, 2.45, z); ink(r, 0.03); g.add(r);
  box(g, 0.7, 1.3, 0.05, x, 0, z + 1.01, toon('#7a5233'), 0.015);
}
function buildBeach() {
  const g = makeSet('beach', OX.beach);
  const sandT = ctex('sand', () => P.grass('#ecd29a'));
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(200, 60, 1, 1), toon('#ffffff', rep(sandT, 50, 15)));
  sand.rotation.x = -Math.PI / 2; sand.position.set(0, 0.14, 25); g.add(sand);
  const wet = new THREE.Mesh(new THREE.PlaneGeometry(200, 5), toon('#cdb27a')); wet.rotation.x = -Math.PI / 2; wet.position.set(0, 0.07, -2.5); g.add(wet);
  makeWater(g, 'sea', -60, 60, -70, -1.5, 160, 110);
  for (let k = 0; k < 6; k++) hut(g, -16 + k * 3.2, 12, ['#e2483c', '#2f6fb2', '#f2c230', '#4c9a5b', '#e8833a', '#8a5a9e'][k]);
  for (const [px, pz] of [[-24, 9], [-20, 14], [14, 10], [19, 13], [26, 9]]) palm(g, px, pz, 1.0, px < 0 ? 0.12 : -0.14);
  // lifeguard tower
  for (const [lx, lz] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) box(g, 0.12, 2.4, 0.12, 9 + lx, 0, 6 + lz, toon('#f4f1e6'), 0.015);
  box(g, 1.8, 1.0, 1.8, 9, 2.4, 6, toon('#e2483c'), 0.03); box(g, 2.2, 0.12, 2.2, 9, 3.4, 6, toon('#f4f1e6'), 0.03);
  for (const [ux, uz, col] of [[-6, 6, '#e2483c'], [4, 7.5, '#2f9e9a'], [-11, 7, '#f2c230']]) {
    cyl(g, 0.04, 0.04, 2.4, ux, 0, uz, toon('#eee'), 0.01, 8);
    const c = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.6, 12), toon(col)); c.position.set(ux, 2.6, uz); ink(c, 0.03); g.add(c);
  }
  for (const [rx, rz, r] of [[-30, -6, 2.2], [-27, -4, 1.3], [32, -8, 2.8], [28, -5, 1.4]]) ball(g, r, rx, 0, rz, toon('#8b8378'), 0.05, 1.2, 0.8, 1);
  for (const [hx, hz, r, col] of [[-90, -120, 45, '#7a9a6a'], [100, -110, 40, '#86a275'], [-140, -80, 60, '#6e8f60']]) ball(g, r, hx, -r * 0.5, hz, toon(col), 0);
  const sunM = new THREE.Mesh(new THREE.CircleGeometry(9, 40), new THREE.MeshBasicMaterial({ color: STYLE_NAME === 'neon' ? '#ffcf6b' : '#fff6d8', fog: false })); sunM.position.set(-30, 26, -220); g.add(sunM);
  for (let k = 0; k < 7; k++) cloud(g, -110 + k * 36, 30 + (k % 3) * 8, -180, 24);
}

// TRAFFIC ----------------------------------------------------------
const cars = [];
function car(g, x, z, col) {
  const c = new THREE.Group(); c.position.set(x, 0, z); g.add(c);
  box(c, 1.9, 0.62, 4.1, 0, 0.32, 0, toon(col), 0.03);
  box(c, 1.7, 0.06, 0.06, 0, 1.3, 1.05, toon('#2a2f3a'), 0.012);
  for (const px of [-0.82, 0.82]) box(c, 0.05, 0.36, 0.05, px, 0.94, 1.05, toon('#2a2f3a'), 0.01);
  box(c, 1.6, 0.35, 0.5, 0, 0.94, -1.1, toon(P.shadeHex(col, 0.8)), 0.02);
  for (const [px, pz] of [[-0.9, 1.3], [0.9, 1.3], [-0.9, -1.3], [0.9, -1.3]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 14), toon('#24262b')); w.rotation.z = Math.PI / 2; w.position.set(px, 0.33, pz); ink(w, 0.02); c.add(w); }
  for (const px of [-0.6, 0.6]) box(c, 0.38, 0.15, 0.06, px, 0.7, 2.06, new THREE.MeshBasicMaterial({ color: '#fff7d6' }), 0.01);
  box(c, 1.6, 0.05, 0.6, 0, 0.94, 1.6, toon('#2a2f3a'), 0); // dash
  cars.push(c); return c;
}
function buildTraffic() {
  const g = makeSet('traffic', OX.traffic);
  const asp = ctex('asphalt', P.asphalt);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(18, 400), toon('#ffffff', rep(asp, 4.5, 100))); road.rotation.x = -Math.PI / 2; road.position.set(0, 0, -180); g.add(road);
  for (let z = 15; z > -380; z -= 6) for (const lx of [-2.7, 2.7]) box(g, 0.15, 0.01, 2.6, lx, 0.005, z, toon('#f4f1e6'), 0);
  for (const lx of [-8.4, 8.4]) { box(g, 0.12, 0.01, 400, lx, 0.005, -180, toon('#f4f1e6'), 0); box(g, 0.2, 0.35, 400, lx + Math.sign(lx) * 0.6, 0.45, -180, toon('#c7ccd2'), 0.02); }
  const gr = ctex('grass', () => P.grass('#7cae4e'));
  for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(80, 400), toon('#ffffff', rep(gr, 20, 100))); m.rotation.x = -Math.PI / 2; m.position.set(sx * 49, -0.02, -180); g.add(m); }
  for (let z = 10; z > -260; z -= 14) { tree(g, -13 - (z % 3), z, 1.3, '#4f9a3c'); tree(g, 13 + (z % 4), z - 6, 1.2, '#5aa847'); }
  const cols = ['#d6342c', '#2f6fb2', '#f2c230', '#f4f1e6', '#4c9a5b', '#8a5a9e', '#e8833a', '#5d6670'];
  let k = 0;
  for (const lx of [-5.4, 0, 5.4]) for (let z = (lx === 0 ? -1 : lx < 0 ? -3 : -5); z > -230; z -= 6.2 + ((k * 7) % 3) * 0.6) car(g, lx, z, cols[(k++ * 5) % cols.length]);
  for (const [hx, hz, r, col] of [[-70, -260, 50, '#9c86ad'], [40, -300, 70, '#a58fb4'], [110, -240, 45, '#8f7aa8']]) ball(g, r, hx, -r * 0.5, hz, toon(col), 0);
  const sunM = new THREE.Mesh(new THREE.CircleGeometry(12, 40), new THREE.MeshBasicMaterial({ color: '#fff3c8', fog: false })); sunM.position.set(10, 20, -330); g.add(sunM);
  for (let kk = 0; kk < 6; kk++) cloud(g, -100 + kk * 40, 30 + (kk % 2) * 10, -250, 26);
}

// ---------- camera ----------
function camKeys(keys, f) {
  let i = 0; while (i < keys.length - 1 && f >= keys[i + 1].f) i++;
  const A = keys[i], B = keys[Math.min(i + 1, keys.length - 1)];
  const t = B === A ? 0 : ss((f - A.f) / (B.f - A.f));
  const L = (a, b) => a.map((v, j) => lerp(v, b[j], t));
  return { p: L(A.p, B.p), l: L(A.l, B.l), fov: lerp(A.fov ?? 40, B.fov ?? A.fov ?? 40, t), roll: lerp(A.roll ?? 0, B.roll ?? A.roll ?? 0, t) };
}
let KICKS = [], FLASHES = [];

// ---------- extra sets ----------
OX.apt = 6000; OX.train = 7000;
let doorL, doorR, landTex, trainPosts = [];
function buildApt() {
  const g = makeSet('apt', OX.apt);
  const pl = ctex('planks', () => P.planks('#c99a6b'));
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), toon('#ffffff', rep(pl, 5, 4))); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, -1); g.add(fl);
  box(g, 10, 2.8, 0.15, 0, 0, -3.1, toon('#f3e9dc'), 0.02);
  box(g, 0.15, 2.8, 8, -4.6, 0, -1, toon('#e9dfd0'), 0.02);
  // window with a city view
  const wc = P.canvas(512, 384), wx = wc.getContext('2d'); const gg = wx.createLinearGradient(0, 0, 0, 384); gg.addColorStop(0, '#8fc3ee'); gg.addColorStop(1, '#dff0fb'); wx.fillStyle = gg; wx.fillRect(0, 0, 512, 384);
  for (let k = 0; k < 9; k++) { wx.fillStyle = ['#b9c9d9', '#c6d4b2', '#e9d3a8'][k % 3]; const h = 120 + (k * 53) % 150; wx.fillRect(k * 58, 384 - h, 52, h); }
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), new THREE.MeshBasicMaterial({ map: P.tex(wc) })); win.position.set(2.4, 1.6, -3.0); g.add(win);
  box(g, 1.75, 0.08, 0.1, 2.4, 0.96, -2.98, toon('#ffffff'), 0.01); box(g, 1.75, 0.08, 0.1, 2.4, 2.2, -2.98, toon('#ffffff'), 0.01); box(g, 0.06, 1.2, 0.08, 2.4, 1.0, -2.98, toon('#ffffff'), 0);
  box(g, 2.4, 0.02, 1.6, 1.4, 0, -0.4, toon('#e07a5f'), 0); // rug
  plant(g, 3.6, -2.5, 1.0);
  box(g, 0.9, 0.5, 0.45, 3.4, 0, -0.6, toon('#7aa0c4'), 0.02); // small cabinet
  // wardrobe (open front)
  const W0 = new THREE.Group(); W0.position.set(-0.6, 0, -2.75); g.add(W0);
  const wood = toon('#e8c79a'), inner = toon('#f6e7cf');
  box(W0, 1.9, 2.3, 0.05, 0, 0, -0.3, inner, 0.01);
  box(W0, 0.06, 2.3, 0.62, -0.95, 0, 0, wood, 0.015); box(W0, 0.06, 2.3, 0.62, 0.95, 0, 0, wood, 0.015);
  box(W0, 1.96, 0.06, 0.62, 0, 2.3, 0, wood, 0.015); box(W0, 1.9, 0.08, 0.62, 0, 0, 0, wood, 0.015);
  for (const sy of [1.25, 1.75]) box(W0, 1.84, 0.04, 0.58, 0, sy, 0, wood, 0.01);
  const cl = ['#ef476f', '#118ab2', '#ffd166', '#06d6a0', '#8d99ae', '#f78c6b'];
  for (let s = 0; s < 2; s++) for (let k = 0; k < 4; k++) for (let h = 0; h < 3; h++) box(W0, 0.36, 0.09, 0.4, -0.66 + k * 0.44, [1.29, 1.79][s] + h * 0.095, 0, toon(cl[(k + h + s * 2) % 6]), 0.006);
  box(W0, 0.5, 0.3, 0.4, 0.62, 0.08, 0, toon('#c9ada7'), 0.01); box(W0, 0.5, 0.28, 0.4, 0.62, 0.38, 0, toon('#9a8c98'), 0.01); // shoe boxes
  const mkDoor = (px, sgn) => { const p = new THREE.Group(); p.position.set(px, 0, 0.31); W0.add(p); const d = box(p, 0.94, 2.26, 0.04, -sgn * 0.47, 0.04, 0, toon('#f2d3a8'), 0.015); box(p, 0.04, 0.3, 0.06, -sgn * 0.85, 1.05, 0.04, toon('#8d99ae'), 0.005); return p; };
  doorL = mkDoor(-0.95, -1); doorR = mkDoor(0.95, 1);
}
function landscapeCanvas() {
  const w = 2048, h = 512, c = P.canvas(w, h), x = c.getContext('2d');
  const gg = x.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, '#8fc3ee'); gg.addColorStop(0.6, '#e9f3fb'); gg.addColorStop(1, '#e9f3fb'); x.fillStyle = gg; x.fillRect(0, 0, w, h);
  const wrap = (fn) => { for (const o of [-w, 0, w]) { x.save(); x.translate(o, 0); fn(); x.restore(); } };
  wrap(() => { x.fillStyle = '#b8d4a8'; x.beginPath(); x.moveTo(0, 330); for (let i = 0; i <= 16; i++) x.lineTo(i * 128, 300 - 60 * Math.sin(i * 1.7) ** 2); x.lineTo(w, h); x.lineTo(0, h); x.fill(); });
  // sea band on the right half
  x.fillStyle = '#58c3ec'; x.fillRect(1100, 330, 800, 40); x.fillStyle = '#ffffff'; for (let k = 0; k < 10; k++) x.fillRect(1120 + k * 75, 340, 30, 4);
  wrap(() => { x.fillStyle = '#9cc58a'; x.fillRect(0, 360, w, 152);
    for (let k = 0; k < 22; k++) { const tx = k * 93 + 20; x.fillStyle = '#7a5233'; x.fillRect(tx, 330, 8, 40); x.fillStyle = ['#6fae4a', '#5a9e3f', '#7cbf5a'][k % 3]; x.beginPath(); x.arc(tx + 4, 322, 24, 0, 7); x.fill(); }
    for (let k = 0; k < 6; k++) { const hx = 150 + k * 330; x.fillStyle = ['#f3e9dc', '#e9d3a8', '#d99f86'][k % 3]; x.fillRect(hx, 318, 60, 44); x.fillStyle = '#c9584a'; x.beginPath(); x.moveTo(hx - 8, 320); x.lineTo(hx + 30, 292); x.lineTo(hx + 68, 320); x.fill(); } });
  return c;
}
function buildTrain() {
  const g = makeSet('train', OX.train);
  const fl = ctex('mfloor', () => P.tiles('#9aa1a8', { n: 8, seam: 0.85, seed: 41 }));
  box(g, 26, 0.1, 3.4, 0, -0.1, 0, toon('#ffffff', rep(fl, 13, 1.7)), 0);
  for (const zz of [-1.65, 1.65]) {
    box(g, 26, 0.9, 0.1, 0, 0, zz, toon('#e3e8ee'), 0.02);
    box(g, 26, 0.12, 0.1, 0, 0.78, zz, toon('#3a86ff'), 0);
    box(g, 26, 0.45, 0.1, 0, 2.0, zz, toon('#e3e8ee'), 0.02);
    for (let xx = -12; xx <= 12; xx += 2.6) box(g, 0.3, 1.1, 0.12, xx, 0.9, zz, toon('#d4dae1'), 0.02);
  }
  box(g, 26, 0.1, 3.4, 0, 2.45, 0, toon('#f1f4f7'), 0);
  for (let xx = -11; xx <= 11; xx += 3) box(g, 1.8, 0.04, 0.25, xx, 2.41, 0, toon('#ffffff', null, { emissive: '#ffffff', emissiveIntensity: 0.6 }), 0.01);
  box(g, 26, 0.12, 0.5, 0, 0.39, -1.3, toon('#3a86ff'), 0.02); box(g, 26, 0.5, 0.1, 0, 0.5, -1.53, toon('#3a86ff'), 0.02); box(g, 26, 0.39, 0.4, 0, 0, -1.3, toon('#5a6470'), 0.02);
  box(g, 26, 0.12, 0.5, 0, 0.39, 1.3, toon('#3a86ff'), 0.02); box(g, 26, 0.39, 0.4, 0, 0, 1.3, toon('#5a6470'), 0.02);
  landTex = P.tex(landscapeCanvas()); landTex.repeat.set(2, 1);
  const land = new THREE.Mesh(new THREE.PlaneGeometry(90, 14), new THREE.MeshBasicMaterial({ map: landTex, fog: false })); land.position.set(0, 2.5, -14); g.add(land);
  for (let k = 0; k < 5; k++) { const m = box(g, 0.18, 4, 0.18, 0, -1, -3.2, toon('#8d99ae'), 0.01); m.userData.x0 = k * 9; trainPosts.push(m); }
}
function trainUpdate(f, speed, tint) {
  landTex.offset.x = (f * speed * 0.004) % 1;
  trainPosts.forEach(m => { m.position.x = ((m.userData.x0 - f * speed * 0.9) % 45 + 45) % 45 - 22; });
  landTex.userData.m = landTex.userData.m || null;
}

// ---------- shots ----------
const SHOTS = [];
const shot = (a, b, set, light, cam, update, creep = 0.0022) => SHOTS.push({ a, b, set, light, cam, update, creep });

// ---------- captions ----------
var CAPS_TEST = null;
let CAPS = [];
const FS = 66, LH = 82;
const CAPST = {
  toon:      { font: `800 66px "Baloo 2"`, fill: '#ffffff', hl: '#ffd23f', stroke: '#111118', sw: 14, y: H - 70 },
  flat:      { font: `800 58px "Baloo 2"`, fill: '#2b2d42', hl: '#ef476f', stroke: null, box: 'pill', y: H - 80 },
  bd:        { font: `56px "Luckiest Guy"`, fill: '#111111', hl: '#d62828', stroke: null, box: 'recit', y: 120, upper: true },
  papier:    { font: `800 60px "Baloo 2"`, fill: '#3b2a1e', hl: '#c0392b', stroke: null, box: 'strip', y: H - 80 },
  aquarelle: { font: `800 60px "Baloo 2"`, fill: '#2e3247', hl: '#2a7fb8', stroke: 'rgba(255,255,255,0.85)', sw: 12, y: H - 75 },
  neon:      { font: `800 64px "Baloo 2"`, fill: '#ffffff', hl: '#7df9ff', stroke: null, glow: '#ff3fd2', y: H - 75 },
}[STYLE_NAME];
function drawCaption(f) {
  const cap = [...CAPS, CAPS_TEST].find(c => c && f >= c[0] && f < c[1]); if (!cap) return;
  const [a, b, text0, hl] = cap; const C = CAPST;
  const text = C.upper ? text0.toUpperCase() : text0, words = text.split(' '), hlU = hl.map(w => C.upper ? w.toUpperCase() : w);
  octx.font = C.font; octx.textBaseline = 'alphabetic'; octx.lineJoin = 'round';
  const space = octx.measureText(' ').width + 14, maxW = C.box === 'recit' ? 1100 : 1560;
  const lines = [[]]; let lw = 0;
  words.forEach(w => { const ww = octx.measureText(w).width; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += ww + space; });
  const widths = lines.map(ln => ln.reduce((q, w) => q + octx.measureText(w).width, 0) + space * (ln.length - 1));
  const lf = f - a, fadeOut = clamp01((b - f) / 4), boxT = clamp01(lf / 6);
  const bw = Math.max(...widths), bh = lines.length * LH;
  const left = C.box === 'recit';
  const y0 = left ? C.y : C.y - (lines.length - 1) * LH;
  // boxes
  octx.save(); octx.globalAlpha = fadeOut;
  if (C.box === 'pill') { octx.fillStyle = 'rgba(255,255,255,0.92)'; octx.beginPath(); octx.roundRect((W - bw) / 2 - 36, y0 - LH + 12, bw + 72, bh + 22, 40); octx.fill(); }
  if (C.box === 'recit') { octx.translate(70, 0); octx.fillStyle = '#fff3a8'; octx.fillRect(-30, y0 - LH + 10, (bw + 60) * ss(boxT), bh + 26); octx.lineWidth = 6; octx.strokeStyle = '#000'; octx.strokeRect(-30, y0 - LH + 10, (bw + 60) * ss(boxT), bh + 26); octx.translate(-70, 0); }
  if (C.box === 'strip') { octx.translate(W / 2, y0); octx.rotate(-0.015); octx.fillStyle = '#fbf6ea'; octx.shadowColor = 'rgba(60,40,20,0.35)'; octx.shadowBlur = 14; octx.shadowOffsetY = 6; octx.fillRect(-bw / 2 - 40, -LH + 8, bw + 80, bh + 24); octx.shadowColor = 'transparent'; octx.rotate(0.015); octx.translate(-W / 2, -y0); }
  octx.restore();
  let wi = 0;
  lines.forEach((ln, li) => {
    let x = left ? 70 : (W - widths[li]) / 2; const y = y0 + li * LH + (left ? 0 : 0);
    ln.forEach(w => {
      const appear = wi * 2.2, t = clamp01((lf - appear) / 5); wi++;
      const ww = octx.measureText(w).width;
      if (t > 0) {
        const sc = t < 1 ? 0.6 + back(t) * 0.4 : 1;
        octx.save(); octx.globalAlpha = Math.min(1, t * 2) * fadeOut; octx.translate(x + ww / 2, y - FS * 0.32); octx.scale(sc, sc); octx.translate(-ww / 2, FS * 0.32);
        if (C.glow) { octx.shadowColor = C.glow; octx.shadowBlur = 22; }
        if (C.stroke) { octx.lineWidth = C.sw; octx.strokeStyle = C.stroke; octx.strokeText(w, 0, 0); }
        octx.fillStyle = hlU.includes(w) ? C.hl : C.fill; octx.fillText(w, 0, 0);
        if (C.glow) octx.fillText(w, 0, 0);
        octx.restore();
      }
      x += ww + space;
    });
  });
}

// ---------- post per style ----------
let vign, POST = {};
function noiseCanvas(fn) { const c = P.canvas(W, H), x = c.getContext('2d'); fn(x); return c; }
function initPost() {
  if (STYLE_NAME === 'bd') POST.half = noiseCanvas(x => { x.fillStyle = '#000'; for (let yy = 0; yy < H; yy += 9) for (let xx = (yy / 9 % 2) * 4.5; xx < W; xx += 9) { x.beginPath(); x.arc(xx, yy, 1.9, 0, 7); x.fill(); } });
  if (STYLE_NAME === 'papier' || STYLE_NAME === 'aquarelle') POST.paper = noiseCanvas(x => {
    const id = x.createImageData(W, H), d = id.data; for (let i = 0; i < d.length; i += 4) { const v = 225 + Math.random() * 30; d[i] = v; d[i + 1] = v * 0.985; d[i + 2] = v * 0.95; d[i + 3] = 255; } x.putImageData(id, 0, 0);
    x.globalAlpha = 0.08; x.strokeStyle = '#7a6040'; for (let k = 0; k < 2500; k++) { const px = Math.random() * W, py = Math.random() * H, a = Math.random() * 7; x.lineWidth = 1; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * 14, py + Math.sin(a) * 14); x.stroke(); }
    if (STYLE_NAME === 'aquarelle') { x.globalAlpha = 0.035; for (let k = 0; k < 90; k++) { const px = Math.random() * W, py = Math.random() * H, r = 60 + Math.random() * 220; const gg = x.createRadialGradient(px, py, r * 0.6, px, py, r); gg.addColorStop(0, 'rgba(120,90,60,0)'); gg.addColorStop(0.92, 'rgba(120,90,60,0.9)'); gg.addColorStop(1, 'rgba(120,90,60,0)'); x.fillStyle = gg; x.fillRect(px - r, py - r, 2 * r, 2 * r); } }
  });
  if (STYLE_NAME === 'neon') POST.scan = noiseCanvas(x => { x.fillStyle = 'rgba(0,0,0,0.18)'; for (let yy = 0; yy < H; yy += 4) x.fillRect(0, yy, W, 2); });
}
function post() {
  const src = renderer.domElement;
  if (STYLE_NAME === 'aquarelle') { octx.filter = 'blur(2.2px) saturate(1.15)'; octx.drawImage(src, 0, 0); octx.filter = 'none'; octx.globalAlpha = 0.45; octx.drawImage(src, 0, 0); octx.globalAlpha = 1; }
  else octx.drawImage(src, 0, 0);
  if (STYLE_NAME === 'neon') { octx.save(); octx.globalCompositeOperation = 'lighter'; octx.globalAlpha = 0.4; octx.filter = 'blur(12px)'; octx.drawImage(src, 0, 0); octx.restore(); octx.filter = 'none'; octx.drawImage(POST.scan, 0, 0); }
  if (POST.paper) { octx.save(); octx.globalCompositeOperation = 'multiply'; octx.globalAlpha = STYLE_NAME === 'papier' ? 0.55 : 0.6; octx.drawImage(POST.paper, 0, 0); octx.restore(); }
  if (POST.half) { octx.save(); octx.globalCompositeOperation = 'multiply'; octx.globalAlpha = 0.22; octx.drawImage(POST.half, 0, 0); octx.restore(); }
  if (STYLE_NAME === 'toon' || STYLE_NAME === 'papier' || STYLE_NAME === 'bd') {
    if (!vign) { vign = octx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05); vign.addColorStop(0, 'rgba(20,10,30,0)'); vign.addColorStop(1, STYLE_NAME === 'papier' ? 'rgba(70,40,10,0.35)' : 'rgba(20,10,30,0.32)'); }
    octx.fillStyle = vign; octx.fillRect(0, 0, W, H);
  }
  if (STYLE_NAME === 'aquarelle') { const v = octx.createRadialGradient(W / 2, H / 2, H * 0.5, W / 2, H / 2, H * 1.0); v.addColorStop(0, 'rgba(255,255,255,0)'); v.addColorStop(1, 'rgba(255,253,246,0.7)'); octx.fillStyle = v; octx.fillRect(0, 0, W, H); }
}
function postAfterCaption() {
  if (STYLE_NAME === 'bd') { octx.lineWidth = 34; octx.strokeStyle = '#fbf8f0'; octx.strokeRect(0, 0, W, H); octx.lineWidth = 7; octx.strokeStyle = '#000'; octx.strokeRect(20, 20, W - 40, H - 40); }
}

// ---------- frame ----------
function render(f) {
  const sh = SHOTS.find(s => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];
  Object.values(cards).forEach(c => c.hide()); placed.length = 0;
  for (const k in SETS) if (SETS[k].isGroup) SETS[k].visible = k === sh.set;
  PROPS.forEach(o => { o.visible = false; });
  // dynamic textures
  const scroll = f * 0.35; P.drawSheet(sheetCanvas.getContext('2d'), 256, 160, scroll); sheetTex.needsUpdate = true;
  let hours = 9.05;
  if (f >= 395 && f < 470) hours = 9.5 + Math.pow((f - 395) / 75, 1.6) * 8.25;
  else if (f >= 470) hours = 17.75 + 0.25 * ss((f - 470) / 18) + (f > 486 && f < 492 ? 0.004 * Math.sin(f * 3) : 0);
  P.drawClock(clockCanvas.getContext('2d'), 512, hours); clockTex.needsUpdate = true;
  // camera
  const c = sh.cam(f);
  const p = new THREE.Vector3(...c.p), l = new THREE.Vector3(...c.l);
  p.lerp(l, Math.min(0.25, sh.creep * (f - sh.a)));
  let roll = c.roll || 0, dy = 0;
  KICKS.forEach(([kf, amp]) => { const d = f - kf; if (d >= 0 && d < 7) { const s = amp * (1 - d / 7) * (d % 2 ? 1 : -1); dy += s; roll += s * 0.6; } });
  camera.position.copy(p); camera.position.y += dy; camera.up.set(0, 1, 0); camera.lookAt(l); camera.rotateZ(roll);
  camera.fov = c.fov; camera.updateProjectionMatrix();
  applyLight(sh.light);
  sh.update(f);
  // billboards
  placed.forEach(cd => {
    if (cd.full) cd.mesh.quaternion.copy(camera.quaternion);
    else { cd.mesh.rotation.set(0, Math.atan2(camera.position.x - cd.mesh.position.x, camera.position.z - cd.mesh.position.z), 0); }
  });
  cloudCards.forEach(m => m.quaternion.copy(camera.quaternion));
  renderer.render(scene, camera);
  // composite
  post();
  for (const fl of FLASHES) { const d = Math.abs(f - fl); if (d <= 3) { octx.fillStyle = `rgba(255,255,255,${1 - d / 4})`; octx.fillRect(0, 0, W, H); } }
  if (!window.NOCAP) drawCaption(f);
  postAfterCaption();
}
window.renderFrame = (f, q = 0.93) => { render(f); return out.toDataURL('image/jpeg', q); };

(async () => {
  const fonts = [new FontFace('Baloo 2', 'url(fonts/baloo-2-latin-800-normal.woff2)', { weight: '800' }), new FontFace('Luckiest Guy', 'url(fonts/luckiest-guy-latin-400-normal.woff2)')];
  for (const ft of fonts) { await ft.load(); document.fonts.add(ft); }
  buildStreet(); buildMetro(); buildOffice(); buildWave(); buildTraffic(); buildBeach(); buildApt(); buildTrain(); initPost();
  const E = {
    THREE, P, T, scene, camera, OX, SETS, WATERS, STYLE_NAME,
    shot, camKeys, chr, card, put, walkPh, blinkAt, ss, clamp01, back, lerp,
    toon, ink, box, cyl, ball, rep, ctex, tree, palm, lamp, plant, desk,
    updateSea, beachH, updateWater, waveH, trainUpdate,
    get doorL() { return doorL; }, get doorR() { return doorR; },
    prop(obj, set) { (set ? SETS[set] : scene).add(obj); PROPS.push(obj); obj.visible = false; return obj; },
    setCaps(c) { CAPS = c; }, setKicks(k) { KICKS = k; }, setFlashes(fl) { FLASHES = fl; }, setTotal(n) { TOTAL = n; },
  };
  const story = await import('./stories/' + (window.STORY || 'planche-surf') + '.js');
  await story.default(E);
  window.TOTAL = TOTAL;
  window.ready = true;
})().catch(e => { window.err = String(e.stack || e); });
