// Painted canvas textures (hand-made look: blotches, soft noise, dark seams)
import * as THREE from './lib/three.module.js';

export const INK = '#16161f';

let _seed = 1;
export const rnd = () => { _seed = (_seed * 16807) % 2147483647; return (_seed - 1) / 2147483646; };
export const reseed = (s) => { _seed = Math.max(1, Math.floor(s * 9973) % 2147483647); };

export function hex(c) { const v = new THREE.Color(c); return v; }
export function shadeHex(c, k) { const v = new THREE.Color(c); v.multiplyScalar(k); return '#' + v.getHexString(); }
export function mixHex(a, b, t) { const v = new THREE.Color(a).lerp(new THREE.Color(b), t); return '#' + v.getHexString(); }

export function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

export function tex(c, { repeat = [1, 1], srgb = true, nearest = false } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 4;
  if (nearest) t.magFilter = THREE.NearestFilter;
  return t;
}

// soft painterly blotches over a base colour
export function blotch(ctx, w, h, base, amt = 0.08, n = 260, size = 60) {
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, y = rnd() * h, r = size * (0.3 + rnd());
    const k = 1 + (rnd() - 0.5) * 2 * amt;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const c = shadeHex(base, k);
    g.addColorStop(0, c + 'aa'); g.addColorStop(1, c + '00');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  // brush streaks
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 120; i++) {
    ctx.strokeStyle = rnd() < 0.5 ? '#ffffff' : '#000000';
    ctx.lineWidth = 2 + rnd() * 5;
    const x = rnd() * w, y = rnd() * h, l = 20 + rnd() * 60;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y + (rnd() - 0.5) * 8); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function plain(color, amt = 0.06, size = 256) {
  reseed(color.length * 7 + amt * 100);
  const c = canvas(size, size), x = c.getContext('2d');
  blotch(x, size, size, color, amt, 80, size / 5);
  return c;
}

// facade with window grid; windows painted with frames and glass reflection
export function facade({ color = '#e8d5b0', cols = 3, rows = 4, glass = '#3d5a80', frame = '#f6f1e6', shutter = null, door = false, w = 512, h = 768, seed = 1, storeband = null }) {
  reseed(seed);
  const c = canvas(w, h), x = c.getContext('2d');
  blotch(x, w, h, color, 0.08, 200, 70);
  // cornice / plinth
  x.fillStyle = shadeHex(color, 0.82); x.fillRect(0, 0, w, 18);
  x.fillStyle = shadeHex(color, 0.7); x.fillRect(0, h - 40, w, 40);
  const top = 40, bot = door ? h - 220 : h - 60;
  const cw = w / cols, rh = (bot - top) / rows;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const ww = cw * 0.5, wh = rh * 0.62;
    const wx = k * cw + (cw - ww) / 2, wy = top + r * rh + (rh - wh) / 2;
    if (shutter) { x.fillStyle = shutter; x.fillRect(wx - ww * 0.32, wy, ww * 0.3, wh); x.fillRect(wx + ww * 1.02, wy, ww * 0.3, wh);
      x.strokeStyle = INK; x.lineWidth = 3; x.strokeRect(wx - ww * 0.32, wy, ww * 0.3, wh); x.strokeRect(wx + ww * 1.02, wy, ww * 0.3, wh); }
    x.fillStyle = frame; x.fillRect(wx - 6, wy - 6, ww + 12, wh + 12);
    const lit = rnd() < 0.15;
    const g = x.createLinearGradient(wx, wy, wx + ww, wy + wh);
    g.addColorStop(0, lit ? '#ffe7a8' : shadeHex(glass, 1.35)); g.addColorStop(1, lit ? '#f2c66b' : glass);
    x.fillStyle = g; x.fillRect(wx, wy, ww, wh);
    x.fillStyle = 'rgba(255,255,255,0.35)';
    x.beginPath(); x.moveTo(wx + ww * 0.15, wy + wh); x.lineTo(wx + ww * 0.45, wy); x.lineTo(wx + ww * 0.6, wy); x.lineTo(wx + ww * 0.3, wy + wh); x.fill();
    x.strokeStyle = frame; x.lineWidth = 5; x.beginPath(); x.moveTo(wx + ww / 2, wy); x.lineTo(wx + ww / 2, wy + wh); x.moveTo(wx, wy + wh * 0.4); x.lineTo(wx + ww, wy + wh * 0.4); x.stroke();
    x.strokeStyle = INK; x.lineWidth = 4; x.strokeRect(wx - 6, wy - 6, ww + 12, wh + 12);
    x.fillStyle = shadeHex(color, 0.75); x.fillRect(wx - 12, wy + wh + 6, ww + 24, 10); // sill
  }
  if (storeband) { x.fillStyle = storeband; x.fillRect(0, h - 230, w, 30); x.strokeStyle = INK; x.lineWidth = 4; x.strokeRect(-4, h - 230, w + 8, 30); }
  if (door) {
    const dw = w * 0.28, dh = 170, dx = (w - dw) / 2, dy = h - 40 - dh;
    x.fillStyle = '#6b4a35'; x.fillRect(dx, dy, dw, dh);
    x.fillStyle = '#7d5a42'; x.fillRect(dx + 10, dy + 10, dw / 2 - 15, dh - 20); x.fillRect(dx + dw / 2 + 5, dy + 10, dw / 2 - 15, dh - 20);
    x.strokeStyle = INK; x.lineWidth = 5; x.strokeRect(dx, dy, dw, dh);
  }
  return c;
}

