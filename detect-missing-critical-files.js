#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Missing Critical Files Detector
 * Detects files that were removed but are actually being imported/used
 */

class MissingCriticalFilesDetector {
    constructor() {
        this.missingFiles = new Map();
        this.brokenImports = [];
        this.allFiles = new Set();
        this.startTime = Date.now();
        
        this.clientDir = path.join(process.cwd(), 'client');
        
        // File extensions to analyze
        this.codeExtensions = new Set(['.js', '.jsx', '.ts', '.tsx']);
        
        // Skip these directories
        this.skipDirs = new Set([
            'node_modules', '.next', '.git', 'dist', 'build', 'public',
            '__tests__', 'test', 'tests', 'docs', 'api-docs'
        ]);
        
        // Comprehensive import patterns
        this.importPatterns = [
            // Standard ES6 imports
            /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g,
            // Dynamic imports
            /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
            // Next.js dynamic imports
            /dynamic\s*\(\s*\(\s*\)\s*=>\s*import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
            // Require statements
            /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
        ];
    }

    // Collect all existing files
    collectExistingFiles(dirPath = this.clientDir) {
        try {
            const items = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);
                
                if (item.isDirectory() && !this.skipDirs.has(item.name)) {
                    this.collectExistingFiles(fullPath);
                } else if (item.isFile()) {
                    const ext = path.extname(item.name);
                    if (this.codeExtensions.has(ext)) {
                        this.allFiles.add(fullPath);
                    }
                }
            }
        } catch (error) {
            console.error(`Error scanning ${dirPath}:`, error.message);
        }
    }

    // Extract imports from file content
    extractImports(content, filePath) {
        const imports = new Set();
        
        this.importPatterns.forEach(pattern => {
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(content)) !== null) {
                const importPath = match[1];
                // Only analyze local imports
                if (importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('@/')) {
                    const resolved = this.resolveImportPath(importPath, filePath);
                    if (resolved) {
                        imports.add(resolved);
                    }
                }
            }
        });
        
        return imports;
    }

    // Resolve import path to actual file path
    resolveImportPath(importPath, fromFile) {
        const fromDir = path.dirname(fromFile);
        let resolved;
        
        if (importPath.startsWith('@/')) {
            // Handle @/ alias
            resolved = path.join(this.clientDir, importPath.slice(2));
        } else if (importPath.startsWith('/')) {
            resolved = path.join(this.clientDir, importPath);
        } else {
            // Relative import
            resolved = path.resolve(fromDir, importPath);
        }
        
        // Try different extensions and index files
        const candidates = [
            resolved,
            resolved + '.js',
            resolved + '.jsx',
            resolved + '.ts',
            resolved + '.tsx',
            path.join(resolved, 'index.js'),
            path.join(resolved, 'index.jsx'),
            path.join(resolved, 'index.ts'),
            path.join(resolved, 'index.tsx')
        ];
        
        for (const candidate of candidates) {
            if (this.allFiles.has(candidate)) {
                return candidate;
            }
        }
        
        // Return the most likely path for missing file detection
        return candidates[0];
    }

    // Check if file exists
    fileExists(filePath) {
        try {
            return fs.existsSync(filePath);
        } catch {
            return false;
        }
    }

    // Analyze a single file for broken imports
    analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const imports = this.extractImports(content, filePath);
            const relativePath = path.relative(this.clientDir, filePath);
            
            imports.forEach(importedPath => {
                if (!this.fileExists(importedPath)) {
                    const relativeImportPath = path.relative(this.clientDir, importedPath);
                    
                    // Track missing file and where it's imported from
                    if (!this.missingFiles.has(relativeImportPath)) {
                        this.missingFiles.set(relativeImportPath, []);
                    }
                    this.missingFiles.get(relativeImportPath).push(relativePath);
                    
                    // Track broken import
                    this.brokenImports.push({
                        file: relativePath,
                        missingImport: relativeImportPath,
                        originalImport: importedPath
                    });
                }
            });
        } catch (error) {
            console.error(`Error analyzing ${filePath}:`, error.message);
        }
    }

    // Main analysis method
    detectMissingFiles() {
        console.log('🔍 Missing Critical Files Detector');
        console.log('==================================\n');
        
        // Step 1: Collect all existing files
        console.log('📁 Scanning existing files...');
        this.collectExistingFiles();
        console.log(`Found ${this.allFiles.size} files to analyze\n`);
        
        // Step 2: Analyze each file for broken imports
        console.log('🔗 Analyzing imports...');
        let analyzedCount = 0;
        for (const filePath of this.allFiles) {
            this.analyzeFile(filePath);
            analyzedCount++;
            if (analyzedCount % 50 === 0) {
                console.log(`  Analyzed ${analyzedCount}/${this.allFiles.size} files...`);
            }
        }
        console.log(`Completed analysis of ${analyzedCount} files\n`);
        
        this.generateReport();
    }

    // Categorize missing files by criticality
    categorizeMissingFiles() {
        const categories = {
            critical: [],
            important: [],
            optional: []
        };
        
        this.missingFiles.forEach((importedBy, missingFile) => {
            const usageCount = importedBy.length;
            const fileType = this.getFileCategory(missingFile, importedBy);
            
            const missingFileInfo = {
                file: missingFile,
                importedBy,
                usageCount,
                category: fileType
            };
            
            if (fileType === 'critical' || usageCount >= 3) {
                categories.critical.push(missingFileInfo);
            } else if (fileType === 'important' || usageCount >= 2) {
                categories.important.push(missingFileInfo);
            } else {
                categories.optional.push(missingFileInfo);
            }
        });
        
        return categories;
    }

    // Determine file category based on path and usage
    getFileCategory(filePath, importedBy) {
        // Critical patterns
        if (filePath.includes('/explore/') && 
            (filePath.includes('FilterSidebar') || 
             filePath.includes('MobileFilterDrawer') || 
             filePath.includes('VirtualizedProductGrid'))) {
            return 'critical';
        }
        
        if (filePath.includes('ErrorBoundary') || 
            filePath.includes('BackgroundEffects') ||
            filePath.includes('NotificationBell') ||
            filePath.includes('loader.jsx')) {
            return 'critical';
        }
        
        // Important patterns
        if (filePath.includes('/landing/') || 
            filePath.includes('/shared/ui/') ||
            filePath.includes('/cart/') ||
            filePath.includes('NewsletterCTA')) {
            return 'important';
        }
        
        // Check if used in critical files
        const criticalUsage = importedBy.some(file => 
            file.includes('/page.jsx') || 
            file.includes('/layout.jsx') ||
            file.includes('/explore/') ||
            file.includes('/landing/')
        );
        
        if (criticalUsage) {
            return 'important';
        }
        
        return 'optional';
    }

    // Generate detailed report
    generateReport() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        const categories = this.categorizeMissingFiles();
        
        console.log('📊 MISSING FILES ANALYSIS RESULTS');
        console.log('==================================');
        console.log(`⏱️  Analysis completed in ${duration}s`);
        console.log(`📁 Files analyzed: ${this.allFiles.size}`);
        console.log(`🚨 Missing files found: ${this.missingFiles.size}`);
        console.log(`💔 Broken imports: ${this.brokenImports.length}\n`);
        
        if (this.missingFiles.size === 0) {
            console.log('🎉 No missing files detected! All imports are working.\n');
            return;
        }
        
        // Show critical missing files
        if (categories.critical.length > 0) {
            console.log('🚨 CRITICAL MISSING FILES (IMMEDIATE ACTION REQUIRED):');
            console.log('=' .repeat(60));
            categories.critical.forEach((item, index) => {
                console.log(`\n${index + 1}. ${item.file}`);
                console.log(`   Usage: ${item.usageCount} file(s)`);
                console.log(`   Imported by:`);
                item.importedBy.slice(0, 3).forEach(file => {
                    console.log(`     • ${file}`);
                });
                if (item.importedBy.length > 3) {
                    console.log(`     ... and ${item.importedBy.length - 3} more files`);
                }
            });
            console.log('');
        }
        
        // Show important missing files
        if (categories.important.length > 0) {
            console.log('⚠️  IMPORTANT MISSING FILES:');
            console.log('-'.repeat(40));
            categories.important.forEach((item, index) => {
                console.log(`${index + 1}. ${item.file} (used by ${item.usageCount} files)`);
            });
            console.log('');
        }
        
        // Show optional missing files
        if (categories.optional.length > 0) {
            console.log('📋 OPTIONAL MISSING FILES:');
            console.log('-'.repeat(40));
            categories.optional.slice(0, 10).forEach((item, index) => {
                console.log(`${index + 1}. ${item.file} (used by ${item.usageCount} files)`);
            });
            if (categories.optional.length > 10) {
                console.log(`... and ${categories.optional.length - 10} more optional files`);
            }
            console.log('');
        }
        
        // Recommendations
        console.log('💡 RECOMMENDATIONS:');
        console.log('=' .repeat(40));
        
        if (categories.critical.length > 0) {
            console.log('🚨 URGENT: Restore critical files immediately!');
            console.log('   These files are breaking core functionality.');
            console.log('   Command: git checkout HEAD -- <file-path>');
            console.log('');
        }
        
        console.log('📋 Action items:');
        console.log('1. ✅ Restore critical files first (breaks functionality)');
        console.log('2. 🔍 Review important files (may impact user experience)');
        console.log('3. 📝 Consider if optional files are truly needed');
        console.log('4. 🧪 Test the application after restoring files');
        
        // Save detailed report
        this.saveReport(categories);
    }

    // Save analysis report
    saveReport(categories) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalMissingFiles: this.missingFiles.size,
                criticalMissing: categories.critical.length,
                importantMissing: categories.important.length,
                optionalMissing: categories.optional.length,
                brokenImports: this.brokenImports.length
            },
            categories,
            brokenImports: this.brokenImports,
            restoreCommands: categories.critical.map(item => 
                `git checkout HEAD -- client/${item.file}`
            )
        };
        
        try {
            fs.writeFileSync('missing-critical-files-report.json', JSON.stringify(report, null, 2));
            console.log('\n📄 Detailed report saved to: missing-critical-files-report.json');
            
            // Also create a simple restore script
            const restoreScript = [
                '#!/bin/bash',
                '# Auto-generated script to restore critical missing files',
                'echo "🔧 Restoring critical missing files..."',
                '',
                ...report.restoreCommands,
                '',
                'echo "✅ Critical files restored!"',
                'echo "🧪 Please test your application now."'
            ].join('\n');
            
            fs.writeFileSync('restore-critical-files.sh', restoreScript);
            fs.chmodSync('restore-critical-files.sh', '755');
            console.log('📄 Restore script saved to: restore-critical-files.sh');
            
        } catch (error) {
            console.log('\n⚠️  Could not save report files');
        }
    }

    // Run the detection
    run() {
        try {
            this.detectMissingFiles();
        } catch (error) {
            console.error('❌ Fatal error during detection:', error.message);
            console.error(error.stack);
            process.exit(1);
        }
    }
}

// CLI execution
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔍 Missing Critical Files Detector

Detects files that were removed but are still being imported/used in the codebase.
Analyzes import statements to find broken dependencies.

Usage: node detect-missing-critical-files.js [options]

Options:
  --help, -h     Show this help message

Features:
✅ Comprehensive import analysis
✅ Critical vs optional file categorization  
✅ Usage tracking (how many files import it)
✅ Auto-generated restore commands
✅ Broken import detection

Output:
📄 missing-critical-files-report.json - Detailed analysis
📄 restore-critical-files.sh - Script to restore critical files

⚠️  This tool helps identify files that should NOT have been removed!
`);
    process.exit(0);
}

console.log('🚀 Starting Missing Critical Files Detection...\n');
const detector = new MissingCriticalFilesDetector();
detector.run();