# Astrologer CRM

A lightweight CRM built for astrology practitioners to manage clients, schedule consultations, and record session notes.

## Features

- **Dashboard** — Overview stats, today's sessions, upcoming appointments, recent clients, revenue
- **Authentication** — Secure login for the astrologer (JWT session cookie)
- **Client Management** — CRUD with birth details (date, time, place), tags, and notes
- **Consultation Tracking** — Schedule sessions, set type/duration/status, link to clients
- **Payment Tracking** — Record fee, payment status, method, and notes per consultation
- **Session Notes** — Record findings, gemstone recommendations, and remedies per consultation
- **Search & Filter** — Search clients by name, phone, email, or tags; filter consultations by status and payment

## Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Framework  | Next.js 15 (App Router) |
| Language   | TypeScript              |
| Database   | SQLite via Prisma ORM   |
| Styling    | Tailwind CSS v4         |
| Icons      | Lucide React            |

## Prerequisites

- Node.js 18+ (recommended: 20+)
- npm

## Getting Started

### 1. Install dependencies

```bash
cd "C:\Users\abc\Downloads\astrologer crm (1)\astrologer crm"
npm install
```

### 2. Set up the database

```bash
npm run db:push
npm run db:seed
```

The seed command loads sample clients and consultations so you can explore the app immediately.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to the login page.

**Demo credentials:** `astrologer@crm.com` / `password123`

Set `AUTH_SECRET` in `.env` for production (see `.env` file).

## Available Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start development server             |
| `npm run build`    | Build for production                 |
| `npm run start`    | Start production server              |
| `npm run db:push`  | Push Prisma schema to SQLite         |
| `npm run db:seed`  | Seed sample data                     |
| `npm run db:migrate` | Create a migration (optional)      |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Dashboard
│   ├── clients/                 # Client list, create, detail
│   ├── consultations/           # Consultation list, create, detail
│   └── api/                     # REST API routes
├── components/                  # Reusable UI components
└── lib/                         # Prisma client, utils, constants
prisma/
├── schema.prisma                # Database schema
└── seed.ts                      # Sample data
```

## API Endpoints

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | `/api/clients?search=`      | List/search clients      |
| POST   | `/api/clients`              | Create client            |
| GET    | `/api/clients/:id`          | Get client with history  |
| PUT    | `/api/clients/:id`          | Update client            |
| DELETE | `/api/clients/:id`          | Delete client            |
| GET    | `/api/consultations`        | List consultations       |
| POST   | `/api/consultations`        | Create consultation      |
| GET    | `/api/consultations/:id`    | Get consultation         |
| PUT    | `/api/consultations/:id`    | Update consultation      |
| DELETE | `/api/consultations/:id`    | Delete consultation      |
| GET    | `/api/dashboard`            | Dashboard statistics     |

## Documentation

- [PROJECT_NOTES.md](./PROJECT_NOTES.md) — Architecture, assumptions, future improvements
- [AI_USAGE.md](./AI_USAGE.md) — AI tool usage declaration

## License

Built as an assignment project.
