# SpendDial Web

Live dial of discretionary spend left today - Web Application

## Overview

SpendDial is a financial tracking application that helps users manage their discretionary spending through a simple, intuitive dial interface. The web application is built with Next.js 15, React 18, and TypeScript.

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL 16 with Prisma 5
- **Authentication:** Clerk (Passkey/WebAuthn-first)
- **Payments:** Stripe
- **Storage:** Cloudflare R2
- **Monitoring:** Sentry + OpenTelemetry

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- npm or yarn

### Installation

1. Clone the repository and navigate to the web directory:
```bash
cd spenddial_web
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in your values for:
- Database connection
- Clerk authentication keys
- Stripe keys
- Cloudflare R2 credentials
- Sentry DSN

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
spenddial_web/
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   │   ├── api/          # API endpoints
│   │   │   ├── health/   # Health check endpoint
│   │   │   └── dial/     # Dial state API
│   │   ├── sign-in/      # Authentication pages
│   │   └── sign-up/
│   ├── components/       # React components
│   ├── lib/              # Utility functions and shared code
│   │   ├── prisma.ts     # Prisma client singleton
│   │   └── utils.ts      # shadcn/ui utilities
│   └── types/            # TypeScript type definitions
├── prisma/
│   └── schema.prisma     # Database schema
├── openapi.yaml          # API documentation
└── package.json
```

## API Documentation

The API is documented using OpenAPI 3.0 specification. See `openapi.yaml` for full details.

### Key Endpoints

- `GET /api/health` - Health check
- `GET /api/dial` - Get current dial state
- `PATCH /api/dial` - Update dial state

## Authentication

The app uses Clerk for authentication with passkey (WebAuthn) support as the primary method, with magic link as a fallback.

## Database Schema

The main data models include:
- **User** - User accounts
- **Account** - Connected bank accounts
- **Transaction** - Financial transactions
- **DialState** - Current spending dial state
- **Bill** - Upcoming bills
- **Category** - Spending categories
- **Subscription** - User subscription tiers

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Security & Privacy

- Client-side encryption for sensitive data
- Read-only banking tokens
- GDPR-compliant data export and deletion
- Secure passkey authentication

## License

Proprietary
