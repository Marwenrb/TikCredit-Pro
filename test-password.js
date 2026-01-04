const bcrypt = require('bcryptjs');
const fs = require('fs');

// Read the .env.local file
const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
const hashLine = lines.find(l => l.trim().startsWith('ADMIN_PASSWORD_HASH='));

if (!hashLine) {
  console.error('❌ ADMIN_PASSWORD_HASH not found in .env.local');
  process.exit(1);
}

const hash = hashLine.split('=')[1].trim();

console.log('🔍 Testing password verification...\n');
console.log('Hash from .env.local:');
console.log(hash);
console.log('\nHash length:', hash.length);
console.log('Hash starts with $2b$12$:', hash.startsWith('$2b$12$'));

const testPasswords = [
  'AdminTikCredit123Pro',
  'AdminTikCredit123Pro!',
  'Admin123!@#Secure'
];

console.log('\n📝 Testing passwords:\n');

testPasswords.forEach(password => {
  bcrypt.compare(password, hash, (err, result) => {
    if (err) {
      console.error(`❌ Error testing "${password}":`, err);
    } else {
      console.log(`${result ? '✅' : '❌'} "${password}": ${result ? 'MATCH' : 'NO MATCH'}`);
    }
  });
});

// Also test with the hash directly
setTimeout(() => {
  console.log('\n🔧 Now testing what the server would see...\n');
  
  // Simulate what Next.js does
  process.env.ADMIN_PASSWORD_HASH = hash;
  
  const passwordFromClient = 'AdminTikCredit123Pro';
  
  bcrypt.compare(passwordFromClient, process.env.ADMIN_PASSWORD_HASH, (err, result) => {
    if (err) {
      console.error('❌ Error:', err);
    } else {
      console.log(`Server verification result: ${result ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      if (!result) {
        console.log('\n⚠️  The password does NOT match the hash in .env.local');
        console.log('This is why you\'re getting 401 errors!');
        console.log('\nLet me generate a NEW hash for you...\n');
        
        bcrypt.hash(passwordFromClient, 12, (err2, newHash) => {
          if (err2) {
            console.error('Error generating new hash:', err2);
          } else {
            console.log('✅ New hash generated:');
            console.log(newHash);
            console.log('\nUpdate your .env.local with this hash!');
          }
        });
      } else {
        console.log('\n✅ Everything is working correctly!');
        console.log('The issue must be elsewhere. Check:');
        console.log('1. Is the dev server running?');
        console.log('2. Did you restart it after updating .env.local?');
        console.log('3. Are you using the correct password?');
      }
    }
  });
}, 500);


