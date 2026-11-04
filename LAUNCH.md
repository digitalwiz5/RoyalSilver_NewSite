# Going live: checklist (Royal Silver storefront)

Nothing here has been done yet. Every step that touches the live domain, the live Shopify store or live tracking needs explicit approval.

## Where things stand
- Code: `main` on GitHub (digitalwiz5/RoyalSilver_NewSite). Standalone Vite/TanStack Start app, no Lovable.
- Preview: `https://royalsilver-preview.royalsilver-site.workers.dev` is a **safe preview** (simulated cart, checkout blocked, no Meta Pixel, noindex).
  Redeploy: `npm run deploy:preview` (needs the Cloudflare login on this machine).
- Live site: royalsilver.net is still served by the old host. Untouched.

## Modes
| Build | Command | Cart | Checkout | Pixel | Indexing |
|---|---|---|---|---|---|
| dev server | `npm run dev` | simulated | blocked | off | n/a |
| public preview | `npm run build:preview` | simulated | blocked | off | noindex, robots disallow |
| production | `npm run build` | **real Shopify cart** | **real Shopify checkout** | on after consent | indexable |

Safe mode is controlled in `src/lib/safe-mode.ts`. Production builds do not set `VITE_RS_PREVIEW`.

## Test the full purchase BEFORE the domain moves
Use a Shopify **development store** (free, Partners account) with a few test products and the Bogus Gateway.
1. Create a Storefront API token in that store (read products + manage carts).
2. Build against it without touching the live store:
   `VITE_SHOPIFY_STORE_DOMAIN=<dev>.myshopify.com VITE_SHOPIFY_STOREFRONT_TOKEN=<token> VITE_RS_ALLOW_LIVE=1 npm run dev`
3. Check: variants and sizes, quantity changes, discount code, shipping line (29.90), checkout opens, test order appears, mobile.
4. Do not run `VITE_RS_ALLOW_LIVE=1` against the live store for tests: a completed checkout creates a real order.

## Pre-launch content
- [ ] Owner approves privacy, terms, returns, shipping, FAQ, accessibility text.
- [ ] Contact details and social links verified.
- [ ] Meta: Shopify channel sends InitiateCheckout/Purchase; the site sends PageView/ViewContent/AddToCart only (see AGENTS.md). Verify in Meta Test Events with no duplicates.
- [ ] Sitemap, robots.txt (Allow), canonical URLs, Search Console.

## Domain move (needs approval, do in this order)
1. Find where royalsilver.net DNS is managed today and who has access.
2. Add the domain to Cloudflare and **copy every existing DNS record** (especially MX and TXT for email) before changing nameservers.
3. Deploy the production build to a **separate** Worker name (not `royalsilver-preview`) and attach a test subdomain such as `new.royalsilver.net`. Old site stays live.
4. Run the full test list on the subdomain.
5. Switch `royalsilver.net` and `www` to the Worker. Keep the old records written down for a fast rollback.
6. After launch: place one real order of low value (refund it), check Meta events and Shopify order attribution.

## Rollback
Restore the previous DNS records (kept from step 2). TTL should be lowered to 300s a day before the switch.

## Risks to keep in mind
- A wrong DNS move can interrupt website and e-mail.
- Apps/pixels/scripts that lived on the old site do not move automatically.
- Production checkout runs on Shopify's domain; payment settings are not changed by this project.
