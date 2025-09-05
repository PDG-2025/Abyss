# Abyss Firmware

**Auteurs:** Mathéo Lopez, Nathan Füllemann, Arno Tribolet

## Description

Abyss Firmware est une application de plongée développée pour Raspberry Pi.

## Functionnalités

Une fois lancée, la montre permet, dans 2 modes différents:  
* La sélection le type de gaz utilisé  
* La sélection le pourcentage d'oxygène  
* Le calibrage le compas  
* L'affichage 
  * de la profondeur
  * des variations de profondeurs en m/min
  * de la température
  * de la durée de la plongée

## Structure du projet

```
.
├── deploy.sh
├── pyproject.toml
├── README.md
├── src
│   ├── button
│   │   ├── buttons.py
│   ├── display
│   │   ├── display_manager.py
│   │   └── screens
│   │       ├── config_screen.py
│   │       ├── exit_screen.py
│   │       ├── general_screen.py
│   │       ├── palier_screen.py
│   │       └── template_screen.py
│   ├── logs
│   │   └── mesures.json
│   ├── main.py
│   ├── sensors
│   │   ├── ms5837.py
│   │   └── sensors.py
│   └── utils
│       └── utils.py
└── tests
    └── test_display.py
```

## Installation

### Prérequis

- Python 3.8+
- pip

### Installation en développement

```bash
# Cloner le repository
git clone <repository-url>
cd Abyss/firmware

# Installer en mode développement avec les dépendances de dev
pip install -e ".[dev]"
```

### Installation via le package déployé

```bash
# Télécharger et extraire le package depuis le serveur
tar -xzf Abyss-firmware.tar.gz

# Exécuter le script d'installation
chmod +x deploy.sh
sudo ./deploy.sh
```

## Utilisation

### Exécution directe

```bash
# Via le module Python
sudo python3 src/main.py
```

## Tests

### Exécuter les tests

```bash
# Lancer tous les tests
pytest tests/ -v

# Lancer les tests avec rapport détaillé
pytest tests/ -v --tb=short
```

## Développement

### Outils de qualité de code

Le projet utilise plusieurs outils pour maintenir la qualité du code :

```bash
# Formatage du code
black src/ tests/

# Vérification du formatage
black --check --diff src/ tests/

# Linting (erreurs critiques)
flake8 src/ tests/ --count --select=E9,F63,F7,F82 --show-source --statistics

# Linting complet (avec warnings)
flake8 src/ tests/ --count --max-complexity=10 --max-line-length=88 --statistics
```

### Dépendances de développement

- `pytest>=6.0` : Framework de tests
- `black` : Formatage automatique du code
- `flake8` : Linting et analyse statique

### Plateformes supportées

- `linux_armv7l` (Raspberry Pi 32-bit)
- `linux_aarch64` (Raspberry Pi 64-bit)

## Support

Pour toute question ou problème, contactez l'équipe de développement :
- Mathéo Lopez
- Nathan Füllemann  
- Arno Tribolet

Email : prenom.nom@hes-so.ch