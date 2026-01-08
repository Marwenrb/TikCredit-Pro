# 🔍 How to Find Form Submissions in Firebase

## 📋 Overview

All form submissions are saved to **Firestore** in the `submissions` collection. This guide shows you how to access them.

---

## 🚀 Quick Access

### Option 1: Firebase Console (Web Interface)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Login with: `rbmarwenrb@gmail.com`
   - Select project: **TikCredit Prp** (`tikcredit-prp`)

2. **Navigate to Firestore**
   - Click **Firestore Database** in the left sidebar
   - If you see "Create database", click it and choose:
     - **Production mode** (for security rules)
     - **Location**: Choose closest to your users (e.g., `europe-west1`)

3. **View Submissions**
   - Click on the **`submissions`** collection
   - You'll see all form submissions with:
     - Document ID (auto-generated)
     - Fields: `data`, `timestamp`, `status`, `source`, `ip`, `userAgent`

4. **Submission Document Structure**
   ```json
   {
     "data": {
       "fullName": "اسم المستخدم",
       "phone": "0543123456",
       "email": "user@example.com",
       "requestedAmount": 15000000,
       "amountValid": true,
       "wilaya": "الجزائر",
       "financingType": "تمويل شخصي",
       // ... other form fields
     },
     "timestamp": "2026-01-08T12:00:00.000Z",
     "status": "pending",
     "source": "web-form",
     "ip": "xxx.xxx.xxx.xxx",
     "userAgent": "Mozilla/5.0..."
   }
   ```

---

## 🔧 Option 2: Firebase Admin SDK (Programmatic Access)

### Setup Environment Variables

Create `.env.local` file (never commit this):

```env
FIREBASE_PROJECT_ID=tikcredit-prp
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@tikcredit-prp.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Important**: 
- Keep `\n` newlines in `FIREBASE_PRIVATE_KEY`
- Never commit `.env.local` to git
- The service account JSON file is already in `.gitignore`

### Access via Code

The admin dashboard already uses this. Submissions are automatically fetched from Firestore.

---

## 📊 Query Submissions

### In Firebase Console

1. **Filter by Date**
   - Use the filter icon in Firestore
   - Filter `timestamp` field
   - Choose date range

2. **Search by Field**
   - Use the search bar
   - Search within `data.fullName`, `data.phone`, etc.

3. **Sort**
   - Click column headers to sort
   - Default: sorted by `timestamp` (newest first)

### Via Code (Admin Dashboard)

The admin dashboard (`/admin`) automatically:
- Fetches all submissions from Firestore
- Displays them in a table
- Allows filtering, searching, and export

---

## 🔐 Security & Permissions

### Firestore Security Rules

Current rules (in `firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Submissions collection - read/write via Admin SDK only
    match /submissions/{submissionId} {
      allow read, write: if false; // Only Admin SDK can access
    }
  }
}
```

**Note**: Only server-side code (using Admin SDK) can read/write submissions. This ensures security.

---

## 🚨 Troubleshooting

### "Collection not found"
- **Cause**: Firestore database not created yet
- **Fix**: 
  1. Go to Firebase Console → Firestore Database
  2. Click "Create database"
  3. Choose production mode and location
  4. Wait for database to initialize

### "Permission denied"
- **Cause**: Security rules blocking access
- **Fix**: Use Admin SDK (server-side) or update security rules

### "Billing required"
- **Cause**: Firestore requires billing to be enabled
- **Fix**: 
  1. Go to: https://console.developers.google.com/billing/enable?project=tikcredit-prp
  2. Enable billing (Firestore has free tier: 50K reads/day, 20K writes/day)
  3. Wait a few minutes for changes to propagate

### Submissions not appearing
- **Check**: 
  1. Verify environment variables are set correctly
  2. Check server logs for errors
  3. Verify Firestore database is created
  4. Check billing is enabled

---

## 📈 Monitoring Submissions

### Firebase Console Dashboard

1. **View Statistics**
   - Go to Firestore → Usage tab
   - See read/write counts
   - Monitor storage usage

2. **Export Data**
   - Click "Export" in Firestore
   - Choose format (JSON, CSV)
   - Download all submissions

### Admin Dashboard

- Visit `/admin` (requires login)
- View all submissions in real-time
- Export to JSON, CSV, TXT, PDF, Excel
- Filter by date, search by name/phone

---

## 🔄 Fallback Mode

If Firebase Admin credentials are not configured, submissions are saved locally to:
- **Location**: `.tmp/submissions.json` (server-side)
- **Purpose**: Development/fallback when Firestore is unavailable
- **Note**: This is temporary storage, not production-ready

---

## 📝 Next Steps

1. ✅ **Enable Billing** (if not done)
   - Required for Firestore writes
   - Free tier is generous for most use cases

2. ✅ **Set Environment Variables**
   - Add to `.env.local` for local development
   - Add to hosting platform (Vercel/Netlify) for production

3. ✅ **Verify Submissions**
   - Submit a test form
   - Check Firebase Console → Firestore → `submissions` collection
   - Verify document appears

4. ✅ **Monitor Usage**
   - Check Firebase Console → Usage
   - Stay within free tier limits

---

## 📞 Support

- **Firebase Console**: https://console.firebase.google.com/project/tikcredit-prp
- **Firebase Docs**: https://firebase.google.com/docs/firestore
- **Project Email**: rbmarwenrb@gmail.com

---

**Last Updated**: 2026-01-08  
**Project**: TikCredit Pro  
**Firebase Project**: tikcredit-prp

