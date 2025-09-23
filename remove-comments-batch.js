#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Batch script to remove comments from all .jsx files in the client directory
 */

function findJsxFiles(directory) {
  const jsxFiles = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(item)) {
          scanDirectory(fullPath);
        }
      } else if (stat.isFile() && item.endsWith('.jsx')) {
        jsxFiles.push(fullPath);
      }
    }
  }
  
  scanDirectory(directory);
  return jsxFiles;
}

function main() {
  console.log('🔍 Finding all .jsx files in client directory...');
  
  const clientDir = './client';
  if (!fs.existsSync(clientDir)) {
    console.error('❌ Client directory not found!');
    process.exit(1);
  }
  
  const jsxFiles = findJsxFiles(clientDir);
  
  if (jsxFiles.length === 0) {
    console.log('ℹ️  No .jsx files found in client directory.');
    return;
  }
  
  console.log(`📁 Found ${jsxFiles.length} .jsx files`);
  console.log('🚀 Starting comment removal process...\n');
  
  let processedCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (const file of jsxFiles) {
    try {
      console.log(`Processing: ${file}`);
      execSync(`node remove-comments-enhanced.js "${file}"`, { 
        stdio: 'inherit',
        encoding: 'utf8'
      });
      processedCount++;
      console.log('✅ Success\n');
    } catch (error) {
      errorCount++;
      const errorMsg = `Failed to process ${file}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`❌ ${errorMsg}\n`);
    }
  }
  
  // Summary
  console.log('=' .repeat(50));
  console.log('📊 BATCH PROCESSING SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Total files found: ${jsxFiles.length}`);
  console.log(`Successfully processed: ${processedCount}`);
  console.log(`Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  if (processedCount > 0) {
    console.log('\n🎉 Comment removal completed!');
    console.log('💡 Tip: Check your files to ensure the results are as expected.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default { findJsxFiles, main };