const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Simple password for admin access
const PASSWORD = 'Admin123';

// Generate bcrypt hash
const hash = bcrypt.hashSync(PASSWORD, 12);

// Verify it works
const verified = bcrypt.compareSync(PASSWORD, hash);
console.log('Password:', PASSWORD);
console.log('Hash:', hash);
console.log('Verification:', verified ? '✅ SUCCESS' : '❌ FAILED');

if (!verified) {
  console.error('Hash verification failed!');
  process.exit(1);
}

// Create .env.local content
const envContent = `# TikCredit Pro - Environment Variables
# WARNING: Never commit this file to git!

# ADMIN AUTHENTICATION
# Password: ${PASSWORD}
ADMIN_PASSWORD_HASH=${hash}

# JWT Configuration  
JWT_SECRET=tikcredit-ultra-secure-jwt-secret-key-2024-production-ready-${Date.now()}

# Firebase (add your own values)
# NEXT_PUBLIC_FIREBASE_API_KEY=
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
# NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
# NEXT_PUBLIC_FIREBASE_APP_ID=
`;

// Write to .env.local
const envPath = path.join(process.cwd(), '.env.local');
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('\n✅ .env.local created successfully!');
console.log('📝 Admin Password:', PASSWORD);
console.log('\n🚀 Restart your dev server: npm run dev');

