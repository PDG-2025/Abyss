#!/bin/bash
set -e

APP=${1:-Abyss}
SRC=${2:-.}

# Install & copy
apt-get update -qq && apt-get install -y python3-venv
mkdir -p /opt/$APP
cp -r $SRC/* /opt/$APP/
cd /opt/$APP

# Setup Python
python3 -m venv venv
venv/bin/pip install -e .

# Create service
cat > /etc/systemd/system/$APP.service << EOF
[Unit]
After=network.target
[Service]
User=root
WorkingDirectory=/opt/$APP
ExecStart=/opt/$APP/venv/bin/python main.py
Restart=always
[Install]
WantedBy=multi-user.target
EOF

# Start
systemctl enable $APP --now

echo "Done. Status: systemctl status $APP"