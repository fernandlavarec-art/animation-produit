// Produit : machine à raclette 3-en-1 (raclette, mini pizzas, cookies) — 6 poêlons à revêtement isolant.
// Contrat : build(E) -> { pieces: [6 poêlons], assembled: machine (socle + gril), PIECE_X, JOINT_X, hero, ... }
// Unités : mètres. Chaque poêlon est centré sur le centre de sa coupelle, poignée vers +x.
export function build(E) {
  const { THREE, toon, ink } = E;
  const METAL = '#cfd6de', CORAL = '#ff6b6b', YEL = '#ffd166', DARK = '#2b2d42', COAT = '#f7f2e8';
  const R = 0.07;            // rayon intérieur de la coupelle
  const SLOT_R = 0.17;       // distance centre machine -> centre coupelle
  const SLOT_Y = 0.085;      // hauteur des poêlons dans la machine

  // coupelle : profil tourné (lathe) — fond plat, bord relevé arrondi
  function lathe(points, mat, seg = 32) { const m = new THREE.Mesh(new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), seg), mat); return m; }
  function poelon(i = 0) {
    const g = new THREE.Group();
    // revêtement isolant (coque extérieure corail, plus large, avec petits patins)
    const shell = lathe([[0, -0.012], [R + 0.012, -0.012], [R + 0.022, 0.0], [R + 0.024, 0.026], [R + 0.012, 0.03], [R + 0.004, 0.026], [R + 0.002, 0.012]], toon(COAT, null, { side: THREE.DoubleSide }));
    ink(shell, 0.006); g.add(shell);
    // coupelle métal clair (le creux qui accueille pâte, fromage ou cookie)
    const pan = lathe([[0, 0.004], [R - 0.006, 0.004], [R, 0.012], [R + 0.004, 0.03], [R + 0.008, 0.031]], toon(METAL, null, { side: THREE.DoubleSide }));
    g.add(pan);
    for (const a of [0.6, 2.7, 4.8]) { const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 10), toon(CORAL)); pad.position.set(Math.cos(a) * R * 0.75, -0.016, Math.sin(a) * R * 0.75); g.add(pad); }
    // poignée isolée
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.016, 0.03), toon(CORAL)); hand.position.set(R + 0.075, 0.012, 0); ink(hand, 0.006); g.add(hand);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 14), toon(YEL)); tip.position.set(R + 0.14, 0.012, 0); g.add(tip);
    const rivet = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.034), toon(METAL)); rivet.position.set(R + 0.018, 0.016, 0); g.add(rivet);
    g.userData.slot = i; return g;
  }
  // garnitures (posées dans la coupelle, centrées, base à y=0.006)
  function filling(kind, cook = 1) {
    const g = new THREE.Group(); const r = R - 0.008;
    if (kind === 'fromage') {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(r * (0.85 + 0.15 * cook), r * (0.85 + 0.15 * cook), 0.012 + 0.006 * (1 - cook), 28), toon(cook > 0.5 ? '#ffc94d' : '#ffe08a')); c.position.y = 0.012; g.add(c);
      for (const [x, z, s] of [[0.02, 0.01, 1], [-0.025, -0.015, 0.8], [0.0, -0.03, 0.7], [-0.02, 0.028, 0.6]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.008 * s, 8, 6), toon('#ffe7a3')); b.scale.y = 0.4; b.position.set(x, 0.019, z); b.visible = cook > 0.4; g.add(b); }
    } else if (kind === 'pizza') {
      const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.012, 28), toon(cook > 0.5 ? '#e9b06a' : '#f6dcb0')); d.position.y = 0.01; g.add(d);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(r - 0.006, 0.008, 8, 28), toon(cook > 0.5 ? '#d9954e' : '#f1d3a3')); rim.rotation.x = Math.PI / 2; rim.position.y = 0.017; g.add(rim);
      const sauce = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.016, r - 0.016, 0.004, 28), toon('#e63946')); sauce.position.y = 0.018; sauce.name = 'sauce'; g.add(sauce);
      const top = new THREE.Group(); top.name = 'top'; g.add(top);
      for (const [x, z] of [[0.02, 0.015], [-0.022, 0.01], [0.004, -0.025], [-0.01, 0.03]]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.004, 14), toon('#b5302a')); m.position.set(x, 0.022, z); top.add(m); }
      for (const [x, z] of [[-0.005, 0.0], [0.028, -0.012], [-0.03, -0.02], [0.012, 0.035]]) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), toon('#fff8e6')); m.scale.y = 0.45; m.position.set(x, 0.023, z); top.add(m); }
      for (const [x, z] of [[0.015, -0.005], [-0.018, -0.032]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.003, 0.007), toon('#3a9d5d')); m.position.set(x, 0.026, z); m.rotation.y = x * 40; top.add(m); }
    } else if (kind === 'cookie') {
      const c = new THREE.Mesh(new THREE.SphereGeometry(r * (0.75 + 0.25 * cook), 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(cook > 0.5 ? '#c98a45' : '#e8c48c')); c.scale.y = 0.28 - 0.12 * cook; c.position.y = 0.006; g.add(c);
      for (const [x, z] of [[0.015, 0.012], [-0.02, 0.006], [0.004, -0.024], [-0.008, 0.03], [0.03, -0.012], [-0.03, -0.022]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.011, 0.008, 0.011), toon('#4a2c1a')); m.position.set(x * (0.75 + 0.25 * cook), 0.006 + r * (0.28 - 0.12 * cook) * 0.85, z * (0.75 + 0.25 * cook)); m.rotation.y = x * 50; g.add(m); }
    }
    return g;
  }
  // machine : socle sombre, 6 logements radiaux, gril en fonte, résistance qui rougeoie
  function machine() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.05, 40), toon(DARK)); base.position.y = 0.035; ink(base, 0.01); g.add(base);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; const ft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.012, 10), toon('#1d1e2c')); ft.position.set(Math.cos(a) * 0.25, 0.006, Math.sin(a) * 0.25); g.add(ft); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.008, 8, 48), toon(CORAL)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.06; g.add(ring);
    const heat = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.006, 40), new THREE.MeshBasicMaterial({ color: '#ff8c42' })); heat.position.y = 0.162; heat.name = 'heat'; g.add(heat);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.11, 16), toon(DARK)); col.position.y = 0.11; g.add(col);
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.29, 0.03, 40), toon('#3a3d48')); plate.position.y = 0.18; ink(plate, 0.01); g.add(plate);
    for (let k = -3; k <= 3; k++) { const gr = new THREE.Mesh(new THREE.BoxGeometry(0.5 - Math.abs(k) * 0.05, 0.006, 0.012), toon('#24262f')); gr.position.set(0, 0.198, k * 0.06); g.add(gr); }
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 14), toon(YEL)); knob.rotation.x = Math.PI / 2; knob.position.set(0, 0.04, 0.325); g.add(knob);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), new THREE.MeshBasicMaterial({ color: '#06d6a0' })); led.position.set(0.06, 0.045, 0.31); g.add(led);
    return g;
  }
  const slot = (i) => { const a = i / 6 * Math.PI * 2 + Math.PI / 6; return { pos: [Math.cos(a) * SLOT_R, SLOT_Y, -Math.sin(a) * SLOT_R], rotY: a, a }; };
  const pieces = Array.from({ length: 6 }, (_, i) => poelon(i));
  const assembled = (() => { const g = new THREE.Group(); g.add(machine()); for (let i = 0; i < 6; i++) { const p = poelon(i), s = slot(i); p.position.set(...s.pos); p.rotation.y = s.rotY; g.add(p); } return g; })();
  return {
    pieces, assembled, machine, poelon, filling, slot, R, SLOT_R, SLOT_Y,
    PIECE_X: [-0.5, -0.3, -0.1, 0.1, 0.3, 0.5], JOINT_X: [0, 0, 0, 0, 0, 0],
    hero: { pos: [0.55, 0.15, 0.6], rot: [0.25, 0.4, 0] },
  };
}
