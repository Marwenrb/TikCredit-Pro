# 🚀 Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Security Requirements
- [ ] All environment variables configured
- [ ] JWT_SECRET is 32+ characters and secure
- [ ] ADMIN_PASSWORD is strong and unique
- [ ] HTTPS/SSL certificate configured
- [ ] Security headers enabled
- [ ] Rate limiting configured

### ✅ Performance Requirements
- [ ] Production build passes (`npm run build`)
- [ ] TypeScript compilation successful
- [ ] ESLint checks pass
- [ ] Bundle size optimized
- [ ] Images optimized

### ✅ Environment Configuration

#### Required Environment Variables
```bash
# Authentication (CRITICAL)
ADMIN_PASSWORD=YourSecurePasswordHere
JWT_SECRET=your-very-long-secure-random-string-here-at-least-32-chars

# Production Mode
NODE_ENV=production

# Optional: Firebase (if using database)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

## 🌐 Deployment Platforms

### Netlify (Recommended)

#### 1. Automatic Deployment
```bash
# Connect your GitHub repository to Netlify
# Build settings are configured in netlify.toml
```

#### 2. Manual Environment Variables
In Netlify Dashboard:
1. Go to Site Settings > Environment Variables
2. Add all required variables listed above
3. Deploy the site

#### 3. Custom Domain (Optional)
1. Go to Domain Management
2. Add your custom domain
3. Configure DNS records
4. SSL certificate will be auto-generated

### Vercel Alternative

#### 1. Deploy with Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

#### 2. Environment Variables
```bash
vercel env add ADMIN_PASSWORD
vercel env add JWT_SECRET
# Add other variables as needed
```

### Manual Server Deployment

#### 1. Build the Application
```bash
npm run build:production
```

#### 2. Start Production Server
```bash
npm start
```

#### 3. Process Manager (PM2)
```bash
npm i -g pm2
pm2 start npm --name "tikcredit" -- start
pm2 startup
pm2 save
```

## 🔧 Production Optimizations

### Performance Monitoring
```bash
# Bundle analysis
npm run analyze

# Performance audit
npm run lighthouse
```

### Security Monitoring
```bash
# Security audit
npm run security-audit

# Dependency check
npm audit --audit-level moderate
```

## 🚨 Post-Deployment Verification

### 1. Functionality Tests
- [ ] Landing page loads correctly
- [ ] Form submission works
- [ ] Admin login functions
- [ ] Admin dashboard accessible
- [ ] Export functionality works
- [ ] All animations and UI elements display properly

### 2. Security Tests
- [ ] Admin routes require authentication
- [ ] Rate limiting prevents brute force
- [ ] Security headers present
- [ ] HTTPS enforced
- [ ] No sensitive data in client-side code

### 3. Performance Tests
- [ ] Page load times < 3 seconds
- [ ] Mobile responsiveness
- [ ] Lighthouse score > 90
- [ ] Bundle size optimized

## 📊 Monitoring & Maintenance

### Error Tracking
```bash
# Recommended: Sentry integration
npm install @sentry/nextjs
```

### Uptime Monitoring
- Set up monitoring with services like:
  - Pingdom
  - UptimeRobot
  - StatusCake

### Log Monitoring
```bash
# Check deployment logs regularly
netlify logs # for Netlify
vercel logs # for Vercel
```

## 🔄 Update Procedure

### 1. Development Updates
```bash
git checkout main
git pull origin main
npm install
npm run build:production
```

### 2. Security Updates
```bash
npm audit fix
npm run security-audit
```

### 3. Dependency Updates
```bash
npm update
npm run build:production
```

## 🆘 Troubleshooting

### Build Failures
1. Check environment variables are set
2. Verify TypeScript compilation
3. Run ESLint fix: `npm run lint:fix`
4. Clear cache: `npm run clean`

### Authentication Issues
1. Verify ADMIN_PASSWORD is set correctly
2. Check JWT_SECRET length (32+ chars)
3. Ensure cookies are enabled
4. Check HTTPS configuration

### Performance Issues
1. Run bundle analyzer: `npm run analyze`
2. Check image optimization
3. Verify CDN configuration
4. Monitor server resources

### Security Concerns
1. Review security headers
2. Check rate limiting logs
3. Audit dependencies: `npm audit`
4. Verify HTTPS enforcement

## 📞 Support

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Netlify Next.js](https://docs.netlify.com/frameworks/next-js/)
- [Security Best Practices](./SECURITY.md)

### Emergency Contacts
- Technical Issues: tech@tikcredit.com
- Security Issues: security@tikcredit.com

## 🎯 Performance Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Lighthouse Scores
- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 90
- **SEO**: > 90

### Bundle Size Targets
- **First Load JS**: < 200KB
- **Page JS**: < 50KB
- **Total Bundle**: < 1MB