#!/usr/bin/env node

// Production PDF Diagnostic Script
// Checks production build, file sizes, and serving capability

import fs from 'fs';
import path from 'path';

const productionPdfsPath = 'dist/public/pdfs';
const expectedPdfs = [
  'secret-garden.pdf',
  'the-reef.pdf',
  'palm-beach-residences.pdf',
  'solvamar-macao.pdf',
  'amares-unique-homes.pdf',
  'tropical-beach-3-0.pdf',
  'las-cayas-residences.pdf',
  'aura-boulevard.pdf'
];

console.log('🔍 Production PDF Diagnostic');
console.log('============================');

// Check if production PDF directory exists
if (!fs.existsSync(productionPdfsPath)) {
  console.log('❌ Production PDF directory missing:', productionPdfsPath);
  console.log('🔧 Creating directory and copying PDFs...');
  
  fs.mkdirSync(productionPdfsPath, { recursive: true });
  
  // Copy PDFs from client/public/pdfs
  const sourcePdfsPath = 'client/public/pdfs';
  if (fs.existsSync(sourcePdfsPath)) {
    const sourceFiles = fs.readdirSync(sourcePdfsPath).filter(f => f.endsWith('.pdf'));
    sourceFiles.forEach(file => {
      const src = path.join(sourcePdfsPath, file);
      const dest = path.join(productionPdfsPath, file);
      fs.copyFileSync(src, dest);
      console.log(`📁 Copied: ${file}`);
    });
  }
}

console.log('\n📊 PDF Status Check:');
console.log('--------------------');

const diagnostics = {
  directory_exists: fs.existsSync(productionPdfsPath),
  total_files: 0,
  available_pdfs: [],
  missing_pdfs: [],
  file_sizes: {},
  permission_issues: [],
  large_files: []
};

if (diagnostics.directory_exists) {
  const files = fs.readdirSync(productionPdfsPath);
  const pdfFiles = files.filter(f => f.endsWith('.pdf'));
  
  diagnostics.total_files = pdfFiles.length;
  diagnostics.available_pdfs = pdfFiles;
  
  // Check for missing expected PDFs
  diagnostics.missing_pdfs = expectedPdfs.filter(expectedPdf => 
    !pdfFiles.includes(expectedPdf)
  );
  
  // Check file sizes and permissions
  pdfFiles.forEach(file => {
    const filePath = path.join(productionPdfsPath, file);
    const stats = fs.statSync(filePath);
    const sizeMB = Math.round(stats.size / 1024 / 1024);
    
    diagnostics.file_sizes[file] = `${sizeMB}MB`;
    
    // Check for large files (>35MB)
    if (stats.size > 35 * 1024 * 1024) {
      diagnostics.large_files.push(`${file} (${sizeMB}MB)`);
    }
    
    // Check permissions (should be readable)
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
    } catch (error) {
      diagnostics.permission_issues.push(file);
    }
  });
}

// Print diagnostics
console.log(`Directory exists: ${diagnostics.directory_exists ? '✅' : '❌'}`);
console.log(`Total PDFs: ${diagnostics.total_files}`);
console.log(`Expected PDFs: ${expectedPdfs.length}`);

if (diagnostics.missing_pdfs.length > 0) {
  console.log('❌ Missing PDFs:');
  diagnostics.missing_pdfs.forEach(pdf => console.log(`   - ${pdf}`));
}

if (diagnostics.large_files.length > 0) {
  console.log('⚠️  Large Files (>35MB):');
  diagnostics.large_files.forEach(file => console.log(`   - ${file}`));
}

if (diagnostics.permission_issues.length > 0) {
  console.log('❌ Permission Issues:');
  diagnostics.permission_issues.forEach(file => console.log(`   - ${file}`));
}

console.log('\n📁 File Sizes:');
Object.entries(diagnostics.file_sizes).forEach(([file, size]) => {
  const isLarge = diagnostics.large_files.some(large => large.includes(file));
  const status = isLarge ? '⚠️ ' : '✅ ';
  console.log(`${status} ${file}: ${size}`);
});

// Production readiness
const isReady = diagnostics.directory_exists && 
                diagnostics.missing_pdfs.length === 0 && 
                diagnostics.permission_issues.length === 0;

console.log('\n🚀 Production Readiness:');
console.log(isReady ? '✅ READY' : '❌ NOT READY');

if (diagnostics.large_files.length > 0) {
  console.log('\n💡 Recommendations for Large Files:');
  console.log('- Consider PDF compression to reduce file size');
  console.log('- Implement streaming for files >40MB');
  console.log('- Check production server memory limits');
  console.log('- Consider CDN for large static files');
}

console.log('\n🔗 Test URLs (when server is running):');
diagnostics.available_pdfs.forEach(pdf => {
  console.log(`   http://localhost:5000/pdfs/${pdf}`);
});