// Stickman card drawing (Canvas2D). Design canvas 768x1024, soles at y=978, body centre x=384.
export const CW = 768, CH = 1024, SOLE = 978, CX = 384;
export const VARIANTS = {
  stick:    { hs: 1, legK: 1, armK: 1, torsoK: 1, bodyW: 1, legW: 13, armW: 12, handR: 13, skin: null, sleeve: false, pants: null, shoe: null, eyes: 'round', outline: true },
  moderne:  { hs: 0.8, legK: 1.05, armK: 1.0, torsoK: 1.05, bodyW: 1.05, legW: 34, armW: 28, handR: 17, skin: '#f2c7a5', sleeve: true, pants: '#34405a', shoe: '#2b2d42', eyes: 'dot', outline: false, neck: true },
  chibi:    { hs: 1.32, legK: 0.6, armK: 0.7, torsoK: 0.72, bodyW: 0.92, legW: 26, armW: 22, handR: 16, skin: '#ffdcc4', sleeve: true, pants: '#34405a', shoe: '#ffffff', eyes: 'shine', outline: true, cheeks: true, ink: '#4a3434' },
  mascotte: { hs: 1.05, legK: 0.5, armK: 0.62, torsoK: 0.88, bodyW: 1.3, legW: 42, armW: 34, handR: 22, skin: '#ffe0c7', sleeve: true, pants: 'dark', shoe: '#3d2b3d', eyes: 'oval', outline: true, cheeks: true, round: true, ink: '#3d2b3d' },
  geo:      { hs: 0.86, legK: 0.95, armK: 0.95, torsoK: 1.0, bodyW: 1.0, legW: 30, armW: 26, handR: 15, skin: '#e9a77e', sleeve: true, pants: '#2f3e64', shoe: '#1d2340', eyes: 'dot', outline: false, round: true, shade: true },
  elance:   { hs: 0.6, legK: 1.32, armK: 1.2, torsoK: 1.12, bodyW: 0.8, legW: 20, armW: 16, handR: 11, skin: '#d9a07c', sleeve: true, pants: '#2b2d42', shoe: '#111111', eyes: 'dot', outline: false, neck: true },
};
export const ST = { ink: '#1a1a2e', limb: '#111111', lw: 1, head: '#ffffff', v: VARIANTS.stick };

export const OUTFITS = {
  marc:   { type: 'shirt', color: '#3d8fd6', tie: '#d6342c', hair: { color: '#3b2a20', style: 'short' }, seed: 1 },
  julie:  { type: 'dress', color: '#d0435b', hair: { color: '#6b3a1f', style: 'long' }, seed: 2 },
  paul:   { type: 'suit', color: '#6c7380', tie: '#2c4f8f', hair: { color: '#222222', style: 'side' }, seed: 3 },
  sophie: { type: 'tunic', color: '#e8a93a', hair: { color: '#a8552a', style: 'bun' }, seed: 4 },
  karim:  { type: 'shirt', color: '#4c9a5b', hair: { color: '#1d1d1d', style: 'curly' }, seed: 5 },
  ped:    { type: 'suit', color: '#8a5a9e', tie: '#f2c14e', hair: { color: '#7a7a7a', style: 'side' }, seed: 6 },
  p1:     { type: 'dress', color: '#2f9e9a', hair: { color: '#e0b04a', style: 'long' }, seed: 7 },
  p2:     { type: 'tunic', color: '#c0622f', hair: { color: '#444', style: 'bald' }, seed: 8 },
  p3:     { type: 'shirt', color: '#7b5bc4', hair: { color: '#2b2b2b', style: 'curly' }, seed: 9 },
  p4:     { type: 'suit', color: '#3f5f45', tie: '#e05a3a', hair: { color: '#5a3a24', style: 'short' }, seed: 10 },
};

const TAU = Math.PI * 2;
const noise1 = (t, s) => Math.sin(3 * t + s * 1.7) * 0.022 + Math.sin(5 * t + s * 3.1) * 0.014 + Math.sin(2 * t + s * 0.6) * 0.012;

function headPath(x, cx, cy, a, b, seed) {
  x.beginPath();
  const n = 64;
  for (let i = 0; i <= n; i++) {
    const t = i / n * TAU;
    const egg = ST.v.round ? 1 : 1 + 0.06 * Math.cos(t + Math.PI / 2) * (Math.sin(t) < 0 ? 1 : 0.5); // fuller crown
    const r = ST.v.round ? 1 : 1 + noise1(t, seed);
    const px = cx + Math.cos(t) * a * r * (Math.sin(t) > 0 ? 0.94 : 1) , py = cy + Math.sin(t) * b * r * egg;
    i ? x.lineTo(px, py) : x.moveTo(px, py);
  }
  x.closePath();
}

