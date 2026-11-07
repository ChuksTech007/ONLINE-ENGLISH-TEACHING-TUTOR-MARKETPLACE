# Successor handover — Merit English marketplace

**Status: MVP is complete and runnable. The full specification is not.**

This note is for the next developers. It explains what has already been built, how to run it, which business rules must never change, and what is still required to take the product from this MVP to the full spec in `Hack.txt`.

The product is an online English teaching marketplace. Teachers keep **100% of lesson fees**. Students pay teachers directly. The platform earns money only when teachers buy **advertising credits**, and when a **new student contacts a teacher for the first time**.

---

## 1. What you are inheriting

A working first version of the marketplace, using the stack the spec asked for:

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) + Tailwind — `frontend/` |
| Backend | NestJS REST API — `backend/` |
| Database | PostgreSQL + Prisma — `backend/prisma/` |
| Auth | JWT in an httpOnly cookie, role-based access (student / teacher / admin) |

The commercial loop is live and has been tested:

1. Teacher is approved and has advertising credit.
2. A **new** student contacts that teacher → contact fee is deducted from the teacher wallet.
3. The same student messages again → **no second charge**.
4. A different student contacts the same teacher → a new charge.

Example that already ran against this codebase: teacher wallet **$20.00 → $18.00** on first contact, then stayed **$18.00** on the follow-up message.

---

## 2. How to run the MVP

1. PostgreSQL 17 is expected locally. Database name: `merit_english`.
2. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` and `JWT_SECRET`. **Never commit `.env`.**
3. From `backend/`, generate the client, migrate, and seed (if the database is empty).
4. Start API on port **4000** and the website on port **3000**.

The project folder name contains `&`, which breaks some Windows `npm` scripts. Prefer:

```
powershell -File .\start.ps1
```

or Node directly:

```
# backend (after nest build)
node .\dist\src\main.js

