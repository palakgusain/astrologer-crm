# Project Notes — Astrologer CRM Management System

## Tech Stack

| Component      | Choice                       | Rationale                                                                |
| -------------- | ---------------------------- | ------------------------------------------------------------------------ |
| Framework      | Next.js 15                   | Full-stack architecture with frontend and backend in a single repository |
| Database       | Neon PostgreSQL + Prisma ORM | Cloud-hosted relational database with production-ready persistence       |
| Language       | TypeScript                   | Type safety across API routes, database operations, and UI               |
| Styling        | Tailwind CSS v4              | Rapid and responsive UI development                                      |
| Authentication | JWT + bcrypt                 | Lightweight authentication with secure password hashing                  |
| ORM            | Prisma ORM                   | Type-safe database access and schema management                          |
| Hosting        | Vercel                       | Fast deployment and seamless integration with Next.js                    |
| Icons          | Lucide React                 | Lightweight and consistent icon system                                   |

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Browser (React UI)                      │
│ Login │ Dashboard │ Clients │ Consultations │ Payments     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTP Requests + Session Cookie
                          ▼
┌─────────────────────────────────────────────────────────────┐
│          Next.js Middleware + API Route Handlers           │
│ /api/auth  /api/clients  /api/consultations  /dashboard    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ Prisma ORM
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Neon PostgreSQL Database                  │
│        User │ Client ←→ Consultation (with payments)       │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### User

Stores authentication and account information.

Fields:

* id
* name
* email
* passwordHash
* createdAt
* updatedAt

### Client

Stores astrology client information.

Fields:

* Contact Information
* Birth Date
* Birth Time
* Birth Place
* Tags
* Notes

### Consultation

Stores consultation and payment information.

Fields:

* Scheduled Date & Time
* Consultation Type
* Duration
* Status
* Session Notes
* Fee
* Payment Status
* Payment Method
* Payment Notes

Relationship:

* One Client → Many Consultations
* Consultation records are automatically deleted when the associated client is removed (Cascade Delete)

## Authentication

Authentication is implemented using JWT-based session management.

Features:

* Email and Password Login
* bcrypt Password Hashing
* HTTP-Only Session Cookies
* Protected API Routes
* Protected Dashboard Pages
* Middleware-Based Route Protection

Demo Credentials:

```text
Email: astrologer@crm.com
Password: password123
```

Protected Routes:

* Dashboard
* Clients
* Consultations
* Payment Features
* API Endpoints

## Payment Tracking

Payment information is maintained directly within consultation records.

Features:

* Consultation Fee Tracking
* Payment Status Management
* Payment Method Recording
* Revenue Monitoring
* Pending Payment Tracking

Supported Payment Statuses:

* Pending
* Paid
* Partial
* Waived

Supported Payment Methods:

* Cash
* UPI
* Bank Transfer
* Card

Dashboard Revenue Metrics:

* Total Revenue
* Pending Payments
* Paid Consultations

## Key Design Decisions

### 1. Full-Stack Next.js Architecture

A single repository was chosen to simplify development, deployment, and maintenance.

### 2. Neon PostgreSQL

Neon PostgreSQL was selected instead of SQLite to support cloud deployment and persistent production data.

### 3. Prisma ORM

Prisma provides type-safe queries, schema management, and easy migration handling.

### 4. Custom JWT Authentication

JWT authentication provides lightweight security without requiring external authentication providers.

### 5. Payment Tracking Within Consultations

Payment data is linked directly to consultations, reducing schema complexity while maintaining business requirements.

### 6. API-Driven Design

All business logic is exposed through secure API routes, improving maintainability and scalability.

## Assumptions

1. Single astrologer account is used for the application.
2. Indian Rupee (INR) is used for payment calculations.
3. Birth time is stored in HH:MM format.
4. Date formatting follows Indian locale conventions.
5. Internet connectivity is available for cloud database access.
6. Authentication is required before accessing CRM functionality.

## What Was Built (Scope)

| Feature                       | Status |
| ----------------------------- | ------ |
| Authentication (Login/Logout) | Done   |
| Protected Routes              | Done   |
| Client CRUD Operations        | Done   |
| Birth Details Management      | Done   |
| Client Notes & Tags           | Done   |
| Consultation Scheduling       | Done   |
| Session Notes                 | Done   |
| Payment Tracking              | Done   |
| Revenue Dashboard             | Done   |
| Dashboard Analytics           | Done   |
| Search Functionality          | Done   |
| Consultation Filters          | Done   |
| PostgreSQL Integration        | Done   |
| Vercel Deployment Support     | Done   |
| Seed Data Generation          | Done   |

## Future Improvements

* WhatsApp Integration
* Email/SMS Appointment Reminders
* Kundli PDF Upload and Storage
* AI-Based Astrology Recommendations
* Calendar View
* Revenue Reports and Analytics
* CSV/Excel Export
* Multi-User Support
* Role-Based Access Control
* Payment Receipt Generation

## Known Limitations

* No password reset functionality
* No self-registration flow
* No pagination for large datasets
* No email notification service
* Limited analytics and reporting
* Single-user architecture only

## Deployment

Production deployment stack:

* Vercel
* Neon PostgreSQL
* Prisma ORM
* Next.js 15

This architecture provides secure authentication, persistent cloud storage, and scalable hosting suitable for production environments.