// marker stroke: two passes with tiny offset -> uneven line weight
function marker(x, w = 9, col = ST.ink) {
  if (!ST.v.outline) return;
  if (ST.v.ink) col = ST.v.ink;
  x.strokeStyle = col; x.lineJoin = 'round'; x.lineCap = 'round';
  x.lineWidth = w * ST.lw; x.stroke();
  x.save(); x.translate(1.6, 1.2); x.lineWidth = w * 0.75 * ST.lw; x.stroke(); x.restore();
}

function stick(x, pts, w = 12) {
  x.strokeStyle = ST.limb; x.lineWidth = w * ST.lw; x.lineCap = 'round'; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.stroke();
}
function dot(x, p, r = 12) { x.fillStyle = ST.limb; x.beginPath(); x.arc(p[0], p[1], r, 0, TAU); x.fill(); }
const seg = (p, ang, len) => [p[0] + Math.sin(ang) * len, p[1] + Math.cos(ang) * len];

// ---------- faces ----------
const EXPR = {
  neutral:    { brow: [0, 0], mouth: 'smallsmile' },
  smile:      { brow: [0.05, 0.05], mouth: 'smile' },
  grin:       { brow: [0.15, 0.1], mouth: 'grin' },
  happy:      { brow: [0.2, 0.2], mouth: 'grin', eyes: 'arc' },
  smirk:      { brow: [0.3, -0.1], mouth: 'smirk' },
  wink:       { brow: [0.2, 0], mouth: 'smirk', eyes: 'wink' },
  suspicious: { brow: [-0.35, 0.3], mouth: 'squiggle' },
  shock:      { brow: [0.55, 0.55], mouth: 'o', eyes: 'big' },
  grumpy:     { brow: [-0.5, -0.5], mouth: 'frown' },
  bored:      { brow: [-0.05, -0.05], mouth: 'flat', eyes: 'lids' },
  whisper:    { brow: [0.25, 0.25], mouth: 'smallo' },
  determined: { brow: [-0.4, -0.4], mouth: 'smile' },
  think:      { brow: [0.35, -0.2], mouth: 'flat' },
};

