# TikCredit Pro - Guide Supabase

Guide complet pour la configuration et l'utilisation de Supabase.

---

## Configuration Initiale

### 1. Créer la table submissions

Allez dans **Supabase Dashboard → SQL Editor** et exécutez:

```sql
-- Table des soumissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Données du formulaire
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  wilaya TEXT NOT NULL,
  profession TEXT,
  custom_profession TEXT,
  monthly_income_range TEXT,
  salary_receive_method TEXT NOT NULL,
  financing_type TEXT NOT NULL,
  requested_amount BIGINT NOT NULL,
  is_existing_customer TEXT,
  preferred_contact_time TEXT,
  notes TEXT,
  
  -- Métadonnées
  status TEXT DEFAULT 'pending',
  source TEXT DEFAULT 'web-form',
  ip_address TEXT,
  user_agent TEXT,
  
  -- Suivi des sauvegardes
  last_backup_at TIMESTAMPTZ,
  backup_count INTEGER DEFAULT 0
);

-- Activer Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Index pour performance
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_phone ON submissions(phone);

-- Trigger mise à jour automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 2. Configurer les Variables d'Environnement

Dans `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jkbqbchwyqewsobldgbx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=<votre-clé-service-role>
```

> ⚠️ La `SUPABASE_SERVICE_ROLE_KEY` se trouve dans: **Dashboard → Settings → API → service_role**

---

## Architecture

| Fichier | Rôle |
|---------|------|
| `src/lib/supabase.ts` | Client SDK (browser) |
| `src/lib/supabase-admin.ts` | Admin SDK (server) |
| `src/lib/supabaseService.ts` | Service CRUD haut niveau |
| `src/lib/persistenceService.ts` | Stratégie dual-storage |

---

## API Endpoints

### Soumettre un formulaire
```
POST /api/submissions/submit
```

### Lister les soumissions (admin)
```
GET /api/submissions/list
```

### Synchroniser vers Supabase
```
POST /api/submissions/sync
```

### Créer une sauvegarde
```
POST /api/backup
GET /api/backup?format=json&download=true
GET /api/backup?format=text&download=true
```

---

## Dashboard Supabase

### Voir les données
1. Dashboard → Table Editor → submissions
2. Cliquer sur une ligne pour voir les détails

### Exporter en CSV
1. Table Editor → submissions
2. Cliquer "Export" en haut à droite
3. Choisir CSV

### Requête SQL personnalisée
```sql
-- Soumissions du jour
SELECT * FROM submissions 
WHERE created_at >= CURRENT_DATE;

-- Par wilaya
SELECT wilaya, COUNT(*) as total 
FROM submissions 
GROUP BY wilaya 
ORDER BY total DESC;

-- Montant total demandé
SELECT SUM(requested_amount) as total_amount 
FROM submissions;
```

---

## Dépannage

### Erreur "Supabase Admin not initialized"
- Vérifiez `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`
- Redémarrez le serveur: `npm run dev`

### Soumissions non sauvegardées
1. Vérifiez la console pour les erreurs
2. Assurez-vous que la table existe dans Supabase
3. Vérifiez les politiques RLS

### Synchronisation locale → Supabase
```bash
# Via API
curl -X POST http://localhost:3000/api/submissions/sync
```
