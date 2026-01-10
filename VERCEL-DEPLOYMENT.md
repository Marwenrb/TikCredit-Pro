# 🚀 Guide de Déploiement Vercel - TikCredit Pro

## ✅ Configuration Automatique

Le projet est maintenant configuré pour être déployé automatiquement sur Vercel depuis la branche `main`.

## 📋 Étapes de Déploiement

### Option 1: Déploiement Automatique (Recommandé)

1. **Connecter le Repository GitHub à Vercel:**
   - Allez sur: https://vercel.com/new
   - Importez le repository: `Marwenrb/TikCredit-Pro`
   - Vercel détectera automatiquement Next.js

2. **Configuration du Projet:**
   - **Framework Preset:** Next.js (détecté automatiquement)
   - **Root Directory:** `./` (racine du projet)
   - **Build Command:** `npm run build` (par défaut)
   - **Output Directory:** `.next` (par défaut)
   - **Install Command:** `npm install` (par défaut)

3. **Branche de Production:**
   - **Production Branch:** `main` ✅ (déjà configuré)
   - Vercel déploiera automatiquement chaque push vers `main`

4. **Variables d'Environnement:**
   - Allez dans **Settings** → **Environment Variables**
   - Ajoutez ces variables (NE PAS COMMITER LES VRAIES VALEURS):
   
   ```
   ADMIN_PASSWORD=AdminTikCredit123Pro!
   JWT_SECRET=TikCreditPro2026SecureJWTSigningKeyForAdminAuth!
   FIREBASE_PROJECT_ID=tikcredit-prp
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@tikcredit-prp.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY=[Votre clé privée complète avec \n]
   ```

   ⚠️ **Important:** Pour `FIREBASE_PRIVATE_KEY`, copiez la clé complète depuis `service-account-key.json` et remplacez les retours à la ligne par `\n` littéraux.

### Option 2: Utiliser un Fichier Service Account (Alternative)

Au lieu d'utiliser les variables d'environnement, vous pouvez :

1. Créer un fichier `service-account-key.json` via le script:
   ```bash
   node scripts/create-service-account.js
   ```

2. Ajouter le contenu du fichier dans Vercel comme **Secret**:
   - Settings → Environment Variables
   - Ajoutez `FIREBASE_SERVICE_ACCOUNT_KEY` avec le contenu JSON complet

3. Le code utilisera automatiquement le fichier s'il existe

## 🔧 Configuration Vercel (vercel.json)

Le fichier `vercel.json` est déjà configuré avec :
- ✅ Build optimisé pour Next.js
- ✅ Headers de sécurité (CSP, X-Frame-Options, etc.)
- ✅ Timeout augmenté pour les API routes (30s)
- ✅ Configuration des régions (iad1 - US East)

## 📝 Workflow de Déploiement

### Déploiement Automatique:
```
1. Développement sur production-v1.0
2. Tests et validation
3. Merge dans main: git merge production-v1.0
4. Push vers GitHub: git push origin main
5. Vercel déploie automatiquement depuis main ✅
```

### Déploiement Manuel:
Si besoin, vous pouvez aussi déployer manuellement depuis Vercel Dashboard:
1. Allez dans votre projet Vercel
2. Cliquez sur **"Deployments"**
3. Cliquez sur **"Redeploy"** sur le dernier déploiement
4. Ou créez un nouveau déploiement depuis une branche spécifique

## 🔐 Sécurité

### Fichiers Protégés (.vercelignore):
- ✅ `service-account-key.json` - Ne sera jamais déployé
- ✅ `.env.local` - Ne sera jamais déployé
- ✅ `node_modules/` - Reconstruit sur Vercel
- ✅ Scripts de développement

### Variables d'Environnement:
- ✅ Toujours utiliser les **Environment Variables** de Vercel Dashboard
- ✅ Ne JAMAIS commiter les credentials dans Git
- ✅ Utiliser des valeurs différentes pour Production/Preview/Development

## 🚀 Déploiement Immédiat

Pour déployer maintenant:

```bash
# 1. Vérifier que vous êtes sur main
git checkout main

# 2. Vérifier que main contient production-v1.0
git log --oneline -3

# 3. Push vers GitHub (si pas déjà fait)
git push origin main

# 4. Vercel déploiera automatiquement dans ~2-3 minutes
```

## ✅ Vérification Post-Déploiement

Après le déploiement, vérifiez:

1. **Site accessible:** `https://votre-projet.vercel.app`
2. **API fonctionnelle:** `/api/submissions/submit` retourne 200
3. **Admin accessible:** `/admin` avec le mot de passe
4. **Firebase connecté:** Les soumissions sont sauvegardées dans Firestore
5. **Pas d'erreurs dans les logs Vercel**

## 🔍 Dépannage

### Si le déploiement échoue:
1. Vérifiez les logs de build dans Vercel Dashboard
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez que `service-account-key.json` n'est pas dans le commit (il doit être dans .vercelignore)

### Si Firebase ne fonctionne pas en production:
1. Vérifiez que `FIREBASE_PRIVATE_KEY` a tous les `\n` correctement échappés
2. Vérifiez les permissions IAM du service account dans Google Cloud Console
3. Vérifiez que Firestore est créé et activé

## 📞 Support

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Firebase Setup Guide:** Voir `FIREBASE-SETUP-GUIDE.md`

---

**✅ Votre projet est maintenant configuré pour un déploiement automatique sur Vercel depuis la branche `main` !**