function face(x, cx, cy, o) {
  const E = EXPR[o.expr || 'neutral'];
  const f = o.facing || 0;
  const sp = f ? 30 : 38, shift = f * 30;
  const eyes = [[cx + shift - sp, cy - 4], [cx + shift + sp, cy - 4]];
  const lx = (o.lookX ?? 0) + f * 0.6, ly = o.lookY ?? 0;
  const blink = o.blink;
  eyes.forEach((e, i) => {
    let mode = E.eyes || 'round';
    if (blink && mode !== 'arc') mode = 'closed';
    if (mode === 'wink' && i === 1) mode = 'arc'; else if (mode === 'wink') mode = 'round';
    const R = mode === 'big' ? 23 : 19;
    const ev = ST.v.eyes;
    if (ev !== 'round' && (mode === 'round' || mode === 'big' || mode === 'lids')) {
      x.fillStyle = '#1d1d26'; x.beginPath();
      if (ev === 'dot') x.ellipse(e[0] + lx * 3, e[1] + ly * 3, mode === 'big' ? 11 : 9, mode === 'big' ? 15 : 12, 0, 0, TAU);
      else if (ev === 'oval') x.ellipse(e[0] + lx * 3, e[1] + ly * 3, 11, mode === 'big' ? 22 : 18, 0, 0, TAU);
      else x.arc(e[0] + lx * 3, e[1] + ly * 3, mode === 'big' ? 25 : 22, 0, TAU);
      x.fill();
      x.fillStyle = '#ffffff'; x.beginPath(); x.arc(e[0] + lx * 3 + (ev === 'shine' ? 7 : 3), e[1] + ly * 3 - (ev === 'shine' ? 8 : 5), ev === 'shine' ? 7 : 3.5, 0, TAU); x.fill();
      if (ev === 'shine') { x.beginPath(); x.arc(e[0] + lx * 3 - 7, e[1] + ly * 3 + 8, 3.5, 0, TAU); x.fill(); }
      if (mode === 'lids') { x.fillStyle = ST.v.skin || '#fff'; x.fillRect(e[0] - 28, e[1] - 30, 56, 30); x.strokeStyle = '#1d1d26'; x.lineWidth = 6; x.beginPath(); x.moveTo(e[0] - 14, e[1]); x.lineTo(e[0] + 14, e[1]); x.stroke(); }
    } else if (mode === 'round' || mode === 'big' || mode === 'lids') {
      x.fillStyle = '#ffffff'; x.beginPath(); x.arc(e[0], e[1], R, 0, TAU); x.fill();
      x.strokeStyle = ST.ink; x.lineWidth = 5; x.stroke();
      x.fillStyle = '#000'; x.beginPath(); x.arc(e[0] + lx * 8, e[1] + ly * 8, mode === 'big' ? 7 : 8.5, 0, TAU); x.fill();
      if (mode === 'lids') { x.fillStyle = '#ffffff'; x.fillRect(e[0] - R - 3, e[1] - R - 3, 2 * R + 6, R + 2); x.strokeStyle = ST.ink; x.lineWidth = 6; x.beginPath(); x.moveTo(e[0] - R, e[1] - 1); x.lineTo(e[0] + R, e[1] - 1); x.stroke(); }
    } else if (mode === 'closed') {
      x.strokeStyle = ST.ink; x.lineWidth = 6; x.lineCap = 'round'; x.beginPath(); x.moveTo(e[0] - 16, e[1] + 2); x.quadraticCurveTo(e[0], e[1] + 8, e[0] + 16, e[1] + 2); x.stroke();
    } else if (mode === 'arc') {
      x.strokeStyle = ST.ink; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.moveTo(e[0] - 16, e[1] + 6); x.quadraticCurveTo(e[0], e[1] - 14, e[0] + 16, e[1] + 6); x.stroke();
    }
    // eyebrows: brow[0]=inner lift, brow[1]=outer lift (radians-ish)
    const side = i === 0 ? -1 : 1;
    const bIn = E.brow[0] * (o.browMul ?? 1), bOut = E.brow[1] * (o.browMul ?? 1);
    const by = e[1] - 36 - (bIn + bOut) * 10;
    x.strokeStyle = ST.limb; x.lineWidth = 9; x.lineCap = 'round';
    x.beginPath();
    x.moveTo(e[0] - side * 4 - side * -2, by - bIn * 18);
    x.quadraticCurveTo(e[0] + side * 8, by - 8 - (bIn + bOut) * 6, e[0] + side * 22, by - bOut * 18);
    x.stroke();
  });
  if (ST.v.cheeks) { x.fillStyle = 'rgba(255,120,140,0.45)'; for (const sd of [-1, 1]) { x.beginPath(); x.ellipse(cx + shift + sd * (sp + 26), cy + 30, 18, 11, 0, 0, TAU); x.fill(); } }
  // mouth
  const mx = cx + shift * 0.9, my = cy + 52;
  x.strokeStyle = ST.ink; x.lineWidth = 7; x.lineCap = 'round'; x.lineJoin = 'round';
  const m = o.mouth || E.mouth;
  x.beginPath();
  if (m === 'smallsmile') { x.moveTo(mx - 16, my); x.quadraticCurveTo(mx, my + 10, mx + 16, my); x.stroke(); }
  else if (m === 'smile') { x.moveTo(mx - 28, my - 6); x.quadraticCurveTo(mx, my + 20, mx + 28, my - 6); x.stroke(); }
  else if (m === 'smirk') { x.moveTo(mx - 18, my + 4); x.quadraticCurveTo(mx + 6, my + 10, mx + 26, my - 8); x.stroke(); }
  else if (m === 'flat') { x.moveTo(mx - 16, my + 2); x.lineTo(mx + 16, my + 2); x.stroke(); }
  else if (m === 'frown') { x.moveTo(mx - 24, my + 10); x.quadraticCurveTo(mx, my - 10, mx + 24, my + 10); x.stroke(); }
  else if (m === 'squiggle') { x.moveTo(mx - 20, my + 2); x.quadraticCurveTo(mx - 10, my - 6, mx, my + 2); x.quadraticCurveTo(mx + 10, my + 10, mx + 20, my + 2); x.stroke(); }
  else if (m === 'o' || m === 'smallo') { const r = m === 'o' ? 14 : 8; x.fillStyle = '#3a1418'; x.beginPath(); x.ellipse(mx, my + 2, r * 0.85, r, 0, 0, TAU); x.fill(); x.stroke(); }
  else if (m === 'grin') {
    x.fillStyle = '#3a1418'; x.moveTo(mx - 32, my - 8); x.quadraticCurveTo(mx, my + 34, mx + 32, my - 8); x.closePath(); x.fill();
    x.save(); x.clip(); x.fillStyle = '#ffffff'; x.fillRect(mx - 34, my - 10, 68, 12); x.fillStyle = '#e66a7a'; x.beginPath(); x.ellipse(mx, my + 22, 14, 8, 0, 0, TAU); x.fill(); x.restore();
    x.beginPath(); x.moveTo(mx - 32, my - 8); x.quadraticCurveTo(mx, my + 34, mx + 32, my - 8); x.closePath(); x.stroke();
  }
}

