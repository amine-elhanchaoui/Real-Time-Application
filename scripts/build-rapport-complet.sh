#!/bin/bash
# Pipeline complet — Rapport Harmony OFPPT
set -e
cd "$(dirname "$0")/.."

echo "═══ 1/6 Logo OFPPT (base64) ═══"
if [ ! -f scripts/assets/ofppt-logo.b64.txt ]; then
  mkdir -p scripts/assets
  curl -sL "https://upload.wikimedia.org/wikipedia/commons/0/03/OFPPT.png" \
    -o scripts/assets/ofppt-logo.png
  base64 -w0 scripts/assets/ofppt-logo.png > scripts/assets/ofppt-logo.b64.txt
fi
echo "  Logo OK"

echo "═══ 2/6 Serveur (si non démarré) ═══"
if ! curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000 | grep -q 200; then
  echo "  Démarrage npm start en arrière-plan..."
  npm start &
  sleep 15
fi
echo "  Serveur OK"

echo "═══ 3/6 Captures d'écran ═══"
node scripts/capture-screenshots.mjs

echo "═══ 4/6 Diagrammes Mermaid ═══"
node scripts/render-mermaid.mjs

echo "═══ 5/6 Rapport HTML ═══"
node scripts/build-rapport-html.mjs

echo "═══ 6/6 Conversion Word ═══"
node scripts/html-to-docx.mjs

echo ""
echo "✅ Terminé !"
echo "   HTML : docs/rapport-harmony.html"
echo "   Word : Rapport_Synthese_Projet.docx"
