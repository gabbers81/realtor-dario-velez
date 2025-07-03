#!/usr/bin/env node

// Deploy PDF Fix Script
// This script ensures PDFs are properly deployed to production

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🚀 PDF Production Deployment Fix');
console.log('=================================');

const productionPdfsPath = 'dist/public/pdfs';
const sourcePdfsPath = 'client/public/pdfs';

// Step 1: Clean and rebuild production assets
console.log('\n1. 🧹 Cleaning production build...');
try {
  if (fs.existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
  }
  console.log('✅ Production directory cleaned');
} catch (error) {
  console.log('⚠️  Clean step failed, continuing...');
}

// Step 2: Build frontend
console.log('\n2. 🔨 Building frontend...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Frontend built successfully');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  process.exit(1);
}

// Step 3: Build backend
console.log('\n3. 🛠️  Building backend...');
try {
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  console.log('✅ Backend built successfully');
} catch (error) {
  console.error('❌ Backend build failed:', error.message);
  process.exit(1);
}

// Step 4: Ensure PDFs directory exists and copy files
console.log('\n4. 📁 Setting up PDFs...');
fs.mkdirSync(productionPdfsPath, { recursive: true });

if (fs.existsSync(sourcePdfsPath)) {
  const pdfFiles = fs.readdirSync(sourcePdfsPath).filter(f => f.endsWith('.pdf'));
  
  console.log(`Found ${pdfFiles.length} PDF files to copy:`);
  
  pdfFiles.forEach(file => {
    const src = `${sourcePdfsPath}/${file}`;
    const dest = `${productionPdfsPath}/${file}`;
    
    fs.copyFileSync(src, dest);
    
    // Set proper permissions (readable by all)
    fs.chmodSync(dest, 0o644);
    
    const stats = fs.statSync(dest);
    const sizeMB = Math.round(stats.size / 1024 / 1024);
    
    console.log(`✅ ${file} (${sizeMB}MB)`);
  });
  
  console.log(`📊 Total PDFs deployed: ${pdfFiles.length}`);
} else {
  console.error('❌ Source PDFs directory not found');
  process.exit(1);
}

// Step 5: Verify deployment
console.log('\n5. 🔍 Verifying deployment...');

const expectedPdfs = [
  'secret-garden.pdf',
  'solvamar-macao.pdf',
  'the-reef.pdf',
  'palm-beach-residences.pdf',
  'amares-unique-homes.pdf',
  'tropical-beach-3-0.pdf',
  'las-cayas-residences.pdf',
  'aura-boulevard.pdf'
];

let allPresent = true;
const largePdfs = [];

expectedPdfs.forEach(pdf => {
  const filePath = `${productionPdfsPath}/${pdf}`;
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    const stats = fs.statSync(filePath);
    const sizeMB = Math.round(stats.size / 1024 / 1024);
    
    console.log(`✅ ${pdf} (${sizeMB}MB)`);
    
    if (sizeMB > 35) {
      largePdfs.push(`${pdf} (${sizeMB}MB)`);
    }
  } else {
    console.log(`❌ ${pdf} - MISSING`);
    allPresent = false;
  }
});

// Step 6: Production recommendations
console.log('\n6. 💡 Production Notes:');
console.log('=====================');

if (largePdfs.length > 0) {
  console.log('⚠️  Large files detected:');
  largePdfs.forEach(file => console.log(`   - ${file}`));
  console.log('\n🔧 Server configuration required:');
  console.log('   - Increase memory limits for Node.js process');
  console.log('   - Enable HTTP/2 streaming support');
  console.log('   - Set appropriate timeout values (120s+)');
  console.log('   - Disable compression for PDF routes');
}

if (allPresent) {
  console.log('\n🎉 All PDFs successfully deployed!');
  console.log('\n🚀 Ready for production deployment');
} else {
  console.log('\n❌ Deployment incomplete - missing PDF files');
  process.exit(1);
}

console.log('\n📋 Next steps:');
console.log('1. Deploy to production with: npm run start');
console.log('2. Test PDF endpoints: /pdfs/secret-garden.pdf');
console.log('3. Monitor server logs for large file streaming');
console.log('4. Verify Content-Type: application/pdf headers');