function hairFront(x, cx, cy, a, b, h, seed, facing) {
  if (!h || h.style === 'bald') return;
  x.save(); headPath(x, cx, cy, a, b, seed); x.clip();
  x.fillStyle = h.color; x.beginPath();
  const f = facing || 0;
  if (h.style === 'short' || h.style === 'side' || h.style === 'curly' || h.style === 'bun' || h.style === 'long') {
    const top = cy - b - 10;
    x.moveTo(cx - a - 10, cy + (h.style === 'long' ? 10 : -12));
    x.lineTo(cx - a - 10, top);
    x.lineTo(cx + a + 10, top);
    x.lineTo(cx + a + 10, cy + (h.style === 'long' ? 10 : -16));
    // fringe line
    const fy = cy - b * 0.38;
    if (h.style === 'side') { x.quadraticCurveTo(cx + a * 0.3, fy - 10, cx - a * 0.2 + f * 30, fy + 8); x.quadraticCurveTo(cx - a * 0.6, fy - 20, cx - a - 10, fy + 10); }
    else if (h.style === 'curly') { for (let i = 0; i <= 6; i++) { const px = cx + a + 10 - i * (2 * a + 20) / 6; x.quadraticCurveTo(px + 15, fy + 22, px, fy); } }
    else { for (let i = 0; i <= 4; i++) { const px = cx + a + 10 - i * (2 * a + 20) / 4; x.quadraticCurveTo(px + 20 + f * 10, fy + 18 - (i % 2) * 8, px, fy - 4); } }
    x.closePath(); x.fill();
  }
  x.restore();
  if (h.style === 'bun') { x.fillStyle = h.color; x.beginPath(); x.arc(cx - facing * 40, cy - b - 18, 34, 0, TAU); x.fill(); x.strokeStyle = ST.ink; x.lineWidth = 7; x.stroke(); }
}
function hairBack(x, cx, cy, a, b, h, facing) {
  if (!h || h.style !== 'long') return;
  x.fillStyle = h.color; x.beginPath();
  x.moveTo(cx - a * 0.9 - facing * 20, cy - b * 0.6);
  x.quadraticCurveTo(cx - a * 1.25, cy + b * 0.9, cx - a * 0.8, cy + b * 1.55);
  x.lineTo(cx + a * 0.8, cy + b * 1.55);
  x.quadraticCurveTo(cx + a * 1.25, cy + b * 0.9, cx + a * 0.9 - facing * 20, cy - b * 0.6);
  x.closePath(); x.fill(); x.strokeStyle = ST.ink; x.lineWidth = 8; x.stroke();
}

// ---------- props held / worn ----------
export function backpack(x, cx, cy, s = 1, color = '#5d8a3c') {
  x.save(); x.translate(cx, cy); x.scale(s, s);
  const w = 300, h = 420;
  x.fillStyle = color; x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, 70); x.fill(); marker(x, 10);
  x.fillStyle = '#4a7230'; x.beginPath(); x.roundRect(-w / 2 + 10, -h / 2 + 6, w - 20, 110, [60, 60, 20, 20]); x.fill(); marker(x, 8);
  x.fillStyle = '#4a7230'; x.beginPath(); x.roundRect(-90, 40, 180, 130, 30); x.fill(); marker(x, 8);
  x.strokeStyle = '#d9c46a'; x.lineWidth = 8; x.beginPath(); x.moveTo(-60, 70); x.lineTo(60, 70); x.stroke();
  x.fillStyle = '#c9b25a'; x.beginPath(); x.roundRect(-20, -h / 2 + 90, 40, 46, 8); x.fill(); marker(x, 5);
  x.restore();
}

export function bill(x, p, rot = -0.3) {
  x.save(); x.translate(p[0], p[1] - 24); x.rotate(rot);
  x.fillStyle = '#7fbf6a'; x.fillRect(-40, -22, 80, 44); x.strokeStyle = ST.ink; x.lineWidth = 5; x.strokeRect(-40, -22, 80, 44);
  x.fillStyle = '#4f8f3e'; x.beginPath(); x.arc(0, 0, 12, 0, TAU); x.fill();
  x.restore();
}

