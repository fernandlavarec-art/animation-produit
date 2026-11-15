# animation-produit

Moteur de **vidéos animées « scénario d'usage produit »** : un personnage utilise un produit dans son quotidien et la vidéo met en valeur ses avantages.
Le rendu se fait image par image avec **Three.js** dans un navigateur headless (Playwright), puis l'encodage MP4 avec **ffmpeg**. Pas de générateur vidéo, pas de logiciel de montage.

**Style par défaut** : décors 3D en *flat design* (aplats pastel, sans contour), personnages 2D « Moderne » (peau colorée, cou, membres habillés, chaussures), sous-titres français sur une pastille blanche, sans son. Format 16:9, 1080p, 30 i/s.

## Installation

```bash
bash tools/setup.sh        # npm install + copie de three.js dans web/lib + Chromium
```

Prérequis : Node 22+, Python 3 avec Pillow (pour les planches contact) et ffmpeg.
Si Chromium ne peut pas être téléchargé, utiliser un Chrome existant : `export CHROME_PATH=/usr/bin/google-chrome`.

## Commandes

```bash
# Aperçu d'un produit (3 images : à côté du personnage, vue éclatée, gros plan)
PRODUCT=planche STORY=apercu node tools/render.mjs stills stills/apercu "0,1,2"

# Images de contrôle d'un scénario + planche contact
STORY=planche-surf node tools/render.mjs stills stills/check "40,320,425,615,885"
python3 tools/sheet.py stills/check stills/contact_sheet.jpg 4

# Rendu complet (2 navigateurs en parallèle) puis encodage et contrôle qualité
STORY=planche-surf node tools/render.mjs frames all 2
bash tools/finish.sh out/la_planche_de_marc.mp4

# Miniatures sans sous-titres
NOCAP=1 STORY=planche-surf node tools/render.mjs stills stills/thumb "428,612,885"
```

Variables utiles :
- `STYLE` = `flat` (défaut), `toon`, `bd`, `papier`, `aquarelle` ou `neon` ;
- `CHARV` = `moderne` (défaut), `stick`, `chibi`, `mascotte`, `geo` ou `elance` ;
- `NOCAP=1` pour un rendu sans sous-titres ;
- `RESUME=1` pour reprendre un rendu interrompu.

Le rendu prend environ 0,25 s par image, soit environ 4 min pour 30 s de vidéo.

## Architecture

```
web/engine.js            moteur : rendu, styles, cartes-personnages, décors, caméra, sous-titres, post-traitement
web/toon.js              dessin des personnages (Canvas2D) : variantes, poses, expressions, accessoires, effets (CLIC !, étincelles…)
web/paint.js             textures peintes et motifs (façades, tuiles, tableur, horloge, panneaux…)
web/products/<nom>.js    un fichier par produit : modèle 3D en morceaux + version assemblée
web/stories/<nom>.js     un fichier par scénario : plans, caméras, actions, sous-titres
tools/                   render.mjs, sheet.py, finish.sh, setup.sh
```

### Décors disponibles (`OX.<nom>` donne leur position en x)

| Décor | Contenu |
|---|---|
| `apt` | appartement : placard à portes animées (`E.doorL` / `E.doorR`), fenêtre, tapis, plante |
| `street` | rue : façades, trottoirs, arbres, lampadaires, immeuble « BUREAUX » (x 22-38) |
| `train` | wagon : banquettes, paysage qui défile par les fenêtres (`trainUpdate(f, vitesse)`) |
| `metro` | rame de métro : barres, lumières du tunnel |
| `office` | open space : bureaux, écrans avec tableur animé, horloge murale, fontaine à eau |
| `beach` | plage : mer animée (`updateSea` + `beachH`), cabines, palmiers, poste de secours |
| `wave` | wave park : bassin à vague artificielle (`updateWater` + `waveH`) |
| `traffic` | autoroute bouchée : files de voitures, conducteurs visibles |
| `snow` | extérieur de nuit : chalet illuminé sous la neige, sapins, lune, flocons animés |
| `chalet` | intérieur de chalet : grande table en bois, bancs, cheminée animée, fenêtre de nuit enneigée, guirlande |

