#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fast & Efficient Unused Files Finder
 * Optimized for speed with smart filtering and minimal analysis
 */

class FastUnusedFilesFinder {
    constructor() {
        this.usedFiles = new Set();
        this.allFiles = new Map();
        this.unusedFiles = [];
        this.startTime = Date.now();
        
        this.clientDir = path.join(process.cwd(), 'client');
        
        // Only analyze specific file types (skip images, fonts, etc.)
        this.codeExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.scss']);
        
        // Files that are ALWAYS safe to keep
        this.alwaysKeep = new Set([
            'layout.jsx', 'layout.tsx', 'page.jsx', 'page.tsx', 
            'loading.jsx', 'loading.tsx', 'error.jsx', 'error.tsx',
            'not-found.jsx', 'not-found.tsx', 'middleware.js',
            'globals.css', 'theme.css', 'tailwind.config.js'
        ]);
        
        // Skip these directories entirely
        this.skipDirs = new Set([
            'node_modules', '.next', '.git', 'dist', 'build', 'public',
            '__tests__', 'test', 'tests', 'docs', 'api-docs'
        ]);
        
        // Simple import pattern (just the basics for speed)
        this.importRegex = /(?:import|require|from)\s+[^'"`]*['"`]([^'"`]+)['"`]/g;
    }

    // Quick file scan - only check for local imports
    quickScanImports(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const imports = new Set();
            
            let match;
            this.importRegex.lastIndex = 0;
            while ((match = this.importRegex.exec(content)) !== null) {
                const importPath = match[1];
                // Only care about local imports
                if (importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('@/')) {
                    imports.add(this.resolveImport(importPath, filePath));
                }
            }
            
            return imports;
        } catch (error) {
            return new Set();
        }
    }

    // Simple import resolution
    resolveImport(importPath, fromFile) {
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
        
        // Try common extensions
        const candidates = [
            resolved,
            resolved + '.js',
            resolved + '.jsx',
            resolved + '.ts',
            resolved + '.tsx',
            path.join(resolved, 'index.js'),
            path.join(resolved, 'index.jsx')
        ];
        
        for (const candidate of candidates) {
            if (this.allFiles.has(candidate)) {
                return candidate;
            }
        }
        
        return null;
    }

    // Fast file collection
    collectFiles(dirPath = this.clientDir) {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            
            if (item.isDirectory() && !this.skipDirs.has(item.name)) {
                this.collectFiles(fullPath);
            } else if (item.isFile()) {
                const ext = path.extname(item.name);
                if (this.codeExtensions.has(ext)) {
                    this.allFiles.set(fullPath, {
                        name: item.name,
                        relativePath: path.relative(this.clientDir, fullPath),
                        isProtected: this.alwaysKeep.has(item.name) || 
                                    this.isProtectedPath(fullPath)
                    });
                }
            }
        }
    }

    // Check if path should be protected
    isProtectedPath(filePath) {
        const relativePath = path.relative(this.clientDir, filePath);
        return (
            relativePath.includes('/api/') ||
            relativePath.includes('/layout.') ||
            relativePath.includes('/page.') ||
            relativePath.includes('/loading.') ||
            relativePath.includes('/error.') ||
            relativePath.includes('/not-found.') ||
            relativePath === 'middleware.js' ||
            relativePath === 'globals.css' ||
            relativePath === 'theme.css'
        );
    }

    // Find entry points
    findEntryPoints() {
        const entryPoints = [];
        
        for (const [filePath, info] of this.allFiles) {
            if (info.isProtected || this.isProtectedPath(filePath)) {
                entryPoints.push(filePath);
            }
        }
        
        return entryPoints;
    }

    // Mark file as used (recursive)
    markUsed(filePath, visited = new Set()) {
        if (visited.has(filePath) || this.usedFiles.has(filePath) || !this.allFiles.has(filePath)) {
            return;
        }
        
        visited.add(filePath);
        this.usedFiles.add(filePath);
        
        // Quick import scan and mark dependencies
        const imports = this.quickScanImports(filePath);
        for (const importPath of imports) {
            if (importPath) {
                this.markUsed(importPath, visited);
            }
        }
    }

    // Main analysis
    run() {
        console.log('⚡ Fast Unused Files Finder');
        console.log('===========================\n');
        
        // Step 1: Collect files (fast)
        console.log('📁 Collecting files...');
        this.collectFiles();
        console.log(`Found ${this.allFiles.size} code files\n`);
        
        // Step 2: Find entry points (fast)
        console.log('🎯 Finding entry points...');
        const entryPoints = this.findEntryPoints();
        console.log(`Found ${entryPoints.length} entry points\n`);
        
        // Step 3: Mark used files (fast traversal)
        console.log('🔗 Tracing dependencies...');
        for (const entry of entryPoints) {
            this.markUsed(entry);
        }
        console.log(`Marked ${this.usedFiles.size} files as used\n`);
        
        // Step 4: Find unused
        console.log('🗑️  Finding unused files...');
        for (const [filePath, info] of this.allFiles) {
            if (!this.usedFiles.has(filePath) && !info.isProtected) {
                this.unusedFiles.push({
                    path: filePath,
                    relativePath: info.relativePath,
                    name: info.name
                });
            }
        }
        
        this.showResults();
    }

    // Show results
    showResults() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        
        console.log(`⚡ FAST ANALYSIS COMPLETE (${duration}s)`);
        console.log('================================');
        console.log(`📁 Total: ${this.allFiles.size} files`);
        console.log(`✅ Used: ${this.usedFiles.size} files`);
        console.log(`🗑️  Unused: ${this.unusedFiles.length} files\n`);
        
        if (this.unusedFiles.length === 0) {
            console.log('🎉 No unused files found!\n');
            return;
        }
        
        // Group by directory
        const byDir = {};
        this.unusedFiles.forEach(file => {
            const dir = path.dirname(file.relativePath);
            if (!byDir[dir]) byDir[dir] = [];
            byDir[dir].push(file.name);
        });
        
        console.log('📂 UNUSED FILES BY DIRECTORY:');
        console.log('-'.repeat(40));
        
        Object.entries(byDir)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([dir, files]) => {
                console.log(`\n${dir}/`);
                files.sort().forEach(file => {
                    console.log(`  └─ ${file}`);
                });
            });
        
        console.log('\n💡 NEXT STEPS:');
        console.log('1. Review the list carefully');
        console.log('2. Check if files are used dynamically');
        console.log('3. Backup before removing any files');
        console.log('4. Test after removal\n');
        
        // Save simple report
        try {
            const report = {
                timestamp: new Date().toISOString(),
                duration: duration + 's',
                summary: {
                    total: this.allFiles.size,
                    used: this.usedFiles.size,
                    unused: this.unusedFiles.length
                },
                unusedFiles: this.unusedFiles
            };
            
            fs.writeFileSync('fast-unused-report.json', JSON.stringify(report, null, 2));
            console.log('📄 Report saved to: fast-unused-report.json');
        } catch (error) {
            console.log('⚠️  Could not save report');
        }
    }
}

// Run it
const finder = new FastUnusedFilesFinder();
finder.run();