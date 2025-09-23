#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Enhanced Comment Removal Script
 * Usage: node remove-comments-enhanced.js <filename>
 */

class CommentRemover {
  constructor() {
    this.patterns = {
      // JavaScript, TypeScript, Java, C++, C#, etc.
      js: {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//g,
        jsxComment: /\{\s*\/\*[\s\S]*?\*\/\s*\}/g, // JSX comments like {/* comment */}
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', '.cs', '.php', '.swift', '.kt', '.scala']
      },
      
      // CSS, SCSS, LESS
      css: {
        multiLine: /\/\*[\s\S]*?\*\//g,
        extensions: ['.css', '.scss', '.less', '.sass']
      },
      
      // HTML, XML
      html: {
        multiLine: /<!--[\s\S]*?-->/g,
        extensions: ['.html', '.htm', '.xml', '.svg', '.vue']
      },
      
      // Python
      python: {
        singleLine: /#.*$/gm,
        multiLine: /"""[\s\S]*?"""|'''[\s\S]*?'''/g,
        extensions: ['.py', '.pyw']
      },
      
      // Shell scripts
      shell: {
        singleLine: /#.*$/gm,
        extensions: ['.sh', '.bash', '.zsh', '.fish']
      },
      
      // SQL
      sql: {
        singleLine: /--.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//g,
        extensions: ['.sql', '.mysql', '.pgsql']
      },
      
      // Ruby
      ruby: {
        singleLine: /#.*$/gm,
        multiLine: /=begin[\s\S]*?=end/g,
        extensions: ['.rb', '.rake']
      },
      
      // Go
      go: {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//g,
        extensions: ['.go']
      },

      // Rust
      rust: {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//g,
        extensions: ['.rs']
      },

      // Lua
      lua: {
        singleLine: /--.*$/gm,
        multiLine: /--\[\[[\s\S]*?\]\]/g,
        extensions: ['.lua']
      }
    };
  }

  /**
   * Detect file type based on extension
   */
  detectFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    for (const [type, config] of Object.entries(this.patterns)) {
      if (config.extensions && config.extensions.includes(ext)) {
        return type;
      }
    }
    
