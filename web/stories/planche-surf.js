// Scénario : « La planche de Marc » — planche de surf démontable en 3 morceaux.
// 30 s, 900 images à 30 i/s, 16:9, sans son, sous-titres incrustés.
import { build as buildProduct } from '../products/planche.js';

export default function (E) {
  const { THREE, P, T, OX, SETS, WATERS, shot, camKeys, chr, card, put, walkPh, blinkAt, ss, clamp01, back, lerp, toon, ink, updateSea, beachH, trainUpdate, doorL, doorR } = E;
  E.setTotal(900);
  E.setKicks([[358, 0.03], [375, 0.03], [396, 0.04], [450, 0.05], [470, 0.05], [662, 0.03], [680, 0.03], [698, 0.03], [815, 0.04]]);
  E.setFlashes([650, 795]);
  const PR = buildProduct(E);
  PR.pieces.forEach(p => E.prop(p, 'beach')); E.prop(PR.assembled, 'beach');
  let longBoard = null;
  const S = OX.street, Bc = OX.beach;
  const A = () => OX.apt, TRN = () => OX.train;
  const seaCalm = (f) => updateSea(WATERS.sea, f, (x, z) => beachH(x, z, f, 0.8));
  const BAGX = 0.75, BAGZ = 1.0, PZ = 1.95, PIECEX = [-0.85, 0, 0.85], JOINX = [-0.7, 0, 0.7];
  function pieces(fn) { PR.pieces.forEach((p, i) => { p.visible = true; p.scale.setScalar(1); fn(p, i); }); }
  function board2(x, y, z, rx, ry, rz) { PR.assembled.visible = true; PR.assembled.position.set(x, y, z); PR.assembled.rotation.set(rx, ry, rz); }

  // 1 — wardrobe
  shot(0, 80, 'apt', 'day', (f) => camKeys([{ f: 0, p: [A() + 1.9, 1.55, 2.4], l: [A() - 0.3, 1.15, -2.6], fov: 44 }, { f: 80, p: [A() + 1.6, 1.45, 1.6], l: [A() - 0.1, 1.1, -2.4], fov: 42 }], f), (f) => {
    const op = ss((f - 8) / 16); doorL.rotation.y = -op * 1.9; doorR.rotation.y = op * 1.9;
    const grab = f >= 50;
    if (!grab) { const bc = card('bagS'); T.drawBagProp(bc.x, 0, true); put(bc, A() - 0.6, 0.12, -2.8, { s: 0.78, shadow: false }); }
    const reach = f > 40 && f < 52;
    chr('marc', 'marc', A() + 1.15 - (reach ? 0.15 : 0), 0, -1.15, { facing: f < 58 ? -1 : 0, expr: f >= 60 ? 'smirk' : f > 26 ? 'grin' : 'smile', lookX: f >= 60 ? 0 : -1, t: f, blink: blinkAt(f, 1), bag: grab ? 0.8 : 0, lean: reach ? -0.12 : 0,
      arms: grab ? null : (f > 4 && f < 22) ? { L: [-1.3, -1.6], R: [0.2, 0.1] } : reach ? { L: [-1.2, -1.5], R: [0.2, 0.1] } : null });
  });
  // 2 — city walk
  shot(80, 125, 'street', 'day', (f) => { const mx = 38 + (f - 80) * 0.06; return { p: [S + mx + 2.6, 0.75, -3.4], l: [S + mx - 0.2, 1.35, -6.4], fov: 44 }; }, (f) => {
    const d = (f - 80) * 0.06, mx = 38 + d;
    chr('marc', 'marc', S + mx, 0.15, -6.35, { pose: 'walk', facing: 1, phase: walkPh(d), step: 1, bag: 0.8, expr: 'smile', t: f, blink: blinkAt(f, 1) });
    chr('ped', 'p2', S + mx + 3.5 - d * 1.6, 0.15, -7.0, { pose: 'walk', facing: -1, phase: walkPh(d * 1.0), step: 1, expr: 'neutral', t: f, blink: blinkAt(f, 3) });
  });
  // 3 — boards the train
  shot(125, 160, 'train', 'day', (f) => camKeys([{ f: 125, p: [TRN() + 1.2, 1.45, 1.35], l: [TRN() - 1.4, 1.1, -0.8], fov: 52 }, { f: 160, p: [TRN() + 0.8, 1.4, 1.3], l: [TRN() - 1.5, 1.1, -0.8], fov: 50 }], f), (f) => {
    trainUpdate(f, ss((f - 140) / 30) * 1, 1);
    const d = Math.min(f - 125, 26) * 0.065;
    chr('marc', 'marc', TRN() - 3.4 + d, 0, -0.4, { pose: 'walk', facing: f < 151 ? 1 : 0, phase: walkPh(d), step: f < 151 ? 1 : 0, bag: 0.8, expr: 'smile', t: f, blink: blinkAt(f, 1) });
    chr('p1', 'p1', TRN() + 0.6, 0, -1.08, { pose: 'sit', facing: 0, expr: 'bored', hold: 'phone', lookY: 1, t: f, blink: blinkAt(f, 11), arms: { L: [-0.1, 0.7], R: [0.4, 2.5] } }, { shw: 0.8 });
  });
  // 4 — nobody guesses
  shot(160, 225, 'train', 'day', (f) => camKeys([{ f: 160, p: [TRN() - 2.9, 0.85, 1.2], l: [TRN() - 0.9, 1.05, -1.3], fov: 54 }, { f: 225, p: [TRN() - 2.3, 0.9, 1.15], l: [TRN() - 0.6, 1.05, -1.3], fov: 50 }], f), (f) => {
    trainUpdate(f, 1, 1);
    chr('marc', 'marc', TRN() - 1.2, 0, -1.08, { pose: 'sit', facing: 0, expr: f > 200 ? 'smirk' : 'smile', lookX: f > 200 ? -0.6 : 0.6, t: f, blink: blinkAt(f, 1), arms: { L: [-0.1, 0.7], R: [0.1, -0.7] } }, { shw: 0.8 });
    const bc = card('bagS'); T.drawBagProp(bc.x, 0, true); put(bc, TRN() - 0.55, 0, -0.85, { s: 0.6, shw: 0.8 });
    chr('p1', 'p1', TRN() + 0.6, 0, -1.08, { pose: 'sit', facing: 0, expr: 'bored', hold: 'phone', lookY: 1, t: f, blink: blinkAt(f, 11), arms: { L: [-0.1, 0.7], R: [0.4, 2.5] } }, { shw: 0.8 });
    chr('p2', 'p3', TRN() - 2.4, 0, -1.08, { pose: 'sit', facing: 0, expr: 'neutral', hold: 'paper', t: f, blink: blinkAt(f, 12) }, { shw: 0.8 });
    chr('p3', 'p2', TRN() + 1.6, 0, -1.08, { pose: 'sit', facing: 0, expr: 'bored', blink: true, t: f, lean: 0.12 + Math.sin(f * 0.05) * 0.03, arms: { L: [-0.1, 0.7], R: [0.1, -0.7] } }, { shw: 0.8 });
  });
  // 5 — beach arrival, opens the bag
  shot(225, 285, 'beach', 'day', (f) => camKeys([{ f: 225, p: [Bc + 6.5, 4.8, 9.5], l: [Bc + 0.8, 0.6, 0.6], fov: 46 }, { f: 285, p: [Bc + 3.2, 1.7, 5.0], l: [Bc + 0.3, 0.6, 1.0], fov: 44 }], f), (f) => {
    seaCalm(f);
    const d = Math.min(f - 225, 34) * 0.08, kneel = f >= 262;
    const bagOn = f < 262;
    if (!bagOn) { const bc = card('bagO'); T.drawBagProp(bc.x, ss((f - 268) / 10)); put(bc, Bc + BAGX, 0.14, BAGZ, { s: 0.75, shw: 1.3 }); }
    chr('marc', 'marc', Bc + (kneel ? -0.3 : 2.4 - d * 0.8), 0.14, kneel ? 1.0 : 1.0 + (34 - Math.min(f - 225, 34)) * 0.05, { pose: kneel ? 'kneel' : 'walk', facing: 1, phase: walkPh(d), step: f < 259 ? 1 : 0, bag: bagOn ? 0.8 : 0, expr: kneel ? 'grin' : 'smile', t: f, blink: blinkAt(f, 1), arms: kneel ? { L: [0.4, 1.0], R: [1.2, 1.5] } : null });
  }, 0.0015);
  // 6 — three pieces, product orbit
  const LAUNCH2 = [287, 296, 305];
  shot(285, 345, 'beach', 'day', (f) => { const a = lerp(0.15, 0.95, ss((f - 285) / 60)); return { p: [Bc + Math.sin(a) * 2.6, 0.95 - (f - 285) * 0.004, PZ + Math.cos(a) * 2.6], l: [Bc, 0.25, PZ], fov: 38 }; }, (f) => {
    seaCalm(f);
    const bc = card('bagO'); T.drawBagProp(bc.x, 1); put(bc, Bc + BAGX, 0.14, BAGZ, { s: 0.75, shw: 1.3 });
    chr('marc', 'marc', Bc - 0.3, 0.14, 1.0, { pose: 'kneel', facing: 1, expr: 'grin', t: f, blink: blinkAt(f, 1), arms: LAUNCH2.some(l => f >= l - 1 && f < l + 6) ? { L: [-0.3, -0.2], R: [2.4, 2.9] } : { L: [0.4, 1.0], R: [1.2, 1.5] } });
    pieces((p, i) => {
      const lf = f - LAUNCH2[i]; if (lf < 0) { p.visible = false; return; }
      const t = clamp01(lf / 11), x = lerp(BAGX - 0.3, PIECEX[i], t), y = lerp(0.5, 0.2, t) + Math.sin(t * Math.PI) * 0.8 + (t >= 1 ? 0.06 + 0.04 * Math.sin(f * 0.12 + i) : 0);
      p.position.set(x, y, lerp(BAGZ, PZ, t)); p.rotation.set(0, t >= 1 ? Math.sin(f * 0.05 + i) * 0.05 : 0, (1 - t) * (i % 2 ? -2 : 2));
    });
    const sp = card('spark'); T.drawSparkle(sp.x, (f - 318) / 22); put(sp, Bc, 0.2, PZ + 0.05, { s: 0.6, shadow: false, full: true });
  });
  // 7 — clic, clic (macro)
  shot(345, 390, 'beach', 'day', (f) => camKeys([{ f: 345, p: [Bc - 0.6, 1.25, PZ + 1.0], l: [Bc - 0.55, 0.15, PZ], fov: 40, roll: 0.03 }, { f: 362, p: [Bc - 0.5, 1.2, PZ + 0.95], l: [Bc - 0.4, 0.15, PZ], fov: 40 }, { f: 390, p: [Bc + 0.35, 1.15, PZ + 0.9], l: [Bc + 0.35, 0.15, PZ], fov: 40, roll: -0.03 }], f), (f) => {
    seaCalm(f);
    const e1 = Math.pow(clamp01((f - 347) / 11), 2), e2 = Math.pow(clamp01((f - 364) / 11), 2);
    const xs = [lerp(PIECEX[0], JOINX[0], e1), 0, lerp(PIECEX[2], JOINX[2], e2)];
    pieces((p, i) => { p.position.set(xs[i], 0.2, PZ); p.rotation.set(0, 0, 0); });
    const b1 = card('clic1'); T.drawBurst(b1.x, (f - 358) / 15, 'CLIC !', '#ef476f'); put(b1, Bc - 0.35, 0.25, PZ - 0.1, { s: 0.32, shadow: false, full: true });
    const b2 = card('clic2'); T.drawBurst(b2.x, (f - 375) / 15, 'CLIC !', '#118ab2'); put(b2, Bc + 0.35, 0.25, PZ - 0.1, { s: 0.32, shadow: false, full: true });
  });
  // 8 — latch clic, board stands up (hero)
  shot(390, 435, 'beach', 'day', (f) => camKeys([{ f: 390, p: [Bc + 1.6, 0.4, PZ + 2.3], l: [Bc + 0.1, 0.6, PZ - 0.2], fov: 46 }, { f: 435, p: [Bc + 1.25, 0.38, PZ + 1.8], l: [Bc + 0.15, 1.15, PZ - 0.3], fov: 46, roll: 0.03 }], f), (f) => {
    seaCalm(f);
    const up = ss((f - 404) / 16);
    board2(lerp(0, 0.45, up), lerp(0.2, 1.2, up), lerp(PZ, PZ - 0.3, up), 0, lerp(0, 1.82, up), lerp(0, Math.PI / 2 - 0.06, up));
    const stand = f >= 402;
    chr('marc', 'marc', Bc - 0.35, 0.14, PZ - 0.45, { pose: stand ? 'stand' : 'kneel', facing: stand ? 0 : 1, expr: f > 420 ? 'happy' : 'grin', t: f, blink: blinkAt(f, 1), arms: stand ? { L: [-0.2, -0.1], R: [1.5, 2.2] } : { L: [0.6, 1.2], R: [1.0, 1.4] } });
    const b3 = card('clic3'); T.drawBurst(b3.x, (f - 396) / 15, 'CLIC !', '#ffd166'); put(b3, Bc + 0.1, 0.35, PZ - 0.05, { s: 0.42, shadow: false, full: true });
    const sp = card('spark'); T.drawSparkle(sp.x, (f - 420) / 15); put(sp, Bc + 0.45, 0.6, PZ - 0.2, { s: 0.9, shadow: false, full: true });
  });
  // 9 — solid as one piece: Marc stomps on it
  shot(435, 500, 'beach', 'day', (f) => camKeys([{ f: 435, p: [Bc + 2.9, 0.55, PZ + 2.6], l: [Bc, 0.8, PZ], fov: 44 }, { f: 500, p: [Bc + 2.4, 0.6, PZ + 2.1], l: [Bc, 0.85, PZ], fov: 42 }], f), (f) => {
    seaCalm(f);
    board2(0, 0.2, PZ, 0, 0, 0);
    const jump = (fc) => { const d = f - fc + 10; return d >= 0 && d < 10 ? Math.sin(d / 10 * Math.PI) * 0.45 : 0; };
    const y = 0.28 + jump(450) + jump(470);
    const land = [450, 470].some(l => f >= l && f < l + 4);
    chr('marc', 'marc', Bc, y - (land ? 0.04 : 0), PZ + 0.02, { pose: 'surf', facing: 0, expr: f > 476 ? 'smirk' : 'determined', t: f, blink: blinkAt(f, 1) && f > 476, arms: jump(450) + jump(470) > 0.05 ? { L: [-2.4, -2.8], R: [2.4, 2.8] } : f > 476 ? { L: [-0.2, -0.1], R: [2.2, -2.6] } : { L: [-1.3, -1.7], R: [1.3, 1.7] } }, { shadow: false });
    const p1 = card('puff1'); T.drawPuff(p1.x, (f - 450) / 14); put(p1, Bc, 0.1, PZ + 0.1, { s: 1.0, shadow: false });
    const p2 = card('puff2'); T.drawPuff(p2.x, (f - 470) / 14); put(p2, Bc, 0.1, PZ + 0.1, { s: 1.1, shadow: false });
  });
  // 10 — runs into the waves
  shot(500, 565, 'beach', 'day', (f) => { const mz = 2.2 - (f - 500) * 0.11; return { p: [Bc + 5.2, 1.05, mz - 1.2], l: [Bc + 0.2, 0.9, mz - 0.4], fov: 44 }; }, (f) => {
    seaCalm(f);
    const d = (f - 500) * 0.11, mz = 2.2 - d, wade = clamp01((-mz - 1.5) / 3);
    const y = 0.14 - wade * 0.55;
    chr('marc', 'marc', Bc, y, mz, { pose: 'run', facing: 1, phase: walkPh(d, 1.0), step: 1, expr: 'happy', t: f, arms: { L: [-0.6, -0.2], R: [0.9, 1.5] } }, { shadow: wade < 0.05 });
    board2(0.15, y + 0.72, mz + 0.05, 0, Math.PI / 2, 0.05);
    const sp = card('spray'); T.drawSpray(sp.x, f, 3); if (wade > 0.1) put(sp, Bc + 0.1, -0.1, mz + 0.6, { s: 1.0, shadow: false });
  });
  // 11-13 — surfing
  const cz = (f) => -16 + (f - 565) * 0.07;
  const surfH = (f) => (x, z) => { const [h, k] = beachH(x, z, f, 0.6); const d = z - cz(f), p = d > 0 ? Math.exp(-Math.pow(d / 1.4, 2)) : Math.exp(-Math.pow(d / 5, 2)); const A = 1.9; return [h + A * p, Math.max(k, p * 0.95)]; };
  const surfer = (f, extraY = 0, spin = 0) => {
    const mx = -6 + (f - 565) * 0.2, mz = cz(f) + 0.9, H = surfH(f);
    const hy = H(mx, mz)[0], slope = (H(mx, mz + 0.3)[0] - H(mx, mz - 0.3)[0]) / 0.6;
    const carve = Math.sin((f - 565) * 0.16) * 0.45;
    board2(mx, hy + 0.05 + extraY, mz + 0.05, -Math.atan(slope) * 0.7 * (1 - Math.min(1, extraY)), carve * (1 - Math.min(1, extraY)) + spin, carve * 0.4);
    chr('marc', 'marc', Bc + mx, hy + 0.12 + extraY, mz + 0.05, { pose: 'surf', facing: 0, expr: 'happy', t: f, blink: false, lean: -carve * 0.3, arms: { L: [-1.45, -1.9 + Math.sin(f * 0.2) * 0.2], R: [1.35, 1.75 + Math.sin(f * 0.2 + 1) * 0.2] } }, { s: 0.95, shadow: false });
    const sp = card('spray'); T.drawSpray(sp.x, f, 5); put(sp, Bc + mx - 0.7, hy - 0.2 + extraY * 0.3, mz - 0.1, { s: 1.3, shadow: false });
    return { mx, mz, hy };
  };
  shot(565, 600, 'beach', 'day', (f) => { const mx = -6 + (f - 565) * 0.2, mz = cz(f) + 0.9; return { p: [Bc + mx + 3.2, 0.7, mz + 4.2], l: [Bc + mx, 1.6, mz], fov: 44, roll: Math.sin((f - 565) * 0.16) * 0.04 }; }, (f) => {
    updateSea(WATERS.sea, f, surfH(f)); surfer(f);
  });
  shot(600, 628, 'beach', 'day', (f) => { const mx = -6 + (f - 565) * 0.2, mz = cz(f) + 0.9; return { p: [Bc + mx + 2.4, 0.35, mz + 3.6], l: [Bc + mx, 2.4, mz], fov: 48, roll: 0.07 }; }, (f) => {
    updateSea(WATERS.sea, f, surfH(f));
    const t = clamp01((f - 602) / 24), jy = Math.sin(t * Math.PI) * 1.7;
    const s = surfer(f, jy, 0);
    const sp = card('spark'); T.drawSparkle(sp.x, (f - 609) / 14); put(sp, Bc + s.mx + 0.3, s.hy + jy + 0.1, s.mz + 0.2, { s: 0.9, shadow: false, full: true });
  }, 0.001);
  let tube;
  shot(628, 650, 'beach', 'day', (f) => { const mx = -6 + (f - 565) * 0.2, mz = cz(f) + 0.9, hy = surfH(f)(mx, mz)[0]; return { p: [Bc + mx + 3.0, hy + 1.1, mz + 0.4], l: [Bc + mx, hy + 0.9, mz], fov: 60 }; }, (f) => {
    updateSea(WATERS.sea, f, surfH(f));
    const s = surfer(f);
    if (!tube) {
      const geo = new THREE.CylinderGeometry(2.0, 2.0, 18, 48, 6, true, 0, Math.PI * 1.35); geo.rotateZ(Math.PI / 2);
      const pa = geo.attributes.position, cols = new Float32Array(pa.count * 3), cA = new THREE.Color('#ffffff'), cB = new THREE.Color('#58c3ec'), cC = new THREE.Color('#1f7fbf'), tmp = new THREE.Color();
      for (let i = 0; i < pa.count; i++) { let th = Math.atan2(pa.getY(i), pa.getZ(i)); if (th < 0) th += Math.PI * 2; const u = th / (Math.PI * 1.35); if (u < 0.12) tmp.copy(cA).lerp(cB, u / 0.12); else tmp.copy(cB).lerp(cC, clamp01((u - 0.12) / 0.6)); tmp.toArray(cols, i * 3); }
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      tube = E.prop(new THREE.Mesh(geo, toon('#ffffff', null, { side: THREE.DoubleSide, vertexColors: true })), 'beach');
    }
    tube.visible = true; tube.position.set(s.mx - 6, s.hy + 1.0, s.mz); tube.rotation.set(0, 0, 0);
  });
  // 14 — evening: unclip
  shot(650, 725, 'beach', 'golden', (f) => camKeys([{ f: 650, p: [Bc - 1.9, 1.35, PZ + 2.7], l: [Bc + 0.1, 0.4, PZ - 0.2], fov: 42 }, { f: 725, p: [Bc - 1.4, 1.2, PZ + 2.2], l: [Bc + 0.1, 0.4, PZ - 0.2], fov: 40 }], f), (f) => {
    seaCalm(f);
    const s2 = ss((f - 682) / 10), s1 = ss((f - 700) / 10);
    const xs = [lerp(JOINX[0], PIECEX[0] - 0.05, s1), 0, lerp(JOINX[2], PIECEX[2] + 0.05, s2)];
    pieces((p, i) => { p.position.set(xs[i], 0.2, PZ); p.rotation.set(0, 0, 0); });
    chr('marc', 'marc', Bc - 0.2, 0.14, 1.05, { pose: 'kneel', facing: 1, expr: 'smile', t: f, blink: blinkAt(f, 1), arms: { L: [0.6, 1.3], R: [1.1, 1.5 + Math.sin(f * 0.3) * 0.1] } });
    [[662, 0, '#ffd166'], [680, 0.35, '#118ab2'], [698, -0.35, '#ef476f']].forEach(([fc, x, col], i) => { const b = card('unclic' + i); T.drawBurst(b.x, (f - fc) / 15, 'CLIC !', col); put(b, Bc + x, 0.3, PZ - 0.05, { s: 0.38, shadow: false, full: true }); });
  });
  // 15 — pieces vanish into the bag
  const INTO = [730, 741, 752];
  shot(725, 795, 'beach', 'golden', (f) => camKeys([{ f: 725, p: [Bc + 0.4, 0.55, PZ + 3.0], l: [Bc + 0.3, 0.75, 1.1], fov: 46 }, { f: 795, p: [Bc + 0.5, 0.65, PZ + 2.4], l: [Bc + 0.2, 0.9, 1.1], fov: 44 }], f), (f) => {
    seaCalm(f);
    const closed = f >= 764;
    if (f < 772) { const bc = card('bagO'); T.drawBagProp(bc.x, closed ? 0 : 1); put(bc, Bc + BAGX, 0.14, BAGZ, { s: 0.75, shw: 1.3 }); }
    pieces((p, i) => {
      const t = clamp01((f - INTO[i]) / 9); if (t >= 1) { p.visible = false; return; }
      p.position.set(lerp(PIECEX[i], BAGX - 0.3, t), 0.2 + Math.sin(t * Math.PI) * 0.7, lerp(PZ, BAGZ, t)); p.rotation.set(0, 0, t * 3); p.scale.setScalar(1 - t * 0.6);
    });
    const stand = f >= 772;
    chr('marc', 'marc', Bc - 0.3, 0.14, 1.0, { pose: stand ? 'stand' : 'kneel', facing: stand ? 0 : 1, bag: stand ? 0.8 : 0, expr: f > 780 ? 'wink' : 'grin', t: f, blink: blinkAt(f, 1) && f < 778, arms: f > 780 ? { L: [-0.45, 2.3], R: [2.3, -2.5] } : stand ? null : { L: [0.4, 1.0], R: [1.2, 1.5] } });
    const sp = card('spark'); T.drawSparkle(sp.x, (f - 764) / 14); put(sp, Bc + BAGX, 0.4, BAGZ + 0.1, { s: 0.6, shadow: false, full: true });
  });
  // 16 — train home: the other surfer
  shot(795, 850, 'train', 'golden', (f) => camKeys([{ f: 795, p: [TRN() - 0.5, 1.5, 1.3], l: [TRN() - 0.4, 1.05, -1.0], fov: 60 }, { f: 850, p: [TRN() - 0.2, 1.45, 1.25], l: [TRN() - 0.1, 1.05, -1.0], fov: 58 }], f), (f) => {
    trainUpdate(f, 1, 0.8);
    const bump = f >= 812 && f < 830;
    if (!longBoard) { longBoard = E.prop(new THREE.Group(), 'train'); const lb = new THREE.Mesh(PR.boardPieceGeo(-1.05, 1.05), toon('#ffd166')); lb.scale.set(1.35, 1, 1.1); ink(lb, 0.02); longBoard.add(lb); }
    longBoard.visible = true; longBoard.position.set(-1.0 + Math.sin(f * 0.1) * 0.05, 1.45, -0.3); longBoard.rotation.set(0, 0.25, 0.08 + (bump ? 0.06 : 0));
    chr('surfer', 'p4', TRN() - 0.9, 0, -0.35, { facing: 0, expr: 'nervous' in {} ? 'smile' : (f > 815 ? 'shock' : 'smile'), t: f, blink: blinkAt(f, 51), arms: { L: [-1.0, -1.9], R: [1.0, 1.9] } });
    chr('vic1', 'p1', TRN() - 2.6, 0, -1.08, { pose: 'sit', facing: 0, expr: f > 814 ? 'grumpy' : 'bored', lookX: 1, t: f, blink: blinkAt(f, 52), lean: f > 814 && f < 822 ? -0.12 : 0 }, { shw: 0.8 });
    chr('vic2', 'p3', TRN() - 1.6, 0, -1.08, { pose: 'sit', facing: 0, expr: 'grumpy', lookX: 0.4, lookY: -0.6, t: f, blink: blinkAt(f, 53), lean: 0.1 }, { shw: 0.8 });
    chr('marc', 'marc', TRN() + 1.9, 0, -1.08, { pose: 'sit', facing: 0, expr: 'smile', lookX: -0.8, t: f, blink: blinkAt(f, 1) }, { shw: 0.8 });
    const bc = card('bagS'); T.drawBagProp(bc.x, 0, true); put(bc, TRN() + 2.5, 0, -0.85, { s: 0.6, shw: 0.8 });
    const b = card('toc'); T.drawBurst(b.x, (f - 815) / 16, 'TOC !', '#ffd166'); put(b, TRN() - 2.3, 1.75, -0.6, { s: 0.55, shadow: false, full: true });
  });
  // 17 — Marc relaxed, wink
  shot(850, 900, 'train', 'golden', (f) => camKeys([{ f: 850, p: [TRN() + 2.75, 1.12, 0.95], l: [TRN() + 2.15, 1.0, -1.0], fov: 44, roll: 0 }, { f: 900, p: [TRN() + 2.5, 1.1, 0.15], l: [TRN() + 2.15, 1.05, -1.0], fov: 42, roll: 0.05 }], f), (f) => {
    trainUpdate(f, 1, 0.8);
    chr('marc', 'marc', TRN() + 1.9, 0, -1.08, { pose: 'sit', facing: 0, expr: f > 874 ? 'wink' : 'smile', lookX: f > 874 ? 0 : 0.5, t: f, blink: blinkAt(f, 1) && f < 870, arms: f > 862 && f < 874 ? { L: [-0.1, 0.7], R: [0.9, 0.4 + Math.sin(f * 0.9) * 0.15] } : f >= 874 ? { L: [-0.1, 0.7], R: [2.3, -2.5] } : { L: [-0.1, 0.7], R: [0.1, -0.7] } }, { shw: 0.8 });
    const bc = card('bagS'); T.drawBagProp(bc.x, 0, true); put(bc, TRN() + 2.5, 0, -0.85, { s: 0.6, shw: 0.8 });
  }, 0.003);

  E.setCaps([
  [0, 80, 'Dans le placard de Marc, un sac bien rangé cache un secret.', ['secret.']],
  [80, 160, 'Il l\'attrape, traverse la ville et saute dans le train.', ['train.']],
  [160, 225, 'Personne ne devine ce qu\'il transporte.', ['Personne']],
  [225, 285, 'Arrivé sur la plage, il ouvre le sac.', ['plage,']],
  [285, 345, 'Trois morceaux de planche.', ['Trois', 'morceaux']],
  [345, 435, 'Clic. Clic. Clic. Dix secondes, et la planche est prête.', ['Clic.', 'Dix', 'secondes,']],
  [435, 500, 'Solide comme une planche d\'un seul bloc.', ['Solide', 'seul', 'bloc.']],
  [500, 565, 'Marc fonce dans les vagues.', ['fonce']],
  [565, 650, 'Virage, saut, tube : la planche tient tout.', ['Virage,', 'saut,', 'tube']],
  [650, 725, 'Le soir, trois clics dans l\'autre sens.', ['trois', 'clics']],
  [725, 795, 'La planche disparaît dans le sac.', ['disparaît']],
  [795, 900, 'Et Marc rentre en train… sans gêner personne.', ['sans', 'gêner', 'personne.']],
]);
}
