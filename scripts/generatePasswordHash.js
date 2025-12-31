#!/usr/bin/env node

/**
 * Password Hash Generator for TikCredit Pro
 * 
 * Usage:
 *   node scripts/generatePasswordHash.js YourSecurePassword123!
 * 
 * This will generate a bcrypt hash that you can use in .env.local
 */

const bcrypt = require('bcryptjs')

const password = process.argv[2]

if (!password) {
  console.error('❌ Error: Please provide a password as an argument')
  console.log('\nUsage:')
  console.log('  node scripts/generatePasswordHash.js YourSecurePassword123!')
  console.log('\nExample:')
  console.log('  node scripts/generatePasswordHash.js MyStr0ng!P@ssw0rd')
  process.exit(1)
}

// Validate password strength
if (password.length < 12) {
  console.error('❌ Error: Password must be at least 12 characters long')
  process.exit(1)
}

if (!/[A-Z]/.test(password)) {
  console.error('❌ Error: Password must contain at least one uppercase letter')
  process.exit(1)
}

if (!/[a-z]/.test(password)) {
  console.error('❌ Error: Password must contain at least one lowercase letter')
  process.exit(1)
}

if (!/[0-9]/.test(password)) {
  console.error('❌ Error: Password must contain at least one number')
  process.exit(1)
}

if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
  console.error('❌ Error: Password must contain at least one special character')
  process.exit(1)
}

console.log('🔒 Generating secure password hash...\n')

const saltRounds = 12
bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('❌ Error generating hash:', err)
    process.exit(1)
  }
  
  console.log('✅ Password hash generated successfully!\n')
  console.log('📋 Add this to your .env.local file:\n')
  console.log('ADMIN_PASSWORD_HASH=' + hash)
  console.log('\n⚠️  IMPORTANT: Never commit this hash to git!')
  console.log('⚠️  Keep your .env.local file secure and private.')
  console.log('\n🔐 Password strength: STRONG')
})

