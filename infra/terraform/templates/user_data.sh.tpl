#!/bin/bash
set -euxo pipefail

# --- System packages ---------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx git curl ca-certificates gnupg certbot python3-certbot-nginx

# --- Node.js 20 (NodeSource) --------------------------------------------------
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g yarn@1.22.22

# --- App ----------------------------------------------------------------------
APP_DIR=/opt/${project_name}
rm -rf "$APP_DIR"
git clone --branch "${github_branch}" --depth 1 "${github_repo_url}" "$APP_DIR"
cd "$APP_DIR"

yarn install
(cd apps/server && yarn build)

cat > "$APP_DIR/apps/server/.env" <<EOF
SERVER_PORT=8080
SERVER_HOST_BIND=127.0.0.1
EOF

chown -R ubuntu:ubuntu "$APP_DIR"

# --- systemd service -----------------------------------------------------------
cat > /etc/systemd/system/${project_name}-server.service <<EOF
[Unit]
Description=${project_name} server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$APP_DIR/apps/server
EnvironmentFile=$APP_DIR/apps/server/.env
ExecStart=/usr/bin/node $APP_DIR/apps/server/dist/index.cjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now ${project_name}-server

# --- nginx reverse proxy (HTTP only; run infra/scripts/setup-tls.sh once DNS points here) ---
cat > /etc/nginx/sites-available/${project_name} <<EOF
server {
    listen 80;
    server_name ${api_subdomain};

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket connections can stay open for the app's 1-hour session limit.
        proxy_read_timeout 3660s;
        proxy_send_timeout 3660s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/${project_name} /etc/nginx/sites-enabled/${project_name}
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