Lumières : `day`, `golden` (soir), `office`, `metro`, `nuit` (intérieur chaleureux) et `lune` (extérieur de nuit).

### API d'un scénario (`export default function (E) { … }`)

- `E.shot(a, b, decor, lumiere, cam(f), update(f), avancee?)` déclare un plan de l'image `a` à l'image `b` (exclue).
- `E.camKeys([{ f, p:[x,y,z], l:[x,y,z], fov, roll }, …], f)` interpole des positions de caméra avec des glissés doux.
- `E.chr(nom, tenue, x, y, z, options, { s, shadow, full })` place un personnage. Options principales :
  - `pose` : `stand`, `walk`, `run`, `sit`, `kneel` ou `surf` ;
  - `facing` : -1, 0 ou 1 ;
  - `expr` : `neutral`, `smile`, `grin`, `happy`, `smirk`, `wink`, `suspicious`, `shock`, `grumpy`, `bored`, `whisper`, `determined` ou `think` ;
  - `arms: { L: [haut, bas], R: [haut, bas] }` en angles (0 = vers le bas, positif = vers la droite de l'écran) ;
  - `bag` (sac à dos, échelle), `hold` (`phone`, `paper` ou `bill`), `phase` et `step` pour la marche, `lookX` / `lookY`, `blink`, `lean`, `t` pour la respiration.
- `E.card(nom)` puis `T.drawBurst / drawSparkle / drawPuff / drawSpray / drawBubble / drawBagProp` et `E.put(...)` ajoutent des effets ou des accessoires 2D.
- `E.prop(objet3D, decor)` enregistre un objet 3D. Il est masqué à chaque image : le plan qui l'utilise le rend visible.
- `E.setTotal(n)`, `E.setCaps([[a, b, 'texte', ['mots', 'en', 'couleur']], …])`, `E.setKicks([[image, amplitude]])` pour les secousses et `E.setFlashes([image])` pour les flashs blancs de saut dans le temps.

### Tenues (`toon.js` → `OUTFITS`)

`marc` (héros, chemise bleue et cravate rouge), `julie`, `paul`, `sophie`, `karim`, `ped`, `p1`…`p4`. Pour en ajouter : `{ type: 'shirt'|'suit'|'dress'|'tunic', color, tie?, hair: { color, style: 'short'|'side'|'curly'|'bun'|'long'|'bald' }, seed }`.

## Règles de mise en scène (à respecter dans chaque scénario)

- Aucun plan ne dure plus de 90 images (3 s), et deux plans consécutifs n'ont jamais le même angle de caméra.
- La caméra n'est jamais fixe : chaque plan avance lentement (paramètre `avancee`).
- Les personnages respirent, clignent des yeux et regardent dans leur sens de marche.
- Le produit est le héros, avec 4 plans types :
  - **sortie / dévoilement** : la caméra tourne lentement autour du produit posé ;
  - **macro sur le mécanisme** : gros plan, avec « CLIC ! » et une secousse ;
  - **plan héroïque** : contre-plongée sur le produit dressé, avec des étincelles ;
  - **preuve** : un test de solidité ou une situation extrême.
- Les sous-titres apparaissent mot par mot, avec les mots-clés en couleur. Écrire environ 90 mots pour 30 s.
- Flash blanc de 6 images à chaque saut dans le temps.

## Scénarios fournis

- `planche-surf` : « La planche de Marc », une planche de surf démontable en 3 morceaux (30 s).
- `raclette-chalet` : « La raclette de Léa », machine à raclette 3-en-1 (raclette, mini pizzas, cookies) avec poêlons à revêtement isolant (30 s). Plan : `PLAN-raclette.md`.
- `test-chalet` : images de contrôle des décors `snow` / `chalet` et du produit `raclette`.
- `apercu` : valide le modèle 3D d'un produit (`PRODUCT=<nom>`).
