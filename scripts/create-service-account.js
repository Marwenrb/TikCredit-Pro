/**
 * Script pour créer le fichier service account JSON à partir de .env.local
 * Usage: node scripts/create-service-account.js
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
let privateKey = process.env.FIREBASE_PRIVATE_KEY

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

// Nettoyer la clé privée
privateKey = privateKey.replace(/^["']|["']$/g, '')
if (privateKey.includes('\\n')) {
  privateKey = privateKey.replace(/\\n/g, '\n')
}
// Retirer les espaces en début/fin et retours à la ligne supplémentaires
privateKey = privateKey.trim()

const serviceAccount = {
  type: "service_account",
  project_id: projectId,
  private_key_id: "849f705b83f6e8c77814182bca8c29d8063848c4",
  private_key: privateKey,
  client_email: clientEmail,
  client_id: "118394318504192936407",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`,
  universe_domain: "googleapis.com"
}

const filePath = path.join(__dirname, '..', 'service-account-key.json')
fs.writeFileSync(filePath, JSON.stringify(serviceAccount, null, 2))

console.log('✅ Fichier service-account-key.json créé avec succès!')
console.log('   Chemin:', filePath)
console.log('   ⚠️  N\'oubliez pas d\'ajouter ce fichier à .gitignore!')

