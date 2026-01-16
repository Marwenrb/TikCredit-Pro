# 📋 Guide de Gestion des Soumissions - TikCredit Pro

## Vue d'ensemble

Ce guide explique comment accéder et gérer les demandes de financement soumises via TikCredit Pro.

---

## 🔥 Accès à Firebase Console

### Étape 1: Connexion à Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Connectez-vous avec le compte Google associé au projet
3. Sélectionnez le projet **TikCredit-Pro**

### Étape 2: Accéder aux données Firestore

1. Dans le menu latéral, cliquez sur **Firestore Database**
2. Vous verrez la collection `submissions` contenant toutes les demandes

### Structure des données

Chaque soumission contient:

| Champ | Type | Description |
|-------|------|-------------|
| `id` | string | Identifiant unique |
| `timestamp` | timestamp | Date et heure de soumission |
| `fullName` | string | Nom complet du client |
| `phone` | string | Numéro de téléphone |
| `email` | string | Email (optionnel) |
| `wilaya` | string | Wilaya de résidence |
| `profession` | string | Profession |
| `financingType` | string | Type de financement demandé |
| `requestedAmount` | number | Montant demandé (DZD) |
| `loanDuration` | number | Durée du prêt (mois, max 18) |
| `salaryReceiveMethod` | string | Mode de réception salaire (CCP/Banque) |
| `monthlyIncomeRange` | string | Tranche de revenu mensuel |
| `notes` | string | Notes additionnelles |
| `isExistingCustomer` | string | Client existant (Oui/Non) |

---

## 📊 Tableau de bord Admin

### Accès au Dashboard

1. Accédez à `https://votre-domaine.com/admin`
2. Entrez le mot de passe administrateur
3. Vous aurez accès à:
   - Liste de toutes les soumissions
   - Statistiques en temps réel
   - Options d'export (CSV, PDF, JSON)

### Fonctionnalités du Dashboard

- **Filtrage**: Par période (aujourd'hui, semaine, mois)
- **Recherche**: Par nom, téléphone, wilaya
- **Export**: Téléchargez les données en différents formats
- **Statistiques**: Graphiques et métriques clés

---

## 📁 Stockage Local (Backup)

En plus de Firebase, les soumissions sont sauvegardées localement:

### Emplacement des fichiers

```
G:\TikCredit-Pro\data\
├── submissions.json          # Toutes les soumissions (JSON)
├── backup_YYYY-MM-DD.json    # Backups quotidiens
└── reports\
    ├── YYYY-MM\
    │   ├── DD_arabic.txt     # Rapports quotidiens (Arabe)
    │   └── DD_french.txt     # Rapports quotidiens (Français)
```

### Format du fichier JSON

```json
{
  "submissions": [
    {
      "id": "uuid-here",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "data": {
        "fullName": "أحمد محمد",
        "phone": "0555123456",
        "requestedAmount": 10000000,
        "loanDuration": 12,
        ...
      }
    }
  ],
  "lastUpdated": "2024-01-15T10:30:00.000Z",
  "totalCount": 150
}
```

---

## 🔒 Sécurité

### Règles Firestore

Les règles de sécurité actuelles:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Soumissions: lecture admin uniquement, écriture publique
    match /submissions/{document} {
      allow read: if request.auth != null;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
  }
}
```

### Bonnes pratiques

1. **Ne partagez jamais** les identifiants Firebase
2. **Sauvegardez régulièrement** les données locales
3. **Surveillez** les quotas Firebase
4. **Activez** les alertes de sécurité dans Firebase

---

## 📈 Quotas et Limites

### Firebase (Plan Gratuit - Spark)

| Ressource | Limite |
|-----------|--------|
| Lectures Firestore | 50,000/jour |
| Écritures Firestore | 20,000/jour |
| Stockage | 1 GB |
| Bande passante | 10 GB/mois |

### Recommandations pour la mise à l'échelle

Si vous dépassez les limites du plan gratuit:
1. Passez au plan **Blaze** (pay-as-you-go)
2. Configurez des budgets d'alerte
3. Optimisez les requêtes avec des index

---

## 🛠️ Commandes Utiles

### Exporter toutes les soumissions

```bash
# Via Firebase CLI
firebase firestore:export gs://your-bucket/backup

# Ou téléchargez via le dashboard admin
```

### Vérifier le statut

```bash
# Tester la connexion Firebase
npm run test:firebase

# Voir les statistiques locales
npm run stats
```

---

## 📞 Support

Pour toute question technique:
- Consultez la documentation Firebase: [firebase.google.com/docs](https://firebase.google.com/docs)
- Vérifiez les logs dans Firebase Console > Functions > Logs

---

*Dernière mise à jour: Janvier 2024*
