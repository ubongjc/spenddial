# SpendDial

Live dial of discretionary spend left today; auto-tightens with upcoming bills; teaches pacing without spreadsheets.

## Overview

SpendDial is a financial tracking application that helps users manage their discretionary spending through a simple, intuitive dial interface. The app connects to your bank accounts, predicts upcoming bills, and shows you exactly how much you have left to spend each day.

## Repository Structure

This monorepo contains two sibling applications:

- **`spenddial_web/`** - Next.js web application
- **`spenddial_ios/`** - Native iOS application with SwiftUI

## Key Features

- **Live Spending Dial** - Real-time view of remaining discretionary budget
- **Bank Integration** - Automatic transaction syncing via aggregators
- **Predictive Billing** - Anticipates upcoming bills to adjust available budget
- **Category Management** - Envelope-like spending categories
- **Haptic Feedback** - (iOS) Tactile spending awareness
- **Merchant Suggestions** - Smart spending recommendations
- **Passkey Authentication** - WebAuthn-first security
- **Client-Side Encryption** - Sensitive data encrypted before upload

## Tech Stack

### Web
- Next.js 15, React 18, TypeScript 5
- Tailwind CSS + shadcn/ui
- PostgreSQL 16 + Prisma 5 + pgvector
- Clerk authentication (passkeys)
- Stripe payments
- Cloudflare R2 storage
- Sentry + OpenTelemetry

### iOS
- SwiftUI + Combine
- CryptoKit for encryption
- AuthenticationServices for passkeys
- StoreKit 2 for payments
- iOS 17+ target

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 16+
- Xcode 15+ (for iOS development)
- Apple Developer account (for iOS device testing)

### Quick Start

#### Web Application
```bash
cd spenddial_web
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma migrate dev
npm run dev
```

Visit http://localhost:3000

#### iOS Application
```bash
cd spenddial_ios
open SpendDial.xcodeproj
# Configure signing in Xcode
# Build and run (⌘R)
```

See individual README files in each directory for detailed setup instructions.

## Architecture

### Data Model
- **User** - User accounts with authentication
- **Account** - Connected bank accounts
- **Transaction** - Financial transactions with merchant data
- **DialState** - Current spending dial state
- **Bill** - Upcoming bills and subscriptions
- **Category** - Spending categories and budgets

### API
RESTful API with OpenAPI documentation. Key endpoints:
- `GET /api/health` - Health check
- `GET /api/dial` - Get current dial state
- `PATCH /api/dial` - Update dial state
- Bank connection, suggestions, and more

## Security & Privacy

- **Read-Only Banking** - No transfer permissions
- **Client-Side Encryption** - AES-GCM for sensitive data
- **Passkey Authentication** - WebAuthn/FIDO2
- **GDPR Compliance** - Data export and deletion
- **Minimal Data Collection** - Privacy-first design

## Monetization

- Freemium model with Plus tier
- Fintech partnerships
- Premium features (advanced analytics, multiple accounts, etc.)

## Development

### Project Structure
```
spenddial/
├── spenddial_web/        # Web application
│   ├── src/
│   │   ├── app/          # Next.js pages and API routes
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities
│   │   └── types/        # TypeScript types
│   └── prisma/           # Database schema
│
└── spenddial_ios/        # iOS application
    └── SpendDial/
        ├── App/          # App entry point
        ├── Features/     # Feature modules
        ├── Networking/   # API client
        ├── Crypto/       # Encryption
        └── Models/       # Data models
```

### API Documentation
See `spenddial_web/openapi.yaml` for full API documentation.

## Contributing

This is a private repository. For team members, please follow the standard PR workflow.

## License

Proprietary - All rights reserved