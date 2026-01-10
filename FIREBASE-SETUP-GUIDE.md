# 🔥 Guide de Configuration Firebase - TikCredit Pro

## ❌ Problème Actuel
La clé privée fournie ne peut pas être parsée par Firebase Admin SDK. Cela signifie que:
- La clé privée est corrompue ou invalide
- Les permissions du service account ne sont pas correctement configurées

## ✅ Solution: Régénérer les Credentials Firebase

### Option 1: Télécharger une nouvelle clé depuis Firebase Console (RECOMMANDÉ)

1. **Allez sur Firebase Console:**
   - URL: https://console.firebase.google.com/project/tikcredit-prp/settings/serviceaccounts/adminsdk

2. **Générez une nouvelle clé privée:**
   - Cliquez sur "Générer une nouvelle clé privée"
   - Téléchargez le fichier JSON

3. **Remplacez le fichier service-account-key.json:**
   ```bash
   # Copiez le fichier téléchargé vers votre projet
   cp ~/Downloads/tikcredit-prp-xxxxx.json service-account-key.json
   ```

4. **OU mettez à jour .env.local avec les nouvelles valeurs:**
   - Ouvrez le fichier JSON téléchargé
   - Copiez les valeurs suivantes vers `.env.local`:
     ```
     FIREBASE_PROJECT_ID=<project_id du JSON>
     FIREBASE_CLIENT_EMAIL=<client_email du JSON>
     FIREBASE_PRIVATE_KEY="<private_key du JSON (avec tous les \n)>"
     ```

### Option 2: Vérifier les Permissions IAM

1. **Allez sur Google Cloud Console IAM:**
   - URL: https://console.cloud.google.com/iam-admin/iam?project=tikcredit-prp

2. **Trouvez votre service account:**
   - Recherchez: `firebase-adminsdk-fbsvc@tikcredit-prp.iam.gserviceaccount.com`
   - Ou un autre service account si vous en avez créé un nouveau

3. **Ajoutez les rôles nécessaires:**
   - Cliquez sur "✏️ Modifier" (icône crayon)
   - Cliquez sur "+ Ajouter un autre rôle"
   - Ajoutez **au moins un** de ces rôles:
     - ✅ **Owner** (le plus complet, pour le développement)
     - ✅ **Cloud Datastore User** (minimum requis pour Firestore)
     - ✅ **Firebase Admin SDK Administrator Service Agent**

4. **Sauvegardez** les changements

### Option 3: Activer l'API Firestore

1. **Allez sur Google Cloud Console APIs:**
   - URL: https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=tikcredit-prp

2. **Activez l'API Firestore:**
   - Si elle n'est pas activée, cliquez sur "Activer"

3. **Vérifiez que Firestore est créé:**
   - URL: https://console.firebase.google.com/project/tikcredit-prp/firestore
   - Si aucune base de données n'existe, créez-en une:
     - Mode: **Production** (recommandé) ou **Test**
     - Localisation: Choisissez la plus proche (ex: `europe-west1`)

## 🧪 Tester la Configuration

Une fois que vous avez mis à jour les credentials, testez la connexion:

```bash
node scripts/test-firebase-simple.js
```

Si le test réussit, vous verrez:
```
✅✅✅ TOUS LES TESTS RÉUSSIS! Firebase fonctionne parfaitement! ✅✅✅
```

## 📝 Mise à Jour du Code

Le code est déjà configuré pour utiliser:
1. **Fichier `service-account-key.json`** (priorité haute) - si présent dans la racine du projet
2. **Variables d'environnement** (fallback) - depuis `.env.local`

## 🔒 Sécurité

⚠️ **IMPORTANT:**
- **NE COMMITEZ JAMAIS** `service-account-key.json` dans Git
- **NE COMMITEZ JAMAIS** `.env.local` dans Git
- Ces fichiers sont déjà dans `.gitignore`

## ✅ Après Configuration

Une fois Firebase configuré correctement:
1. Les soumissions seront sauvegardées dans Firestore (au lieu du fichier local)
2. Le dashboard admin pourra lire les soumissions depuis Firebase
3. Les données seront persistées dans le cloud

## 🆘 Si le Problème Persiste

1. Vérifiez que le service account a les bonnes permissions
2. Vérifiez que l'API Firestore est activée
3. Vérifiez que Firestore est créé dans Firebase Console
4. Essayez de régénérer une nouvelle clé privée depuis Firebase Console
5. Vérifiez que la clé privée dans `.env.local` a tous les `\n` correctement échappés

## 📚 Ressources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Google Cloud IAM](https://cloud.google.com/iam/docs)

