# Project Context — OneThing Invoice

## What This Is

A browser-based invoice generation SaaS app called **OneThing Invoice** (domain: `makeinvoices.app`). Users create invoice templates, generate PDF invoices, and manage invoice history. Authentication is passwordless via magic links.

## Tech Stack

### Frontend (`/frontend`)
- **React 19** with TypeScript (~5.9)
- **Vite 7** (build tool, dev server on port 5173)
- **Tailwind CSS 3** + **shadcn/ui** (Radix primitives + `class-variance-authority`)
- **react-router-dom v7** (client-side routing)
- **@react-pdf/renderer** (PDF generation in-browser)
- **react-hook-form** (forms)
- **lucide-react** + **react-icons** (icons)
- **sonner** (toast notifications)
- **next-themes** (dark/light theme via `use-theme` hook)
- **react-helmet-async** (SEO meta tags)
- **recharts** (charts/stats)
- **pako** (compression)

### Backend/Infrastructure (`/infra`)
- **AWS CDK** (TypeScript, `aws-cdk-lib ^2.239`)
- **AWS Region**: `eu-west-1`
- **Services**: Cognito (auth), API Gateway, Lambda, DynamoDB, SES (emails)
- **Lambda functions** at `/infra/lambda/invoice-api/`:
  - `save-template.ts`, `get-template.ts`
  - `save-invoice.ts`, `get-invoice.ts`, `list-invoices.ts`, `delete-invoice.ts`
  - `get-usage.ts`, `get-global-stats.ts`
  - `save-feedback.ts`

## Architecture

```
Browser (React SPA)
  ├── Auth: AWS Cognito passwordless (magic links)
  ├── API: REST via API Gateway → Lambda → DynamoDB
  └── PDF: Generated client-side with @react-pdf/renderer
```

### Authentication
- Passwordless magic links via AWS Cognito custom auth flow
- Tokens stored in `localStorage`
- Auto-refresh 30s before expiry
- Session lasts 30 days (refresh token lifetime)
- Auth library: custom implementation at `src/lib/auth/`

### Runtime Config
- Dev: `.env` with `VITE_USER_POOL_ID`, `VITE_USER_POOL_CLIENT_ID`, `VITE_API_URL`, `VITE_REGION`
- Prod: fetched from `/config.json` at runtime

## Frontend Structure

```
frontend/src/
├── pages/           # Route-level components (Index, Login, InvoiceWorkspace, About, Privacy, Terms, Support)
├── components/      # Shared components
│   ├── ui/          # shadcn/ui primitives (button, dialog, card, etc.)
│   ├── invoiceWorkspace/  # Workspace tabs (GenerateTab, HistoryTab, TemplateTab, InvoicePreview)
│   ├── Header.tsx, Footer.tsx, FeedbackDialog.tsx, ProtectedRoute.tsx, SEO.tsx
│   └── SISLogo.tsx, SISLogoIcon.tsx, ThemeToggle.tsx
├── lib/
│   ├── auth/        # Full auth implementation (cognito-api, magic-link, refresh, storage, etc.)
│   ├── api-client.ts      # API client with auto-refresh (templateApi, invoiceApi, usageApi, feedbackApi, statsApi)
│   ├── InvoicePdfDocument.tsx  # PDF template component
│   ├── exportPdf.ts       # PDF export logic
│   ├── invoice-design-system.ts
│   ├── currencySymbols.ts
│   ├── storage.ts         # localStorage utilities
│   └── utils.ts           # cn() helper, etc.
├── config/
│   ├── runtime-config.ts  # Loads env vars (dev) or /config.json (prod)
│   └── currencies.ts
├── hooks/           # use-mobile, use-theme, use-toast
├── types/           # invoice.ts (InvoiceTemplate, LineItem, Invoice interfaces)
└── assets/
```

## Routes

| Path | Component | Auth |
|------|-----------|------|
| `/` | Index (landing page) | Public |
| `/login` | Login (magic link flow) | Public |
| `/workspace` | InvoiceWorkspace | Protected |
| `/about` | About | Public |
| `/privacy` | Privacy | Public |
| `/terms` | Terms | Public |
| `/support` | Support | Public |

## Key Commands

```bash
# Frontend
cd frontend
npm run dev        # Start dev server (Vite, port 5173)
npm run build      # TypeScript check + Vite production build
npm run lint       # ESLint
npm run preview    # Preview production build

# Infrastructure
cd infra
npm run deploy     # CDK deploy
npm run synth      # CDK synth
npm run diff       # CDK diff
npm run deploy:prod  # Deploy with AWS_PROFILE=ske-dev DEPLOY_ENV=prod
```

## Key Types

```typescript
interface InvoiceTemplate {
  seller_name, seller_address_line1/2, seller_country, seller_phone, seller_email
  seller_extra_fields?: string[]
  issuer_name, issuer_address, issuer_tax_id, issuer_email
  client_name, client_address, client_tax_id, client_extra_fields?: string[]
  currency, salary_rate, rate_unit: "monthly" | "daily" | "hourly"
  description, payment_terms, bank_name, iban, swift_bic
  line_items?: LineItem[]
  tax_rate?: number
}

interface LineItem { description, details, quantity, unit, rate, amount }

interface Invoice { invoice_number, invoice_date, due_date, amount, currency, notes, pdf_url? }
```

## API Endpoints (via api-client.ts)

- `GET /templates` — get user's template
- `POST /templates` — save template
- `GET /invoices` — list invoices
- `GET /invoices/:id` — get single invoice
- `POST /invoices` — save invoice
- `DELETE /invoices/:id` — delete invoice
- `GET /usage` — user usage stats
- `POST /feedback` — submit feedback
- `GET /stats` — global stats (public, no auth)

## Conventions

- UI components use shadcn/ui pattern: Radix primitive + Tailwind + CVA variants
- Path aliases: `@/` maps to `src/`
- Theme: light/dark via `next-themes`, storage key `sis-ui-theme`
- Currency support: EUR, USD, UAH (extensible via `currencySymbols.ts`)
- Form state: `react-hook-form`
- Notifications: `sonner` toasts
- API auth: `Authorization: Bearer <idToken>` header, auto-refresh on expiry

## Current State (v0.9.0)

- Core features working: template creation, invoice generation, PDF export, history
- Auth fully implemented with magic links
- Infrastructure deployed to AWS (eu-west-1)
- SEO optimization done (meta tags, sitemap, robots.txt, OG images)
- Feedback system with email notifications
- Dark/light theme support
- Mobile responsive
