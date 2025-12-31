# ⚡ Quick Start Commands

Copy and paste these commands to get started with TikCredit Pro!

---

## 🔧 Initial Setup

### 1. Install Dependencies

```powershell
npm install
```

---

## 🔐 Security Setup

### 2. Generate Password Hash

**Replace `YourStr0ng!P@ssw0rd123` with your actual secure password:**

```powershell
node scripts/generatePasswordHash.js YourStr0ng!P@ssw0rd123
```

**Copy the generated hash from the output.**

### 3. Generate JWT Secret

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Copy the generated secret from the output.**

### 4. Create .env.local File

**Windows PowerShell:**

```powershell
@"
ADMIN_PASSWORD_HASH=PASTE_YOUR_HASH_HERE
JWT_SECRET=PASTE_YOUR_SECRET_HERE
NODE_ENV=development
JWT_EXPIRES_IN=8h
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=60000
"@ | Out-File -FilePath .env.local -Encoding UTF8
```

**Then edit `.env.local` and replace the placeholder values.**

---

## 🚀 Run Development Server

### 5. Start Development Server

```powershell
npm run dev
```

**Open in browser:**
- Home: http://localhost:3000
- Form: http://localhost:3000/form
- Admin: http://localhost:3000/admin

---

## 🏗️ Build for Production

### 6. Test Production Build

```powershell
npm run build
npm start
```

**Verify everything works before deploying.**

---

## 📦 Git & GitHub

### 7. Initialize Git (if needed)

```powershell
git init
```

### 8. Add and Commit Files

```powershell
git add .
git commit -m "Production ready: TikCredit Pro with Luxury White Theme"
```

### 9. Create GitHub Repository

1. Go to https://github.com/new
2. Name: `tikcredit-pro`
3. Set to **Private** (recommended)
4. Don't initialize with README
5. Click "Create repository"

### 10. Push to GitHub

**Replace `YOUR_USERNAME` with your GitHub username:**

```powershell
git remote add origin https://github.com/YOUR_USERNAME/tikcredit-pro.git
git branch -M main
git push -u origin main
```

---

## 🔥 Firebase Setup

### 11. Install Firebase CLI

```powershell
npm install -g firebase-tools
```

### 12. Login to Firebase

```powershell
firebase login
```

### 13. Deploy Firestore Rules

```powershell
firebase deploy --only firestore:rules
```

---

## 🌐 Deploy to Netlify

### 14. Via Netlify Website (Recommended)

1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Select `tikcredit-pro` repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables (see below)
7. Click "Deploy site"

### Environment Variables to Add in Netlify:

```
ADMIN_PASSWORD_HASH = <your_bcrypt_hash>
JWT_SECRET = <your_64_char_secret>
NODE_ENV = production
JWT_EXPIRES_IN = 8h
RATE_LIMIT_MAX = 10
RATE_LIMIT_WINDOW_MS = 60000
```

---

## 🔄 Update and Redeploy

### 15. After Making Changes

```powershell
# Test locally first
npm run dev

# Build for production
npm run build

# Commit and push (auto-deploys to Netlify)
git add .
git commit -m "Update: description of changes"
git push
```

---

## 🧪 Testing Commands

### Check for Security Vulnerabilities

```powershell
npm audit
```

### Fix Vulnerabilities

```powershell
npm audit fix
```

### Check for Outdated Packages

```powershell
npm outdated
```

### Update Packages

```powershell
npm update
```

---

## 🛠️ Troubleshooting Commands

### Clear Node Modules and Reinstall

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Clear Next.js Cache

```powershell
Remove-Item -Recurse -Force .next
npm run build
```

### View Firestore Rules

```powershell
firebase firestore:rules:get
```

### Test Firestore Rules

```powershell
firebase emulators:start --only firestore
```

---

## 📊 Useful Commands

### Generate New Password Hash

```powershell
node scripts/generatePasswordHash.js NewPassword123!
```

### Generate New JWT Secret

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Check Current Git Branch

```powershell
git branch
```

### View Git Status

```powershell
git status
```

### View Recent Commits

```powershell
git log --oneline -10
```

---

## 🎯 Quick Reference

### One-Command Full Setup (After Dependencies Installed)

**This is a template - edit values before running:**

```powershell
# 1. Generate credentials
$hash = node scripts/generatePasswordHash.js YourPassword123!
$secret = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 2. Create .env.local (edit the values!)
@"
ADMIN_PASSWORD_HASH=$hash
JWT_SECRET=$secret
NODE_ENV=development
JWT_EXPIRES_IN=8h
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=60000
"@ | Out-File -FilePath .env.local -Encoding UTF8

# 3. Run dev server
npm run dev
```

---

## 📞 Need Help?

- **Documentation:** See `README.md`
- **Deployment:** See `DEPLOYMENT_GUIDE.md`
- **Changes:** See `CHANGES_SUMMARY.md`

---

**Version:** 2.0.0 - Luxury White Edition
**Made with ❤️ for Algeria 🇩🇿**

