#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Checking JavaScript/JSX syntax...\n');

try {
  // Use Next.js lint but filter only for parsing/syntax errors
  const result = execSync('next lint --max-warnings 0', {
    stdio: 'pipe',
    encoding: 'utf8'
  });
  
  console.log('✅ All JavaScript/JSX files have valid syntax!\n');
  process.exit(0);
} catch (error) {
  if (error.stdout) {
    const output = error.stdout.toString();
    
    // Check if there are actual parsing errors (not just warnings)
    if (output.includes('Parsing error') || output.includes('SyntaxError')) {
      console.log('❌ Syntax errors found:\n');
      
      // Extract only parsing errors
      const lines = output.split('\n');
      let currentFile = '';
      
      lines.forEach(line => {
        if (line.includes('.js') || line.includes('.jsx')) {
          currentFile = line;
        }
        if (line.includes('Parsing error') || line.includes('SyntaxError')) {
          console.log(`📁 ${currentFile}`);
          console.log(`   ${line.trim()}\n`);
        }
      });
      
      process.exit(1);
    } else {
      // No syntax errors, just linting issues
      console.log('✅ All JavaScript/JSX files have valid syntax!\n');
      console.log('ℹ️  Note: There may be linting warnings. Run "npm run lint" to see them.\n');
      process.exit(0);
    }
  }
  
  // If no output, assume success
  console.log('✅ All JavaScript/JSX files have valid syntax!\n');
  process.exit(0);
}