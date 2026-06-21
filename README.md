# Book / Single-Product Landing Template

A polished, single-product landing site with a working cart and **real Stripe
checkout** (Stripe Elements, test-mode ready). Built with Next.js 16, React 19,
Tailwind v4, and Framer Motion.

Rebrand the entire site by editing **one file** — [`site.config.ts`](./site.config.ts) —
then drop your assets into `/public`. Pricing lives in the config in **cents**,
and the server is the only pricing authority (the client can never change what
it's charged).

## What's inside

- Hero carousel, quote, about-the-book, about-the-author, free-chapter signup,
  community section, drifting Instagram gallery, sticky header, footer.
- Cart (localStorage) → checkout → **Stripe PaymentIntent + `<PaymentElement>`**.
- Route handlers: `create-payment-intent`, `webhooks/stripe`, `subscribe`.
- Pluggable hooks for order fulfillment and email capture — **no database
  required** to run.

## Quick start

```bash
npm install
cp .env.example .env.local        # then fill in your Stripe test keys

# In one terminal — forward Stripe webhooks to your local route and copy the
# printed whsec_... into STRIPE_WEBHOOK_SECRET in .env.local:
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal:
npm run dev
```

Open <http://localhost:3000>. Add to cart → checkout → pay with the Stripe test
card **4242 4242 4242 4242** (any future expiry, any CVC/ZIP). You should see
the success view, the cart clear, and `payment_intent.succeeded` log in the
`stripe listen` terminal as `fulfillOrder()` fires.

Required env vars are documented in [`.env.example`](./.env.example).

## Rebrand in 3 steps

1. **Edit `site.config.ts`** — title, author, price (in cents), copy, nav,
   social links, SEO, and the Stripe Elements `appearance` colors. This is the
   single source of truth.
2. **Replace the assets** in `/public/placeholder/` (cover, hero slides, author
   photo, logo) and point the config at them. See
   [`public/assets.md`](./public/assets.md) for the full list, recommended
   filenames, and dimensions. Optional social/OG images go in `app/`.
3. **Set your env** — Stripe keys (+ optional `ORDER_WEBHOOK_URL`,
   `EMAIL_WEBHOOK_URL`, `NEXT_PUBLIC_SITE_URL`).

## How pricing & checkout work

- `app/lib/money.ts` computes subtotal / shipping / total from `site.config`
  (all cents). The **same** function runs in the order summary (client) and in
  `create-payment-intent` (server), so they can't disagree.
- `app/api/create-payment-intent/route.ts` ignores any client amount, recomputes
  the total from config, clamps quantity to `[1, maxQty]`, enforces a
  `MAX_TOTAL_CENTS` ceiling, and returns a `clientSecret`.
- `app/checkout/Checkout.tsx` creates/refreshes the PaymentIntent on load and on
  quantity change, then renders `<StripeProvider>` → `<CheckoutForm>` with
  `<PaymentElement>`. On success Stripe redirects to
  `/checkout?status=success`, which clears the cart and shows the confirmation.

## Where to add persistence / integrations

This template runs without a database on purpose. The two seams:

- **`app/lib/fulfillment.ts`** — `fulfillOrder()` runs after a successful
  payment (via the webhook). Default: log + optional `ORDER_WEBHOOK_URL`
  forward. Replace the body with your DB write (Prisma/Drizzle/Supabase/etc.).
- **`app/api/subscribe/route.ts`** — free-chapter email signups. Default: log +
  optional `EMAIL_WEBHOOK_URL` forward. Swap in your email provider's API.

## Deploy (Vercel)

1. Push to GitHub and import the repo into Vercel.
2. Set env vars in the Vercel project: `STRIPE_SECRET_KEY`,
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, and any
   optional ones. Use **live** keys when you go live.
3. In the Stripe dashboard, add a webhook endpoint pointing at
   `https://yourdomain.com/api/webhooks/stripe`, subscribe to
   `payment_intent.succeeded`, and copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`.

## Verify

```bash
npm run build   # typechecks + compiles
npm run lint
```