// ---------- body ----------
function torso(x, o, sx, sy, facing) {
  const c = o.color;
  x.fillStyle = c; x.beginPath();
  if (o.type === 'suit') { x.roundRect(sx - 82, sy - 6, 164, 270, 36); }
  else if (o.type === 'dress') { x.moveTo(sx - 62, sy); x.quadraticCurveTo(sx - 70, sy + 120, sx - 128, sy + 300); x.quadraticCurveTo(sx, sy + 330, sx + 128, sy + 300); x.quadraticCurveTo(sx + 70, sy + 120, sx + 62, sy); x.quadraticCurveTo(sx, sy - 22, sx - 62, sy); }
  else if (o.type === 'tunic') { x.ellipse(sx, sy + 135, 86, 150, 0, 0, TAU); }
  else { x.ellipse(sx, sy + 128, 80, 140, 0, 0, TAU); }
  x.fill(); marker(x, 9);
  if (o.type === 'suit' || o.tie) {
    x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(sx - 30 + facing * 20, sy - 2); x.lineTo(sx + facing * 20, sy + 70); x.lineTo(sx + 30 + facing * 20, sy - 2); x.closePath(); x.fill(); marker(x, 5);
    if (o.tie) { x.fillStyle = o.tie; x.beginPath(); x.moveTo(sx - 9 + facing * 20, sy + 8); x.lineTo(sx + 9 + facing * 20, sy + 8); x.lineTo(sx + 14 + facing * 20, sy + 100); x.lineTo(sx + facing * 20, sy + 118); x.lineTo(sx - 14 + facing * 20, sy + 100); x.closePath(); x.fill(); marker(x, 4); }
  }
  if (o.type === 'tunic') { x.fillStyle = '#7a4a1c'; x.fillRect(sx - 84, sy + 160, 168, 16); x.strokeStyle = ST.ink; x.lineWidth = 4; x.strokeRect(sx - 84, sy + 160, 168, 16); }
}

