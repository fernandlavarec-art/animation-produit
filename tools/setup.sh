#!/usr/bin/env bash
# Installe les dépendances et copie three.js dans web/lib.
set -e
cd "$(dirname "$0")/.."
npm install --no-audit --no-fund
mkdir -p web/lib
cp node_modules/three/build/three.module.js web/lib/
# Chromium pour Playwright (si le réseau le permet ; sinon définir CHROME_PATH vers un Chrome/Chromium installé)
npx playwright install chromium || echo "⚠️  Chromium non téléchargé : définir CHROME_PATH=/chemin/vers/chrome"
command -v ffmpeg >/dev/null || echo "⚠️  ffmpeg introuvable : il est nécessaire pour l'encodage MP4"
echo "Moteur prêt."
