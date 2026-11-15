// Test des décors chalet / snow et du produit raclette (images de contrôle).
import { build } from '../products/raclette.js';
export default function (E) {
  const { OX, shot, chr, blinkAt } = E;
  const PR = build(E); E.prop(PR.assembled, 'chalet'); PR.pieces.forEach(p => E.prop(p, 'chalet'));
  const fills = []; ['fromage', 'pizza', 'cookie', 'pizza', 'fromage', 'cookie'].forEach((k, i) => { const f = PR.filling(k); fills.push(E.prop(f, 'chalet')); });
  const C = OX.chalet, S = OX.snow, TY = 0.74;
  const F = { lea: { type: 'tunic', color: '#06a89a', hair: { color: '#a8552a', style: 'long' }, seed: 21 }, tom: { type: 'shirt', color: '#d6342c', hair: { color: '#3b2a20', style: 'short' }, seed: 22 }, ines: { type: 'dress', color: '#7b5bc4', hair: { color: '#1d1d1d', style: 'bun' }, seed: 23 }, hugo: { type: 'shirt', color: '#2f6fb2', hair: { color: '#1d1d1d', style: 'curly' }, seed: 24 }, sarah: { type: 'tunic', color: '#ef476f', hair: { color: '#e0b04a', style: 'long' }, seed: 25 }, max: { type: 'shirt', color: '#3f5f45', hair: { color: '#5a3a24', style: 'side' }, seed: 26 } };
  const show = () => { PR.assembled.visible = true; PR.assembled.position.set(0, TY, 0); PR.assembled.rotation.set(0, 0, 0); PR.assembled.children.slice(1).forEach((p, i) => { const s = PR.slot(i); fills[i].visible = true; fills[i].position.set(s.pos[0], TY + s.pos[1], s.pos[2]); }); };
  const friends = (f) => {
    [['ines', -0.95], ['tom', -0.32], ['lea', 0.32], ['hugo', 0.95]].forEach(([n, x], i) => chr(n, F[n], C + x, -0.06, -1.0, { pose: 'sit', facing: 0, expr: 'happy', t: f, blink: blinkAt(f, i) }, { shw: 0.8 }));
    chr('sarah', F.sarah, C - 1.65, -0.06, 0.1, { pose: 'sit', facing: 1, expr: 'grin', t: f }, { shw: 0.8 });
    chr('max', F.max, C + 1.65, -0.06, 0.1, { pose: 'sit', facing: -1, expr: 'grin', t: f }, { shw: 0.8 });
  };
  E.setTotal(5);
  shot(0, 1, 'snow', 'lune', () => ({ p: [S + 3, 2.2, 14], l: [S, 2.6, -6], fov: 44 }), () => {});
  shot(1, 2, 'chalet', 'nuit', () => ({ p: [C + 0.6, 2.0, 4.6], l: [C, 1.0, -1.2], fov: 46 }), (f) => { show(); friends(f); });
  shot(2, 3, 'chalet', 'nuit', () => ({ p: [C + 0.55, TY + 0.55, 0.75], l: [C, TY + 0.1, 0], fov: 40 }), () => { show(); });
  shot(3, 4, 'chalet', 'nuit', () => ({ p: [C + 0.2, TY + 0.25, 0.3], l: [C + 0.05, TY + 0.03, 0.08], fov: 40 }), () => {
    const P0 = PR.pieces[0]; P0.visible = true; P0.position.set(0, TY + 0.02, 0.1); P0.rotation.set(0, 0.5, 0);
    const fl = fills[1]; fl.visible = true; fl.position.set(0, TY + 0.02, 0.1);
  });
  shot(4, 5, 'chalet', 'nuit', () => ({ p: [C - 2.5, 1.5, 2.5], l: [C + 0.5, 1.2, -3.5], fov: 50 }), (f) => { show(); friends(f); });
  E.setCaps([]);
}
