# Deployment Checklist

## Required Environment

Copy `.env.example` for local development and configure these values in the deployment platform:

- `NEXT_PUBLIC_APP_URL`: canonical app URL, for example `https://app.example.com`
- `NEXT_PUBLIC_ROOT_DOMAIN`: root tenant domain, for example `example.com`
- `DATABASE_URL`: MongoDB connection string
- `PAYLOAD_SECRET`: long random Payload secret
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret

Optional:

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token when media uploads use Blob storage
- `TRPC_SLOW_PROCEDURE_MS`: slow tRPC log threshold, default `500`

## Quality Gate

Run this before opening a PR:

```bash
npm run ci
```

The CI workflow runs the same command on pull requests and pushes to `main`.

## Health Check

Use this endpoint for platform readiness checks:

```txt
GET /api/health
```

Expected healthy response:

```json
{
  "ok": true,
  "status": "ok",
  "checks": {
    "database": { "ok": true },
    "env": { "ok": true }
  }
}
```

The endpoint returns `503` when required environment variables are missing or the database cannot be reached.

## Stripe Webhooks

Configure Stripe to send events to:

```txt
POST /api/stripe/webhooks
```

Currently handled events:

- `checkout.session.completed`
- `account.updated`

Each Stripe event is persisted in `webhook-events` with one of these statuses:

- `processing`
- `processed`
- `failed`
- `skipped`

Use this collection for payment incident review and replay decisions.

## Security Notes

- Do not commit `.env`; only `.env.example` is tracked.
- Rotate `PAYLOAD_SECRET` and Stripe secrets if they are exposed.
- Keep `NEXT_PUBLIC_ROOT_DOMAIN` aligned with DNS and tenant subdomain routing.
- Keep `npm run lint` at zero warnings so CI does not accumulate ignored problems.

## Abuse Protection

The app includes process-local rate limiting for high-risk tRPC mutations:

- auth registration
- auth login
- Stripe account verification link creation
- checkout session creation
- review create/update

This protects local development and single-instance deployments. For multi-instance production deployments, replace the in-memory limiter in `src/lib/rate-limit.ts` with a shared store such as Redis or Upstash Redis while preserving the same limit keys and behavior.
