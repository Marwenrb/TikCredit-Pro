# 🔥 Firebase Integration Guide

## Project Details
- **Project ID:** `tikcredit-prp`
- **Project Number:** `250203469696`
- **Console:** https://console.firebase.google.com/project/tikcredit-prp

---

## 1️⃣ Installation

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

---

## 2️⃣ Authentication

```bash
# Login to Firebase
firebase login

# Verify your projects
firebase projects:list
```

---

## 3️⃣ Deploy Security Rules

```bash
# Deploy Firestore rules only
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

---

## 4️⃣ Deploy Application

```bash
# Build the Next.js app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or deploy everything
firebase deploy
```

---

## 5️⃣ Firestore Structure

```
submissions/
├── {documentId}
│   ├── data
│   │   ├── fullName: string
│   │   ├── phone: string
│   │   ├── email: string
│   │   ├── wilaya: string
│   │   ├── profession: string
│   │   ├── salaryRange: string
│   │   ├── salaryReceiveMethod: string
│   │   ├── financingType: string
│   │   ├── requestedAmount: number
│   │   └── notes: string
│   ├── timestamp: Timestamp
│   ├── createdAt: string (ISO)
│   └── status: "pending" | "approved" | "rejected"
```

---

## 6️⃣ Security Rules (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Submissions - Public write, admin read
    match /submissions/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

---

## 7️⃣ Data Export (Console)

1. Go to Firebase Console → Firestore
2. Select collection `submissions`
3. Click ⋮ menu → Export documents
4. Choose Cloud Storage bucket
5. Download from Google Cloud Console

**Or using gcloud CLI:**

```bash
# Export entire database
gcloud firestore export gs://tikcredit-prp.appspot.com/backups/$(date +%Y%m%d)

# Export specific collection
gcloud firestore export gs://tikcredit-prp.appspot.com/backups/submissions \
  --collection-ids=submissions
```

---

## 8️⃣ Monitoring

### Firebase Console
- **Usage:** Console → Usage and billing
- **Reads/Writes:** Console → Firestore → Usage tab
- **Errors:** Console → Functions → Logs

### Cost Optimization (Spark Plan - Free)
- 50K reads/day
- 20K writes/day  
- 20K deletes/day
- 1GB storage

**Tips:**
- Use pagination (limit queries to 50-100 docs)
- Cache frequently accessed data
- Use batch writes when possible

---

## 9️⃣ Useful Commands

```bash
# Start local emulators
firebase emulators:start

# View logs
firebase functions:log

# Check project info
firebase projects:list

# Switch projects
firebase use tikcredit-prp
```

---

## 🔗 Resources

- [Firebase Console](https://console.firebase.google.com/project/tikcredit-prp)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)




