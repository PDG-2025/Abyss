#!/bin/bash
echo "Installing the App..."
# Dependencies
pip install --no-index --find-links wheels/ wheels/*.whl

# firmware
pip install --no-index --find-links . *.whl

echo "Installation over !"

