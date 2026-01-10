/**
 * Script de test pour vérifier la connexion Firebase Admin SDK
 * Usage: node scripts/test-firebase-connection.js
 */

require('dotenv').config({ path: '.env.local' })
const admin = require('firebase-admin')

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY

console.log('🔍 Test de connexion Firebase Admin SDK...\n')

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Variables d\'environnement manquantes:')
  console.error('  FIREBASE_PROJECT_ID:', projectId ? '✅' : '❌')
  console.error('  FIREBASE_CLIENT_EMAIL:', clientEmail ? '✅' : '❌')
  console.error('  FIREBASE_PRIVATE_KEY:', privateKey ? '✅' : '❌')
  process.exit(1)
}

console.log('✅ Variables d\'environnement trouvées:')
console.log('  Project ID:', projectId)
console.log('  Client Email:', clientEmail)
console.log('  Private Key:', privateKey.substring(0, 30) + '...\n')

try {
  // Formater la clé privée - plusieurs formats possibles
  let formattedPrivateKey = privateKey
  
  // Retirer les guillemets environnants si présents
  formattedPrivateKey = formattedPrivateKey.replace(/^["']|["']$/g, '')
  
  // Si la clé contient des \n littéraux (chaîne), les remplacer par de vrais retours à la ligne
  if (formattedPrivateKey.includes('\\n')) {
    formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n')
  }
  
  // Vérifier que la clé commence et se termine correctement
  if (!formattedPrivateKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('Format de clé privée invalide: doit contenir "BEGIN PRIVATE KEY"')
  }
  
  if (!formattedPrivateKey.includes('END PRIVATE KEY')) {
    throw new Error('Format de clé privée invalide: doit contenir "END PRIVATE KEY"')
  }
  
  console.log('📝 Format de la clé privée:')
  console.log('   Longueur:', formattedPrivateKey.length)
  console.log('   Contient \\n:', privateKey.includes('\\n'))
  console.log('   Contient de vrais retours à la ligne:', formattedPrivateKey.includes('\n'))
  console.log('   Première ligne:', formattedPrivateKey.split('\n')[0])
  console.log('   Dernière ligne:', formattedPrivateKey.split('\n').slice(-1)[0])
  console.log('')

  // Initialiser Firebase Admin
  console.log('🔄 Initialisation de Firebase Admin SDK...')
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: formattedPrivateKey,
    }),
  })

  console.log('✅ Firebase Admin initialisé avec succès!\n')

  // Tester l'accès à Firestore
  const db = admin.firestore()
  db.settings({ ignoreUndefinedProperties: true })

  console.log('🔄 Test d\'écriture dans Firestore...')
  
  const testDoc = {
    test: true,
    timestamp: new Date().toISOString(),
    message: 'Test de connexion Firebase Admin SDK',
  }

  // Fonction async pour les tests
  async function runTests() {
    try {
      // Écrire un document de test
      await db.collection('submissions').doc('test-connection').set(testDoc)
      console.log('✅ Document de test écrit avec succès!')
      console.log('   Document ID: test-connection\n')

      // Lire le document
      console.log('🔄 Test de lecture depuis Firestore...')
      const docSnap = await db.collection('submissions').doc('test-connection').get()
      
      if (docSnap.exists) {
        console.log('✅ Document lu avec succès!')
        console.log('   Données:', JSON.stringify(docSnap.data(), null, 2))
      } else {
        console.error('❌ Document non trouvé!')
      }

      // Supprimer le document de test
      console.log('\n🔄 Suppression du document de test...')
      await db.collection('submissions').doc('test-connection').delete()
      console.log('✅ Document de test supprimé!\n')

      console.log('✅✅✅ TOUS LES TESTS RÉUSSIS! Firebase est correctement configuré. ✅✅✅\n')
      process.exit(0)
    } catch (testError) {
      throw testError
    }
  }

  // Exécuter les tests
  runTests().catch(error => {
    throw error
  })

} catch (error) {
  console.error('\n❌ ERREUR:', error.message)
  console.error('\nCode d\'erreur:', error.code)
  
  if (error.code === 16 || error.message.includes('UNAUTHENTICATED')) {
    console.error('\n💡 Solution:')
    console.error('1. Allez sur https://console.cloud.google.com/iam-admin/iam')
    console.error('2. Trouvez le service account:', clientEmail)
    console.error('3. Cliquez sur "Éditer" et ajoutez le rôle "Cloud Datastore User" ou "Owner"')
    console.error('4. Ou activez l\'API Firestore: https://console.cloud.google.com/apis/library/firestore.googleapis.com')
  } else if (error.message.includes('PERMISSION_DENIED')) {
    console.error('\n💡 Solution:')
    console.error('1. Vérifiez les règles Firestore dans firestore.rules')
    console.error('2. Déployez les règles avec: firebase deploy --only firestore:rules')
    console.error('3. Note: L\'Admin SDK bypass les règles, mais vérifiez que l\'API est activée')
  }
  
  process.exit(1)
}