/*
 o = { outfit, expr, facing (-1,0,1), phase, step (0..1 walk amount), run, pose: 'stand'|'walk'|'sit'|'kneel'|'surf'|'carlean',
       arms: {L:[u,l], R:[u,l]} (absolute angles from down, +toward +x), blink, lookX, lookY, bag (scale or 0), bob, lean, hold: 'bill'|null, t (frame for breathing) }
*/
export function drawChar(x, o) {
  const O = typeof o.outfit === 'string' ? OUTFITS[o.outfit] : o.outfit;
  const f = o.facing || 0;
  const pose = o.pose || 'stand';
  x.clearRect(0, 0, CW, CH);
  x.save();
  const V = ST.v; const T = 190 * V.legK; // limb lengths
  let L1, L2, R1, R2; // leg angles (thigh, shin) for screen-left leg and right leg
  const ph = o.phase || 0, st = o.step || 0;
  if (pose === 'walk' || pose === 'run') {
    const A = pose === 'run' ? 0.62 : 0.42;
    const s0 = Math.sin(ph), s1 = Math.sin(ph + Math.PI);
    L1 = f * A * s0 * st; L2 = L1 - f * (pose === 'run' ? 1.1 : 0.7) * Math.max(0, Math.cos(ph)) * st;
    R1 = f * A * s1 * st; R2 = R1 - f * (pose === 'run' ? 1.1 : 0.7) * Math.max(0, Math.cos(ph + Math.PI)) * st;
    if (!f) { L1 = -0.08; L2 = -0.08; R1 = 0.08; R2 = 0.08; }
  } else if (pose === 'sit') { const ff = f || 1; L1 = ff * 1.45; L2 = 0.05 * ff; R1 = ff * 1.5; R2 = 0.0; if (!f) { L1 = -0.12; L2 = -0.05; R1 = 0.12; R2 = 0.05; } }
  else if (pose === 'kneel') { const ff = f || 1; L1 = ff * 1.5; L2 = 0; R1 = -ff * 0.15; R2 = -ff * 1.55; }
  else if (pose === 'surf') { L1 = -0.55; L2 = -0.05; R1 = 0.55; R2 = 0.05; }
  else { L1 = -0.07; L2 = -0.05; R1 = 0.07; R2 = 0.05; }
  const thighL = pose === 'sit' && !f ? 110 * V.legK : T;
  const vert = (a1, a2, l1 = T) => Math.cos(a1) * l1 + Math.cos(a2) * T;
  let hipY = SOLE - Math.max(vert(L1, L2, thighL), vert(R1, R2, thighL));
  if (pose === 'sit' && !f) hipY = SOLE - 300 * V.legK;
  const hx = CX + (pose === 'surf' ? 0 : 0);
  const breathe = Math.sin((o.t || 0) * 0.16 + (O.seed || 0)) * 4;
  // upper body anchor
  const lean = (o.lean || 0) + (pose === 'run' ? f * 0.12 : pose === 'walk' ? f * 0.04 * st : 0);
  const shoulderY = hipY - 230 * V.torsoK + breathe * 0.4;
  const hipL = [hx - 24, hipY], hipR = [hx + 24, hipY];
  // legs (drawn first; dress covers top)
  const kneeL = seg(hipL, L1, thighL), footL = seg(kneeL, L2, T);
  const kneeR = seg(hipR, R1, thighL), footR = seg(kneeR, R2, T);
  // back leg first
  const legCol = V.pants === 'dark' ? mulHex(O.color, 0.7) : O.type === 'dress' && V.skin ? V.skin : (V.pants || ST.limb);
  const drawLeg = (pts) => { stickC(x, pts, V.legW, legCol); if (V.shoe) { const ft = pts[2]; x.fillStyle = V.shoe; x.beginPath(); x.ellipse(ft[0] + (f || 0) * V.legW * 0.5, ft[1] - V.legW * 0.15, V.legW * (f ? 1.0 : 0.75), V.legW * 0.45, 0, 0, TAU); x.fill(); marker(x, 5); } };
  drawLeg([hipL, kneeL, footL]); drawLeg([hipR, kneeR, footR]);

  x.translate(hx, hipY); x.rotate(lean); x.translate(-hx, -hipY);
  const sy = shoulderY, sx = hx;
  const a = 112 * V.hs, b = 104 * V.hs;
  const headCY = sy - b - 4 - (V.neck ? 22 : 0) + breathe * 0.2, headCX = sx + f * 10;
  // backpack behind
  if (o.bag) backpack(x, sx - f * 120, sy + 110, o.bag);
  // arms angles
  const sh = [[sx - 66 * V.bodyW, sy + 40 * V.torsoK], [sx + 66 * V.bodyW, sy + 40 * V.torsoK]];
  let arms = o.arms;
  if (!arms) {
    if (pose === 'walk' || pose === 'run') { const A = (pose === 'run' ? 0.9 : 0.55) * st; arms = { L: [-0.2 + A * Math.sin(ph + Math.PI) * (f || 1), -0.2 + A * Math.sin(ph + Math.PI) * (f || 1) + 0.5 * (f || 1)], R: [0.2 + A * Math.sin(ph) * (f || 1), 0.2 + A * Math.sin(ph) * (f || 1) + 0.5 * (f || 1)] }; }
    else arms = { L: [-0.18, -0.08], R: [0.18, 0.08] };
  }
  if (o.bag && !o.arms) arms = { L: [-0.45, 2.3], R: [0.45, -2.3] }; // hands on straps
  const drawArm = (i) => { const s = sh[i], A = i ? arms.R : arms.L; const e = seg(s, A[0], 118 * V.armK), h = seg(e, A[1], 112 * V.armK); stickC(x, [s, e, h], V.armW, V.sleeve ? (O.type === 'dress' ? V.skin : mulHex(O.color, 0.85)) : ST.limb); x.fillStyle = V.skin || ST.limb; x.beginPath(); x.arc(h[0], h[1], V.handR, 0, TAU); x.fill(); return h; };
  // torso
  if (V.neck) { x.fillStyle = V.skin; x.fillRect(sx - 24 * V.hs, sy - 34, 48 * V.hs, 50); }
  x.save(); x.translate(sx, sy); x.scale(V.bodyW, V.torsoK); x.translate(-sx, -sy);
  torso(x, O, sx, sy + 8, f);
  if (V.shade) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(20,20,60,0.18)'; x.fillRect(sx + 10, sy - 20, 140, 360); x.globalCompositeOperation = 'source-over'; }
  x.restore();
  // straps over torso
  if (o.bag) { x.strokeStyle = '#3e6127'; x.lineWidth = 18; x.lineCap = 'round'; x.beginPath(); x.moveTo(sx - 50, sy + 10); x.lineTo(sx - 46, sy + 200); x.moveTo(sx + 50, sy + 10); x.lineTo(sx + 46, sy + 200); x.stroke(); x.strokeStyle = ST.ink; x.lineWidth = 3; x.stroke(); }
  const handL = drawArm(0), handR = drawArm(1);
  if (o.hold === 'bill') bill(x, handR);
  if (o.hold === 'phone') { x.save(); x.translate(handR[0] - 10, handR[1] - 30); x.rotate(-0.2); x.fillStyle = '#2b2d42'; x.beginPath(); x.roundRect(-22, -38, 44, 76, 8); x.fill(); x.fillStyle = '#9ad1f5'; x.fillRect(-16, -30, 32, 58); x.restore(); }
  // head
  hairBack(x, headCX, headCY, a, b, O.hair, f);
  headPath(x, headCX, headCY, a, b, O.seed || 1);
  x.fillStyle = V.skin || ST.head; x.fill(); marker(x, 10);
  hairFront(x, headCX, headCY, a, b, O.hair, O.seed || 1, f);
  headPath(x, headCX, headCY, a, b, O.seed || 1); marker(x, 10);
  x.save(); x.translate(headCX, headCY + 8 * V.hs); x.scale(V.hs, V.hs); face(x, 0, 0, { ...o, facing: f }); x.restore();
  if (o.hold === 'paper') { x.save(); x.translate(sx, sy - 10); x.rotate(-0.04); x.fillStyle = '#f2efe6'; x.fillRect(-150, -40, 300, 210); x.strokeStyle = ST.ink; x.lineWidth = 5 * ST.lw; x.strokeRect(-150, -40, 300, 210); x.fillStyle = '#b8b4aa'; for (let k = 0; k < 7; k++) { x.fillRect(-130, -15 + k * 24, 120, 9); x.fillRect(10, -15 + k * 24, 120, 9); } x.fillStyle = '#2b2d42'; x.fillRect(-130, -32, 260, 12); x.restore(); dot(x, [sx - 150, sy + 60], 13); dot(x, [sx + 150, sy + 60], 13); }
  x.restore();
  return { handL, handR };
}

