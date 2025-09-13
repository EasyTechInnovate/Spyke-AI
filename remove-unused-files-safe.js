#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Safe Unused Files Remover
 * Removes the 111 unused files identified by the fast analysis
 */

class SafeUnusedFilesRemover {
    constructor() {
        this.removedFiles = [];
        this.errors = [];
        this.startTime = Date.now();
        this.clientDir = path.join(process.cwd(), 'client');
        
        // Load the unused files from the report
        this.unusedFiles = this.loadUnusedFiles();
    }

    // Load unused files from the fast analysis report
    loadUnusedFiles() {
        try {
            const reportPath = path.join(process.cwd(), 'fast-unused-report.json');
            const data = fs.readFileSync(reportPath, 'utf8');
            const report = JSON.parse(data);
            return report.unusedFiles || [];
        } catch (error) {
            console.error('❌ Could not load fast-unused-report.json');
            console.error('   Please run fast-unused-files.js first');
            process.exit(1);
        }
    }

    // Remove a single file
    removeFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                this.errors.push(`File not found: ${filePath}`);
                return false;
            }

            fs.unlinkSync(filePath);
            this.removedFiles.push(path.relative(this.clientDir, filePath));
            return true;
        } catch (error) {
            this.errors.push(`Failed to remove ${filePath}: ${error.message}`);
            return false;
        }
    }

    // Remove empty directories
    removeEmptyDirectories(dirPath) {
        try {
            if (!fs.existsSync(dirPath)) {
                return;
            }

            const items = fs.readdirSync(dirPath);
            
            // If directory is empty, remove it
            if (items.length === 0) {
                fs.rmdirSync(dirPath);
                console.log(`  🗂️  Removed empty directory: ${path.relative(this.clientDir, dirPath)}`);
                
                // Recursively check parent directory
                const parentDir = path.dirname(dirPath);
                if (parentDir !== this.clientDir && parentDir !== dirPath) {
                    this.removeEmptyDirectories(parentDir);
                }
            }
        } catch (error) {
            // Ignore errors when removing directories
        }
    }

    // Main removal process
    removeUnusedFiles(dryRun = false) {
        console.log(`${dryRun ? '🔍 DRY RUN - ' : '🗑️  '}Removing ${this.unusedFiles.length} unused files...\n`);

        let removedCount = 0;
        let errorCount = 0;
        const directoriesProcessed = new Set();

        // Group files by directory for better output
        const byDirectory = {};
        this.unusedFiles.forEach(file => {
            const dir = path.dirname(file.relativePath);
            if (!byDirectory[dir]) {
                byDirectory[dir] = [];
            }
            byDirectory[dir].push(file);
        });

        // Process files by directory
        Object.entries(byDirectory)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([dir, files]) => {
                console.log(`📂 ${dir}/`);
                
                files.forEach(file => {
                    if (dryRun) {
                        console.log(`   👁️  Would remove: ${file.name}`);
                    } else {
                        const success = this.removeFile(file.path);
                        if (success) {
                            console.log(`   ✅ Removed: ${file.name}`);
                            removedCount++;
                        } else {
                            console.log(`   ❌ Failed: ${file.name}`);
                            errorCount++;
                        }
                    }
                });
                
                // Mark directory for cleanup
                if (!dryRun) {
                    directoriesProcessed.add(path.join(this.clientDir, dir));
                }
                
                console.log('');
            });

        // Clean up empty directories
        if (!dryRun) {
            console.log('🧹 Cleaning up empty directories...');
            directoriesProcessed.forEach(dir => {
                this.removeEmptyDirectories(dir);
            });
        }

        this.generateSummary(removedCount, errorCount, dryRun);
    }

    // Generate summary report
    generateSummary(removedCount, errorCount, dryRun) {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        
        console.log('\n📊 REMOVAL SUMMARY');
        console.log('==================');
        console.log(`⏱️  Completed in ${duration}s`);
        console.log(`📁 Files processed: ${this.unusedFiles.length}`);
        
        if (dryRun) {
            console.log(`👁️  Files that would be removed: ${this.unusedFiles.length}`);
        } else {
            console.log(`✅ Files removed: ${removedCount}`);
            console.log(`❌ Errors: ${errorCount}`);
        }
        
        if (this.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        if (dryRun) {
            console.log('\n🔧 TO ACTUALLY REMOVE FILES:');
            console.log('   Run: node remove-unused-files-safe.js --remove');
        } else {
            console.log('\n🎉 CLEANUP COMPLETE!');
            console.log('✅ All unused files have been removed');
            console.log('💡 Recommended next steps:');
            console.log('   1. Test your application');
            console.log('   2. Check git status');
            console.log('   3. Commit the changes');
        }

        // Save removal report
        const report = {
            timestamp: new Date().toISOString(),
            dryRun,
            summary: { 
                processed: this.unusedFiles.length, 
                removed: removedCount, 
                errors: errorCount 
            },
            removedFiles: this.removedFiles,
            errors: this.errors
        };

        try {
            const reportName = dryRun ? 'removal-dry-run-report.json' : 'removal-complete-report.json';
            fs.writeFileSync(reportName, JSON.stringify(report, null, 2));
            console.log(`\n📄 Report saved to: ${reportName}`);
        } catch (error) {
            console.log('\n⚠️  Could not save report');
        }
    }

    // Main execution
    run(options = {}) {
        const { remove = false } = options;
        const dryRun = !remove;
        
        console.log('🧹 Safe Unused Files Remover');
        console.log('============================');
        console.log(`Found ${this.unusedFiles.length} unused files to process`);
        console.log(`Mode: ${dryRun ? 'DRY RUN (preview only)' : 'REMOVAL MODE'}`);
        console.log('');

        if (!dryRun) {
            console.log('⚠️  WARNING: This will permanently delete files!');
            console.log('   Make sure you have backed up your code.');
            console.log('');
        }

        this.removeUnusedFiles(dryRun);
    }
}

// CLI execution
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧹 Safe Unused Files Remover

Removes the unused files identified by the fast analysis.

Usage: node remove-unused-files-safe.js [options]

Options:
  --remove     Actually remove files (default: dry run)
  --help, -h   Show this help message

Examples:
  node remove-unused-files-safe.js              # Dry run (preview only)
  node remove-unused-files-safe.js --remove     # Actually remove files

⚠️  IMPORTANT: Always backup your code before using --remove!
`);
    process.exit(0);
}

const options = {
    remove: args.includes('--remove')
};

const remover = new SafeUnusedFilesRemover();
remover.run(options);