#!/bin/bash
# Constitutional Tender — VM Setup Script
# Run this on a fresh Ubuntu 22.04 LTS GCE instance
# Usage: sudo bash setup-vm.sh

set -euo pipefail

echo "=== Constitutional Tender VM Setup ==="

# --- System packages ---
echo "[1/8] Updating system packages..."
apt-get update && apt-get upgrade -y
apt-get install -y curl git nginx ufw

# --- Node.js 20 ---
echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

# --- PostgreSQL 16 ---
echo "[3/8] Installing PostgreSQL 16..."
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
apt-get update
apt-get install -y postgresql-16 postgresql-client-16

# --- Create DB ---
echo "[4/8] Setting up database..."
if [ -z "${DB_PASSWORD:-}" ]; then
  read -sp "Enter PostgreSQL password for ctuser: " DB_PASSWORD
  echo ""
fi
if [ -z "$DB_PASSWORD" ]; then
  echo "ERROR: Database password cannot be empty."
  exit 1
fi
sudo -u postgres psql -c "CREATE USER ctuser WITH PASSWORD '${DB_PASSWORD}';" || true
sudo -u postgres psql -c "CREATE DATABASE constitutional_tender OWNER ctuser;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE constitutional_tender TO ctuser;" || true

# --- Create app directory ---
echo "[5/8] Creating application directory..."
mkdir -p /opt/ct
mkdir -p /var/log/ct
chown -R $SUDO_USER:$SUDO_USER /opt/ct /var/log/ct

# --- Firewall ---
echo "[6/8] Configuring firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# --- Nginx config ---
echo "[7/8] Configuring Nginx..."
cp /opt/ct/deploy/nginx.conf /etc/nginx/sites-available/ct
ln -sf /etc/nginx/sites-available/ct /etc/nginx/sites-enabled/ct
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# --- PM2 startup ---
echo "[8/8] Configuring PM2 startup..."
sudo -u $SUDO_USER pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER | tail -1 | bash || true

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Clone your repo:  cd /opt/ct && git clone <repo-url> ."
echo "  2. Create .env file: cp deploy/.env.example apps/api/.env"
echo "  3. Install deps:     npm ci"
echo "  4. Generate Prisma:  cd apps/api && npx prisma generate && npx prisma migrate deploy"
echo "  5. Seed database:    npx prisma db seed"
echo "  6. Build:            npx turbo run build"
echo "  7. Start PM2:        pm2 start deploy/ecosystem.config.js"
echo "  8. Save PM2:         pm2 save"
echo ""
echo "Database URL: postgresql://ctuser:<YOUR_PASSWORD>@localhost:5432/constitutional_tender"
echo ""
echo "Use the password you entered above in your .env DATABASE_URL."
