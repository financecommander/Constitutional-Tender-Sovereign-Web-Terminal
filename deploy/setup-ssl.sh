#!/bin/bash
# Constitutional Tender — SSL Setup Script
# Usage: bash setup-ssl.sh yourdomain.com
#
# Prerequisites:
# - Domain DNS A record pointing to this server's IP
# - Nginx installed and running
# - Certbot installed (apt install certbot python3-certbot-nginx)

set -euo pipefail

DOMAIN="${1:-}"

if [ -z "$DOMAIN" ]; then
  echo "Usage: bash setup-ssl.sh yourdomain.com"
  echo ""
  echo "Before running:"
  echo "  1. Point your domain's DNS A record to this server's IP"
  echo "  2. Wait for DNS propagation (check: dig $DOMAIN)"
  exit 1
fi

echo "=== Constitutional Tender SSL Setup ==="
echo "Domain: $DOMAIN"
echo ""

# Step 1: Install certbot if not present
if ! command -v certbot &> /dev/null; then
  echo "[1/5] Installing Certbot..."
  sudo apt-get update
  sudo apt-get install -y certbot python3-certbot-nginx
else
  echo "[1/5] Certbot already installed."
fi

# Step 2: Update Nginx config with domain
echo "[2/5] Updating Nginx configuration..."
NGINX_CONF="/etc/nginx/sites-available/constitutional-tender"

if [ -f /opt/ct/deploy/nginx-ssl.conf ]; then
  sudo cp /opt/ct/deploy/nginx-ssl.conf "$NGINX_CONF"
  sudo sed -i "s/YOUR_DOMAIN.com/$DOMAIN/g" "$NGINX_CONF"
  sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
  sudo rm -f /etc/nginx/sites-enabled/default
  echo "  Config written to $NGINX_CONF"
else
  echo "  ERROR: /opt/ct/deploy/nginx-ssl.conf not found"
  exit 1
fi

# Step 3: Test Nginx config
echo "[3/5] Testing Nginx configuration..."
sudo nginx -t

# Step 4: Reload Nginx
echo "[4/5] Reloading Nginx..."
sudo systemctl reload nginx

# Step 5: Obtain SSL certificate
echo "[5/5] Obtaining SSL certificate from Let's Encrypt..."
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" --redirect

echo ""
echo "=== SSL Setup Complete ==="
echo ""
echo "Your site is now available at:"
echo "  https://$DOMAIN"
echo "  https://www.$DOMAIN"
echo ""
echo "Certificate auto-renewal is handled by Certbot's systemd timer."
echo "Test renewal: sudo certbot renew --dry-run"
echo ""
echo "Next steps:"
echo "  1. Update FRONTEND_URL in /opt/ct/apps/api/.env to https://$DOMAIN"
echo "  2. Restart API: pm2 restart ct-api"
