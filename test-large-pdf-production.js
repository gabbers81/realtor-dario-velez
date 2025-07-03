#!/usr/bin/env node

// Production Large PDF Test Script
// Simulates production conditions and tests large PDF serving

import { spawn } from 'child_process';
import fs from 'fs';

console.log('🧪 Large PDF Production Test');
console.log('============================');

// Simulate production environment
process.env.NODE_ENV = 'production';

// Test both large PDFs
const testPdfs = [
  { file: 'secret-garden.pdf', size: '40MB' },
  { file: 'solvamar-macao.pdf', size: '42MB' }
];

async function testPdfAccess(filename) {
  return new Promise((resolve) => {
    console.log(`\n📄 Testing ${filename}...`);
    
    const curl = spawn('curl', [
      '-v',
      '-o', '/dev/null',
      '--max-time', '30',
      '--connect-timeout', '10',
      `http://localhost:5000/pdfs/${filename}`
    ]);
    
    let output = '';
    let error = '';
    
    curl.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    curl.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    curl.on('close', (code) => {
      const success = code === 0;
      console.log(`${success ? '✅' : '❌'} ${filename}: ${success ? 'SUCCESS' : 'FAILED'}`);
      
      if (!success) {
        console.log('Error details:');
        console.log(error.split('\n').slice(-5).join('\n')); // Last 5 lines
      } else {
        // Extract transfer stats
        const lines = error.split('\n');
        const statsLine = lines.find(line => line.includes('100') && line.includes('%'));
        if (statsLine) {
          console.log(`📊 Transfer: ${statsLine.trim()}`);
        }
      }
      
      resolve({ filename, success, code, error });
    });
  });
}

async function runTests() {
  console.log('\n🚀 Starting PDF tests...');
  
  // Check if files exist in production location
  const productionPath = 'dist/public/pdfs';
  console.log(`\n📁 Checking production files in ${productionPath}:`);
  
  for (const pdf of testPdfs) {
    const filePath = `${productionPath}/${pdf.file}`;
    const exists = fs.existsSync(filePath);
    console.log(`${exists ? '✅' : '❌'} ${pdf.file} (${pdf.size})`);
    
    if (exists) {
      const stats = fs.statSync(filePath);
      const actualSize = Math.round(stats.size / 1024 / 1024);
      console.log(`   Actual size: ${actualSize}MB`);
    }
  }
  
  // Test each PDF
  const results = [];
  for (const pdf of testPdfs) {
    const result = await testPdfAccess(pdf.file);
    results.push(result);
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`Success Rate: ${successful}/${total} (${Math.round(successful/total*100)}%)`);
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.filename}`);
  });
  
  if (successful === total) {
    console.log('\n🎉 All large PDFs are working correctly!');
  } else {
    console.log('\n⚠️  Some large PDFs failed. Check server logs and file permissions.');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Ensure files exist in dist/public/pdfs/');
    console.log('2. Check file permissions (should be 644)');
    console.log('3. Verify server memory limits');
    console.log('4. Check network timeout settings');
  }
}

// Ensure production directory exists
if (!fs.existsSync('dist/public/pdfs')) {
  console.log('🔧 Creating production PDF directory...');
  fs.mkdirSync('dist/public/pdfs', { recursive: true });
  
  // Copy PDFs
  if (fs.existsSync('client/public/pdfs')) {
    const sourceFiles = fs.readdirSync('client/public/pdfs').filter(f => f.endsWith('.pdf'));
    sourceFiles.forEach(file => {
      const src = `client/public/pdfs/${file}`;
      const dest = `dist/public/pdfs/${file}`;
      fs.copyFileSync(src, dest);
      console.log(`📁 Copied: ${file}`);
    });
  }
}

runTests().catch(console.error);