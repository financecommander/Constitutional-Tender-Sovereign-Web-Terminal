# Google Cloud VM Setup — Constitutional Tender

## 1. Create GCP Project

```bash
gcloud projects create constitutional-tender --name="Constitutional Tender"
gcloud config set project constitutional-tender
gcloud services enable compute.googleapis.com
```

## 2. Create VM Instance

```bash
gcloud compute instances create ct-production \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --tags=http-server,https-server
```

## 3. Reserve Static IP

```bash
gcloud compute addresses create ct-ip --region=us-central1
gcloud compute addresses describe ct-ip --region=us-central1 --format='value(address)'
```

Assign the static IP to the VM in the GCP Console.

## 4. Configure Firewall Rules

```bash
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 --target-tags=http-server --direction=INGRESS

gcloud compute firewall-rules create allow-https \
  --allow=tcp:443 --target-tags=https-server --direction=INGRESS
```

## 5. SSH into VM

```bash
gcloud compute ssh ct-production --zone=us-central1-a
```

## 6. Run Setup Script

```bash
# Clone the repo
sudo mkdir -p /opt/ct && sudo chown $USER:$USER /opt/ct
cd /opt/ct
git clone https://github.com/financecommander/CTS.git .

# Run the setup script
sudo bash deploy/setup-vm.sh
```

## 7. Configure Environment

```bash
# API environment
cp deploy/.env.example apps/api/.env
# Edit apps/api/.env with real Auth0 credentials and DB password
nano apps/api/.env

# Web environment
cat > apps/web/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://YOUR_VM_IP:4000
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.us.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://api.constitutionaltender.com
NEXT_PUBLIC_AUTH0_REDIRECT_URI=http://YOUR_VM_IP
EOF
```

## 8. Build and Start

```bash
npm ci
cd apps/api && npx prisma generate && npx prisma migrate deploy && npx prisma db seed
cd /opt/ct
npx turbo run build
pm2 start deploy/ecosystem.config.js
pm2 save
```

## 9. GitHub Actions Deploy Secrets

In the GitHub repo, go to Settings > Secrets and add:
- `VM_HOST` — your VM's static IP address
- `VM_USER` — your SSH username (usually your Google account username)
- `VM_SSH_KEY` — your private SSH key for the VM

## 10. Verify

Visit `http://YOUR_VM_IP` in a browser. You should see the Constitutional Tender homepage.

## SSL (Later — When Domain is Ready)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```
