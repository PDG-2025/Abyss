const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques depuis le dossier 'www'
app.use(express.static(path.join(__dirname, 'www')));

// Route principale - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📁 Fichiers servis depuis le dossier: ${path.join(__dirname, 'www')}`);
    console.log(`🌊 Landing page Abyss disponible à l'adresse: http://localhost:${PORT}`);
});

// Gestion des erreurs
process.on('uncaughtException', (err) => {
    console.error('❌ Erreur non gérée:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée non gérée:', reason);
});