// ---------- standalone prop / fx cards (all on 768x1024 canvases unless noted) ----------
export function drawBagProp(x, open = 0, upright = false) {
  x.clearRect(0, 0, CW, CH);
  if (upright) { backpack(x, CX, SOLE - 215, 1.0); return; }
  x.save(); x.translate(CX, 822); x.rotate(-Math.PI / 2);
  backpack(x, 0, 0, 1.0);
  x.restore();
  if (open > 0) { x.fillStyle = '#22301a'; x.beginPath(); x.ellipse(CX - 205, 822, 34 * open, 115, 0, 0, TAU); x.fill(); marker(x, 8); }
}

export function drawBubble(x, kind, t) {
  x.clearRect(0, 0, CW, CH);
  if (t <= 0) return;
  x.save(); x.translate(CX, 470); x.scale(t, t);
  // cloud
  x.fillStyle = '#ffffff'; x.beginPath();
  const pts = 10;
  for (let i = 0; i < pts; i++) { const ang = i / pts * TAU; x.moveTo(Math.cos(ang) * 230 + 70, Math.sin(ang) * 160); x.arc(Math.cos(ang) * 230, Math.sin(ang) * 160, 85, 0, TAU); }
  x.fill();
  x.beginPath(); x.ellipse(0, 0, 260, 190, 0, 0, TAU); x.fill();
  // outline via scaled stroke of circles
  x.strokeStyle = ST.ink; x.lineWidth = 9;
  for (let i = 0; i < pts; i++) { const ang = i / pts * TAU; x.beginPath(); x.arc(Math.cos(ang) * 230, Math.sin(ang) * 160, 85, ang - 1.2, ang + 1.2); x.stroke(); }
  // tail dots
  x.fillStyle = '#fff'; [[ -60, 300, 34], [-100, 380, 22], [-125, 440, 13]].forEach(([px, py, r]) => { x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); x.stroke(); });
  // content
  x.lineWidth = 8; x.strokeStyle = ST.ink; x.lineCap = 'round'; x.lineJoin = 'round';
  if (kind === 'parachute') {
    x.fillStyle = '#e8473c'; x.beginPath(); x.moveTo(-170, -10); x.quadraticCurveTo(0, -230, 170, -10); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(-60, -10); x.quadraticCurveTo(-30, -170, 0, -175); x.quadraticCurveTo(-10, -60, 60, -10); x.closePath(); x.fill(); x.stroke();
    x.beginPath(); [-170, -60, 60, 170].forEach(px => { x.moveTo(px, -10); x.lineTo(0, 110); }); x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(0, 120, 22, 0, TAU); x.fill(); x.stroke(); stick(x, [[0, 142], [0, 170]], 9);
  } else if (kind === 'yoga') {
    x.fillStyle = '#9b59d0'; x.beginPath(); x.roundRect(-200, -60, 330, 120, 30); x.fill(); x.stroke();
    x.fillStyle = '#b57ee0'; x.beginPath(); x.ellipse(140, 0, 50, 60, 0, 0, TAU); x.fill(); x.stroke();
    x.beginPath(); x.ellipse(140, 0, 26, 32, 0, 0, TAU); x.stroke(); x.beginPath(); x.ellipse(140, 0, 8, 10, 0, 0, TAU); x.stroke();
    x.fillStyle = '#16161f'; x.font = '90px "Luckiest Guy"'; x.textAlign = 'center'; x.fillText('XXL', -40, -90);
  } else if (kind === 'cat') {
    x.fillStyle = '#f0a03c';
    x.beginPath(); x.moveTo(-120, -40); x.lineTo(-110, -170); x.lineTo(-40, -95); x.lineTo(40, -95); x.lineTo(110, -170); x.lineTo(120, -40); x.quadraticCurveTo(140, 110, 0, 120); x.quadraticCurveTo(-140, 110, -120, -40); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#fff'; [[-50, 0], [50, 0]].forEach(([px, py]) => { x.beginPath(); x.arc(px, py, 26, 0, TAU); x.fill(); x.stroke(); x.fillStyle = '#000'; x.beginPath(); x.ellipse(px, py, 7, 16, 0, 0, TAU); x.fill(); x.fillStyle = '#fff'; });
    x.fillStyle = '#e66a7a'; x.beginPath(); x.moveTo(-14, 40); x.lineTo(14, 40); x.lineTo(0, 54); x.closePath(); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(0, 54); x.quadraticCurveTo(-20, 80, -36, 66); x.moveTo(0, 54); x.quadraticCurveTo(20, 80, 36, 66);
    [[-60, 50, -170, 30], [-60, 62, -170, 80], [60, 50, 170, 30], [60, 62, 170, 80]].forEach(([a1, b1, a2, b2]) => { x.moveTo(a1, b1); x.lineTo(a2, b2); }); x.stroke();
  }
  x.fillStyle = '#16161f'; x.font = '110px "Luckiest Guy"'; x.textAlign = 'center'; x.fillText('?', 205, -120);
  x.restore();
}