// modern office tower: glass grid
export function glassTower({ w = 512, h = 1024, cols = 6, rows = 14, seed = 3 }) {
  reseed(seed);
  const c = canvas(w, h), x = c.getContext('2d');
  blotch(x, w, h, '#cfd8dc', 0.05, 120, 60);
  const cw = w / cols, rh = h / rows;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const wx = k * cw + 7, wy = r * rh + 7, ww = cw - 14, wh = rh - 14;
    const g = x.createLinearGradient(wx, wy, wx, wy + wh);
    g.addColorStop(0, '#9cc3e0'); g.addColorStop(1, '#4f7ea8');
    x.fillStyle = g; x.fillRect(wx, wy, ww, wh);
    if (rnd() < 0.25) { x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(wx + ww * 0.1, wy, ww * 0.18, wh); }
    x.strokeStyle = '#2a3a4a'; x.lineWidth = 3; x.strokeRect(wx, wy, ww, wh);
  }
  return c;
}

export function tiles(color, { n = 4, seam = 0.6, size = 256, seed = 2, jitter = 0.06 } = {}) {
  reseed(seed);
  const c = canvas(size, size), x = c.getContext('2d');
  blotch(x, size, size, color, 0.05, 60, 40);
  const s = size / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    x.fillStyle = shadeHex(color, 1 + (rnd() - 0.5) * 2 * jitter);
    x.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
  }
  x.strokeStyle = shadeHex(color, seam); x.lineWidth = 3;
  for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, size); x.stroke(); x.beginPath(); x.moveTo(0, i * s); x.lineTo(size, i * s); x.stroke(); }
  return c;
}

export function asphalt() {
  reseed(11);
  const s = 256, c = canvas(s, s), x = c.getContext('2d');
  blotch(x, s, s, '#5d6168', 0.07, 120, 30);
  for (let i = 0; i < 1500; i++) { x.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)'; x.fillRect(rnd() * s, rnd() * s, 2, 2); }
  return c;
}

export function grass(color = '#6fae4a') {
  reseed(5);
  const s = 256, c = canvas(s, s), x = c.getContext('2d');
  blotch(x, s, s, color, 0.12, 160, 30);
  for (let i = 0; i < 600; i++) { x.strokeStyle = shadeHex(color, 0.7 + rnd() * 0.6); x.lineWidth = 2; const px = rnd() * s, py = rnd() * s; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (rnd() - 0.5) * 4, py - 6 - rnd() * 6); x.stroke(); }
  return c;
}

export function carpet() {
  reseed(9);
  const s = 256, c = canvas(s, s), x = c.getContext('2d');
  blotch(x, s, s, '#8e9db0', 0.06, 100, 30);
  x.strokeStyle = 'rgba(40,50,70,0.25)'; x.lineWidth = 3;
  for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, s); x.stroke(); x.beginPath(); x.moveTo(0, i * 64); x.lineTo(s, i * 64); x.stroke(); }
  return c;
}

