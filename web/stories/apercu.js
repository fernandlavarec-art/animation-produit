// Aperçu d'un produit : 3 images pour valider le modèle 3D avant d'écrire le scénario.
//   image 0 : produit assemblé à côté de Marc (plage)   image 1 : vue éclatée des morceaux   image 2 : gros plan produit
// usage : PRODUCT=planche STORY=apercu node tools/render.mjs stills stills/apercu "0,1,2"
export default async function (E) {
  const { OX, shot, chr, updateSea, beachH, WATERS, lerp } = E;
  const mod = await import('../products/' + (window.PRODUCT || 'planche') + '.js');
  const PR = mod.build(E);
  PR.pieces.forEach(p => E.prop(p, 'beach')); E.prop(PR.assembled, 'beach');
  const B = OX.beach, sea = () => updateSea(WATERS.sea, 40, (x, z) => beachH(x, z, 40));
  const hero = PR.hero || { pos: [0.6, 1.2, 0.2], rot: [0, 1.82, Math.PI / 2 - 0.06] };
  E.setTotal(3);
  shot(0, 1, 'beach', 'day', () => ({ p: [B + 1.6, 1.05, 4.4], l: [B - 0.1, 1.2, 0.2], fov: 42 }), () => {
    sea(); PR.assembled.visible = true; PR.assembled.position.set(...hero.pos); PR.assembled.rotation.set(...hero.rot);
    chr('marc', 'marc', B - 0.45, 0.14, 0.3, { facing: 0, expr: 'grin', t: 7, arms: { L: [-0.2, -0.1], R: [1.7, 2.6] } });
  });
  shot(1, 2, 'beach', 'day', () => ({ p: [B + 0.9, 1.4, 3.0], l: [B, 0.3, 1.0], fov: 40 }), () => {
    sea(); const xs = PR.PIECE_X || PR.pieces.map((_, i) => (i - (PR.pieces.length - 1) / 2) * 0.9);
    PR.pieces.forEach((p, i) => { p.visible = true; p.position.set(xs[i] * 1.15, 0.3, 1.0); p.rotation.set(0, 0, 0); });
  });
  shot(2, 3, 'beach', 'day', () => ({ p: [B + 0.9, 0.5, 3.6], l: [B, 1.0, 0.6], fov: 36 }), () => {
    sea(); PR.assembled.visible = true; PR.assembled.position.set(0, 1.0, 0.6); PR.assembled.rotation.set(...hero.rot);
  });
  E.setCaps([]);
}
