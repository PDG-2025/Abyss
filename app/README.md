# Abyss Mobile

## Description

Abyss Mobile est une application React Native de démonstration développée principalement pour tester et valider le pipeline CI/CD automatisé. Cette application utilise les composants de base React Native pour créer une interface simple tout en mettant l'accent sur un système de déploiement robuste via GitHub Actions.

## Architecture du projet

```
app/
├── android/                    # Configuration Android native
│   
├── __tests__/                 # Tests unitaires
│   └── App.test.tsx
├── App.tsx                    # Composant principal React Native
├── index.js                   # Point d'entrée de l'application
├── package.json              # Dépendances et scripts npm
├── tsconfig.json             # Configuration TypeScript
├── babel.config.js           # Configuration Babel
├── metro.config.js           # Configuration Metro bundler
└── ../.github/workflows/
    └── release-mobile-app.yaml  # Pipeline CI/CD
```

## Installation et Setup

### Prérequis

- **Node.js:** >= 18.0.0
- **Java JDK:** 17 (pour build Android)
- **Android Studio** avec SDK Android
- **React Native CLI:** `npm install -g @react-native-community/cli`

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd app/

# Installer les dépendances
npm install

# Pour Android - Première installation uniquement
cd android && ./gradlew clean && cd ..
```

## Utilisation

### Développement

```bash
# Démarrer le Metro bundler
npm start

# Lancer sur Android (émulateur ou appareil connecté)
npm run android
```

### Tests et Qualité

```bash
# Exécuter les tests unitaires
npm test

# Linter le code
npm run lint

# Lancer tous les checks de qualité
npm run lint && npm test
```

## Stack Technique

### Framework et Librairies principales
- **React Native:** 0.81.0
- **React:** 19.1.0
- **TypeScript:** 5.8.3
- **SafeAreaContext:** 5.5.2 - Gestion des zones sûres

### Outils de Développement
- **ESLint:** Linting avec config React Native
- **Jest:** Framework de tests unitaires
- **Prettier:** 2.8.8 - Formatage de code
- **Babel:** Transpilation JavaScript/TypeScript
- **Metro:** Bundler React Native

### Build et CI/CD
- **Gradle:** Build system Android
- **GitHub Actions:** Intégration continue
- **FTP Deploy:** Déploiement automatisé


### Scripts disponibles
```json
{
  "android": "react-native run-android",
  "start": "react-native start",
  "test": "jest",
  "lint": "eslint ."
}
```

## Fonctionnalités actuelles

L'application actuelle est une **démo technique** 

### Workflow de développement
1. Créer une branche feature : `git checkout -b feature/nom-fonctionnalite`
2. Développer et tester localement : `npm run lint && npm test`
3. Pousser la branche : les tests s'exécutent automatiquement
4. Créer une Pull Request vers `main`
5. Une fois mergée, l'APK est automatiquement buildée et déployée

## Support et Contact

Cette application fait partie de l'écosystème Abyss développé par :
- Mathéo Lopez
- Nathan Füllemann  
- Arno Tribolet

---

*Cette application est actuellement en phase de démonstration technique et servira de base pour le développement des fonctionnalités métier de l'écosystème Abyss.*