# frontend
node .\node_modules\next\dist\bin\next dev --port 3000
```

- Website: http://localhost:3000  
- API: http://localhost:4000/api  
- Health: http://localhost:4000/api/health  

### Demo accounts

Password for all: `Password123!`

| Role | Email |
|---|---|
| Admin | admin@merit.test |
| Teacher (approved, has credits) | amara.okafor@merit.test |
| Teacher (approved) | james.whitfield@merit.test |
| Teacher (approved) | sofia.martinez@merit.test |
| Teacher (pending approval) | pending.teacher@merit.test |
| Student | nina.chen@merit.test |
| Student | david.mensah@merit.test |

---

## 3. Business rules that must not change

These are in the spec as non-negotiable. Do not “improve” them away.

1. Teachers set their own lesson prices.
2. Students pay teachers directly (PayPal, bank, Wise, mobile money, etc. as listed on the profile).
3. The platform takes **zero commission** on teaching income.
4. Teachers buy advertising credits in advance.
5. Credits are deducted only on a **qualifying first contact** between that student and that teacher.
6. Profile views and impressions are free.
7. Repeat messages from the same student to the same teacher are free.
8. Admin controls the contact fee and credit packages (no code change required to change the fee).
9. Lessons happen on Zoom, Google Meet, Teams, or another external tool. The platform stores the meeting link.

Wallet money must stay decimal (Prisma `Decimal`), transactional, and ledger-based. Never treat the balance field as the source of truth without the transaction table.

---

## 4. What the MVP already implements

### Public website

- Home, Find a teacher, How it works, Become a teacher, About, Contact, Login, Register
- Teacher directory with search/filter (name/bio, country, specialization, level, native speaker, experience, max price), pagination, featured teachers first
- Individual profile pages at `/teachers/{slug}` (photo, bio, qualifications, rates, availability, methodology, payment methods, reviews, Contact + request lesson)

### Accounts and approval

- Student and teacher registration (admin is seed-only; cannot self-register as admin)
- Login / logout, JWT cookie, role guards
- Teacher profiles start **Pending** until an admin approves them
- Admin can approve, reject, suspend, and feature teachers
- Only **approved** teachers appear in the public directory

### Advertising wallet (core of the business)

- One wallet per teacher
- Packages: Starter $5, Basic $10, Professional $20, Business $50 (admin can add/edit)
- Transaction ledger: type, amount, previous balance, new balance, unique reference, description, enquiry id, timestamp
- First-contact uniqueness on `(studentId, teacherId)`
- Concurrent-safe deduction (`SELECT … FOR UPDATE` inside a transaction)
- Insufficient credit blocks **new** paid contacts; existing relationships can still message
- Low-credit in-app notification
- Admin can credit, debit, or refund; refunds are **new** credit transactions (original deductions are never deleted)
- Historical deductions keep the fee that was in force at the time

**Known MVP shortcut:** “Buy credits” currently credits the wallet immediately so the model can be demonstrated. It is **not** a verified Stripe/PayPal payment. That is the first full-spec gap.

### Teaching and communication

- Enquiry form (level, objectives, schedule, message)
- Internal messaging with read state
- Lesson request / schedule / cancel / complete
- Teacher pastes Zoom or Google Meet link
- Join Class is offered near lesson start time
- Reviews (stars + teaching quality, communication, punctuality, comment) after a **completed** lesson
- In-app notifications (enquiry, wallet, approval, lesson updates)

### Admin

- Stats (teachers, students, enquiries, credit sales, deductions, contact fee)
- Teacher list: approve / reject / suspend / feature
- Finance: change contact fee, packages, manual wallet credit, transaction log
- Audit log for admin wallet and status actions

### Repo hygiene

- Root `.gitignore` ignores `node_modules`, `.env`, `.env.local`, `dist`, `.next`, `uploads`, keys
- `backend/.env.example` is safe to commit; `backend/.env` is not

---

## 5. Spec tests the MVP already covers

| Spec test | MVP |
|---|---|
| Teacher registers | Yes |
| Profile enters approval queue | Yes |
| Admin approves → profile can go public | Yes |
| Student first contact deducts the fee | Yes |
| Same student messages again → no second deduction | Yes |
| Different student → new deduction | Yes (relationship is unique per pair) |
| Insufficient credit blocks chargeable contact | Yes |
| Teacher updates availability | Yes |
| Teacher adds Meet/Zoom link; student can join near start | Yes |
| Student pays teacher directly; no lesson commission | Yes (by design; platform never takes lesson money) |
| Admin refund is a recorded credit transaction | Yes |
| Admin changes contact fee; new fee applies going forward | Yes |
| Teacher buys $20 **after verified payment** | **No** — wallet is credited without a payment gateway |

---

## 6. What remains for the full spec — and what you need to finish it

Work below is grouped by what the next team must **obtain** versus what is **code-only**.

### A. Real advertising payments (required before this is a real business)

**What is missing:** Stripe / PayPal / Flutterwave (or country-specific gateway). Unique payment reference, checkout, **server-side webhook verification**, credit the wallet **exactly once** even if the webhook retries, never trust a browser “success” redirect, confirmation notification.

**What you need:**

- A legal entity / Stripe (or PayPal / Flutterwave) account for the countries you operate in
- API keys and webhook signing secret in `.env` (never in git)
- Decision: which gateway first (Stripe is the usual starting point)
- Admin setting for “which gateway is active”

**Suggested build:** replace `POST /wallets/purchase` with: create pending payment → redirect to Stripe Checkout → webhook `checkout.session.completed` → credit wallet idempotently using the payment reference.

### B. Email, password reset, enforced verification, lesson reminders

**What is missing:** accounts are usable without proving email; there is no forgot-password; notifications are **in-app only**; no 24h / 1h / 15min lesson emails.

**What you need:**

- A transactional email provider (Resend, Amazon SES, Postmark, etc.) and an API key
- A from-address on a domain you control (`noreply@yourdomain.com`)
- Optional later: Twilio or WhatsApp Business for SMS

**Code still to write:** verification required before full use; password reset tokens; email templates; a scheduler (cron) for lesson reminders. Until a provider key exists, keep logging the email body in development.

### C. Public content, CMS, and teacher training

**What is missing:** homepage testimonials, FAQ, “why this platform”, teacher benefits; Terms and Privacy; confirm-password on register; availability as a directory filter; a clear **organic listing vs paid promotion** explanation; free teacher-training articles; admin CMS so those pages can change without a code deploy.

**What you need:**

- Final legal copy (Terms, Privacy) from the product owner / lawyer
- Brand, domain, and written training articles
- Product decision: is directory listing free for all approved teachers, with “featured” as paid promotion? (MVP already shows all approved teachers; featured are sorted first. Credits are required only to **receive new contacts**.)

**Code still to write:** CMS tables or a headless content model; training section; richer homepage; confirm-password field; availability filter.

### D. Richer dashboards

**Student still needs:** My Teachers, a dedicated reviews page, fuller profile and account settings.

**Teacher still needs:** last-communication on enquiries; timezone conversion of availability into the **student’s** local time; accept/decline lesson as an obvious first-class flow; admin “request more documents”; re-approval after sensitive profile edits.

**Admin still needs:** search users; verify certificates; edit a teacher profile; per-user activity; outstanding disputes; export financial CSV; configure which emails are sent.

**What you need:** product decisions on timezones and on which profile edits require re-approval. No vendor account required.

### E. Disputes, spam, and reporting

**What is missing:** a teacher/admin dispute on a deduction (investigate → approve/reject refund with a reason); reports/complaints table; stronger duplicate-enquiry and spam detection; contact-endpoint rate limits tuned for abuse; financial export.

**What you need:** a written refund policy (when a fake/spam enquiry is refundable). Admin wallet refund already exists; the **workflow UI and report entity** do not.

### F. Files, security, and production

**What is missing:** AWS S3 (files are on local disk); private certificate access (students must not open teacher documents by guessing a URL); database backups; JWT refresh rotation; CSRF tokens if cookies stay; API versioning (`/api/v1`); production deploy; backup/restore runbook.

**What you need:**

- AWS (or compatible) account for S3
- Hosting: Vercel (frontend) + a Node host for Nest, or AWS for both
- Production Postgres (RDS, Neon, etc.)
- A backup schedule
- Strong `JWT_SECRET` and `COOKIE_SECURE=true` behind HTTPS

### G. SEO and international

**What is missing:** `sitemap.xml`, `robots.txt`, per-teacher meta titles/descriptions, Open Graph previews, structured data, language filter, multi-currency display (teachers already have a currency field; there is no converter).

**What you need:** the public domain name. No paid SEO tool is required.

### H. Automatic Zoom / Google Meet rooms (explicitly later in the spec)

**MVP today:** teacher pastes a Zoom or Meet link. Join Class uses that link. This matches the spec’s own “initial implementation”.

**Full spec later:** create the meeting from the API when a lesson is scheduled.

**What you need:**

| Approach | You must provide |
|---|---|
| Zoom API | Zoom Marketplace app (Client ID, Secret, account) |
| Google Meet API | Google Cloud OAuth; Meet via API often needs Google Workspace |
| Jitsi (no vendor) | Nothing — we can generate `https://meet.jit.si/merit-{lessonId}` |

