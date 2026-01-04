# TikCredit Pro 🇩🇿

> Ultra-Premium Financing Platform for Algeria | منصة التمويل الفاخرة للجزائر

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)

## ✨ Features

- **Ultra-Premium UI/UX** - Aurora effects, 3D particles, interactive cursor tracking
- **RTL Arabic Support** - Full right-to-left layout with Arabic typography
- **Secure Admin Dashboard** - JWT + Bcrypt authentication with rate limiting
- **Multi-Step Form** - Beautiful financing application form
- **Excel/PDF Export** - Download submissions in multiple formats
- **Firebase Integration** - Real-time Firestore database

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Run the setup script to create your `.env.local`:

```bash
node scripts/setup-env.js
```

Or manually create `.env.local`:

```env
# Admin password: Admin123
ADMIN_PASSWORD_HASH=$2b$12$your-bcrypt-hash-here

# JWT Secret (any secure random string)
JWT_SECRET=your-secure-jwt-secret-key

# Firebase (optional - for database)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

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
- **Password:** `Admin123` (configure in `.env.local`)

## 🎨 Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations & transitions |
| Firebase | Database & authentication |
| Bcrypt.js | Password hashing |
| JWT | Session tokens |

## 📦 Production Build

```bash
npm run build
npm start
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD_HASH` | ✅ | Bcrypt hash of admin password |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens |
| `NEXT_PUBLIC_FIREBASE_*` | ⚠️ | Firebase config (for database) |

## 🛡️ Security Features

- ✅ Bcrypt password hashing (12 rounds)
- ✅ JWT token authentication
- ✅ HTTP-only secure cookies
- ✅ Rate limiting (10 requests/minute)
- ✅ CSRF protection (strict same-site)

## 📄 License

MIT © 2024 TikCredit Pro

---

<p align="center">
  Made with ❤️ in Algeria 🇩🇿
</p>
