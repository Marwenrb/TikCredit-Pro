# TikCredit Pro - Quick Reference Guide

## Quick Start (5 minutes)

```bash
# 1. Clone & install
git clone <url> tikcredit-pro
cd tikcredit-pro
npm install

# 2. Setup environment
cp env.example .env.local
# Edit .env.local: Add ADMIN_PASSWORD and JWT_SECRET

# 3. Run
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

## Essential Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm start                  # Start production server

# Code Quality
npm run type-check         # Check TypeScript
npm run lint               # Check code style
npm run lint:fix           # Auto-fix lint errors
npm run security-audit     # Security check
npm run clean              # Clear cache

# Analysis
npm run analyze            # Bundle size analysis
npm run deploy:check       # Deployment checks
```

---

## File Locations Cheat Sheet

```
Component Library           → src/components/ui/
Form Component              → src/components/form/CleanForm.tsx
Admin Dashboard             → src/components/admin/AdminDashboard.tsx

Form Submit API             → src/app/api/submissions/submit/route.ts
Admin Login API             → src/app/api/auth/login/route.ts
List Submissions API        → src/app/api/submissions/list/route.ts
Real-time SSE API          → src/app/api/realtime/submissions/route.ts

Type Definitions           → src/types/index.ts
Authentication Logic       → src/lib/auth.ts
Firebase Setup             → src/lib/firebase-admin.ts
Email Service              → src/lib/emailService.ts
Rate Limiting              → src/lib/rateLimit.ts
Utilities                  → src/lib/utils.ts
Design Tokens              → src/lib/design-tokens.ts

Environment Variables      → .env.local (create from env.example)
Firebase Rules             → firestore.rules
Tailwind Config            → tailwind.config.ts
TypeScript Config          → tsconfig.json
```

---

## Port Numbers

| Service | Port | URL |
|---------|------|-----|
| Dev Server | 3000 | http://localhost:3000 |
| Database | 5432 | N/A |
| Cache | 6379 | N/A |

---

## API Quick Reference

### Submit Form
```bash
POST /api/submissions/submit
Content-Type: application/json

{
  "fullName": "أحمد محمد",
  "phone": "0512345678",
  "email": "ahmad@example.com",
  "wilaya": "الجزائر",
  "profession": "موظف",
  "monthlyIncomeRange": "50,000 - 80,000 د.ج",
  "financingType": "قرض شخصي",
  "requestedAmount": 10000000,
  "salaryReceiveMethod": "حساب بنكي"
}
```

### Admin Login
```bash
POST /api/auth/login
Content-Type: application/json

{"password": "YourPassword"}
```

### Get Submissions
```bash
GET /api/submissions/list
Cookie: token=YOUR_JWT_TOKEN
```

### Real-time Events
```javascript
const sse = new EventSource('/api/realtime/submissions')
sse.addEventListener('new_submission', console.log)
```

---

## Tailwind Color Quick Reference

```tsx
// Primary (Blue)
<div className="bg-elegant-blue">Primary</div>           // #1E3A8A
<div className="bg-elegant-blue-light">Light</div>      // #3B82F6
<div className="text-elegant-blue">Text</div>

// Accent (Gold)
<div className="bg-premium-gold">Gold</div>              // #F59E0B
<div className="text-premium-gold-light">Light</div>    // #FCD34D

// Neutral
<div className="text-luxury-charcoal">Dark text</div>   // #374151
<div className="bg-luxury-offWhite">Background</div>    // #F9FAFB
<div className="border-luxury-gray">Border</div>        // #E5E7EB

// Status
<div className="text-status-success">Success</div>      // #10B981 (Green)
<div className="text-status-error">Error</div>          // #EF4444 (Red)
<div className="text-status-warning">Warning</div>      // #F59E0B (Orange)
<div className="text-status-info">Info</div>            // #3B82F6 (Blue)
```

---

## Framer Motion Quick Reference

```tsx
import { motion } from 'framer-motion'

// Fade in
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

// Slide
<motion.div initial={{ x: -50 }} animate={{ x: 0 }}>

// Scale
<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>

// Hover effects
<motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>

// Spring animation
<motion.div animate={{ x: 100 }} transition={{ type: 'spring', stiffness: 300 }}>

// List animation
<motion.div layout>... content ...</motion.div>
```

