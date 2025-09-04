# 🌊 Abyss Diving App

Application mobile développée avec **React Native** et **Expo** pour suivre et explorer vos plongées.

---

## 📦 Prérequis

Avant de lancer l'application, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (>= 18.x recommandé)
- [Yarn](https://yarnpkg.com/) (recommandé) ou npm
- [Expo CLI](https://docs.expo.dev/get-started/installation/) :

```bash
npm install -g expo-cli
````

* Android Studio (pour un émulateur Android) ou Xcode (pour iOS)
* L’application **Expo Go** sur votre téléphone (iOS/Android) si vous voulez tester sans émulateur.

---

## 🚀 Installation

Clonez le dépôt et installez les dépendances :

```bash
git clone https://github.com/PDG-2025/Abyss.git
cd abyss/app
yarn install
```

*(ou `npm install` si vous préférez npm)*

---
## Variables d'environnement 
```
EXPO_PUBLIC_API_BASE = "http://localhost:3000"
```
Ne pas oublié de mettre le liens de votre API
## ▶️ Lancer l'application

### Mode développement avec Expo

```bash
yarn start
```

Cela ouvrira **Expo Dev Tools** dans votre navigateur.
Vous pouvez alors :

* Scanner le QR code avec **Expo Go** sur votre smartphone
* Ou lancer sur un émulateur :

```bash
yarn android   # Pour Android
yarn ios       # Pour iOS (macOS uniquement)
yarn web       # Pour le mode Web
```

---

## 🛠️ Outils de développement

### Vérifier le code (lint + formatage)

```bash
yarn validate
```

---

## 📁 Structure du projet

```
.
├── src/              # Code source principal
│   ├── screens/      # Écrans React Native
│   ├── services/     # Services (API, récupération data)
│   ├── components/   # Composants réutilisables
│   │── navigations/  # Gestion de menu et des changements de page 
│   └── store/        # Gestion d'état (Zustand)
│   └── ble/          # Gestion des parametre pour la connection ble
│   └── types/        # Gestion des type des valeurs enregistrer dans la database
│   └── utils/        # Gestion des pages
├── package.json
└── README.md
```

---

## ⚡ Notes

* L'API par défaut est définie dans `services/api.ts`.
* Vous pouvez modifier l’adresse de l’API dans **les paramètres de l’application**.
---

## 👨‍💻 Développement

* **React Native** `0.79.6`
* **Expo SDK** `53`
* **TypeScript** `5.8`
* **Navigation** : React Navigation
* **Storage** : MMKV
* **BLE** : react-native-ble-plx
* **Maps** : react-native-maps