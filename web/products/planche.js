// Produit : planche de surf démontable en 3 morceaux.
// Contrat d'un fichier produit : export function build(E) -> { pieces: [Group...], assembled: Group, ... }
// Les morceaux sont centrés sur leur propre origine (pour l'outline et les animations).
export function build(E) {
  const { THREE, toon, ink } = E;
  function boardPieceGeo(x0, x1) {
    const L = 1.05, hw = (x) => { const u = x / L; return u >= 0 ? 0.29 * Math.pow(Math.max(0, 1 - u * u), 0.7) + 0.005 : Math.max(0.1, 0.29 * Math.pow(Math.max(0, 1 - Math.pow(-u, 3)), 0.5)); };
    const sh = new THREE.Shape(); const n = 16;
    for (let i = 0; i <= n; i++) { const xx = x0 + (x1 - x0) * i / n; i ? sh.lineTo(xx, hw(xx)) : sh.moveTo(xx, hw(xx)); }
    for (let i = n; i >= 0; i--) { const xx = x0 + (x1 - x0) * i / n; sh.lineTo(xx, -hw(xx)); }
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 });
    geo.rotateX(-Math.PI / 2); geo.center();
    return geo;
  }
  function makeBoard() {
    const cuts = [[-1.05, -0.35], [-0.35, 0.35], [0.35, 1.05]];
    return cuts.map(([a, b], i) => {
      const m = new THREE.Mesh(boardPieceGeo(a, b), toon('#ff6b6b')); ink(m, 0.018);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry((b - a) * (i === 2 ? 0.82 : 0.99), 0.012, 0.12), toon('#ffffff')); stripe.position.set(i === 2 ? -0.05 : 0, 0.045, 0); m.add(stripe);
      const rail = new THREE.Mesh(new THREE.BoxGeometry((b - a) * (i === 2 ? 0.6 : 0.99), 0.012, 0.03), toon('#ffd166')); rail.position.set(i === 2 ? -0.1 : 0, 0.046, 0.12); m.add(rail);
      const L = (b - a) / 2;
      if (i < 2) for (const zz of [-0.22, 0.22]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.035, 0.05), toon('#cfd6de')); c.position.set(L - 0.03, 0.045, zz); m.add(c); }
      if (i > 0) for (const zz of [-0.22, 0.22]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.035, 0.05), toon('#9aa5b1')); c.position.set(-L + 0.03, 0.045, zz); m.add(c); }
      if (i === 0) for (const zz of [-0.12, 0, 0.12]) { const fin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.015), toon('#2b2d42')); fin.position.set(-0.15, -0.08, zz); m.add(fin); }
      const g = new THREE.Group(); g.add(m); g.userData.cx = (a + b) / 2; return g;
    });
  }
  return { pieces: makeBoard(), assembled: (() => { const g = new THREE.Group(); makeBoard().forEach(p => { p.position.x = p.userData.cx; g.add(p); }); return g; })(), boardPieceGeo, makeBoard,
    PIECE_X: [-0.85, 0, 0.85], JOINT_X: [-0.7, 0, 0.7] };
}
