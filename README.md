# TikCredit Pro 🇩🇿

> Ultra-Premium Financing Platform for Algeria | منصة التمويل الفاخرة للجزائر

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Ready-black?style=flat-square&logo=vercel)](https://vercel.com)

## ✨ Features

- **Ultra-Premium UI/UX** - Aurora effects, 3D particles, interactive cursor tracking
- **RTL Arabic Support** - Full right-to-left layout with Arabic typography
- **Secure Admin Dashboard** - Environment-based authentication with rate limiting
- **Multi-Step Form** - Beautiful financing application form
- **Multi-Format Export** - Download submissions as TXT, CSV, Excel, or PDF
- **Firebase Integration** - Real-time Firestore database

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` file in the root directory:

```env
# Admin Password (REQUIRED)
ADMIN_PASSWORD=YourSecurePasswordHere

# JWT Secret (REQUIRED - 32+ characters)
JWT_SECRET=your-very-long-secure-random-string-here-at-least-32-chars

# Firebase (OPTIONAL - for database)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**⚠️ IMPORTANT:** Never commit `.env.local` to git! It's already in `.gitignore`.

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/          # Admin dashboard page
│   ├── api/            # API routes (auth, submissions)
│   ├── form/           # Financing form page
│   └── page.tsx        # Landing page
├── components/
│   ├── admin/          # Admin components
│   ├── form/           # Form components
│   └── ui/             # Reusable UI components
├── lib/                # Utilities (auth, firebase, exports)
└── types/              # TypeScript types
```

## 🔐 Admin Access

- **URL:** `/admin`
- **Password:** Set in `.env.local` as `ADMIN_PASSWORD`

## 🎨 Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations & transitions |
| Firebase | Database & authentication |
| JWT | Session tokens |

## 📦 Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment

### Vercel (Recommended) ⚡

**✅ Configuration Automatique :** Le projet est configuré pour déployer automatiquement depuis la branche `main`.

1. **Connecter à Vercel:**
   - Allez sur: https://vercel.com/new
   - Importez le repository: `Marwenrb/TikCredit-Pro`
   - Vercel détectera automatiquement Next.js

2. **Branche de Production:**
   - ✅ Vercel déploiera automatiquement depuis `main`
   - Chaque push vers `main` déclenche un nouveau déploiement

3. **Variables d'Environnement:**
   - Allez dans **Settings** → **Environment Variables**
   - Ajoutez ces variables:
     ```
     ADMIN_PASSWORD=AdminTikCredit123Pro!
     JWT_SECRET=TikCreditPro2026SecureJWTSigningKeyForAdminAuth!
     FIREBASE_PROJECT_ID=tikcredit-prp
     FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@tikcredit-prp.iam.gserviceaccount.com
     FIREBASE_PRIVATE_KEY=[Votre clé privée avec \n]
     ```

4. **Déploiement:**
   - ✅ Push vers `main` = Déploiement automatique
   - Consultez `VERCEL-DEPLOYMENT.md` pour plus de détails

### Firebase Hosting

```bash
npm run build
firebase deploy
```

**Remember to set environment variables in Firebase Console!**

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD` | ✅ | Admin login password (plain text - stored securely) |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens (32+ characters) |
| `NEXT_PUBLIC_FIREBASE_*` | ⚠️ | Firebase config (for database) |

## 🛡️ Security Features

- ✅ Environment-based password (not in code)
- ✅ JWT token authentication
- ✅ HTTP-only secure cookies
- ✅ Rate limiting (10 requests/minute)
- ✅ CSRF protection (strict same-site)
- ✅ Secure headers in production

## 📤 Export Formats

The admin dashboard supports multiple export formats:

- **TXT** ⭐ - Full Arabic support, beautifully formatted
- **CSV** ⭐ - Spreadsheet-compatible with Arabic (UTF-8 BOM)
- **Excel** ⭐ - XLSX format with styled headers and alternating rows (ExcelJS)
- **PDF** - Professional PDF reports with tables (English labels)

## 🚀 PRODUCTION READY! ✅

**Your TikCredit Pro is now 100% PRODUCTION-READY and DEPLOYMENT-READY!**

### ✅ All Issues Fixed
- **Security Vulnerabilities**: ✅ 0 vulnerabilities (npm audit)
- **Dependencies**: ✅ All packages updated and compatible
- **ESLint**: ✅ Upgraded to v9.39.2 (no conflicts)
- **Excel Export**: ✅ Migrated from xlsx to ExcelJS (secure)
- **Firebase**: ✅ Latest versions (firebase@12.7.0, firebase-admin@13.6.0)
- **Build**: ✅ Production build tested and working
- **Deployment**: ✅ Configured for automatic Vercel deployment from `main`

### 🌐 Automatic Vercel Deployment
- **Branche de Production**: `main` ✅
- **Configuration**: `vercel.json` créé ✅
- **Workflow**: Push vers `main` = Déploiement automatique ✅
- **Guide**: Voir `VERCEL-DEPLOYMENT.md` pour les détails complets

### 📚 Documentation Guides
- **🚀 Vercel Deployment**: `VERCEL-DEPLOYMENT.md` - Guide complet de déploiement Vercel
- **🔥 Firebase Setup**: `FIREBASE-SETUP-GUIDE.md` - Configuration Firebase complète
- **📋 Submissions Guide**: `FIREBASE-SUBMISSIONS-GUIDE.md` - Guide des soumissions

### 🛡️ Security Features Active
- JWT Authentication with 8-hour expiration
- Rate limiting (5 attempts/minute)
- Complete HTTP security headers
- Input validation and sanitization
- Secure cookie configuration
- HTTPS enforcement

## 📄 License

MIT © 2024 TikCredit Pro

---

<p align="center">
  Made with ❤️ in Algeria 🇩🇿
</p>
