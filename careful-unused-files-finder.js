#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Careful Unused Files Finder - Production Ready
 * Properly handles Next.js structure, import aliases, and dependency tracing
 */

class CarefulUnusedFilesFinder {
    constructor() {
        this.usedFiles = new Set();
        this.allFiles = new Map();
        this.importGraph = new Map();
        this.unusedFiles = [];
        this.errors = [];
        this.warnings = [];
        this.startTime = Date.now();
        
        // Base directories
        this.clientDir = path.join(process.cwd(), 'client');
        this.rootDir = process.cwd();
        
        // Import path aliases (Next.js jsconfig.json style)
        this.aliases = new Map([
            ['@/', 'client/'],
            ['@/components', 'client/components'],
            ['@/lib', 'client/lib'],
            ['@/hooks', 'client/hooks'],
            ['@/utils', 'client/utils'],
            ['@/styles', 'client/styles'],
            ['@/app', 'client/app'],
            ['@/public', 'client/public']
        ]);
        
        // Critical files that should NEVER be removed
        this.criticalFiles = new Set([
            'package.json',
            'next.config.mjs',
            'middleware.js',
            'layout.jsx',
            'layout.tsx',
            'page.jsx',
            'page.tsx',
            'loading.jsx',
            'loading.tsx',
            'error.jsx',
            'error.tsx',
            'not-found.jsx',
            'not-found.tsx',
            'globals.css',
            'theme.css',
            'tailwind.config.js',
            'postcss.config.mjs',
            'jsconfig.json',
            'tsconfig.json',
            'eslint.config.mjs',
            'components.json',
            'favicon.ico',
            'icon.svg',
            'robots.txt',
            'sitemap.xml'
        ]);
        
        // Directories to skip completely
        this.skipDirs = new Set([
            'node_modules',
            '.next',
            '.git',
            'dist',
            'build',
            'out',
            'coverage',
            '.nyc_output',
            'logs',
            '__tests__',
            'test',
            'tests'
        ]);
        
        // Extensions to analyze
        this.codeExtensions = new Set([
            '.js', '.jsx', '.ts', '.tsx', '.mjs',
            '.css', '.scss', '.sass', '.less',
            '.json', '.md', '.mdx'
        ]);
        
        // Comprehensive import patterns
        this.importPatterns = [
            // ES6 imports - more comprehensive
            /import\s+(?:(?:\{[^}]*\}|\w+|\*\s+as\s+\w+),?\s*)*\s*from\s+['"`]([^'"`]+)['"`]/g,
            // Default + named imports
            /import\s+\w+\s*,\s*\{[^}]*\}\s+from\s+['"`]([^'"`]+)['"`]/g,
            // Type imports
            /import\s+type\s+(?:\{[^}]*\}|\w+)\s+from\s+['"`]([^'"`]+)['"`]/g,
            // CommonJS require
            /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
            // Dynamic imports
            /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
            // Next.js dynamic imports
            /dynamic\s*\(\s*\(\s*\)\s*=>\s*import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
            // CSS imports
            /@import\s+['"`]([^'"`]+)['"`]/g,
            // Image/asset imports
            /(?:src|href)\s*=\s*['"`]([^'"`]+)['"`]/g,
            // Lazy loading
            /lazy\s*\(\s*\(\s*\)\s*=>\s*import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
            // Next.js Image component
            /<Image[^>]+src\s*=\s*['"`]([^'"`]+)['"`]/g,
            // Next.js Link component
            /<Link[^>]+href\s*=\s*['"`]([^'"`]+)['"`]/g
        ];
    }

    // Safe file reading with full content
    readFileContent(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            this.errors.push(`Failed to read ${filePath}: ${error.message}`);
            return null;
        }
    }

    // Resolve import path with aliases
    resolveImportPath(importPath, fromFile) {
        // Skip external modules
        if (!importPath.startsWith('.') && !importPath.startsWith('/') && !importPath.startsWith('@')) {
            return null;
        }
        
        let resolvedPath;
        const fromDir = path.dirname(fromFile);
        
        // Handle alias imports
        if (importPath.startsWith('@/')) {
            const aliasKey = '@/';
            const relativePath = importPath.slice(aliasKey.length);
            resolvedPath = path.join(this.clientDir, relativePath);
        } else if (importPath.startsWith('/')) {
            resolvedPath = path.join(this.clientDir, importPath);
        } else {
            // Relative imports
            resolvedPath = path.resolve(fromDir, importPath);
        }
        
        // Try different extensions and index files
        const candidates = this.generateFileCandidates(resolvedPath);
        
        for (const candidate of candidates) {
            if (this.allFiles.has(candidate)) {
                return candidate;
            }
        }
        
        // Log warning for unresolved imports
        this.warnings.push(`Unresolved import: ${importPath} in ${path.relative(this.rootDir, fromFile)}`);
        return null;
    }

    // Generate possible file paths for an import
    generateFileCandidates(basePath) {
        const candidates = [basePath];
        const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss'];
        
        // Try with extensions
        for (const ext of extensions) {
            candidates.push(basePath + ext);
        }
        
        // Try index files
        for (const ext of extensions) {
            candidates.push(path.join(basePath, 'index' + ext));
        }
        
        return candidates;
    }

    // Extract imports from file content
    extractImports(content, filePath) {
        const imports = new Set();
        
        this.importPatterns.forEach(pattern => {
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(content)) !== null) {
                const importPath = match[1];
                const resolved = this.resolveImportPath(importPath, filePath);
                if (resolved) {
                    imports.add(resolved);
                }
            }
        });
        
        return imports;
    }

    // Collect all files in the project
    collectAllFiles(dirPath = this.clientDir, relativePath = '') {
        try {
            const items = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);
                const relPath = path.join(relativePath, item.name);
                
                if (item.isDirectory()) {
                    if (!this.skipDirs.has(item.name) && !item.name.startsWith('.')) {
                        this.collectAllFiles(fullPath, relPath);
                    }
                } else if (item.isFile()) {
                    const ext = path.extname(item.name);
                    if (this.codeExtensions.has(ext)) {
                        this.allFiles.set(fullPath, {
                            name: item.name,
                            relativePath: relPath,
                            isCritical: this.criticalFiles.has(item.name) || 
                                       this.isInCriticalPath(relPath)
                        });
                    }
                }
            }
        } catch (error) {
            this.errors.push(`Failed to scan directory ${dirPath}: ${error.message}`);
        }
    }

    // Check if file is in a critical path
    isInCriticalPath(relativePath) {
        const criticalPaths = [
            'app/layout.jsx',
            'app/page.jsx',
            'app/not-found.jsx',
            'app/error.jsx',
            'app/loading.jsx',
            'middleware.js',
            'next.config.mjs',
            'globals.css',
            'theme.css'
        ];
        
        return criticalPaths.some(critical => relativePath.endsWith(critical)) ||
               relativePath.includes('/api/') ||
               relativePath.includes('/layout.') ||
               relativePath.includes('/page.') ||
               relativePath.includes('/loading.') ||
               relativePath.includes('/error.') ||
               relativePath.includes('/not-found.');
    }

    // Find all entry points (files that should definitely be kept)
    findEntryPoints() {
        const entryPoints = new Set();
        
        for (const [filePath, info] of this.allFiles) {
            const { name, relativePath } = info;
            
            // Next.js special files
            if (name === 'layout.jsx' || name === 'layout.tsx' ||
                name === 'page.jsx' || name === 'page.tsx' ||
                name === 'loading.jsx' || name === 'loading.tsx' ||
                name === 'error.jsx' || name === 'error.tsx' ||
                name === 'not-found.jsx' || name === 'not-found.tsx') {
                entryPoints.add(filePath);
            }
            
            // API routes
            if (relativePath.includes('/api/') && (name.endsWith('.js') || name.endsWith('.ts'))) {
                entryPoints.add(filePath);
            }
            
            // Middleware
            if (name === 'middleware.js' || name === 'middleware.ts') {
                entryPoints.add(filePath);
            }
            
            // Global styles
            if (name === 'globals.css' || name === 'theme.css') {
                entryPoints.add(filePath);
            }
            
            // Config files
            if (this.criticalFiles.has(name)) {
                entryPoints.add(filePath);
            }
        }
        
        return entryPoints;
    }

    // Build the import graph
    buildImportGraph() {
        console.log('📊 Building import graph...');
        
        for (const [filePath] of this.allFiles) {
            const content = this.readFileContent(filePath);
            if (content) {
                const imports = this.extractImports(content, filePath);
                this.importGraph.set(filePath, imports);
            }
        }
        
        console.log(`Built graph with ${this.importGraph.size} nodes`);
    }

    // Mark file and its dependencies as used (DFS)
    markAsUsed(filePath, visited = new Set()) {
        if (visited.has(filePath) || this.usedFiles.has(filePath)) {
            return;
        }
        
        visited.add(filePath);
        this.usedFiles.add(filePath);
        
        // Mark all dependencies as used
        const dependencies = this.importGraph.get(filePath) || new Set();
        for (const dep of dependencies) {
            this.markAsUsed(dep, visited);
        }
    }

    // Main analysis method
    analyze() {
        console.log('🔍 Careful Unused Files Analysis');
        console.log('=================================\n');
        
        // Step 1: Collect all files
        console.log('📁 Collecting files...');
        this.collectAllFiles();
        console.log(`Found ${this.allFiles.size} files to analyze\n`);
        
        // Step 2: Build import graph
        this.buildImportGraph();
        
        // Step 3: Find entry points
        console.log('🎯 Finding entry points...');
        const entryPoints = this.findEntryPoints();
        console.log(`Found ${entryPoints.size} entry points\n`);
        
        // Step 4: Mark all used files
        console.log('🔗 Tracing dependencies from entry points...');
        for (const entryPoint of entryPoints) {
            this.markAsUsed(entryPoint);
        }
        console.log(`Marked ${this.usedFiles.size} files as used\n`);
        
        // Step 5: Find unused files
        console.log('🗑️  Finding unused files...');
        for (const [filePath, info] of this.allFiles) {
            if (!this.usedFiles.has(filePath) && !info.isCritical) {
                this.unusedFiles.push({
                    path: filePath,
                    relativePath: info.relativePath,
                    name: info.name
                });
            }
        }
        console.log(`Found ${this.unusedFiles.length} potentially unused files\n`);
        
        this.generateReport();
    }

    // Generate detailed report
    generateReport() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        
        console.log('📊 ANALYSIS RESULTS');
        console.log('===================');
        console.log(`⏱️  Analysis completed in ${duration}s`);
        console.log(`📁 Total files analyzed: ${this.allFiles.size}`);
        console.log(`✅ Files marked as used: ${this.usedFiles.size}`);
        console.log(`🗑️  Potentially unused files: ${this.unusedFiles.length}`);
        console.log(`⚠️  Warnings: ${this.warnings.length}`);
        console.log(`❌ Errors: ${this.errors.length}\n`);
        
        if (this.unusedFiles.length === 0) {
            console.log('🎉 No unused files found! Your codebase is clean.\n');
        } else {
            console.log('🗂️  POTENTIALLY UNUSED FILES:');
            console.log('-'.repeat(50));
            
            // Group by directory
            const byDirectory = {};
            this.unusedFiles.forEach(file => {
                const dir = path.dirname(file.relativePath);
                if (!byDirectory[dir]) {
                    byDirectory[dir] = [];
                }
                byDirectory[dir].push(file);
            });
            
            Object.entries(byDirectory)
                .sort(([a], [b]) => a.localeCompare(b))
                .forEach(([dir, files]) => {
                    console.log(`\n📂 ${dir}/`);
                    files.sort((a, b) => a.name.localeCompare(b.name))
                         .forEach(file => {
                             console.log(`   └─ ${file.name}`);
                         });
                });
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS (Unresolved Imports):');
            console.log('-'.repeat(50));
            this.warnings.slice(0, 10).forEach((warning, index) => {
                console.log(`${index + 1}. ${warning}`);
            });
            if (this.warnings.length > 10) {
                console.log(`... and ${this.warnings.length - 10} more warnings`);
            }
        }
        
        if (this.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            console.log('-'.repeat(50));
            this.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('-'.repeat(50));
        console.log('1. ✅ Review each file manually before deletion');
        console.log('2. 🔍 Check if files are used dynamically or in tests');
        console.log('3. 📝 Consider if files are future features or templates');
        console.log('4. 🧪 Test your application after any removals');
        console.log('5. 📦 Use version control to track changes');
        
        // Save detailed report
        this.saveReport();
    }

    // Save analysis report
    saveReport() {
        const report = {
            timestamp: new Date().toISOString(),
            analysis: {
                totalFiles: this.allFiles.size,
                usedFiles: this.usedFiles.size,
                unusedFiles: this.unusedFiles.length,
                warnings: this.warnings.length,
                errors: this.errors.length
            },
            unusedFiles: this.unusedFiles.map(f => ({
                path: f.relativePath,
                name: f.name,
                fullPath: f.path
            })),
            warnings: this.warnings,
            errors: this.errors,
            entryPoints: Array.from(this.findEntryPoints()).map(f => 
                path.relative(this.rootDir, f)
            )
        };
        
        try {
            fs.writeFileSync('careful-unused-files-report.json', JSON.stringify(report, null, 2));
            console.log('\n📄 Detailed report saved to: careful-unused-files-report.json');
        } catch (error) {
            console.log('\n⚠️  Could not save report file');
        }
    }

    // Run the analysis
    run() {
        try {
            this.analyze();
        } catch (error) {
            console.error('❌ Fatal error during analysis:', error.message);
            console.error(error.stack);
            process.exit(1);
        }
    }
}

// CLI execution
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔍 Careful Unused Files Finder

A production-ready tool to find unused files in Next.js projects with proper
import resolution, alias handling, and safety checks.

Usage: node careful-unused-files-finder.js [options]

Options:
  --help, -h     Show this help message

Features:
✅ Proper Next.js file structure understanding
✅ Import alias resolution (@/ paths)
✅ Comprehensive import pattern matching
✅ Critical file protection
✅ Full dependency graph analysis
✅ Detailed reporting with warnings

Safety Features:
🛡️  Never removes critical Next.js files
🛡️  Comprehensive import path resolution
🛡️  Detailed warnings for edge cases
🛡️  Full file content analysis (not partial)
🛡️  Manual review recommendations

⚠️  IMPORTANT: Always review the results manually and backup your code!
`);
    process.exit(0);
}

console.log('🚀 Starting Careful Unused Files Analysis...\n');
const finder = new CarefulUnusedFilesFinder();
finder.run();

export default CarefulUnusedFilesFinder;