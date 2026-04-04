# VM Deploy Runbook

This project is developed locally at `C:\Users\Crypt\Claude Local\CTS` and deployed on the production VM at `/opt/ct`.

## Local Prep

Run these commands locally before deployment:

```powershell
cd "C:\Users\Crypt\Claude Local\CTS"
git status
npm run build --workspace=apps/web
```

If API code changed, also run:

```powershell
npm run build --workspace=apps/api
```

## Git Flow

Use a focused commit for UI changes:

```powershell
git add apps/web/src/app/globals.css `
        apps/web/src/app/app/market/page.tsx `
        apps/web/src/app/app/product/[sku]/page.tsx `
        apps/web/src/components/Header.tsx `
        apps/web/src/components/MobileNav.tsx `
        apps/web/src/components/Sidebar.tsx `
        apps/web/src/components/SpotTickerBar.tsx `
        apps/web/src/components/MetalTile.tsx `
        apps/web/src/components/ProductCard.tsx `
        apps/web/src/components/SupplierOfferList.tsx `
        apps/web/src/components/PriceBreakdown.tsx `
        apps/web/src/components/QuoteLockPanel.tsx `
        docs/vm_deploy_runbook.md
git commit -m "Refine premium market and product UI"
git push origin <branch-name>
```

## VM Deploy

SSH to the VM and deploy from `/opt/ct`:

```bash
cd /opt/ct
git pull origin <branch-name>
npm install
npm run build --workspace=apps/web
npm run build --workspace=apps/api
pm2 reload /opt/ct/deploy/ecosystem.config.js --update-env
pm2 status
```

## Smoke Check

Verify:

- `/app/market` renders the premium hero, dark ticker, and updated product cards
- `/app/product/<sku>` renders the refined product detail layout
- mobile navigation opens and closes correctly
- PM2 shows `ct-web` and `ct-api` online

## Rollback

If deployment is bad:

```bash
cd /opt/ct
git log --oneline -5
git checkout <last-good-commit>
npm run build --workspace=apps/web
npm run build --workspace=apps/api
pm2 reload /opt/ct/deploy/ecosystem.config.js --update-env
```
