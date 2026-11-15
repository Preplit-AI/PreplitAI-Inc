#!/bin/sh
# Installs the campus reader on a fresh Ubuntu server and runs it every 3 hours.
# Use it only if the Cloudflare Worker cannot be used (see README.md).
# Run as root from the folder holding campusReader.js, campusSend.js, campusBoards.js and this file:
#
#   sh install.sh
#
# It asks for the reader key once (the same value as CAMPUS_INGEST_KEY in Vercel).
set -eu

DIR=/opt/preplit-campus-reader
ENV_FILE=/etc/preplit-campus-reader.env

echo "Checking that this server can reach Ajou's website..."
if ! curl -s -o /dev/null -m 20 -w "%{http_code}\n" https://www.ajou.ac.kr/oia/notice/notice.do | grep -q 200; then
  echo "This server cannot reach www.ajou.ac.kr. Delete it and try another provider or location." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1 || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  echo "Installing Node 22..."
  apt-get update -q
  apt-get install -y -q ca-certificates curl gnupg
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -q nodejs
fi

mkdir -p "$DIR/scripts" "$DIR/services"
cp campusReader.js "$DIR/scripts/campusReader.js"
cp campusBoards.js "$DIR/services/campusBoards.js"
cp campusSend.js "$DIR/services/campusSend.js"
useradd --system --no-create-home --shell /usr/sbin/nologin campusreader 2>/dev/null || true

if [ ! -f "$ENV_FILE" ]; then
  printf "Reader key (CAMPUS_INGEST_KEY from Vercel): "
  stty -echo; read -r KEY; stty echo; echo
  umask 077
  printf "CAMPUS_INGEST_KEY=%s\n" "$KEY" > "$ENV_FILE"
fi

cat > /etc/systemd/system/preplit-campus-reader.service <<EOF
[Unit]
Description=Preplit AI campus reader
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=campusreader
EnvironmentFile=$ENV_FILE
ExecStart=/usr/bin/node $DIR/scripts/campusReader.js
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
EOF

cat > /etc/systemd/system/preplit-campus-reader.timer <<EOF
[Unit]
Description=Run the Preplit AI campus reader every 3 hours

[Timer]
OnBootSec=2min
OnCalendar=*-*-* 00/3:17:00
RandomizedDelaySec=5min
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now preplit-campus-reader.timer
echo "Running it once now..."
systemctl start preplit-campus-reader.service || true
journalctl -u preplit-campus-reader.service -n 12 --no-pager
echo
echo "Installed. Next runs:"
systemctl list-timers preplit-campus-reader.timer --no-pager