export function drawBurst(x, t, text, col = '#ffd23f') {
  x.clearRect(0, 0, CW, CH);
  if (t <= 0 || t >= 1) return;
  const s = t < 0.25 ? 0.4 + t / 0.25 * 0.75 : 1.15 - (t - 0.25) * 0.2;
  x.save(); x.translate(CX, 500); x.scale(s, s); x.rotate(-0.12);
  x.globalAlpha = t > 0.75 ? 1 - (t - 0.75) / 0.25 : 1;
  x.fillStyle = col; x.strokeStyle = ST.ink; x.lineWidth = 10; x.beginPath();
  const n = 14;
  for (let i = 0; i < n * 2; i++) { const r = i % 2 ? 170 : 300, a = i / (n * 2) * TAU; x.lineTo(Math.cos(a) * r * 1.2, Math.sin(a) * r * 0.8); }
  x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#ffffff'; x.font = '150px "Luckiest Guy"'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineWidth = 22; x.strokeText(text, 0, 10); x.fillText(text, 0, 10);
  x.restore();
}

export function drawSpray(x, t, seed = 1) {
  x.clearRect(0, 0, CW, CH);
  x.fillStyle = '#ffffff'; x.strokeStyle = '#7fb8d8'; x.lineWidth = 5;
  for (let i = 0; i < 16; i++) {
    const a = (i * 2.399 + seed) % TAU, life = ((t * 0.07 + i * 0.137) % 1);
    const r = 60 + life * 300, px = CX - 150 - Math.abs(Math.cos(a)) * r, py = 700 - Math.sin(a * 0.5 + 0.3) * r * 0.9 + life * life * 260;
    const rad = 34 * (1 - life) + 8;
    x.beginPath(); x.arc(px, py, rad, 0, TAU); x.fill(); x.stroke();
  }
}

export function drawSparkle(x, t) {
  x.clearRect(0, 0, CW, CH);
  if (t <= 0 || t >= 1) return;
  x.save(); x.translate(CX, 500);
  const s = Math.sin(t * Math.PI);
  [[0, 0, 1], [-200, -120, 0.6], [180, -160, 0.5], [220, 80, 0.4]].forEach(([px, py, k]) => {
    x.save(); x.translate(px, py); x.scale(s * k, s * k); x.rotate(t * 2);
    x.fillStyle = '#fff6b0'; x.strokeStyle = ST.ink; x.lineWidth = 8; x.beginPath();
    for (let i = 0; i < 8; i++) { const r = i % 2 ? 40 : 160, a = i / 8 * TAU; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    x.closePath(); x.fill(); x.stroke(); x.restore();
  });
  x.restore();
}

export function drawCloud(x, seed) {
  x.clearRect(0, 0, CW, CH);
  x.save(); x.translate(CX, 600);
  x.fillStyle = '#ffffff'; x.strokeStyle = '#c8d6e8'; x.lineWidth = 6;
  const blobs = [[-220, 40, 120], [-90, -20, 160], [70, -50, 170], [210, 30, 130], [0, 60, 150]];
  blobs.forEach(([px, py, r]) => { x.beginPath(); x.arc(px + Math.sin(seed) * 10, py, r, 0, TAU); x.fill(); });
  x.restore();
}

export function drawShadowBlob(x) {
  const g = x.createRadialGradient(64, 32, 2, 64, 32, 62);
  g.addColorStop(0, 'rgba(10,10,30,0.45)'); g.addColorStop(1, 'rgba(10,10,30,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 64);
}

export function drawPuff(x, t, col = '#e9d6a6') {
  x.clearRect(0, 0, CW, CH);
  if (t <= 0 || t >= 1) return;
  x.fillStyle = col; x.globalAlpha = 1 - t;
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI, r = 80 + t * 260; x.beginPath(); x.arc(CX + Math.cos(a) * r * (i % 2 ? 1 : 0.8), 930 - Math.sin(a) * r * 0.35, 40 + t * 50, 0, TAU); x.fill(); }
  x.globalAlpha = 1;
}

function stickC(x, pts, w, col) { x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.stroke(); }
function mulHex(c, k) { const n = parseInt(c.slice(1), 16); const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k); return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1); }
