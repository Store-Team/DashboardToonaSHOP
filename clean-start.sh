#!/bin/bash

# Script pour nettoyer et redémarrer l'application en mode mock

echo "🧹 Nettoyage du localStorage..."
echo "Ouvrez la console du navigateur et exécutez:"
echo "  localStorage.clear()"
echo ""
echo "Ou utilisez ce bookmarklet dans votre navigateur:"
echo "  javascript:localStorage.clear();alert('localStorage cleared!');"
echo ""
echo "📝 Vérification du mode Mock..."

if grep -q "VITE_USE_MOCK_DATA=true" .env; then
    echo "✅ Mode Mock activé (VITE_USE_MOCK_DATA=true)"
else
    echo "⚠️  Mode Mock désactivé - Activation..."
    sed -i 's/VITE_USE_MOCK_DATA=false/VITE_USE_MOCK_DATA=true/' .env
    echo "✅ Mode Mock activé"
fi

echo ""
echo "🚀 Démarrage du serveur de développement..."
echo ""
echo "📌 Note: En mode Mock, aucune requête ne sera envoyée au backend"
echo "📌 Pour désactiver le mode Mock, changez VITE_USE_MOCK_DATA=false dans .env"
echo ""

npm run dev
