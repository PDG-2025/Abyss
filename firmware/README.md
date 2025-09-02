# Abyss Firmware

**Auteurs:** Mathéo Lopez, Nathan Füllemann, Arno Tribolet

## Description

Abyss Firmware est une application de plongée développée pour Raspberry Pi.

## Structure du projet

```
../firmware/
├── deployment-package/
│   └── install.sh              # Script d'installation automatique
├── src/
│   └── hello_world/
│       ├── __init__.py
│       └── main.py             # Application (DEMO)
├── tests/
│   └── test_hello.py           # Tests unitaires (DEMO)
├── pyproject.toml              # Configuration du projet Python
../.github/workflows/
    └── release-firmware.yaml   # Pipeline CI/CD
```

## Installation

### Prérequis

- Python 3.8+
- pip

### Installation en développement

```bash
# Cloner le repository
git clone <repository-url>
cd abyss-firmware

# Installer en mode développement avec les dépendances de dev
pip install -e ".[dev]"
```

### Installation via le package déployé

```bash
# Télécharger et extraire le package depuis le serveur
tar -xzf Abyss-firmware.tar.gz
cd deployment-package

# Exécuter le script d'installation
chmod +x install.sh
./install.sh
```

## Utilisation

### Exécution directe (DEMO)

```bash
# Via le module Python
python -m hello_world.main

# Via le script défini dans pyproject.toml
hello-world
```

## Tests

### Exécuter les tests

```bash
# Lancer tous les tests
pytest tests/ -v

# Lancer les tests avec rapport détaillé
pytest tests/ -v --tb=short
```

### Tests disponibles (DEMO)

- `test_hello()` : Vérifie que la fonction `hello_world()` retourne le bon message
- `test_bye()` : Vérifie que la fonction `bye()` retourne le bon message

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

## Licence

TODO

## Support

Pour toute question ou problème, contactez l'équipe de développement :
- Mathéo Lopez
- Nathan Füllemann  
- Arno Tribolet

Email : prenom.nom@hes-so.ch