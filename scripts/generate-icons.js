/**
 * Icon Generator Script for TikCredit Pro
 * 
 * This script converts SVG icons to PNG format for Android Chrome.
 * 
 * Prerequisites:
 * 1. Install sharp: npm install sharp --save-dev
 * 2. Run: node scripts/generate-icons.js
 * 
 * Alternative: Use online tools like:
 * - https://svgtopng.com/
 * - https://cloudconvert.com/svg-to-png
 * - https://convertio.co/svg-png/
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Sharp library not found.');
  console.log('');
  console.log('To generate PNG icons automatically, install sharp:');
  console.log('  npm install sharp --save-dev');
  console.log('');
  console.log('Then run this script again:');
  console.log('  node scripts/generate-icons.js');
  console.log('');
  console.log('Alternatively, you can convert the SVG files manually:');
  console.log('');
  console.log('📁 SVG files are located at:');
  console.log('   - public/android-chrome-192x192.svg');
  console.log('   - public/android-chrome-512x512.svg');
  console.log('');
  console.log('🌐 Online converters:');
  console.log('   - https://svgtopng.com/');
  console.log('   - https://cloudconvert.com/svg-to-png');
  console.log('   - https://convertio.co/svg-png/');
  console.log('');
  console.log('After conversion, save the PNG files to:');
  console.log('   - public/android-chrome-192x192.png');
  console.log('   - public/android-chrome-512x512.png');
  process.exit(0);
}

const publicDir = path.join(__dirname, '..', 'public');

async function generateIcons() {
  console.log('🎨 Generating Android Chrome icons...');
  console.log('');

  const icons = [
    { svg: 'android-chrome-192x192.svg', png: 'android-chrome-192x192.png', size: 192 },
    { svg: 'android-chrome-512x512.svg', png: 'android-chrome-512x512.png', size: 512 },
  ];

  for (const icon of icons) {
    const svgPath = path.join(publicDir, icon.svg);
    const pngPath = path.join(publicDir, icon.png);

    if (!fs.existsSync(svgPath)) {
      console.log(`❌ SVG not found: ${icon.svg}`);
      continue;
    }

    try {
      await sharp(svgPath)
        .resize(icon.size, icon.size)
        .png()
        .toFile(pngPath);

      console.log(`✅ Created: ${icon.png} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.log(`❌ Error creating ${icon.png}:`, error.message);
    }
  }

  console.log('');
  console.log('🎉 Icon generation complete!');
  console.log('');
  console.log('The following files have been created:');
  console.log('   - public/android-chrome-192x192.png');
  console.log('   - public/android-chrome-512x512.png');
}

generateIcons().catch(console.error);