---

## Database Query Examples

### Firebase/Firestore (Server-side)

```typescript
import { adminDb } from '@/lib/firebase-admin'

// Get all submissions
const snapshot = await adminDb
  .collection('submissions')
  .get()

snapshot.forEach(doc => {
  console.log(doc.data())
})

// Get by ID
const doc = await adminDb
  .collection('submissions')
  .doc('doc-id')
  .get()

// Add new submission
await adminDb.collection('submissions').add({
  id: 'uuid',
  timestamp: new Date().toISOString(),
  data: formData
})

// Filter by field
const filtered = await adminDb
  .collection('submissions')
  .where('phone', '==', '0512345678')
  .get()
```

---

## Component Examples

### Create a Simple Component

```tsx
// src/components/MyCard.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface MyCardProps {
  title: string
  description: string
}

const MyCard: React.FC<MyCardProps> = ({ title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white rounded-lg shadow-lg border border-luxury-gray"
    >
      <h3 className="text-lg font-bold text-elegant-blue mb-2">
        {title}
      </h3>
      <p className="text-sm text-luxury-darkGray">
        {description}
      </p>
    </motion.div>
  )
}

export default MyCard
```

### Create an API Endpoint

```ts
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Hello World'
  })
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  return NextResponse.json({
    success: true,
    received: data
  })
}
```

---

## Git Workflow

```bash
# Check status
git status

# Create a new branch
git checkout -b feature/my-feature

# Make changes and stage them
git add .

# Commit with message
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update readme"

# Push to remote
git push origin feature/my-feature

# Create Pull Request on GitHub
# Then merge to main

# Update local main
git checkout main
git pull origin main
```

---

## Environment Variables Quick Setup

```env
# Required
ADMIN_PASSWORD=MySecurePassword
JWT_SECRET=abcdefghijklmnopqrstuvwxyz1234567890

# Optional (Email)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
# OR
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx

# Optional (Firebase)
FIREBASE_PROJECT_ID=my-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@my-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----"

# Optional (Features)
NEXT_PUBLIC_APP_URL=http://localhost:3000
INTERNAL_API_TOKEN=random-token-here
```

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| Port 3000 in use | `npm run dev -- -p 3001` |
| Module not found | Check file path, ensure `.tsx` extension |
| Firebase error | Regenerate service account key |
| Email not sent | Check API key in `.env.local` |
| TypeScript error | Run `npm run type-check` |
| Build fails | Run `npm run clean` then `npm run build` |

---

## Testing in Browser

```javascript
// Open DevTools (F12) → Console

// Test API
fetch('/api/submissions/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Test',
    phone: '0512345678',
    wilaya: 'الجزائر',
    // ... other fields
  })
})
.then(r => r.json())
.then(console.log)

// Check localStorage
localStorage.getItem('form-draft')
localStorage.setItem('test-key', 'test-value')
localStorage.clear()

// Check cookies
document.cookie
```

---

## Useful Links

- **Local Dev:** http://localhost:3000
- **Form:** http://localhost:3000/form
- **Admin:** http://localhost:3000/admin
- **Firebase:** https://console.firebase.google.com
- **Vercel:** https://vercel.com/dashboard
- **GitHub:** https://github.com/your-repo

---

## Performance Checklist

- [ ] Images are optimized (WebP/AVIF)
- [ ] Components are memoized (React.memo)
- [ ] Unused dependencies removed
- [ ] Dynamic imports for heavy components
- [ ] API responses cached when possible
- [ ] Database queries indexed
- [ ] Bundle size < 200KB

---

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Passwords are 8+ characters
- [ ] JWT secret is 32+ characters
- [ ] HTTPS enforced in production
- [ ] API rate limiting enabled
- [ ] SQL injection prevented (using Firestore)
- [ ] XSS protection enabled
- [ ] CORS properly configured

---

## Deployment Checklist

- [ ] `npm run build` succeeds
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] All environment variables set
- [ ] Firebase rules deployed
- [ ] Email service configured
- [ ] Admin password changed
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] DNS configured

---

**Version:** 1.0  
**Last Updated:** January 15, 2026
