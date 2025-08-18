# Abyss

- [Abyss](#abyss)
  - [Projet Abyss – Ordinateur de plongée](#projet-abyss--ordinateur-de-plongée)
    - [Fonctionnalités](#fonctionnalités)
      - [1. Mesures et affichage en temps réel](#1-mesures-et-affichage-en-temps-réel)
      - [2. Gestion de la sécurité](#2-gestion-de-la-sécurité)
      - [3. Navigation](#3-navigation)
      - [4. Historique et suivi](#4-historique-et-suivi)
      - [5. Interface et ergonomie](#5-interface-et-ergonomie)
      - [6. Extension (optionnel / avancé)](#6-extension-optionnel--avancé)
  - [Glossaire](#glossaire)


## Projet Abyss – Ordinateur de plongée

**Équipe :** Arno Tribolet, Nathan Füllemann, Mathéo Lopez
**Durée :** 3 semaines
**Objectif :** Concevoir un ordinateur de plongée permettant de plonger en toute sécurité.

---

### Fonctionnalités

#### 1. Mesures et affichage en temps réel

* Mesurer et afficher la **profondeur actuelle**.
* Mesurer et afficher la **profondeur maximale**.
* Calculer et afficher le **temps de plongée écoulé**.
* Calculer et afficher la **limite de non-décompression (NDL)**.
* Afficher la **vitesse de remontée** et alerter en cas de remontée trop rapide.
* Gérer le **changement de gaz respiratoire** (air, nitrox).
* Meusurer et afficher la **température de l'eau**.

#### 2. Gestion de la sécurité

* Donner des **alertes visuelles et/ou sonores** (dépassement NDL, vitesse de remontée, profondeur max atteinte, paliers obligatoires).
* Afficher les **paliers de décompression nécessaires** si la NDL est dépassée.
* Calculer le **temps de surface minimum** avant la plongée suivante (intervalle de surface).
* Calculer le **temps minimum** avant de prendre l'avion.

#### 3. Navigation

* Intégrer un **compas numérique** pour l’orientation sous-marine.

#### 4. Historique et suivi

* Enregistrer automatiquement les données de chaque plongée (profondeur, durée, gaz utilisé, etc.).
* Permettre la **consultation de l’historique** directement sur l’ordinateur.
* Synchroniser les plongées avec une **application mobile** (via Bluetooth).

#### 5. Interface et ergonomie

* Avoir une **jauge indiquant l'état de la batterie**
* Avoir un **écran lisible sous l’eau** (luminosité, contraste, chiffres grands).
* Être **facile à utiliser avec des gants** (boutons larges).
* Fournir une **navigation intuitive** dans les menus.

#### 6. Extension (optionnel / avancé)

* **Air Integration** : recevoir la pression de la bouteille depuis un émetteur sans fil et afficher l’air restant / autonomie.

---

## Glossaire

* **NDL (No Decompression Limit)**: Le temps maximum qu’un plongeur peut rester à une certaine profondeur sans avoir besoin d’effectuer de paliers de décompression lors de la remontée. Un palier de sécurité est effectué à chaque plongée mais en cas d'urgence, il peut être omis. Passé ce temps NDL, la plongée passe d'une plongée récréative à une plongée technique.

* **Palier de décompression**: Arrêt d'une certaine durée à une certaine profondeur pendant la remontée, que le plongeur doit respecter. Dans la plongée récréative, le palier de décompression n'est pas obligatoire mais est réalisé pour éviter un accident de décompression. Il dure généralement de 3 à 5 minutes à 5 mètres de profondeur mais peut varier suivant la plongée effectuée.

* **Accident de décompression**: Quand on plonge, la pression augmente et l’azote de l’air respiré se dissout dans le sang et les tissus. Lors de la remontée, si on remonte lentement, l’azote a le temps de s’éliminer progressivement par la respiration. Si on remonte trop vite ou si on dépasse la NDL sans faire les paliers, l’azote se libère brutalement et forme des bulles dans le corps.
Formes bénignes :
- Douleurs articulaires et musculaires ("les bends").
- Fatigue inhabituelle.
- Démangeaisons, éruptions cutanées.
Formes graves :
- Atteinte neurologique (vertiges, paralysies, troubles de la vision, perte de conscience).
- Atteinte respiratoire (toux, essoufflement, douleur thoracique).
- Atteinte circulatoire pouvant mener au décès.

* **Nitrox**: L'air est composé de 21% d'oxygène et 78% d'azote. Le Nitrox (aussi appelé EANx pour Enriched Air Nitrox) est un mélange respiratoire utilisé en plongée composé d’oxygène (O₂) en proportion plus élevée que l’air normal et d’azote (N₂) en proportion réduite (généralement de 32% à 40% d'oxygène). Réduire la part d’azote respiré apporte plusieurs avantages:
- Moins d’azote absorbé par le corps → donc moins de risque d’accident de décompression.
- NDL plus longues (limites de non-décompression augmentées) → on peut rester plus longtemps à une certaine profondeur qu’avec l’air.
- Moins de fatigue après la plongée (effet souvent ressenti par les plongeurs au Nitrox).
Mais il comporte aussi un désavantage majeur. En profondeur, une trop grande quantité d'oxygène devient toxic pour l'homme. C'est pour cela que chaque gaz à un MOD (Maximum Operating Depth). Plus la proportion d'oxygène est grande, plus le MOD est petit.

* **MOD** (Maximum Operating Depth): La profondeur maximale à laquelle on peut utiliser un gaz respiratoire en toute sécurité sans risque de toxicité de l’oxygène. Quand on plonge avec de l’air ou du Nitrox, la pression partielle d’oxygène (PpO₂) augmente avec la profondeur.
Au-delà d’une certaine valeur (généralement 1,4 bar en plongée récréative, 1,6 bar en plongée technique), l’oxygène devient toxique pour le système nerveux.
Cela peut provoquer une crise hyperoxique sous l’eau → convulsions, perte de connaissance, noyade.
Le MOD définit donc une limite de profondeur à ne pas dépasser pour rester en sécurité.