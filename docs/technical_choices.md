# Technical Choices

# Hardware

## Raspberry Pi

Nous avons choisi d’utiliser un Raspberry Pi Zero 2 W comme cœur de notre ordinateur de plongée. Ce choix s’explique par plusieurs raisons techniques :

- Puissance de calcul suffisante : le Raspberry Pi Zero 2 W intègre un processeur quad-core capable de gérer simultanément les calculs de décompression, l’affichage en temps réel des informations et la communication sans fil, sans risque de saturation.

- Connectivité : il dispose d’une interface Bluetooth intégrée, ce qui simplifie la synchronisation des plongées avec un smartphone et l’export des données vers l'application, sans nécessiter de module supplémentaire.

- Compatibilité logicielle : grâce à son environnement Linux, il est possible d’utiliser des bibliothèques logicielles existantes (gestion des capteurs via I²C/SPI, interface graphique, stockage des données, etc.), ce qui accélère le développement.

- Écosystème riche : le Raspberry Pi possède une documentation abondante, ce qui est utile pour le developpement rapide.

- Consommation faible : le modèle Zero 2 W a une consommation énergétique faible tout en ayant une puissance de calcul suffisante, compatible avec une alimentation sur batterie 18650, ce qui permet plusieurs heures d’autonomie.

- Compacité : son petit format permet une intégration facile dans un boîtier étanche à fixer sur le poignet du plongeur.

## Capteur de pression (profondeur)

Nous avons retenu un capteur barométrique haute précision MS5837.

- Plage de mesure adaptée : jusqu’à 30 bar selon le modèle, ce qui permet de couvrir la plongée loisir et technique (jusqu'à 290m de profondeur).

- Précision élevée : résolution de l’ordre du centimètre.

- Interface I²C : simplifie l’intégration avec le Raspberry Pi et permet d’utiliser plusieurs capteurs en parallèle si nécessaire.

- Faible consommation : adapté à une utilisation sur batterie.

- Capteur de température : le capteur MS5837 fait aussi office de thermomètre, ce qui simplifie et réduit le nombre de capteurs nécessaire.

## Batterie

Le système est alimenté par une batterie Li-ion 18650 de 3500 mAh.

- Capacité suffisante : autonomie estimée entre 3 et 5 heures selon la charge.

- Format standard : facilement remplaçable et rechargeable.

## Ecran

Nous avons choisi un écran graphique rectangulaire avec interface I²C.

- Disponibilité : l'écran a été choisi car il était disponnible au MakeLab et répondait à nos besoins.

- Lisibilité : affichage clair des données essentielles (profondeur, temps, NDL, compas).

- Compacité : format adapté pour un boîtier portable à fixer sur le poignet du plongeur.

- Faible consommation : technologie TFT basse consommation, pour préserver l’autonomie.

- Programmabilité : compatible avec des bibliothèques graphiques déjà existantes.

# Landing page

# Base de données

# Cloud

# Workflow
