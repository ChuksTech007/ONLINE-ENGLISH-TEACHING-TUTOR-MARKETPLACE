# Merit English

MVP of an online English teaching marketplace. Teachers keep 100% of lesson fees. The platform earns from advertising credits deducted on a **new student–teacher first contact**.

**For the next developers:** read [`SUCCESSOR-HANDOVER.md`](./SUCCESSOR-HANDOVER.md). It lists what this MVP already does, what the full spec still needs, and which accounts/keys are required to finish it.

## Stack

- Frontend: Next.js (App Router) + Tailwind
- Backend: NestJS REST API
- Database: PostgreSQL + Prisma

## MVP included

- Public homepage, teacher directory, teacher profiles
- Student / teacher / admin accounts
- Teacher approval workflow
- Advertising wallet with a transaction ledger
- First-contact deduction (repeat messages are not charged)
- Internal messaging, lesson requests, Zoom/Meet links
- Reviews after completed lessons
- Admin tools for teachers, contact fee, packages and wallet credits

## Later (full spec)

Stripe/PayPal webhooks, CMS, teacher training library, SEO extras, SMS/WhatsApp, Zoom/Meet APIs, S3 uploads, dispute UI.

## Run locally

1. Create a PostgreSQL database named `merit_english`.
2. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` and `JWT_SECRET`.
3. From `backend`:

```
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

4. Start the API and website. Because this folder name contains `&`, Windows `npm` scripts can break. From the project root:

```
powershell -File .\start.ps1
```

Or call Node directly:

```
# backend
node .\dist\src\main.js

# frontend
node .\node_modules\next\dist\bin\next dev --port 3000
```

API: http://localhost:4000/api  
Web: http://localhost:3000

Advertising credit purchases in this MVP credit the wallet immediately so you can demo the model. Stripe/PayPal webhook verification comes in the full spec.

## Demo accounts

Password for all: `Password123!`

| Role | Email |
|---|---|
| Admin | admin@merit.test |
| Teacher | amara.okafor@merit.test |
| Student | nina.chen@merit.test |
