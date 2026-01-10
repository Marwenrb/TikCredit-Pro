# ⚡ Configuration Rapide Vercel - TikCredit Pro

## ⚠️ SECURITY WARNING - READ FIRST!

**🔐 CRITICAL:** If you cloned this repository before January 10, 2026, credentials were exposed in Git history.

**YOU MUST:**
1. **READ** `SECURITY-NOTICE.md` immediately
2. **REGENERATE** all credentials (admin password, JWT secret, Firebase keys)
3. **NEVER USE** any credentials you find in Git history

---

## 🎯 Solution Immédiate

**✅ La branche `main` contient maintenant TOUT le code de production !**

Vercel déploiera automatiquement depuis `main` après configuration.

## 🚀 Configuration en 3 Étapes

### Étape 1: Connecter le Repository à Vercel

1. **Allez sur:** https://vercel.com/new
2. **Cliquez sur "Import Git Repository"**
3. **Connectez GitHub** si pas déjà fait
4. **Sélectionnez:** `Marwenrb/TikCredit-Pro`
5. **Cliquez sur "Import"**

### Étape 2: Configuration du Projet (Auto-détecté)

Vercel détectera automatiquement:
- ✅ Framework: **Next.js**
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `.next`
- ✅ Install Command: `npm install`
- ✅ **Production Branch:** `main` (déjà configuré)

**✅ Cliquez sur "Deploy" sans changer les paramètres !**

### Étape 3: Ajouter les Variables d'Environnement

Après le premier déploiement (qui peut échouer sans les variables):

1. **Allez dans votre projet Vercel Dashboard**
2. **Cliquez sur "Settings"**
3. **Cliquez sur "Environment Variables"**
4. **Ajoutez ces variables:**

#### Variables Requises:

```
ADMIN_PASSWORD
Value: your-secure-admin-password-here
Environments: Production, Preview, Development

JWT_SECRET
Value: your-secure-jwt-secret-minimum-32-characters
Environments: Production, Preview, Development
```

⚠️ **CRITICAL:** NEVER commit these values to Git!

#### Variables Firebase (Optionnelles):

```
FIREBASE_PROJECT_ID
Value: your-firebase-project-id
Environments: Production, Preview, Development

FIREBASE_CLIENT_EMAIL
Value: your-service-account@your-project.iam.gserviceaccount.com
Environments: Production, Preview, Development

FIREBASE_PRIVATE_KEY
Value: [Your complete private key from Firebase Console]
Format: -----BEGIN PRIVATE KEY-----\nMIIEvw...\n-----END PRIVATE KEY-----\n
Environments: Production, Preview, Development
```

**⚠️ Important pour FIREBASE_PRIVATE_KEY:**
- Get the complete key from Firebase Console (Project Settings → Service Accounts)
- Download the JSON file and copy the `private_key` value
- Keep ALL `\n` as literals (do not convert to actual line breaks)
- The key must start with `-----BEGIN PRIVATE KEY-----\n` and end with `\n-----END PRIVATE KEY-----\n`
- NEVER commit this to Git - set it only in Vercel Dashboard

### Étape 4: Redéployer

Après avoir ajouté les variables:

1. **Allez dans "Deployments"**
2. **Cliquez sur les "..." du dernier déploiement**
3. **Cliquez sur "Redeploy"**
4. **Sélectionnez "Use existing Build Cache"** (optionnel)
5. **Cliquez sur "Redeploy"**

## ✅ Vérification Post-Déploiement

Après le redéploiement, vérifiez:

1. **✅ Site accessible:** `https://votre-projet.vercel.app`
2. **✅ Page d'accueil fonctionne:** `/`
3. **✅ Formulaire accessible:** `/form`
4. **✅ Admin accessible:** `/admin` (avec mot de passe)
5. **✅ API fonctionne:** Testez `/api/submissions/submit`
6. **✅ Pas d'erreurs dans les logs Vercel**

## 🔍 Dépannage Rapide

### Erreur: "ADMIN_PASSWORD not set"
➡️ Ajoutez `ADMIN_PASSWORD` dans Environment Variables

### Erreur: "JWT_SECRET not set"
➡️ Ajoutez `JWT_SECRET` dans Environment Variables

### Erreur: "Firebase authentication failed"
➡️ Vérifiez que `FIREBASE_PRIVATE_KEY` contient tous les `\n` littéraux
➡️ Vérifiez les permissions IAM dans Google Cloud Console

### Build échoue
➡️ Vérifiez les logs de build dans Vercel Dashboard
➡️ Vérifiez que toutes les variables d'environnement sont définies
➡️ Vérifiez que `node_modules` n'est pas dans le commit (déjà dans .gitignore)

## 🎯 Workflow de Déploiement Futur

**Pour déployer de nouvelles versions:**

```bash
# 1. Développer sur production-v1.0 (ou une autre branche)
git checkout production-v1.0

# 2. Faire vos modifications et commits
git add .
git commit -m "feat: Nouvelle fonctionnalité"

# 3. Merger dans main
git checkout main
git merge production-v1.0

# 4. Pousser vers GitHub
git push origin main

# 5. ✅ Vercel déploiera automatiquement en 2-3 minutes !
```

## 📝 Note Importante

**La branche `main` est maintenant votre branche de production stable.**

- ✅ Tous les changements de `production-v1.0` sont dans `main`
- ✅ Vercel déploie automatiquement depuis `main`
- ✅ Chaque push vers `main` = Nouveau déploiement
- ✅ Les changements de `production-v1.0` peuvent être mergés dans `main` à tout moment

## 🔗 Liens Utiles

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Documentation Vercel:** https://vercel.com/docs
- **Guide Complet:** Voir `VERCEL-DEPLOYMENT.md`
- **Firebase Setup:** Voir `FIREBASE-SETUP-GUIDE.md`

---

**✅ Configuration terminée ! Votre projet se déploiera automatiquement sur Vercel depuis `main` !**

