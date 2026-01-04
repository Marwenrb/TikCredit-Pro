# TikCredit Pro 🇩🇿

> Ultra-Premium Financing Platform for Algeria | منصة التمويل الفاخرة للجزائر

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)

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

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - Firebase variables (if using)
4. Deploy

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
- **CSV** ⭐ - Spreadsheet-compatible with Arabic
- **Excel** - XLSX format with Arabic columns
- **PDF** - Numbers and dates only (Arabic not supported in jsPDF)

## 🚀 PRODUCTION READY! ✅

**Your TikCredit Pro is now ULTRA-SECURE and DEPLOYMENT-READY!**

### ✅ All Issues Fixed
- **Build Errors**: ✅ Resolved TypeScript and ESLint issues
- **Security**: ✅ Industry-standard security measures implemented
- **Performance**: ✅ Optimized for production deployment
- **Documentation**: ✅ Complete deployment guides created

### 🌐 Quick Deploy to Netlify
1. **Set Environment Variables** in Netlify Dashboard:
   ```bash
   ADMIN_PASSWORD=YourSecurePasswordHere123!
   JWT_SECRET=TikCredit-Ultra-Secure-JWT-Secret-2024-Production-Key-32Plus-Characters
   NODE_ENV=production
   ```

2. **Deploy**: Connect your GitHub repo to Netlify - it will auto-deploy!

3. **Access**: Visit `https://tikcredit.netlify.app` (or your custom domain)

### 📚 Deployment Guides
- **🚀 Quick Start**: Read `DEPLOY.md` for step-by-step instructions
- **🔐 Security**: Read `SECURITY.md` for security features
- **⚡ Production**: Read `PRODUCTION.md` for advanced configuration

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