export function planks(color = '#b7804a', n = 6) {
  reseed(13);
  const s = 256, c = canvas(s, s), x = c.getContext('2d');
  blotch(x, s, s, color, 0.08, 100, 30);
  const ph = s / n;
  for (let i = 0; i < n; i++) {
    x.fillStyle = shadeHex(color, 0.92 + rnd() * 0.16); x.fillRect(0, i * ph + 2, s, ph - 4);
    for (let k = 0; k < 5; k++) { x.strokeStyle = shadeHex(color, 0.8); x.lineWidth = 1.5; x.beginPath(); const yy = i * ph + 6 + rnd() * (ph - 12); x.moveTo(0, yy); x.bezierCurveTo(80, yy + 3, 160, yy - 3, s, yy); x.stroke(); }
    x.fillStyle = INK; x.fillRect(0, i * ph, s, 2.5);
  }
  return c;
}

// office back wall with big windows and a painted city skyline
export function officeWall() {
  reseed(21);
  const w = 1024, h = 320, c = canvas(w, h), x = c.getContext('2d');
  blotch(x, w, h, '#efe6d6', 0.05, 120, 60);
  const n = 4;
  for (let i = 0; i < n; i++) {
    const wx = 40 + i * 250, wy = 50, ww = 200, wh = 170;
    const g = x.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#8ec5ef'); g.addColorStop(1, '#d6ecfb');
    x.fillStyle = g; x.fillRect(wx, wy, ww, wh);
    // skyline
    reseed(30 + i);
    for (let b = 0; b < 7; b++) { const bx = wx + b * 30 - 5, bh = 40 + rnd() * 90; x.fillStyle = mixHex('#7a93b0', '#a9bdd1', rnd()); x.fillRect(bx, wy + wh - bh, 26, bh);
      x.fillStyle = 'rgba(255,255,255,0.4)'; for (let q = 0; q < bh / 14; q++) x.fillRect(bx + 5, wy + wh - bh + 6 + q * 14, 5, 5), x.fillRect(bx + 15, wy + wh - bh + 6 + q * 14, 5, 5); }
    x.strokeStyle = '#ffffff'; x.lineWidth = 10; x.strokeRect(wx, wy, ww, wh);
    x.beginPath(); x.moveTo(wx + ww / 2, wy); x.lineTo(wx + ww / 2, wy + wh); x.stroke();
    x.strokeStyle = INK; x.lineWidth = 4; x.strokeRect(wx - 5, wy - 5, ww + 10, wh + 10);
  }
  x.fillStyle = shadeHex('#efe6d6', 0.75); x.fillRect(0, h - 22, w, 22);
  return c;
}

export function metroWall() {
  reseed(17);
  const w = 512, h = 128, c = canvas(w, h), x = c.getContext('2d');
  blotch(x, w, h, '#d9dee4', 0.05, 60, 30);
  x.fillStyle = '#2f80c6'; x.fillRect(0, h * 0.62, w, 16);
  x.fillStyle = '#f2b632'; x.fillRect(0, h * 0.62 + 16, w, 6);
  return c;
}

export function fabric(c1 = '#2f5fa8', c2 = '#e3762f') {
  reseed(19);
  const s = 128, c = canvas(s, s), x = c.getContext('2d');
  blotch(x, s, s, c1, 0.05, 30, 20);
  for (let i = 0; i < 40; i++) { x.fillStyle = rnd() < 0.5 ? c2 : '#f1e6c8'; x.beginPath(); x.arc(rnd() * s, rnd() * s, 3 + rnd() * 4, 0, 7); x.fill(); }
  return c;
}

export function tunnel() {
  reseed(23);
  const w = 512, h = 256, c = canvas(w, h), x = c.getContext('2d');
  blotch(x, w, h, '#2a2c33', 0.12, 80, 40);
  x.strokeStyle = '#151619'; x.lineWidth = 6;
  for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(0, 60 + i * 18); x.lineTo(w, 60 + i * 18 + 4); x.stroke(); }
  return c;
}

export function concrete() { return tiles('#d6cfc2', { n: 2, seam: 0.78, seed: 31, jitter: 0.04 }); }

export function waterTex() {
  reseed(29);
  const s = 256, c = canvas(s, s), x = c.getContext('2d');
  blotch(x, s, s, '#ffffff', 0.04, 40, 30);
  x.strokeStyle = 'rgba(200,235,255,0.9)'; x.lineWidth = 3;
  for (let i = 0; i < 40; i++) { const px = rnd() * s, py = rnd() * s; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 12, py - 5, px + 26, py); x.stroke(); }
  return c;
}

