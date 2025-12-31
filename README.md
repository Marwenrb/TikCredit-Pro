# TikCredit Pro ✨

> نظام طلبات التمويل الاحترافي - Professional Luxury Financing Request System

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss)
![Security](https://img.shields.io/badge/Security-Ultra%20Secure-brightgreen)

---

## 🌟 What's New in This Version

### ✨ Luxury White Theme
- **Ultra-Premium Design**: Complete redesign with luxury white aesthetic
- **Modern UI/UX**: High-end typography, subtle gradients, and micro-interactions
- **Elegant Color Palette**: Pure white (#FFFFFF), elegant blue (#1E3A8A), and premium gold (#D4AF37)
- **Enhanced Accessibility**: ARIA labels, keyboard navigation, and reduced motion support

### 🔒 Ultra-Secure
- **Bcrypt Password Hashing**: No plain-text passwords, only secure hashes
- **Rate Limiting**: Protection against brute force attacks (5 attempts per 15 minutes)
- **Comprehensive Security Headers**: CSP, HSTS, X-Frame-Options, and more
- **Enhanced Firestore Rules**: Strict validation and access control
- **HttpOnly Cookies**: Secure JWT token storage

### 🎯 Clean & Professional
- **No AI Features**: Removed all AI/voice input features for a clean, professional experience
- **Optimized Dependencies**: Removed unnecessary packages (react-speech-kit, three.js, particles)
- **Production-Ready**: Optimized bundle size and performance

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create a `.env.local` file in the root directory:

```env
# Generate a secure password hash first
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here

# Generate a secure JWT secret (64+ characters)
JWT_SECRET=your_64_character_random_secret_here

# Optional: Rate limiting configuration
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=60000
```

**Generate Password Hash:**

```bash
node scripts/generatePasswordHash.js YourSecurePassword123!
```

This will output a bcrypt hash to use as `ADMIN_PASSWORD_HASH`.

**Generate JWT Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Run Development Server

```bash
npm run dev
```

**Access URLs:**
- 🏠 Home: http://localhost:3000
- 📝 Form: http://localhost:3000/form
- 🎛️ Admin: http://localhost:3000/admin

---

## 📋 Features

### 🎨 Design - Luxury White Theme
- ✅ Ultra-premium white aesthetic with elegant blue and gold accents
- ✅ High-end typography (Inter, Montserrat)
- ✅ Smooth animations and micro-interactions (Framer Motion)
- ✅ Glassmorphism effects with subtle shadows
- ✅ Full RTL Arabic support
- ✅ Fully responsive (mobile-first design)
- ✅ Accessibility features (WCAG 2.1 AA compliant)

### 📝 Form System
- ✅ Clean 4-step multi-step form
- ✅ Real-time validation with user-friendly error messages
- ✅ Auto-save drafts to prevent data loss
- ✅ 58 Algerian wilayas
- ✅ Professional job categories
- ✅ Customizable financing types

### 🎛️ Admin Dashboard
- ✅ Ultra-secure JWT authentication with bcrypt
- ✅ Real-time statistics and analytics
- ✅ Advanced search & filters
- ✅ Export capabilities (JSON, CSV, PDF)
- ✅ Rate limiting protection
- ✅ Session management (8-hour expiration)

### 🔥 Firebase Integration
- ✅ Cloud Firestore database
- ✅ Ultra-secure security rules with strict validation
- ✅ Production-ready configuration
- ✅ Automatic timestamps and data integrity

### 🔒 Security Features
- ✅ Bcrypt password hashing (12 rounds)
- ✅ JWT tokens in HttpOnly cookies
- ✅ Rate limiting on all sensitive endpoints
- ✅ CSRF protection (SameSite cookies)
- ✅ Comprehensive security headers (CSP, HSTS, etc.)
- ✅ Input sanitization and validation
- ✅ XSS and SQL injection protection
- ✅ Firestore security rules enforcement

---

## 📁 Project Structure

```
tikcredit-pro/
├── src/
│   ├── app/
│   │   ├── admin/page.tsx         # Admin dashboard (Luxury White Theme)
│   │   ├── form/page.tsx          # Multi-step form (Clean Version)
│   │   ├── api/                   # Secure API routes
│   │   │   ├── auth/              # Ultra-secure authentication
│   │   │   └── submissions/       # Form submission with validation
│   │   ├── layout.tsx             # Root layout (RTL support)
│   │   ├── page.tsx               # Landing page (Luxury White)
│   │   └── globals.css            # Global styles (Luxury White Theme)
│   ├── components/
│   │   ├── admin/                 # Admin dashboard components
│   │   ├── form/
│   │   │   └── CleanForm.tsx      # New clean form (no AI)
│   │   └── ui/                    # Reusable UI components
│   ├── lib/
│   │   ├── firebase.ts            # Firebase configuration
│   │   ├── firebaseService.ts     # Firestore operations
│   │   ├── auth.ts                # JWT authentication
│   │   ├── password.ts            # Bcrypt password utilities
│   │   ├── rateLimit.ts           # Rate limiting middleware
│   │   └── utils.ts               # Utility functions
│   └── types/
│       └── index.ts               # TypeScript definitions
├── scripts/
│   └── generatePasswordHash.js    # Password hash generator
├── firestore.rules                # Ultra-secure Firestore rules
├── next.config.js                 # Next.js config with security headers
├── tailwind.config.ts             # Luxury White theme configuration
└── package.json                   # Dependencies (optimized)
```

---

## 🔐 Security Setup (CRITICAL)

### 1. Generate Secure Passwords

**Never use plain-text passwords!** Always use bcrypt hashes:

```bash
# Generate password hash
node scripts/generatePasswordHash.js YourStr0ng!P@ssw0rd123

# Copy the output hash to .env.local
ADMIN_PASSWORD_HASH=<paste_hash_here>
```

**Password Requirements:**
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### 2. Generate JWT Secret

```bash
# Generate a secure 64-character random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env.local
JWT_SECRET=<paste_secret_here>
```

### 3. Deploy Firestore Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy ultra-secure rules
firebase deploy --only firestore:rules
```

### 4. Enable HTTPS (Production)

The app automatically enforces HTTPS in production via security headers. Ensure your hosting platform (Netlify, Vercel, etc.) has SSL/TLS enabled.

---

## 🚀 Deployment to Netlify

### Prerequisites
- GitHub account
- Netlify account (free tier works)
- Firebase project set up

### Step-by-Step Deployment

#### 1. Prepare Your Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: TikCredit Pro with Luxury White Theme"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/tikcredit-pro.git
git branch -M main
git push -u origin main
```

#### 2. Connect to Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify
4. Select your `tikcredit-pro` repository

#### 3. Configure Build Settings

**Build settings:**
- **Base directory:** (leave empty)
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Functions directory:** (leave empty)

#### 4. Set Environment Variables

In Netlify dashboard, go to **Site settings** → **Environment variables** and add:

```
ADMIN_PASSWORD_HASH=<your_bcrypt_hash>
JWT_SECRET=<your_64_char_secret>
NODE_ENV=production
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=60000
```

**Important:** Never expose these values publicly!

#### 5. Deploy

Click "Deploy site". Netlify will:
- Install dependencies
- Build the project
- Deploy to a unique URL (e.g., `https://tikcredit-pro.netlify.app`)

#### 6. Custom Domain (Optional)

Go to **Domain settings** → **Add custom domain** and follow instructions.

### Continuous Deployment

Every push to `main` branch will automatically trigger a new deployment.

```bash
# Make changes, then:
git add .
git commit -m "Update: description of changes"
git push
```

---

## 🧪 Testing Before Deployment

### 1. Run Production Build Locally

```bash
npm run build
npm start
```

Test all features:
- ✅ Home page loads correctly
- ✅ Form submission works
- ✅ Admin login with hashed password
- ✅ Admin dashboard displays correctly
- ✅ Rate limiting works (try multiple login attempts)

### 2. Security Checklist

- [ ] `.env.local` is in `.gitignore` (never commit secrets!)
- [ ] `ADMIN_PASSWORD_HASH` is a bcrypt hash, not plain text
- [ ] `JWT_SECRET` is 64+ characters and random
- [ ] Firestore security rules are deployed
- [ ] Security headers are configured in `next.config.js`
- [ ] HTTPS is enabled on hosting platform
- [ ] Rate limiting is active on sensitive endpoints

### 3. Test Security Headers

After deployment, test security headers:

```bash
curl -I https://your-site.netlify.app
```

Look for:
- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy`

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | React framework with SSR/SSG | 14.2.35 |
| TypeScript | Type safety and developer experience | 5.4.5 |
| Tailwind CSS | Luxury White theme styling | 3.4.4 |
| Framer Motion | Smooth animations and micro-interactions | 11.2.10 |
| Firebase | Cloud Firestore database | 10.7.0 |
| Firebase Admin | Server-side Firebase operations | 12.0.0 |
| bcryptjs | Password hashing | 3.0.3 |
| jsonwebtoken | JWT authentication | 9.0.2 |
| Chart.js | Admin dashboard charts | 4.4.3 |
| jsPDF | PDF export functionality | 2.5.1 |
| Zod | Schema validation | 3.22.4 |
| Lucide React | Premium icon set | 0.395.0 |

---

## 📊 Admin Dashboard Access

1. Navigate to `/admin`
2. Enter your secure password (the one you generated the hash for)
3. Access granted for 8 hours (auto-logout after inactivity)

**Default Credentials:** None! You must set up your own secure password.

**First-Time Setup:**
1. Run `node scripts/generatePasswordHash.js YourPassword123!`
2. Copy the hash to `.env.local` as `ADMIN_PASSWORD_HASH`
3. Restart the development server
4. Login with your password

---

## 🔄 Updating and Maintenance

### Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Audit for security vulnerabilities
npm audit
npm audit fix
```

### Rotate Secrets (Recommended every 90 days)

1. Generate new JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. Update `.env.local` with new `JWT_SECRET`

3. Redeploy to Netlify with new environment variable

### Monitor Security

- Regularly check Firebase console for unusual activity
- Monitor Netlify analytics for traffic patterns
- Review admin logs periodically
- Keep dependencies up to date

---

## 🐛 Troubleshooting

### Login Not Working

**Problem:** "Invalid password" error

**Solutions:**
1. Verify `ADMIN_PASSWORD_HASH` is set correctly in `.env.local`
2. Ensure the hash was generated with the same password you're entering
3. Restart the development server after changing `.env.local`
4. Check browser console for errors

### Build Fails on Netlify

**Problem:** Build command fails

**Solutions:**
1. Check build logs in Netlify dashboard
2. Verify all environment variables are set
3. Ensure `package.json` has all required dependencies
4. Try building locally: `npm run build`

### Firestore Permissions Denied

**Problem:** "Insufficient permissions" error

**Solutions:**
1. Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. Verify Firebase project ID matches in `firebase.json`
3. Check Firestore security rules in Firebase console

### Rate Limiting Too Strict

**Problem:** "Too many requests" error

**Solutions:**
1. Adjust `RATE_LIMIT_MAX` in `.env.local` (default: 10)
2. Increase `RATE_LIMIT_WINDOW_MS` (default: 60000 = 1 minute)
3. Clear browser cookies and try again

---

## 📄 License

MIT License - Free for commercial and personal use

---

## 🙏 Acknowledgments

- **Design Inspiration:** Modern luxury financial platforms
- **Security Best Practices:** OWASP guidelines
- **Accessibility:** WCAG 2.1 AA standards
- **RTL Support:** Arabic language optimizations

---

**Made with ❤️ for Algeria 🇩🇿**

**Version:** 2.0.0 - Luxury White Edition
**Last Updated:** December 2024
**Status:** Production-Ready ✅
