---
name: video-scenario-produit
description: Créer une courte vidéo animée (flat design, personnages Moderne, sous-titres FR, sans son) qui met en scène l'usage d'un produit et ses avantages, à partir d'une description du produit.
---

# Vidéo « scénario d'usage produit »

Objectif : à partir d'une description de produit et de ses avantages, produire une vidéo MP4 animée de 30 s (par défaut) où un personnage utilise le produit dans son quotidien. Le produit est le héros, et chaque avantage devient un moment visuel.

Moteur : dépôt GitHub `https://github.com/fernandlavarec-art/animation-produit.git` (Three.js + Playwright + ffmpeg). Son README décrit l'API, les décors et les commandes. **Lis le README avant de commencer.**

Style imposé, sauf demande contraire : décors en *flat design* (`STYLE=flat`), personnages « Moderne » (`CHARV=moderne`), sous-titres français sur pastille blanche avec mots-clés en rose, sans son, 16:9, 1080p, 30 i/s.

## 0. Préparer le moteur

```bash
git clone https://github.com/fernandlavarec-art/animation-produit.git ~/animation-produit && cd ~/animation-produit && bash tools/setup.sh
```

Si Chromium ne se télécharge pas, chercher un Chrome existant (`which google-chrome chromium`) et exporter `CHROME_PATH`. Vérifier avec `STORY=apercu node tools/render.mjs stills stills/t "0"`.

## 1. Brief produit

Demander en une seule fois (AskUserQuestion ou texte) ce qui manque :
- le nom du produit et ce que c'est, en une phrase ;
- **2 à 4 avantages, classés par importance** ;
- le **mécanisme visible** qui porte l'avantage principal (clips, charnière, pliage, bouton, aimant…) ;
- l'utilisateur type et sa situation d'usage (lieu de départ, trajet, lieu d'usage) ;
- la durée (30 s par défaut), le format (16:9 par défaut) et le ton (humour léger par défaut).

## 2. Associer chaque avantage à un moment visuel

| Avantage | Moment visuel type |
|---|---|
| Compact / se range | rangé dans un placard ou un sac ; transport dans le train ou le métro sans gêner personne ; contraste avec un concurrent encombrant |
| Rapide / facile à monter | gros plan sur le mécanisme, « CLIC ! » à chaque étape, durée affichée dans le texte (« Dix secondes ») |
| Solide / fiable | test de stress : le personnage saute dessus, situation extrême, secousse caméra et poussière |
| Performant | usage intense : action, vitesse, saut, plan en contre-plongée avec étincelles |
| Léger / nomade | porté d'une main, course, enchaînement de lieux |
| Pratique au quotidien | boucle aller / retour : on le sort, on l'utilise, on le range |

## 3. Script (sous-titres)

Trame en 12 lignes environ, **90 mots pour 30 s** (environ 3 mots par seconde de lecture) :
1. **Accroche** : le produit est un secret ou une situation intrigante (« Dans le placard de Marc, un sac bien rangé cache un secret. »).
2. **Trajet** : le contexte de vie, et personne ne devine.
3. **Révélation** : le produit sort, en morceaux ou plié.
4. **Mécanisme** : l'avantage n°1, sur un rythme sonore écrit (« Clic. Clic. Clic. »).
5. **Preuve** : l'avantage n°2 (« Solide comme… »).
6. **Usage plaisir** : le bénéfice, avec 2 ou 3 actions courtes (« Virage, saut, tube : … »).
7. **Rangement / retour** : l'avantage n°3.
8. **Chute** : un contraste ironique avec la solution classique, ou un clin d'œil.

Règles :
- phrases courtes en français parlé, nombres écrits en lettres ;
- chaque ligne a un équivalent visuel, et on ne décrit jamais ce qu'on voit déjà ;
- présenter le script dans un bloc copiable, avec le nombre de mots ;
- demander : **1. Approuver / 2. Modifier / 3. Réécrire**.

## 4. Modéliser le produit

Copier `web/products/_modele.js` en `web/products/<nom>.js` et respecter le contrat : `pieces`, `assembled`, `PIECE_X`, `JOINT_X`, `hero`. Exemple complet : `planche.js`.

- Formes simples (boîtes, cylindres, extrusions de `THREE.Shape`).
- 2 ou 3 couleurs franches qui ressortent sur le sable, la ville et l'eau (corail `#ff6b6b`, blanc, jaune `#ffd166`).
- **Mécanisme en métal clair (`#cfd6de`) bien visible.**
- Chaque morceau est centré sur son origine.

Valider avec `PRODUCT=<nom> STORY=apercu node tools/render.mjs stills stills/apercu "0,1,2"`, puis montrer les 3 images à l'utilisateur.

## 5. Plan de tournage et scénario

1. Écrire `PLAN.md` : un tableau avec une ligne par plan (images, sous-titre, décor, lumière, caméra, action, effets).
2. Copier `web/stories/planche-surf.js` en `web/stories/<nom>.js` et adapter : plans, sous-titres (`setCaps`), secousses (`setKicks`), flashs (`setFlashes`) et durée (`setTotal`).

Règles de mise en scène :
- aucun plan au-delà de 90 images, et jamais deux angles identiques de suite ;
- chaque plan avance lentement ;
- inclure **les 4 plans produit** : dévoilement en orbite lente, macro sur le mécanisme avec « CLIC ! », plan héroïque en contre-plongée avec étincelles, preuve ou test ;
- flash blanc à chaque saut dans le temps, lumière `golden` pour le soir.

Pièges connus :
- Les objets 3D ajoutés à un décor (`E.prop(obj, 'beach')`) se placent en **coordonnées locales** du décor. Les personnages (`chr`) se placent en **coordonnées monde** : `OX.beach + x`.
- Les cartes 2D pivotent seulement autour de l'axe vertical. Pour une vue de dessus, mettre `{ full: true }` sur les effets.
- Vérifier qu'aucun élément (porte, poteau, pare-brise, parasol, lampadaire) ne passe devant un visage ou le produit.
- Sous-titres : les mots apparaissent progressivement, donc une image de contrôle doit être prise **au moins 30 images après le début** de la ligne.

## 6. Contrôle visuel

1. Faire le rendu d'une image au milieu de chaque plan et des moments clés, puis la planche contact (`tools/sheet.py`). L'inspecter soi-même et corriger.
2. Envoyer la planche contact à l'utilisateur avec une ligne par plan, et attendre sa validation.

## 7. Rendu final et livraison

```bash
STORY=<nom> node tools/render.mjs frames all 2
bash tools/finish.sh out/<nom>.mp4                          # encodage H.264 CRF 17 + contrôle qualité
NOCAP=1 STORY=<nom> node tools/render.mjs stills stills/thumb "<3 images fortes>"
```

1. Vérifier le contrôle qualité (aucune image figée ≥ 0,4 s, aucune image noire).
2. Envoyer le MP4 et les 3 miniatures.
3. Donner les infos de mise en ligne : un titre de moins de 70 caractères, 3 titres alternatifs, une description de 3-4 phrases avec appel à l'action et hashtags, 15 à 20 tags et 3 hashtags.
4. Proposer : retoucher un plan, un autre style (`STYLE`, `CHARV`), ou un nouveau scénario d'usage pour le même produit.
5. Si le scénario ou le produit sont nouveaux, proposer de les commiter dans le dépôt.