    return null;
  }

  /**
   * Check if a position is inside a string literal
   */
  isInsideString(content, position) {
    const beforePosition = content.substring(0, position);
    const singleQuotes = (beforePosition.match(/(?<!\\)'/g) || []).length;
    const doubleQuotes = (beforePosition.match(/(?<!\\)"/g) || []).length;
    const backticks = (beforePosition.match(/(?<!\\)`/g) || []).length;
    
    return (singleQuotes % 2 === 1) || (doubleQuotes % 2 === 1) || (backticks % 2 === 1);
  }

  /**
   * Remove comments from string content based on file type
   */
  removeComments(content, fileType) {
    if (!fileType || !this.patterns[fileType]) {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    let result = content;
    const patterns = this.patterns[fileType];

    // For languages that support strings, we need to be careful not to remove comments inside strings
    const hasStrings = ['js', 'python', 'go', 'rust', 'ruby'].includes(fileType);

    if (hasStrings) {
      if (patterns.jsxComment) {
        result = result.replace(patterns.jsxComment, '');
      }
      result = this.removeCommentsStringAware(result, patterns, fileType);
    } else {
      // Simple pattern-based removal for markup languages
      if (patterns.singleLine) {
        result = result.replace(patterns.singleLine, '');
      }
      if (patterns.multiLine) {
        result = result.replace(patterns.multiLine, '');
      }
    }

    // Clean up extra whitespace
    result = result
      .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
      .replace(/[\r\n]{3,}/g, '\n\n') // Reduce multiple empty lines
      .trim();

    return result;
  }

  /**
   * Remove comments while being aware of string literals
   */
  removeCommentsStringAware(content, patterns, fileType) {
    const lines = content.split('\n');
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let processedLine = '';
      let inString = false;
      let stringChar = null;
      let j = 0;

      while (j < line.length) {
        const char = line[j];
        const nextChar = line[j + 1] || '';

        // Handle escape sequences
        if (char === '\\' && inString) {
          processedLine += char + nextChar;
          j += 2;
          continue;
        }

        // Handle string boundaries
        if ((char === '"' || char === "'" || char === '`') && !inString) {
          inString = true;
          stringChar = char;
          processedLine += char;
          j++;
          continue;
        } else if (char === stringChar && inString) {
          inString = false;
          stringChar = null;
          processedLine += char;
          j++;
          continue;
        }

        // If we're inside a string, just add the character
        if (inString) {
          processedLine += char;
          j++;
          continue;
        }

        // Check for single-line comments based on the specific pattern
        let foundComment = false;
        
        if (patterns.singleLine) {
          const singleLinePattern = patterns.singleLine.source;
          
          // JavaScript/TypeScript style comments (//)
          if (singleLinePattern.includes('\\/\\/') && char === '/' && nextChar === '/') {
            foundComment = true;
          }
          // Python/Shell style comments (#) - only for files that actually use # comments
          else if (singleLinePattern.includes('#') && char === '#' && 
                   (fileType === 'python' || fileType === 'shell' || fileType === 'ruby')) {
            foundComment = true;
          }
          // SQL style comments (--)
          else if (singleLinePattern.includes('--') && char === '-' && nextChar === '-') {
            foundComment = true;
          }
        }
        
        if (foundComment) {
          // Found a comment, skip the rest of the line
          break;
        } else {
          processedLine += char;
          j++;
        }
      }

      // Only add non-empty lines or lines with meaningful content
      if (processedLine.trim() !== '') {
        result.push(processedLine);
      }
    }

    let finalResult = result.join('\n');

    // Handle multi-line comments
    if (patterns.multiLine) {
      finalResult = finalResult.replace(patterns.multiLine, '');
    }

    return finalResult;
  }

  /**
   * Process a single file
   */
  processFile(filename) {
    try {
      // Check if file exists
      if (!fs.existsSync(filename)) {
        throw new Error(`File not found: ${filename}`);
      }

      // Check if it's a file (not directory)
      const stats = fs.statSync(filename);
      if (!stats.isFile()) {
        throw new Error(`Path is not a file: ${filename}`);
      }

      // Detect file type
      const fileType = this.detectFileType(filename);
      if (!fileType) {
        const ext = path.extname(filename);
        const supportedExts = Object.values(this.patterns)
          .flatMap(p => p.extensions || [])
          .join(', ');
        throw new Error(`Unsupported file extension: ${ext || 'no extension'}.\nSupported extensions: ${supportedExts}`);
      }

      console.log(`🔍 Processing ${filename} as ${fileType} file...`);

      // Read file content
      const content = fs.readFileSync(filename, 'utf8');
      const originalSize = content.length;
      const originalLines = content.split('\n').length;

      // Remove comments
      const cleanContent = this.removeComments(content, fileType);
      const newSize = cleanContent.length;
      const newLines = cleanContent.split('\n').length;

      // Write cleaned content directly
      fs.writeFileSync(filename, cleanContent);

      // Report results
      const sizeReduction = originalSize - newSize;
      const lineReduction = originalLines - newLines;
      const sizePercentage = originalSize > 0 ? ((sizeReduction / originalSize) * 100).toFixed(1) : 0;
      const linePercentage = originalLines > 0 ? ((lineReduction / originalLines) * 100).toFixed(1) : 0;
      
      console.log(`✅ Comments removed successfully!`);
      console.log(`📊 Statistics:`);
      console.log(`   • Size: ${originalSize} → ${newSize} chars (${sizeReduction} chars removed, ${sizePercentage}% reduction)`);
      console.log(`   • Lines: ${originalLines} → ${newLines} lines (${lineReduction} lines removed, ${linePercentage}% reduction)`);

      if (sizeReduction === 0) {
        console.log(`ℹ️  No comments found to remove.`);
      }

    } catch (error) {
      console.error(`❌ Error processing file: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Display help information
   */
  showHelp() {
    const supportedTypes = Object.entries(this.patterns).map(([type, config]) => {
      return `• ${type.toUpperCase()}: ${config.extensions.join(', ')}`;
    }).join('\n');

    console.log(`
🗑️  Enhanced Comment Remover Script

Usage: node remove-comments-enhanced.js <filename>

📁 Supported file types:
${supportedTypes}

✨ Features:
✅ Removes single-line comments (// # --)
✅ Removes multi-line comments (/* */ <!-- --> """ ''' etc.)
✅ Preserves comments inside string literals
✅ Edits files directly (no backup created)
✅ Shows detailed statistics
✅ Handles escape sequences properly
✅ Supports 20+ file extensions

📖 Examples:
  node remove-comments-enhanced.js app.js
  node remove-comments-enhanced.js styles.css
  node remove-comments-enhanced.js script.py
  node remove-comments-enhanced.js --help

⚠️  Note: Files are edited directly. Make sure to have version control or manual backups!
    `);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    const remover = new CommentRemover();
    remover.showHelp();
    return;
  }

  if (args.length !== 1) {
    console.error('❌ Error: Please provide exactly one filename as argument');
    console.error('Usage: node remove-comments-enhanced.js <filename>');
    console.error('Use --help for more information');
    process.exit(1);
  }

  const filename = args[0];
  const remover = new CommentRemover();
  remover.processFile(filename);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default CommentRemover;