# Guide d'Extraction et d'Impression des Données
# دليل استخراج البيانات والطباعة

Guide complet pour extraire et imprimer les soumissions collectées.

---

## Méthode 1: Interface Admin (Recommandée)

### Étapes:
1. Allez à `/admin` et connectez-vous
2. Cliquez sur **"Exporter"** ou **"تصدير"**
3. Choisissez le format:
   - **JSON** - Données brutes pour traitement
   - **Texte** - Format lisible pour impression

### Téléchargement direct:
```
https://votre-domaine.com/api/backup?format=text&download=true
```

---

## Méthode 2: API Backup

### Générer et télécharger JSON:
```bash
curl -X GET "http://localhost:3000/api/backup?format=json&download=true" \
  -H "Cookie: admin-token=VOTRE_TOKEN" \
  -o backup.json
```

### Générer et télécharger Texte imprimable:
```bash
curl -X GET "http://localhost:3000/api/backup?format=text&download=true" \
  -H "Cookie: admin-token=VOTRE_TOKEN" \
  -o soumissions.txt
```

### Créer une sauvegarde locale:
```bash
curl -X POST "http://localhost:3000/api/backup" \
  -H "Cookie: admin-token=VOTRE_TOKEN"
```
Les fichiers sont sauvegardés dans `data/backups/`

---

## Méthode 3: Supabase Dashboard

### Export CSV:
1. Ouvrez [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez à **Table Editor → submissions**
4. Cliquez sur **Export** (en haut à droite)
5. Choisissez **CSV**

### Requête SQL personnalisée:
```sql
-- Toutes les soumissions avec format lisible
SELECT 
  created_at as "Date",
  full_name as "Nom",
  phone as "Téléphone",
  email as "Email",
  wilaya as "Wilaya",
  profession as "Profession",
  financing_type as "Type Financement",
  requested_amount as "Montant (DA)",
  status as "Statut"
FROM submissions
ORDER BY created_at DESC;
```

### Export par période:
```sql
-- Soumissions de ce mois
SELECT * FROM submissions 
WHERE created_at >= date_trunc('month', CURRENT_DATE);

-- Dernière semaine
SELECT * FROM submissions 
WHERE created_at >= NOW() - INTERVAL '7 days';
```

---

## Méthode 4: Fichiers Locaux

Les soumissions sont aussi sauvegardées localement:

| Fichier | Contenu |
|---------|---------|
| `data/submissions.json` | Toutes les soumissions (JSON) |
| `data/backups/*.json` | Sauvegardes journalières (JSON) |
| `data/backups/*.txt` | Sauvegardes imprimables (Texte) |

### Copier les fichiers:
```powershell
# Windows
Copy-Item data\submissions.json C:\Backup\

# Sauvegardes
Copy-Item data\backups\* C:\Backup\backups\
```

---

## Format d'Impression

Le format texte est optimisé pour l'impression:

```
═══════════════════════════════════════════════════════════════════
       TIKCREDIT PRO - LISTE DES DEMANDES / قائمة الطلبات
       Généré le: 27/01/2026 12:00
       Nombre total: 150
═══════════════════════════════════════════════════════════════════

───────────────────────────────────────────────────────────────────
  DEMANDE N° 1 / الطلب رقم 1
───────────────────────────────────────────────────────────────────
  ID: abc-123-def
  Date: 27/01/2026 11:30

  Nom complet / الاسم الكامل:
    محمد علي

  Téléphone / الهاتف:
    0555123456

  Montant demandé / المبلغ المطلوب:
    10,000,000 DA / ١٠,٠٠٠,٠٠٠ د.ج
...
```

### Imprimer:
1. Ouvrez le fichier `.txt` dans Notepad
2. **Fichier → Imprimer**
3. Utilisez une police monospace (Consolas, Courier New)

---

## Automatisation des Sauvegardes

### Script PowerShell (Windows):
```powershell
# backup-daily.ps1
$date = Get-Date -Format "yyyy-MM-dd"
$backupDir = "C:\TikCredit-Backups\$date"
New-Item -ItemType Directory -Path $backupDir -Force

# Copier les données
Copy-Item "G:\TikCredit-Pro\data\submissions.json" "$backupDir\"
Copy-Item "G:\TikCredit-Pro\data\backups\*" "$backupDir\"

Write-Host "Backup créé dans: $backupDir"
```

### Planifier avec Task Scheduler:
1. Ouvrir **Task Scheduler**
2. Créer une tâche basique
3. Déclencher: Quotidien
4. Action: Exécuter `powershell -File backup-daily.ps1`

---

## Backup Cloud (Supabase)

Supabase effectue des sauvegardes automatiques:
- **Plan gratuit**: Backup manuel via export
- **Plan Pro**: Backups automatiques quotidiens + point-in-time recovery

### Exporter toute la base:
Dashboard → Settings → Database → **Download Backup**
