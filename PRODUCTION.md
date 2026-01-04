# Production Deployment Guide

## 🔒 Security Checklist

### Environment Variables

**CRITICAL:** Never commit sensitive data to git!

1. **Admin Password**
   ```env
   ADMIN_PASSWORD=YourSecurePasswordHere
   ```
   - Use a strong password (12+ characters, mixed case, numbers, symbols)
   - Change default password immediately

2. **JWT Secret**
   ```env
   JWT_SECRET=your-very-long-secure-random-string-here-at-least-32-chars
   ```
   - Generate with: `openssl rand -base64 32`
   - Must be at least 32 characters

3. **Firebase (if using)**
   - Get credentials from Firebase Console
   - Never commit service account keys

## 🚀 Deployment Steps

### Vercel

1. **Connect Repository**
   - Push code to GitHub
   - Import project in Vercel

2. **Set Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all required variables
   - Set for Production, Preview, and Development

3. **Deploy**
   - Vercel auto-deploys on push to main
   - Or manually trigger from dashboard

### Firebase Hosting

1. **Build Project**
   ```bash
   npm run build
   ```

2. **Set Environment Variables**
   - Use Firebase Functions for server-side env vars
   - Or use Firebase Config for client-side

3. **Deploy**
   ```bash
   firebase deploy
   ```

## ✅ Pre-Deployment Testing

- [ ] Admin login works
- [ ] Form submission works
- [ ] Export functions work (TXT, CSV, Excel, PDF)
- [ ] Arabic text displays correctly
- [ ] RTL layout works properly
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Build completes successfully

## 🔍 Post-Deployment

1. Test admin login with production password
2. Submit a test form
3. Export test data
4. Check browser console for errors
5. Monitor error logs

## 🐛 Troubleshooting

### Admin Login Fails
- Check `ADMIN_PASSWORD` is set correctly
- Verify `JWT_SECRET` is 32+ characters
- Check server logs for errors

### Arabic Text Not Displaying
- Use TXT or CSV export (full Arabic support)
- PDF only supports numbers/dates

### Build Fails
- Run `npm run lint` to check for errors
- Ensure all dependencies are installed
- Check TypeScript errors

## 📞 Support

For issues or questions, check:
- GitHub Issues
- Documentation in README.md