// spreadsheet with scrolling rows
export function drawSheet(x, w, h, scroll) {
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#1f7a44'; x.fillRect(0, 0, w, 26);
  x.fillStyle = '#e9f3ec'; x.fillRect(0, 26, 34, h);
  const rh = 18, cw = (w - 34) / 5;
  const off = (scroll * rh) % rh;
  for (let r = 0; r < h / rh + 2; r++) {
    const y = 26 + r * rh - off, row = Math.floor(scroll) + r;
    for (let k = 0; k < 5; k++) {
      const xx = 34 + k * cw;
      if ((row * 7 + k * 3) % 11 === 0) { x.fillStyle = '#c8e6c9'; x.fillRect(xx, y, cw, rh); }
      x.fillStyle = '#9aa3ad';
      const len = 12 + ((row * 13 + k * 29) % 37);
      x.fillRect(xx + 6, y + 6, Math.min(cw - 12, len), 6);
    }
  }
  x.strokeStyle = '#c9d1d9'; x.lineWidth = 1;
  for (let k = 0; k <= 5; k++) { x.beginPath(); x.moveTo(34 + k * cw, 26); x.lineTo(34 + k * cw, h); x.stroke(); }
  for (let r = 0; r < h / rh + 2; r++) { const y = 26 + r * rh - off; x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }
  x.fillStyle = '#1f7a44'; x.fillRect(0, 0, w, 26);
  x.fillStyle = '#ffffff'; x.fillRect(10, 9, 60, 8); x.fillRect(80, 9, 40, 8);
}

// clock face, hours/minutes as float hours
export function drawClock(x, s, hours) {
  const c = s / 2;
  x.clearRect(0, 0, s, s);
  x.fillStyle = '#fbf8ef'; x.beginPath(); x.arc(c, c, c - 8, 0, 7); x.fill();
  x.strokeStyle = INK; x.lineWidth = 14; x.beginPath(); x.arc(c, c, c - 10, 0, 7); x.stroke();
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    x.lineWidth = i % 3 === 0 ? 10 : 5;
    x.beginPath(); x.moveTo(c + Math.sin(a) * (c - 30), c - Math.cos(a) * (c - 30)); x.lineTo(c + Math.sin(a) * (c - (i % 3 === 0 ? 62 : 48)), c - Math.cos(a) * (c - (i % 3 === 0 ? 62 : 48))); x.stroke();
  }
  x.fillStyle = INK; x.font = 'bold 44px "Baloo 2", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  [['12', 0], ['3', 3], ['6', 6], ['9', 9]].forEach(([t, i]) => { const a = i / 12 * Math.PI * 2; x.fillText(t, c + Math.sin(a) * (c - 95), c - Math.cos(a) * (c - 95) + 3); });
  const ha = (hours % 12) / 12 * Math.PI * 2, ma = (hours % 1) * Math.PI * 2;
  x.lineCap = 'round';
  x.strokeStyle = INK; x.lineWidth = 18; x.beginPath(); x.moveTo(c, c); x.lineTo(c + Math.sin(ha) * c * 0.48, c - Math.cos(ha) * c * 0.48); x.stroke();
  x.strokeStyle = '#d6342c'; x.lineWidth = 11; x.beginPath(); x.moveTo(c, c); x.lineTo(c + Math.sin(ma) * c * 0.72, c - Math.cos(ma) * c * 0.72); x.stroke();
  x.fillStyle = INK; x.beginPath(); x.arc(c, c, 16, 0, 7); x.fill();
}

export function signTex(text, { bg = '#f6d04d', fg = INK, w = 1024, h = 256, font = 'Luckiest Guy' } = {}) {
  const c = canvas(w, h), x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  x.strokeStyle = INK; x.lineWidth = 18; x.strokeRect(9, 9, w - 18, h - 18);
  x.fillStyle = fg; x.font = `${h * 0.58}px "${font}"`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, w / 2, h / 2 + h * 0.05);
  return c;
}

export function skyTex(top, hor) {
  const c = canvas(8, 512), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, top); g.addColorStop(0.62, hor); g.addColorStop(1, hor);
  x.fillStyle = g; x.fillRect(0, 0, 8, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
