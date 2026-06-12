# Project Notes — Astrologer CRM

## Tech Stack

| Component   | Choice              | Rationale                                              |
| ----------- | ------------------- | ------------------------------------------------------ |
| Framework   | Next.js 15          | Full-stack in one repo; fast to ship for a 48h window  |
| Database    | SQLite + Prisma     | Zero external setup; file-based DB is enough for demo  |
| Language    | TypeScript          | Type safety across API and UI                          |
| Styling     | Tailwind CSS v4     | Rapid UI development without a heavy component library |
| Auth        | JWT + bcrypt        | Lightweight session auth without external services     |
| Icons       | Lucide React        | Lightweight, consistent icon set                       |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (React)                      │
│  Login │ Dashboard │ Clients │ Consultations            │
└──────────────────────────┬──────────────────────────────┘
                           │ fetch() + session cookie
┌──────────────────────────▼──────────────────────────────┐
│         Next.js Middleware + API Routes (auth guard)       │
│  /api/auth  /api/clients  /api/consultations  /dashboard  │
└──────────────────────────┬──────────────────────────────┘
                           │ Prisma ORM
┌──────────────────────────▼──────────────────────────────┐
│                    SQLite (dev.db)                       │
│         User │ Client ←→ Consultation (with payments)     │
└─────────────────────────────────────────────────────────┘
```

### Data Model

- **User** — Astrologer login (email, password hash, name)
- **Client** — Core entity with contact info, birth details (date/time/place), tags, and general notes
- **Consultation** — Linked to a client; stores schedule, type, duration, status, session notes, and payment fields (fee, paymentStatus, paymentMethod, paidAt, paymentNotes)

Relationship: one client has many consultations (cascade delete).

### Authentication

- Email/password login with bcrypt password hashing
- JWT stored in HTTP-only cookie (`acrm_session`, 7-day expiry)
- Next.js middleware protects all pages and API routes except `/login` and `/api/auth`
- Single demo user seeded: `astrologer@crm.com` / `password123`

### Payment Tracking

- **Fee** — Consultation charge in INR
- **Payment status** — `pending`, `paid`, `partial`, `waived`
- **Payment method** — `cash`, `upi`, `bank_transfer`, `card`
- **Paid at** — Auto-set when status changes to `paid`
- Dashboard shows total revenue (sum of paid fees) and pending payment count

### Key Design Decisions

1. **Monolithic Next.js app** — Chosen over separate frontend/backend to reduce setup overhead.
2. **Custom JWT auth** — Avoids NextAuth complexity for a single-user assignment scope.
3. **Payment on Consultation** — Keeps billing tied to sessions rather than a separate invoices table.
4. **REST API routes** — All routes require authentication via shared `requireAuth()` helper.

## Assumptions

1. **Single user** — One astrologer account; multi-tenant support not implemented.
2. **INR currency** — Fees displayed in Indian Rupees.
3. **Birth time format** — Stored as a simple time string (HH:MM).
4. **Indian locale** — Date formatting uses `en-IN` locale.
5. **SQLite is sufficient** — For demo/assignment purposes; production would use PostgreSQL.

## What Was Built (Scope)

| Feature                    | Status |
| -------------------------- | ------ |
| Authentication (login/logout) | Done |
| Client CRUD                | Done   |
| Birth details (date/time/place) | Done |
| Client tags and notes      | Done   |
| Consultation scheduling    | Done   |
| Session notes              | Done   |
| Payment tracking           | Done   |
| Revenue dashboard stats    | Done   |
| Status management          | Done   |
| Dashboard with stats       | Done   |
| Client search              | Done   |
| Consultation filters       | Done   |
| Seed data                  | Done   |

## Future Improvements

- **Reminders** — Email/SMS notifications for upcoming consultations
- **Birth chart storage** — Upload or link generated kundli/chart PDFs
- **Calendar view** — Visual weekly/monthly schedule
- **Export** — CSV export of clients and consultation history
- **Multi-user support** — Separate accounts for multiple astrologers
- **Payment receipts** — Generate PDF invoices per consultation

## Known Limitations

- No password reset or registration flow
- No pagination on list views
- Delete operations have no undo
- Invalid client ID on consultation create returns 500
