# TikCredit Pro - AI Coding Agent Instructions

## Project Overview
TikCredit Pro is an ultra-premium financing platform for Algeria with a Next.js 14 frontend, Firestore backend, and multi-step form submission system. The app serves dual audiences: end-users (form submission) and admins (dashboard analytics with real-time updates).

**Tech Stack:** Next.js 14 (TypeScript), Tailwind CSS, Firebase/Firestore, React 18, ExcelJS, JSPDF, Server-Sent Events (SSE)

## Architecture & Data Flow

### High-Level Structure
```
Public Routes → Form Submit (/form) → API (/api/submissions/submit) → Firebase + Local + Email + SSE Broadcast
Admin Routes (/admin) → Auth Check → Dashboard ← API + Real-time SSE (/api/realtime/submissions)
```

### Authentication & Security
- **Admin Login:** Plain-text password in `ADMIN_PASSWORD` env var (compared at [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts#L1))
- **JWT Token System:** 8-hour expiring tokens signed with `JWT_SECRET` (32+ chars enforced) at [src/lib/auth.ts](src/lib/auth.ts)
- **Middleware:** [src/middleware.ts](src/middleware.ts) validates tokens for `/admin` routes; client-side handles redirects
- **Rate Limiting:** Strict limiter (5 attempts/min) on login to prevent brute force ([src/lib/rateLimit.ts](src/lib/rateLimit.ts))

### Data Persistence (Dual-Write Pattern)
- **Primary:** Firestore (Firebase Admin SDK server-side at [src/lib/firebase-admin.ts](src/lib/firebase-admin.ts))
- **Fallback:** Local JSON at `.tmp/submissions.json` (or `/tmp` on Vercel)
- **Form Submission:** Tries Firebase first → falls back to local → sends email → broadcasts via SSE
- **Admin Retrieval:** [src/app/api/submissions/list/route.ts](src/app/api/submissions/list/route.ts) merges Firebase + local submissions

### Real-Time Updates (SSE)
- **Endpoint:** [src/app/api/realtime/submissions/route.ts](src/app/api/realtime/submissions/route.ts) - Server-Sent Events for live dashboard
- **Hook:** [src/hooks/useRealtimeSubmissions.ts](src/hooks/useRealtimeSubmissions.ts) - React hook for SSE connection
- **Events:** `connected`, `new_submission`, `count_update`, `heartbeat`
- **Auto-reconnect:** 5 attempts with exponential backoff

### Email Notifications
- **Service:** [src/lib/emailService.ts](src/lib/emailService.ts) - Email with retry queue (3 attempts)
- **Providers:** Resend (recommended) or SendGrid, configured via `RESEND_API_KEY` or `SENDGRID_API_KEY`
- **Recipient:** `weshcredit@gmail.com` for all new submissions
- **Content:** HTML + plain text with submission summary

### Key Type Definitions
- `FormData` interface ([src/types/index.ts](src/types/index.ts)) - form fields with Arabic labels (wilaya, profession enums)
- `Submission` - wraps FormData + timestamp, metadata (IP, userAgent, source)

## Critical Developer Workflows

### Local Development
```bash
npm install          # Install deps (includes Firebase Admin SDK)
cp .env.example .env.local    # Copy template
# Edit .env.local: add ADMIN_PASSWORD + JWT_SECRET (32+ chars minimum)
npm run dev         # Start dev server on http://localhost:3000
```

### Pre-Production Validation
```bash
npm run type-check  # TypeScript check (no emit)
npm run lint        # ESLint validation
npm run build:production  # Full production build: lint → type-check → build
npm run security-audit    # Dependency audit (moderate level)
npm run clean       # Clear .next cache if stuck
```

### Deployment
- **Vercel (Recommended):** Auto-deploy from `main` branch; set env vars in Vercel Dashboard (NOT Git)
- **Firebase Hosting:** `npm run build && firebase deploy` after setting Firebase env vars
- **See:** [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md) (French) and [PRODUCTION.md](PRODUCTION.md)

## Project-Specific Conventions

### Environment Variables (Security-Critical)
- `ADMIN_PASSWORD`: Plain-text, min 1 char (no hashing - compared directly)
- `JWT_SECRET`: Min 32 chars (enforced in [src/lib/auth.ts](src/lib/auth.ts#L7))
- `FIREBASE_*`: Either use `service-account-key.json` OR separate env vars (priority: file > env)
- `RESEND_API_KEY` or `SENDGRID_API_KEY`: For email notifications
- `INTERNAL_API_TOKEN`: For SSE broadcast authentication
- `NEXT_PUBLIC_APP_URL`: Base URL for email links
- **NEVER commit** `.env.local` or service account files (already in .gitignore)

### Firebase Admin Initialization Pattern
At [src/lib/firebase-admin.ts](src/lib/firebase-admin.ts), attempts two strategies:
1. Load `service-account-key.json` from project root (if exists)
2. Fall back to env vars: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

This allows both local file and environment-based configurations.

### Form Validation
- **Phone:** Regex `/^(05|06|07)[0-9]{8}$/` (Algerian format, ~10 digits)
- **Email:** Optional but RFC-compliant when provided
- **Amount:** Min/max enforced (see [src/app/api/submissions/submit/route.ts](src/app/api/submissions/submit/route.ts#L181))

### UI/Component Patterns
- **Framer Motion animations:** Used for transitions and effects
- **Tailwind CSS:** Primary styling (no custom CSS files needed)
- **Glass-morphism design:** `GlassCard` component for cards with backdrop blur
- **Accessibility:** Lucide React icons, semantic HTML, Arabic RTL support
- **Design Tokens:** Centralized at [src/lib/design-tokens.ts](src/lib/design-tokens.ts)
- **AmountSlider:** Premium slider with dual input at [src/components/ui/AmountSlider.tsx](src/components/ui/AmountSlider.tsx)
  - Dual input (slider + numeric field, synchronized)
  - Quick amount buttons
  - Estimated monthly payment tooltip
  - Full keyboard + screen reader accessibility

### Export Formats
Admin dashboard supports: JSON, CSV, Excel (ExcelJS), PDF (jsPDF + autotable)
Export utilities at [src/lib/exportUtils.ts](src/lib/exportUtils.ts) - called from [DownloadModal.tsx](src/components/admin/DownloadModal.tsx)

### Date/Time Handling
Use `date-fns` for formatting (e.g., `format(new Date(timestamp), 'PPpp')` for locale-aware display)

## Integration Points & External Dependencies

### Firebase Integration
- **Public app config** in [src/lib/firebase.ts](src/lib/firebase.ts) (hardcoded, safe)
- **Admin SDK** in [src/lib/firebase-admin.ts](src/lib/firebase-admin.ts) (requires credentials from env/file)
- **Client collection:** `submissions` in Firestore (no auth required for reads; admin SDK enforces security rules)

### API Routes
- `/api/auth/login` → Validates password, returns JWT token
- `/api/auth/verify` → Checks if token is valid
- `/api/auth/logout` → Clears token cookie
- `/api/submissions/submit` → Receives form, saves to Firebase + local, sends email, broadcasts via SSE
- `/api/submissions/list` → Fetches all submissions (auth required), merges sources
- `/api/realtime/submissions` → GET: SSE stream for live updates; POST: broadcast new submission

### Security Rules
[firestore.rules](firestore.rules) restricts reads/writes to **server-side admin SDK only** (no direct client access)

## Common Troubleshooting & Edge Cases

### Firebase Connection Issues
- Verify `FIREBASE_PRIVATE_KEY` has `\n` characters (not literal newlines)
- Check Firebase Admin SDK permissions in Google Cloud IAM
- Confirm Firestore database exists and is in Production mode

### Build Failures
1. Clear `.next` cache: `npm run clean`
2. Verify TypeScript: `npm run type-check`
3. Check ESLint: `npm run lint:fix`
4. Ensure `NODE_ENV=production` for production builds

### Admin Dashboard Not Loading Submissions
- Verify token is valid (check expiry: 8 hours from login)
- Check `/api/submissions/list` response for `source` field (firebase/local/browser)
- If local submissions exist, they'll appear even if Firebase fails

### Rate Limiting Test
Login endpoint returns HTTP 429 with `Retry-After` header after 5 failed attempts in 1 minute

## Reference Documentation
- **Security:** [SECURITY.md](SECURITY.md) & [SECURITY-NOTICE.md](SECURITY-NOTICE.md) (credential exposure history)
- **Firebase Setup:** [FIREBASE-SETUP-GUIDE.md](FIREBASE-SETUP-GUIDE.md)
- **Firebase Submissions:** [FIREBASE-SUBMISSIONS-GUIDE.md](FIREBASE-SUBMISSIONS-GUIDE.md)
- **Deployment:** [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md), [PRODUCTION.md](PRODUCTION.md)
- **Quick Start:** [README.md](README.md) & [VERCEL-QUICK-SETUP.md](VERCEL-QUICK-SETUP.md)

## When Adding Features

1. **New Form Fields:** Update `FormData` interface in [src/types/index.ts](src/types/index.ts); also add to Firestore submission structure
2. **New Admin Filters:** Extend `filterSubmissions()` in [src/lib/utils.ts](src/lib/utils.ts) and add UI in [AdminDashboard.tsx](src/components/admin/AdminDashboard.tsx)
3. **New API Endpoints:** Follow auth/rate-limit pattern from login route; protect with middleware if needed
4. **UI Components:** Keep using Tailwind + Framer Motion; follow existing component patterns in [src/components/ui/](src/components/ui/)
5. **Localization:** All user-facing text uses Arabic; maintain RTL layout consistency
