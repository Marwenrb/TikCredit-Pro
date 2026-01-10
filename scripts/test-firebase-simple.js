/**
 * Test simple de connexion Firebase avec le fichier service-account-key.json
 */

const admin = require('firebase-admin')
const path = require('path')
const fs = require('fs')

const serviceAccountPath = path.join(__dirname, '..', 'service-account-key.json')

async function testFirebase() {
  console.log('🔍 Test de connexion Firebase Admin SDK...\n')

  try {
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('❌ Fichier service-account-key.json non trouvé!')
      console.error('   Exécutez: node scripts/create-service-account.js')
      process.exit(1)
    }

    console.log('✅ Fichier service-account-key.json trouvé')
    const serviceAccount = require(serviceAccountPath)

    console.log('🔄 Initialisation de Firebase Admin SDK...')
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })

    console.log('✅ Firebase Admin initialisé avec succès!')
    console.log('   Project ID:', serviceAccount.project_id)
    console.log('   Client Email:', serviceAccount.client_email)
    console.log('')

    const db = admin.firestore()
    db.settings({ ignoreUndefinedProperties: true })

    console.log('🔄 Test d\'écriture dans Firestore...')
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'Test de connexion réussi'
    }

    await db.collection('submissions').doc('test-connection').set(testData)
    console.log('✅ Document écrit avec succès!\n')

    console.log('🔄 Test de lecture...')
    const doc = await db.collection('submissions').doc('test-connection').get()
    
    if (doc.exists) {
      console.log('✅ Document lu avec succès!')
      console.log('   Données:', JSON.stringify(doc.data(), null, 2))
    }

    console.log('\n🔄 Suppression du document de test...')
    await db.collection('submissions').doc('test-connection').delete()
    console.log('✅ Document supprimé!\n')

    console.log('✅✅✅ TOUS LES TESTS RÉUSSIS! Firebase fonctionne parfaitement! ✅✅✅\n')
    process.exit(0)

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message)
    console.error('   Code:', error.code || 'N/A')
    
    if (error.code === 16 || error.message.includes('UNAUTHENTICATED') || error.message.includes('PERMISSION_DENIED')) {
      const serviceAccount = require(serviceAccountPath)
      console.error('\n💡 Solutions:')
      console.error('1. Allez sur: https://console.cloud.google.com/iam-admin/iam?project=tikcredit-prp')
      console.error('2. Trouvez le service account:', serviceAccount.client_email)
      console.error('3. Cliquez sur "✏️ Modifier" et ajoutez le rôle "Cloud Datastore User" ou "Owner"')
      console.error('4. Activez l\'API Firestore: https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=tikcredit-prp')
      console.error('5. Assurez-vous que Firestore est créé: https://console.firebase.google.com/project/tikcredit-prp/firestore')
    }
    
    process.exit(1)
  }
}

testFirebase()

