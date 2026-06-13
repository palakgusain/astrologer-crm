# Astrologer CRM Management System

A modern Customer Relationship Management (CRM) application designed for astrology practitioners to manage clients, consultations, session notes, and payment records through a centralized dashboard.

# LIVE DEMO 
astrologer-crm-eta.vercel.app

## Features

### Authentication & Security

* Secure Login System
* Protected Routes
* Session-Based Authentication
* Password Hashing and Secure Session Management

### Dashboard

* Overview Statistics
* Total Clients
* Total Consultations
* Revenue Tracking
* Upcoming Appointments
* Recent Client Activity

### Client Management

* Create, View, Update, and Delete Clients
* Store Birth Date, Birth Time, and Birth Place
* Add Tags and Personal Notes
* Search and Filter Client Records

### Consultation Management

* Schedule Consultations
* Track Consultation Status
* Consultation Types and Duration
* Link Consultations to Clients
* Maintain Consultation History

### Payment Tracking

* Track Consultation Fees
* Payment Status Management
* Payment Method Recording
* Payment Notes
* Revenue Monitoring

### Session Notes

* Record Consultation Findings
* Store Gemstone Recommendations
* Save Remedies and Follow-Up Notes

### Search & Filtering

* Search Clients by Name, Phone, Email, or Tags
* Filter Consultations by Status
* Filter Consultations by Payment Status

## Enhancements Implemented

* Authentication System with Protected Access
* Payment Tracking Module
* Dashboard Revenue Statistics
* Secure User Session Management
* API-Based Architecture
* Production Database Integration with Neon PostgreSQL

## System Architecture

```text
Frontend (Next.js + TypeScript)
              ↓
        API Routes
              ↓
         Prisma ORM
              ↓
     Neon PostgreSQL
```

## Tech Stack

| Layer          | Technology                       |
| -------------- | -------------------------------- |
| Framework      | Next.js 15 (App Router)          |
| Language       | TypeScript                       |
| Database       | PostgreSQL (Neon) via Prisma ORM |
| ORM            | Prisma ORM                       |
| Styling        | Tailwind CSS v4                  |
| Authentication | Session-Based Authentication     |
| Icons          | Lucide React                     |
| Deployment     | Vercel                           |

## Prerequisites

* Node.js 18+ (Recommended: 20+)
* npm

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/palakgusain/astrologer-crm.git
cd astrologer-crm
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://neondb_owner:npg_wC4cLFNbKYT6@ep-floral-tooth-ah6kqylg.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="npg_wC4cLFNbKYT6"
```

### 4. Set Up Database

```bash
npm run db:push
npm run db:seed
```

The seed command loads sample clients and consultations so you can explore the application immediately.

### 5. Start Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

You will be redirected to the login page.

## Demo Credentials

**Email:** `astrologer@crm.com`

**Password:** `password123`

## Available Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `npm run dev`        | Start development server         |
| `npm run build`      | Build for production             |
| `npm run start`      | Start production server          |
| `npm run db:push`    | Push Prisma schema to PostgreSQL |
| `npm run db:seed`    | Seed sample data                 |
| `npm run db:migrate` | Create database migrations       |

## Project Structure

```text
src/
├── app/
│   ├── page.tsx                 # Dashboard
│   ├── login/                   # Authentication
│   ├── clients/                 # Client Management
│   ├── consultations/           # Consultation Management
│   └── api/                     # API Routes
├── components/                  # Reusable UI Components
└── lib/                         # Utilities, Prisma Client, Helpers

prisma/
├── schema.prisma                # Database Schema
└── seed.ts                      # Seed Data
```

## Database Models

### User

* Authentication Information
* Session Ownership
* Secure Access Control

### Client

* Personal Details
* Birth Information
* Notes and Tags
* Consultation Relationships

### Consultation

* Scheduling Information
* Session Notes
* Payment Details
* Consultation Status

## API Endpoints

| Method | Endpoint                 | Description          |
| ------ | ------------------------ | -------------------- |
| GET    | `/api/clients?search=`   | List/Search Clients  |
| POST   | `/api/clients`           | Create Client        |
| GET    | `/api/clients/:id`       | Get Client Details   |
| PUT    | `/api/clients/:id`       | Update Client        |
| DELETE | `/api/clients/:id`       | Delete Client        |
| GET    | `/api/consultations`     | List Consultations   |
| POST   | `/api/consultations`     | Create Consultation  |
| GET    | `/api/consultations/:id` | Get Consultation     |
| PUT    | `/api/consultations/:id` | Update Consultation  |
| DELETE | `/api/consultations/:id` | Delete Consultation  |
| GET    | `/api/dashboard`         | Dashboard Statistics |
| POST   | `/api/auth`              | User Authentication  |

## Deployment

The application is deployed using:

* Vercel
* Neon PostgreSQL
* Prisma ORM

Production deployment provides secure authentication, persistent database storage, and scalable hosting.

## Future Improvements

* WhatsApp Integration
* Appointment Reminder System
* Kundli PDF Uploads
* AI-Based Astrology Recommendations
* Advanced Analytics Dashboard
* Multi-User Role Management

## Documentation

* **PROJECT_NOTES.md** — Architecture, Design Decisions, and Future Scope
* **AI_USAGE.md** — AI Tool Usage Declaration

## License

Built as an assignment project for educational and evaluation purposes.

## Author

**Palak Gusain**