Do not block launch on Zoom/Meet APIs. Paste-a-link is enough for V1.

### I. Out of scope until after the full spec (spec says so)

- AI teacher matching
- SMS / WhatsApp notifications (unless budget is approved)
- Platform collecting **lesson** payments (must stay off-platform)

---

## 7. Recommended order for the next team

1. **Stripe (or PayPal) + webhooks + idempotent wallet credit** — without this, advertising revenue is not real.  
2. **Email provider + verification + password reset + lesson reminder emails.**  
3. **CMS, training, Terms/Privacy, organic vs promoted copy.**  
4. **Disputes, CSV export, spam controls, student “My Teachers”.**  
5. **S3, HTTPS deploy, backups, SEO, mobile/security/payment test pass.**  
6. **Zoom/Meet APIs only if the owner supplies credentials.**

Do not change the wallet rules while doing any of the above.

---

## 8. Where to look in the code

| Concern | Place |
|---|---|
| First-contact charge | `backend/src/enquiries/enquiries.service.ts` |
| Wallet ledger / admin adjust | `backend/src/wallets/wallets.service.ts` |
| Schema | `backend/prisma/schema.prisma` |
| Seed / demo users | `backend/prisma/seed.ts` |
| Auth | `backend/src/auth/` |
| Admin | `backend/src/admin/` |
| Public UI | `frontend/src/app/` |
| Dashboards | `frontend/src/app/dashboard/` |

---

## 9. GitHub

There was no git repository at the time the MVP was built. Before the first push:

```
git init
git add .
git status
```

Confirm `backend/.env` is **not** listed. `.gitignore` is set to exclude env files, `node_modules`, build output, and uploads. Keep `backend/.env.example`.

---

## 10. One-sentence summary for stakeholders

The MVP is a working teacher/student marketplace with approval, messaging, lessons via pasted Zoom/Meet links, and a correct advertising wallet (first contact is charged, repeats are not). To become the full spec, the next team must add **verified credit payments**, **email**, **CMS/training/legal pages**, **disputes and production hosting**, then optional Zoom/Meet APIs once credentials exist.
