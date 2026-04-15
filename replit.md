# SSI Platform — Single Smart Interface

## Overview

A full-stack, production-quality, AI-powered digital inclusion platform for India — a unified super app for accessing government, financial, healthcare, and identity-based services. Designed for both urban smartphone users and rural kiosk-based users.

### SSI / Blockchain Features (W3C Standards)
- **Decentralized Identifiers (DIDs)**: `did:ssi:{sha256-32-hex}` format, W3C DID v1.0, stored in `did_documents` table
- **Verifiable Credentials (VCs)**: W3C VC data model, SHA-256 proofs, EcdsaSecp256k1Signature2019, stored in `verifiable_credentials`
- **Blockchain Anchoring**: Simulated Polygon Mumbai testnet tx hashes + block numbers in `blockchain_ledger`
- **IPFS CID simulation**: `bafybei{hex}` format CIDs
- **Issuer DID**: `did:ssi:govt-india-uidai`
- **Credential Wallet** (`/credentials`): Browse, share via QR, verify, revoke VCs
- **Verification Portal** (`/verify`): Public portal — input credential ID, shows full blockchain proof
- **Admin Panel** (`/admin`): "Issue All VCs" button + per-credential revoke controls
- **DigiLocker** (`/documents`): Each doc shows "VC Active" badge, block number, Share VC/Verify buttons
- **Profile** (`/profile`): DID card with live QR code, Copy DID, Show QR dialog

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + ShadCN UI + Framer Motion
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2 for chat)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server — all backend routes
│   └── ssi-platform/       # React frontend at /
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── integrations-openai-ai-server/  # OpenAI server-side integration
│   └── integrations-openai-ai-react/   # OpenAI React hooks (voice)
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

### 1. Identity Layer
- User profile with SSI ID (unique ID), name, phone, language preference
- Single default user (can be extended to multi-user with auth)

### 2. AI Assistant
- Floating chat widget visible on all pages
- Full-page AI chat at /ai-assistant
- Streaming responses via SSE (gpt-5.2)
- Multilingual: English, Hindi, Kannada
- Voice input hook available via integrations-openai-ai-react

### 3. Dashboard
- Service module cards: ATM, Documents, Forms, Healthcare, Payments, Schemes, Notifications
- Live data counts from backend
- Recent activity log
- Collapsible sidebar navigation
- Language switcher (EN/HI/KN)
- Dark/Light mode toggle

### 4. Service Modules
- **ATM Assistant** (/atm) — Step-by-step guided ATM workflow
- **Documents** (/documents) — DigiLocker simulation (Aadhaar, PAN, DL, Voter ID)
- **Forms** (/forms, /forms/:id) — Dynamic government form builder with AI help
- **Healthcare** (/healthcare) — Health records, vitals, AI report explanation
- **Payments** (/payments) — Bill payments, UPI simulation, transaction history
- **Schemes** (/schemes) — Government scheme directory with eligibility check
- **Notifications** (/notifications) — Notification center with mark-as-read
- **Profile** (/profile) — User settings, language, Kiosk Mode toggle

### 5. Kiosk Mode
- Toggle in profile page
- Larger buttons and text for low-literacy users
- Context available via KioskModeContext

### 6. Multilingual Support
- i18n via LanguageContext
- Languages: English, Hindi, Kannada
- AI responds in selected language

## Database Tables

- `users` — user profiles with SSI ID
- `activity_log` — user activity log
- `documents` — DigiLocker documents
- `government_forms` — form definitions with JSON fields
- `form_submissions` — submitted forms
- `health_profiles` — health vitals and info
- `health_records` — medical records/reports
- `transactions` — payment transactions
- `bills` — pending and paid bills
- `schemes` — government schemes
- `complaints` — complaint/issue reports
- `notifications` — user notifications
- `conversations` — AI chat conversations
- `messages` — AI chat messages

## API Routes (all under /api)

- `GET /api/healthz` — health check
- `GET/PUT /api/users/profile` — user profile
- `GET /api/users/activity` — activity log
- `GET /api/documents` — list documents
- `GET /api/documents/:id` — single document
- `GET /api/forms` — list government forms
- `GET /api/forms/:id` — form with fields
- `POST /api/forms/:id/submit` — submit form
- `GET /api/health/profile` — health profile
- `GET /api/health/records` — health records
- `GET /api/payments` — transactions
- `GET /api/payments/bills` — pending bills
- `POST /api/payments/pay` — make payment
- `GET /api/schemes` — government schemes
- `GET /api/schemes/:id/eligibility` — eligibility check
- `POST /api/schemes/complaints` — file complaint
- `GET /api/notifications` — notifications
- `POST /api/notifications/:id/read` — mark read
- `GET /api/dashboard/summary` — dashboard stats
- `GET/POST /api/openai/conversations` — AI conversations
- `GET/DELETE /api/openai/conversations/:id` — single conversation
- `GET/POST /api/openai/conversations/:id/messages` — messages (SSE streaming)

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-set by Replit)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Replit AI proxy base URL
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI proxy API key
- `SESSION_SECRET` — session secret
- `PORT` — assigned port per artifact

## Running

- API server: `pnpm --filter @workspace/api-server run dev`
- Frontend: `pnpm --filter @workspace/ssi-platform run dev`
- Codegen: `pnpm --filter @workspace/api-spec run codegen`
- DB push: `pnpm --filter @workspace/db run push`
