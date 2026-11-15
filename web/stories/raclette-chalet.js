// Scénario : « La raclette de Léa » — machine à raclette 3-en-1 (raclette, mini pizzas, cookies).
// 30 s, 900 images à 30 i/s, 16:9, sans son, sous-titres incrustés. Décors : snow (extérieur) et chalet (intérieur).
import { build as buildProduct } from '../products/raclette.js';

export default function (E) {
  const { THREE, P, T, OX, shot, camKeys, chr, card, put, blinkAt, ss, clamp01, back, lerp, toon, ink } = E;
  E.setTotal(900);
  E.setKicks([[120, 0.03], [248, 0.025], [292, 0.025], [340, 0.03], [502, 0.03], [598, 0.025]]);
  E.setFlashes([357, 625, 700, 730, 760]);
  const C = OX.chalet, S = OX.snow, TY = 0.74, PY = TY + 0.02;
  const PR = buildProduct(E);
  const mach = E.prop(PR.machine(), 'chalet');
  const pans = PR.pieces.map(p => E.prop(p, 'chalet'));
  const pool = {}; // garnitures : pool['pizza1'][i]
  const fill = (kind, cook, i) => { const k = kind + (cook ? 1 : 0); pool[k] = pool[k] || []; if (!pool[k][i]) pool[k][i] = E.prop(PR.filling(kind, cook), 'chalet'); const o = pool[k][i]; o.visible = true; o.scale.setScalar(1); o.rotation.set(0, 0, 0); return o; };
  // ardoises des jours
  const slate = {}; ['MARDI', 'JEUDI', 'SAMEDI'].forEach(d => {
    const g = new THREE.Group(); const t = P.tex(P.signTex(d, { bg: '#2b2d42', fg: '#ffffff' }));
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.13, 0.02), [toon('#6e4729'), toon('#6e4729'), toon('#6e4729'), toon('#6e4729'), new THREE.MeshBasicMaterial({ map: t }), toon('#6e4729')]); b.position.y = 0.09; b.rotation.x = -0.18; ink(b, 0.008); g.add(b);
    slate[d] = E.prop(g, 'chalet');
  });
  // meule de fromage (3D) + visage dessiné (carte)
  const wheel = E.prop(new THREE.Group(), 'chalet');
  { const board = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 28), toon('#9b6236')); board.position.y = 0.012; ink(board, 0.006); wheel.add(board); }

  const F = {
    lea:   { type: 'tunic', color: '#06a89a', hair: { color: '#a8552a', style: 'long' }, seed: 21 },
    tom:   { type: 'shirt', color: '#d6342c', hair: { color: '#3b2a20', style: 'short' }, seed: 22 },
    ines:  { type: 'dress', color: '#7b5bc4', hair: { color: '#1d1d1d', style: 'bun' }, seed: 23 },
    hugo:  { type: 'shirt', color: '#2f6fb2', hair: { color: '#1d1d1d', style: 'curly' }, seed: 24 },
    sarah: { type: 'tunic', color: '#ef476f', hair: { color: '#e0b04a', style: 'long' }, seed: 25 },
    max:   { type: 'shirt', color: '#3f5f45', hair: { color: '#5a3a24', style: 'side' }, seed: 26 },
  };
  const SEAT = { ines: [-0.95, -1.0, 0], tom: [-0.32, -1.0, 0], lea: [0.32, -1.0, 0], hugo: [0.95, -1.0, 0], sarah: [-1.65, 0.1, 1], max: [1.65, 0.1, -1] };
  const UP = { L: [-2.6, -2.9], R: [2.6, 2.9] };
  function friends(f, ov = {}, only = null) {
    Object.keys(SEAT).forEach((n, i) => {
      if (only && !only.includes(n)) return;
      const [x, z, fc] = SEAT[n], o = ov[n] || {};
      chr(n, F[n], C + x, -0.06, z, { pose: 'sit', facing: fc, expr: 'smile', t: f + i * 9, blink: blinkAt(f, i + 2), ...o }, { shw: 0.8 });
    });
  }
  function machine() { mach.visible = true; mach.position.set(0, TY, 0); mach.rotation.set(0, 0, 0); }
  // poêlon i dans son logement (out = sortie radiale)
  function inSlot(i, out = 0, kind = null, cook = 1) {
    const s = PR.slot(i), r = PR.SLOT_R + out, p = pans[i];
    p.visible = true; p.position.set(Math.cos(s.a) * r, TY + PR.SLOT_Y, -Math.sin(s.a) * r); p.rotation.set(0, s.a, 0);
    if (kind) { const o = fill(kind, cook, i); o.position.copy(p.position); }
  }
  const ALL = [0, 1, 2, 3, 4, 5];
  // poêlons sortis, en couronne sur la table
  function ring(kind, cook = 1) {
    ALL.forEach(i => { const a = i / 6 * Math.PI * 2 + Math.PI / 6, p = pans[i]; p.visible = true; p.position.set(Math.cos(a) * 0.62, PY, -Math.sin(a) * 0.45); p.rotation.set(0, a + Math.PI, 0); const o = fill(kind, cook, i); o.position.copy(p.position); });
  }
  function pan(i, x, y, z, ry = 0, rx = 0, rz = 0) { const p = pans[i]; p.visible = true; p.position.set(x, y, z); p.rotation.set(rx, ry, rz); return p; }
  const fx = (name, draw, x, y, z, s, full = true) => { const c = card(name); c.m.depthTest = false; c.mesh.renderOrder = 5; draw(c.x); put(c, C + x, y, z, { s, shadow: false, full }); };

  // 1 — chalet sous la neige
  shot(0, 45, 'snow', 'lune', (f) => camKeys([{ f: 0, p: [S + 4.5, 1.6, 17], l: [S + 0.5, 2.4, -6], fov: 46 }, { f: 45, p: [S + 3.2, 1.9, 11.5], l: [S + 0.2, 2.2, -6], fov: 44 }], f), () => {});
  // 2 — six amis, une envie
  shot(45, 85, 'chalet', 'nuit', (f) => camKeys([{ f: 45, p: [C + 0.9, 2.2, 4.6], l: [C, 1.0, -1.0], fov: 46 }, { f: 85, p: [C + 0.5, 1.9, 3.9], l: [C, 1.0, -1.0], fov: 46 }], f), (f) => {
    machine(); ALL.forEach(i => inSlot(i));
    const up = f >= 58, w = Math.sin(f * 0.5) * 0.15;
    friends(f, Object.fromEntries(Object.keys(SEAT).map((n, i) => [n, up ? { expr: 'happy', arms: { L: [UP.L[0] + w, UP.L[1]], R: [UP.R[0] - w, UP.R[1]] } } : { expr: 'grin' }])));
  });
  // 3 — Léa déteste le fromage
  shot(85, 160, 'chalet', 'nuit', (f) => camKeys([{ f: 85, p: [C + 0.55, 1.18, 1.15], l: [C + 0.3, 0.95, -0.8], fov: 44 }, { f: 160, p: [C + 0.48, 1.15, 0.95], l: [C + 0.3, 0.97, -0.8], fov: 42 }], f), (f) => {
    machine(); ALL.forEach(i => inSlot(i));
    const slide = ss((f - 95) / 14);
    pan(0, lerp(0.05, 0.3, slide), PY, lerp(-0.1, -0.42, slide), Math.PI / 2 + 0.3); const o = fill('fromage', 1, 0); o.position.copy(pans[0].position);
    const yuck = f >= 116;
    friends(f, { lea: { expr: yuck ? 'grumpy' : 'suspicious', lean: yuck ? 0.18 : 0, lookY: yuck ? 0 : 0.8, arms: yuck ? { L: [-1.3, -2.0], R: [1.3, 2.0] } : null }, tom: { expr: 'grin', lookX: 1 }, hugo: { expr: yuck ? 'shock' : 'smile', lookX: -1 } }, ['tom', 'lea', 'hugo']);
    fx('beurk', x => T.drawBurst(x, (f - 118) / 26, 'BEURK !', '#06d6a0'), 0.6, 1.22, -0.7, 0.24);
  });
  // 4 — dévoilement : orbite autour de la machine
  shot(160, 235, 'chalet', 'nuit', (f) => { const a = lerp(-0.5, 0.55, ss((f - 160) / 75)); return { p: [C + Math.sin(a) * 1.05, TY + 0.42 - (f - 160) * 0.001, Math.cos(a) * 1.05], l: [C, TY + 0.12, 0], fov: 38 }; }, (f) => {
    machine(); ALL.forEach(i => inSlot(i, i === 5 || i === 0 ? 0.0 : 0));
    fx('spark', x => T.drawSparkle(x, (f - 196) / 24), 0.05, TY + 0.25, 0.1, 0.35);
  }, 0.0012);
  // 5 — macro : pâte, sauce, garniture
  const PZ = [-0.62, PY, 0.3];
  shot(235, 320, 'chalet', 'nuit', (f) => camKeys([{ f: 235, p: [C - 0.55, TY + 0.36, 0.64], l: [C - 0.62, TY + 0.02, 0.3], fov: 36, roll: 0.02 }, { f: 320, p: [C - 0.68, TY + 0.31, 0.58], l: [C - 0.62, TY + 0.02, 0.31], fov: 34, roll: -0.02 }], f), (f) => {
    machine(); [1, 2, 3, 4, 5].forEach(i => inSlot(i));
    pan(0, PZ[0], PZ[1], PZ[2], 0.35);
    const d = fill('pizza', 0, 0); d.position.set(...PZ); d.rotation.y = 0.35;
    const td = clamp01((f - 240) / 8), ts = ss((f - 262) / 10), tt = clamp01((f - 284) / 8);
    d.position.y = PY + (1 - td) * 0.3; d.visible = f >= 240;
    d.getObjectByName('sauce').scale.set(Math.max(0.001, ts), 1, Math.max(0.001, ts)); d.getObjectByName('sauce').visible = ts > 0;
    const top = d.getObjectByName('top'); top.visible = f >= 284; top.position.y = (1 - tt) * 0.15;
    fx('plop1', x => T.drawBurst(x, (f - 248) / 18, 'PLOP !', '#ffd166'), -0.74, TY + 0.1, 0.28, 0.12);
    fx('plop2', x => T.drawBurst(x, (f - 292) / 18, 'PLOP !', '#ef476f'), -0.5, TY + 0.1, 0.28, 0.12);
  }, 0.001);
  // 6 — sous le gril : CLIC
  shot(320, 357, 'chalet', 'nuit', (f) => camKeys([{ f: 320, p: [C + 0.75, TY + 0.12, 0.55], l: [C + 0.05, TY + 0.1, 0.05], fov: 40 }, { f: 357, p: [C + 0.62, TY + 0.11, 0.48], l: [C + 0.05, TY + 0.1, 0.05], fov: 38 }], f), (f) => {
    machine(); [0, 1, 2, 3, 5].forEach(i => inSlot(i));
    const t = Math.pow(clamp01((f - 324) / 16), 2); inSlot(4, lerp(0.35, 0, t), 'pizza', 0);
    fx('clic', x => T.drawBurst(x, (f - 340) / 16, 'CLIC !', '#118ab2'), 0.1, TY + 0.06, 0.34, 0.11);
  });
  // 7 — héroïque : la mini pizza sort
  shot(357, 400, 'chalet', 'nuit', (f) => camKeys([{ f: 357, p: [C + 0.38, TY + 0.07, 1.0], l: [C + 0.0, TY + 0.16, 0.42], fov: 42, roll: 0.03 }, { f: 400, p: [C + 0.3, TY + 0.06, 0.92], l: [C + 0.0, TY + 0.2, 0.45], fov: 40, roll: -0.02 }], f), (f) => {
    machine(); [0, 1, 2, 3, 5].forEach(i => inSlot(i));
    const u = ss((f - 362) / 18), s = PR.slot(4), r = PR.SLOT_R + 0.28 * u;
    const p = pan(4, Math.cos(s.a) * r, TY + PR.SLOT_Y + 0.12 * u, -Math.sin(s.a) * r, s.a, 0.55 * u, 0.0);
    const o = fill('pizza', 1, 4); o.position.copy(p.position); o.rotation.copy(p.rotation);
    fx('spark', x => T.drawSparkle(x, (f - 376) / 20), Math.cos(s.a) * r + 0.05, TY + 0.2, -Math.sin(s.a) * r - 0.05, 0.22);
  }, 0.002);
  // 8 — Léa conquise
  shot(400, 435, 'chalet', 'nuit', (f) => camKeys([{ f: 400, p: [C + 1.1, 1.15, 0.65], l: [C + 0.3, 0.92, -0.75], fov: 42 }, { f: 435, p: [C + 1.0, 1.12, 0.45], l: [C + 0.3, 0.94, -0.75], fov: 40 }], f), (f) => {
    machine(); [0, 1, 2, 3, 5].forEach(i => inSlot(i));
    pan(4, 0.32, PY, -0.42, Math.PI / 2 + 0.2); const o = fill('pizza', 1, 4); o.position.copy(pans[4].position);
    friends(f, { lea: { expr: 'happy', lookY: 0.6, arms: { L: [-0.5, 1.4], R: [0.5, -1.4] } }, hugo: { expr: 'smile', lookX: -1 } }, ['lea', 'hugo', 'max']);
    fx('sparkL', x => T.drawSparkle(x, (f - 404) / 24), 0.32, 1.5, -0.95, 0.45);
  });
  // 9 — les autres aussi
  shot(435, 470, 'chalet', 'nuit', (f) => camKeys([{ f: 435, p: [C - 2.4, 1.55, 1.9], l: [C + 0.2, 0.95, -0.6], fov: 44 }, { f: 470, p: [C - 2.1, 1.5, 1.6], l: [C + 0.2, 0.95, -0.6], fov: 42 }], f), (f) => {
    machine(); [0, 1, 2, 3, 5].forEach(i => inSlot(i));
    pan(4, 0.32, PY, -0.42, Math.PI / 2 + 0.2); const o = fill('pizza', 1, 4); o.position.copy(pans[4].position);
    const lean = ss((f - 440) / 12);
    friends(f, {
      lea: { expr: 'smirk', arms: { L: [-1.0, -2.2], R: [1.0, 2.2] } },
      tom: { expr: 'grin', lean: 0.2 * lean, lookX: 1, arms: { L: [-0.2, -0.1], R: [1.5, 1.6] } },
      ines: { expr: 'grin', lean: 0.15 * lean, lookX: 1, arms: { L: [-0.2, -0.1], R: [1.4, 1.5] } },
      hugo: { expr: 'happy', lean: -0.2 * lean, lookX: -1, arms: { L: [-1.5, -1.6], R: [0.2, 0.1] } },
      sarah: { expr: 'shock', lean: 0.15 * lean, arms: { L: [-0.2, -0.1], R: [1.5, 1.4] } },
      max: { expr: 'grin', lean: -0.15 * lean, arms: { L: [-1.5, -1.4], R: [0.2, 0.1] } },
    });
  });
  // 10 — preuve : poêlon brûlant posé sur la table
  const PP = [0.7, PY, 0.32];
  shot(470, 555, 'chalet', 'nuit', (f) => camKeys([{ f: 470, p: [C + 0.25, TY + 0.13, 0.95], l: [C + 0.75, TY + 0.12, 0.25], fov: 42 }, { f: 555, p: [C + 0.32, TY + 0.12, 0.85], l: [C + 0.72, TY + 0.1, 0.28], fov: 40 }], f), (f) => {
    machine(); [0, 1, 2, 3, 5].forEach(i => inSlot(i));
    const dn = ss((f - 474) / 28);
    pan(4, PP[0], PP[1] + (1 - dn) * 0.45, PP[2], 2.6); const o = fill('pizza', 1, 4); o.position.copy(pans[4].position); o.rotation.y = 2.6;
    friends(f, { max: { expr: f > 495 && f < 530 ? 'shock' : f >= 530 ? 'smile' : 'neutral', lookX: -1, lookY: 0.5, arms: f > 495 && f < 530 ? { L: [-1.6, -2.6], R: [1.6, 2.6] } : null } }, ['max', 'hugo']);
    fx('steam1', x => T.drawPuff(x, ((f - 470) % 30) / 30, '#ffffff'), PP[0], PP[1] + (1 - dn) * 0.45 - 0.02, PP[2], 0.13, true);
    fx('steam2', x => T.drawPuff(x, ((f - 485) % 30) / 30, '#ffffff'), PP[0] + 0.02, PP[1] + (1 - dn) * 0.45 + 0.03, PP[2], 0.1, true);
    fx('pose', x => T.drawBurst(x, (f - 503) / 20, 'POSÉ !', '#ffd166'), PP[0] - 0.12, TY + 0.12, PP[2] + 0.1, 0.12);
  });
  // 11 — revêtement isolant : le poêlon pivote
  shot(555, 592, 'chalet', 'nuit', (f) => { const a = lerp(0.9, 1.5, ss((f - 555) / 37)); return { p: [C + PP[0] + Math.sin(a) * 0.5, TY + 0.2, PP[2] + Math.cos(a) * 0.5], l: [C + PP[0], TY + 0.12, PP[2]], fov: 36 }; }, (f) => {
    machine(); [0, 1, 2, 3, 5].forEach(i => inSlot(i));
    const u = ss((f - 557) / 16);
    pan(4, PP[0], PP[1] + u * 0.15, PP[2], 2.6 + u * 0.6, 0, -u * 0.95);
  });
  // 12 — zéro trace
  shot(592, 625, 'chalet', 'nuit', (f) => camKeys([{ f: 592, p: [C + PP[0] - 0.05, TY + 0.55, PP[2] + 0.32], l: [C + PP[0], TY, PP[2]], fov: 38 }, { f: 625, p: [C + PP[0] - 0.04, TY + 0.48, PP[2] + 0.28], l: [C + PP[0], TY, PP[2]], fov: 36 }], f), (f) => {
    machine(); [0, 1, 2, 3, 5].forEach(i => inSlot(i));
    pan(4, PP[0] - 0.05, PP[1] + 0.22, PP[2] - 0.08, 3.2, 0, -0.95);
    fx('nickel', x => T.drawBurst(x, (f - 598) / 25, 'NICKEL !', '#06d6a0'), PP[0] + 0.05, TY + 0.0, PP[2] + 0.05, 0.12);
    fx('sparkT', x => T.drawSparkle(x, (f - 600) / 22), PP[0], TY + 0.02, PP[2] + 0.02, 0.2);
  });
  // 13 — dessert : cookie
  const PK = [-0.35, PY, 0.3];
  shot(625, 665, 'chalet', 'nuit', (f) => camKeys([{ f: 625, p: [C - 0.05, TY + 0.22, 0.62], l: [C - 0.33, TY + 0.03, 0.3], fov: 36 }, { f: 665, p: [C - 0.1, TY + 0.2, 0.56], l: [C - 0.34, TY + 0.03, 0.3], fov: 34 }], f), (f) => {
    machine(); [0, 1, 2, 3, 4].forEach(i => inSlot(i));
    pan(5, ...PK, -0.4);
    const t = ss((f - 632) / 18), cooked = t > 0.5;
    const c = fill('cookie', cooked ? 1 : 0, 5); c.position.set(...PK); c.rotation.y = -0.4;
    c.scale.set(cooked ? lerp(0.85, 1, (t - 0.5) * 2) : lerp(0.7, 0.85, t * 2), 1, cooked ? lerp(0.85, 1, (t - 0.5) * 2) : lerp(0.7, 0.85, t * 2));
    fx('sparkC', x => T.drawSparkle(x, (f - 645) / 20), PK[0], TY + 0.1, PK[2] + 0.02, 0.2);
  });
  // 14 — les amis savourent
  shot(665, 700, 'chalet', 'nuit', (f) => camKeys([{ f: 665, p: [C - 1.4, 2.3, 2.9], l: [C, 0.9, -0.6], fov: 44 }, { f: 700, p: [C - 1.2, 2.15, 2.5], l: [C, 0.9, -0.6], fov: 44 }], f), (f) => {
    machine(); ring('cookie', 1);
    const chew = (k) => ({ expr: (f + k * 7) % 30 < 15 ? 'happy' : 'grin', arms: { L: [-0.5, 1.4 + 0.3 * Math.sin(f * 0.3 + k)], R: [0.5, -1.4] } });
    friends(f, { lea: chew(0), tom: chew(1), ines: chew(2), hugo: chew(3), sarah: { expr: 'happy' }, max: { expr: 'happy' } });
  });
  // 15-17 — montage de la semaine
  const week = [['MARDI', 'pizza', 700, [C + 0.95, TY + 0.7, 1.35], [C, TY + 0.05, 0]], ['JEUDI', 'cookie', 730, [C - 0.75, TY + 0.95, 0.95], [C, TY, 0]], ['SAMEDI', 'fromage', 760, [C - 0.1, TY + 0.32, 1.35], [C, TY + 0.1, 0]]];
  week.forEach(([day, kind, a, cp, cl], wi) => {
    shot(a, a + 30, 'chalet', 'nuit', (f) => { const k = (f - a) / 30; return { p: [cp[0] - k * 0.1 * (wi - 1), cp[1] - k * 0.05, cp[2] - k * 0.15], l: cl, fov: 42 }; }, (f) => {
      machine(); ring(kind, 1);
      const s = slate[day]; s.visible = true; s.position.set(0, TY, 0.42); s.rotation.set(0, 0, 0);
      const crew = [['lea', 'tom', 'hugo'], ['ines', 'sarah', 'max'], ['lea', 'tom', 'ines', 'hugo', 'sarah', 'max']][wi];
      friends(f, Object.fromEntries(crew.map((n, i) => [n, { expr: ['happy', 'grin', 'smile'][(i + wi) % 3], arms: (f - a) > 12 && i % 2 ? UP : null }])), crew);
    });
  });
  // 18 — la machine reste sur la table
  shot(790, 850, 'chalet', 'nuit', (f) => camKeys([{ f: 790, p: [C + 0.35, TY + 0.55, 0.85], l: [C, TY + 0.15, 0], fov: 40 }, { f: 850, p: [C + 1.6, 2.5, 4.6], l: [C, 1.05, -1.0], fov: 46 }], f), (f) => {
    machine(); ALL.forEach(i => inSlot(i));
    const laugh = (k) => ({ expr: (f + k * 11) % 26 < 13 ? 'happy' : 'grin', lean: Math.sin(f * 0.25 + k) * 0.06 });
    friends(f, { lea: laugh(0), tom: { ...laugh(1), arms: { L: [-0.3, -0.2], R: [2.4, 2.8] } }, ines: laugh(2), hugo: laugh(3), sarah: laugh(4), max: laugh(5) });
  }, 0.0008);
  // 19 — la meule boude
  const WH = [-0.95, TY, 0.3];
  shot(850, 900, 'chalet', 'nuit', (f) => camKeys([{ f: 850, p: [C + WH[0] + 0.18, TY + 0.2, WH[2] + 0.62], l: [C + WH[0], TY + 0.14, WH[2]], fov: 38 }, { f: 900, p: [C + WH[0] + 0.1, TY + 0.18, WH[2] + 0.5], l: [C + WH[0], TY + 0.14, WH[2]], fov: 36 }], f), (f) => {
    machine(); ALL.forEach(i => inSlot(i));
    wheel.visible = true; wheel.position.set(...WH);
    const c = card('cheese'); drawCheese(c.x, f); put(c, C + WH[0], TY + 0.02, WH[2], { s: 0.24, shadow: false });
    friends(f, { ines: { expr: 'happy' }, tom: { expr: 'grin' } }, ['ines', 'tom']);
  }, 0.0015);

  // meule boudeuse (dessin 2D, base sur la ligne des semelles)
  function drawCheese(x, f) {
    const CX = T.CX, B = T.SOLE; x.clearRect(0, 0, T.CW, T.CH); x.save();
    x.lineJoin = 'round'; x.strokeStyle = '#2b2d42'; x.lineWidth = 0;
    // meule entamée : demi-cylindre vu de face
    x.fillStyle = '#f2b733'; x.beginPath(); x.moveTo(CX - 300, B - 40); x.lineTo(CX - 300, B - 300); x.quadraticCurveTo(CX, B - 380, CX + 300, B - 300); x.lineTo(CX + 300, B - 40); x.quadraticCurveTo(CX, B + 10, CX - 300, B - 40); x.fill();
    x.fillStyle = '#ffd166'; x.beginPath(); x.moveTo(CX - 300, B - 300); x.quadraticCurveTo(CX, B - 380, CX + 300, B - 300); x.quadraticCurveTo(CX, B - 230, CX - 300, B - 300); x.fill();
    x.fillStyle = '#d99a22'; [[-200, -120, 30], [180, -100, 24], [230, -210, 16], [-230, -230, 14], [-60, -60, 18]].forEach(([dx, dy, r]) => { x.beginPath(); x.ellipse(CX + dx, B + dy, r, r * 0.8, 0, 0, 7); x.fill(); });
    // visage triste
    const blink = (f % 40) < 3, sigh = Math.sin(f * 0.15) * 4;
    x.fillStyle = '#2b2d42';
    [[-70, 0], [70, 0]].forEach(([dx]) => { x.beginPath(); if (blink) x.fillRect(CX + dx - 18, B - 205, 36, 6); else x.ellipse(CX + dx, B - 205 + sigh * 0.3, 16, 20, 0, 0, 7); x.fill(); });
    x.strokeStyle = '#2b2d42'; x.lineWidth = 9; x.lineCap = 'round';
    x.beginPath(); x.moveTo(CX - 105, B - 250); x.lineTo(CX - 45, B - 238); x.moveTo(CX + 105, B - 250); x.lineTo(CX + 45, B - 238); x.stroke();
    x.beginPath(); x.moveTo(CX - 45, B - 120 + sigh); x.quadraticCurveTo(CX, B - 155 + sigh, CX + 45, B - 120 + sigh); x.stroke();
    // larme
    const tl = ((f - 862) % 40) / 40; if (f > 862) { x.fillStyle = '#7cc6ee'; x.beginPath(); const ty = B - 185 + tl * 70; x.moveTo(CX + 72, ty - 22); x.quadraticCurveTo(CX + 90, ty + 4, CX + 72, ty + 8); x.quadraticCurveTo(CX + 54, ty + 4, CX + 72, ty - 22); x.fill(); }
    x.restore();
  }

  E.setCaps([
    [0, 85, 'Nuit d\'hiver au chalet. Six amis, une envie : raclette !', ['chalet.', 'raclette']],
    [85, 160, 'Seul hic : Léa déteste le fromage.', ['déteste']],
    [160, 235, 'Pas de panique : la machine cache son jeu.', ['cache', 'jeu.']],
    [235, 320, 'Ses poêlons creusés accueillent pâte, sauce et garniture.', ['creusés']],
    [320, 400, 'Trois minutes sous le gril… et voilà des mini pizzas !', ['mini', 'pizzas']],
    [400, 470, 'Léa est conquise. Les autres aussi, d\'ailleurs.', ['conquise.']],
    [470, 555, 'Poêlon brûlant ? On le pose direct sur la table.', ['brûlant', 'table.']],
    [555, 625, 'Revêtement isolant : zéro trace, zéro dessous-de-plat.', ['isolant', 'zéro', 'trace,']],
    [625, 700, 'Au dessert, des cookies… dans les mêmes poêlons.', ['cookies…', 'mêmes']],
    [700, 790, 'Mardi pizzas, jeudi cookies, samedi raclette.', ['Mardi', 'jeudi', 'samedi']],
    [790, 850, 'La machine ne retourne plus jamais au placard.', ['plus', 'jamais']],
    [850, 900, 'Seul le fromage se sent un peu délaissé.', ['délaissé.']],
  ]);
}
