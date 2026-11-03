# Royal Silver storefront

Hebrew/RTL jewelry storefront. TanStack Start (React 19) + Tailwind 4, reading products and managing carts through the Shopify Storefront API. Standalone: no third-party site-builder dependencies.

## Develop
```bash
npm install
npm run dev     # http://localhost:8080
npm run build
npm run lint
```
In `npm run dev` a **safe mode** is active (`src/lib/safe-mode.ts`): Shopify reads stay real and read-only, cart/checkout mutations are simulated locally, the Meta Pixel never loads and checkout is blocked. Set `VITE_RS_ALLOW_LIVE=1` only with explicit approval.

## Configuration
- Shopify domain/token: `src/lib/shopify.ts` (Storefront tokens are public, read-scoped).
- Hosting target is undecided; `vite.config.ts` includes the Cloudflare plugin for builds only.

## Open items
- Product/brand images are still referenced through `src/assets/*.asset.json` manifests that point at the old host. They must be replaced with real files in `public/media` (see git history/notes).
