// MODÈLE de fichier produit — copier en products/<nom>.js et adapter.
// Contrat : export function build(E) → {
//   pieces:    [THREE.Group, ...]  morceaux séparés (chacun centré sur son origine), pour les montages/démontages
//   assembled: THREE.Group         produit assemblé (pour les plans « héros » et l'usage)
//   PIECE_X:   [x, ...]            positions des morceaux posés côte à côte (vue éclatée)
//   JOINT_X:   [x, ...]            positions des morceaux une fois emboîtés
//   hero:      { pos, rot }        pose de présentation à côté du personnage (aperçu)
// }
// Règles de style (flat design) : formes simples (boîtes, cylindres, extrusions de Shape), 2 ou 3 couleurs franches
// qui contrastent avec le décor, et les DÉTAILS MÉCANIQUES QUI PORTENT L'AVANTAGE PRODUIT bien visibles
// (clips, charnières, boutons, fermetures…) dans une couleur métal claire (#cfd6de).
export function build(E) {
  const { THREE, toon, ink } = E;
  const BODY = '#ff6b6b', ACCENT = '#ffffff', METAL = '#cfd6de';
  function piece(w, i, n) {
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, 0.4), toon(BODY)); ink(m, 0.015); g.add(m);
    const band = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, 0.01, 0.1), toon(ACCENT)); band.position.y = 0.065; g.add(band);
    if (i < n - 1) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.06), toon(METAL)); c.position.set(w / 2 - 0.03, 0.07, 0); g.add(c); }
    return g;
  }
  const W = 0.6, n = 3;
  const make = () => Array.from({ length: n }, (_, i) => piece(W, i, n));
  const assembled = new THREE.Group(); make().forEach((p, i) => { p.position.x = (i - 1) * W; assembled.add(p); });
  return { pieces: make(), assembled, PIECE_X: [-0.75, 0, 0.75], JOINT_X: [-W, 0, W], hero: { pos: [0.6, 0.9, 0.2], rot: [0, 0.6, Math.PI / 2] } };
}
