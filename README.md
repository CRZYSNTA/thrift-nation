# THRIFT NATION — Curated Luxury Thrift Fashion E-Commerce

**Tagline:** Pre-loved. Reimagined. Yours.

Built with Next.js App Router (Next.js 16), TypeScript, Tailwind CSS v4, Framer Motion, Prisma ORM, PostgreSQL (Neon), Auth.js v5, Cloudinary, and Razorpay.

## 1. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — Neon PostgreSQL connection string (`?sslmode=require`)
- `AUTH_SECRET` — Random 32-byte base64 secret (`openssl rand -base64 32`)
- `AUTH_URL` / `NEXT_PUBLIC_SITE_URL` — Canonical site URL (e.g. `http://localhost:3000` or production domain)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` — Razorpay API keys
- `RAZORPAY_WEBHOOK_SECRET` — Razorpay webhook signing secret (configured for `/api/webhooks/razorpay`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Optional managed image uploads in `/admin/products`

## 2. Database Setup & Seeding

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

Seeded demo accounts (`prisma/seed.ts`):
- **Super Admin:** `admin@thriftnation.in` / `Admin@1234`
- **Customer:** `arjun@thriftnation.in` / `Customer@1234`
- **Sample Coupons:** `NATION10` (10% off above ₹2,999), `FIRST500` (₹500 off above ₹4,500)

> Note: Change default passwords immediately before production deployment.

## 3. Running Locally

```bash
npm run dev
```

## 4. Production Deployment (Vercel + Neon)

1. Provision a PostgreSQL database on **Neon** and copy the pooled connection string into Vercel `DATABASE_URL`.
2. Add all environment variables from `.env.example` in Vercel Project Settings.
3. Run production migrations against Neon:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
4. Configure a Razorpay webhook pointing to `https://<your-domain>/api/webhooks/razorpay` for `payment.captured`, `order.paid`, and `payment.failed` events.
5. Deploy to Vercel (`vercel --prod` or Git push).
