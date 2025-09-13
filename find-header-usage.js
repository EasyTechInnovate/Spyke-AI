#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to find all components that are using the Header component
 * This will search for imports and usage patterns of the Header component
 */

class HeaderUsageFinder {
    constructor() {
        this.results = {
            directImports: [],
            conditionalImports: [],
            headerSubComponents: [],
            layoutComponents: [],
            summary: {
                totalFiles: 0,
                directUsage: 0,
                conditionalUsage: 0,
                subComponents: 0
            }
        };
        
        this.searchPatterns = {
            // Direct Header imports
            directImport: /import\s+.*Header.*\s+from\s+['"`].*['"`]/g,
            // Header component usage in JSX
            headerUsage: /<Header\s*[^>]*\/?>/g,
            // Conditional Header (like ConditionalHeader)
            conditionalHeader: /ConditionalHeader/g,
            // Header sub-components
            headerSubComponents: /Header\/\w+/g,
            // useHeader hook usage
            useHeaderHook: /useHeader/g
        };
        
        this.excludePatterns = [
            'node_modules',
            '.next',
            '.git',
            'dist',
            'build'
        ];
    }

    // Check if file should be excluded
    shouldExclude(filePath) {
        return this.excludePatterns.some(pattern => filePath.includes(pattern));
    }

    // Check if file is a React component file
    isReactFile(filePath) {
        const ext = path.extname(filePath);
        return ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
    }

    // Read file content safely
    readFileContent(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            console.warn(`Warning: Could not read file ${filePath}:`, error.message);
            return null;
        }
    }

    // Extract import statements from content
    extractImports(content) {
        const imports = [];
        const importRegex = /import\s+(?:(?:\{[^}]*\}|\w+|\*\s+as\s+\w+),?\s*)*\s*from\s+['"`]([^'"`]+)['"`]/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
            imports.push(match[0]);
        }
        
        return imports;
    }

    // Analyze file for Header usage
    analyzeFile(filePath) {
        const content = this.readFileContent(filePath);
        if (!content) return null;

        const relativePath = path.relative(process.cwd(), filePath);
        const analysis = {
            filePath: relativePath,
            hasDirectImport: false,
            hasConditionalImport: false,
            hasHeaderUsage: false,
            hasUseHeaderHook: false,
            headerSubComponents: [],
            imports: [],
            usage: []
        };

        // Extract all imports
        analysis.imports = this.extractImports(content);

        // Check for direct Header imports
        const headerImports = analysis.imports.filter(imp => 
            imp.includes('Header') && 
            !imp.includes('useHeader') &&
            !imp.includes('ConditionalHeader')
        );
        
        if (headerImports.length > 0) {
            analysis.hasDirectImport = true;
            analysis.usage.push(...headerImports);
        }

        // Check for ConditionalHeader
        if (this.searchPatterns.conditionalHeader.test(content)) {
            analysis.hasConditionalImport = true;
            analysis.usage.push('ConditionalHeader usage found');
        }

        // Check for Header component usage in JSX
        const headerUsageMatches = content.match(this.searchPatterns.headerUsage);
        if (headerUsageMatches) {
            analysis.hasHeaderUsage = true;
            analysis.usage.push(...headerUsageMatches);
        }

        // Check for useHeader hook
        if (this.searchPatterns.useHeaderHook.test(content)) {
            analysis.hasUseHeaderHook = true;
            analysis.usage.push('useHeader hook usage');
        }

        // Check for Header sub-components
        const subComponentMatches = content.match(this.searchPatterns.headerSubComponents);
        if (subComponentMatches) {
            analysis.headerSubComponents = [...new Set(subComponentMatches)];
        }

        return analysis;
    }

    // Recursively scan directory
    scanDirectory(dirPath) {
        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                
                if (this.shouldExclude(fullPath)) {
                    continue;
                }

                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    this.scanDirectory(fullPath);
                } else if (this.isReactFile(fullPath)) {
                    const analysis = this.analyzeFile(fullPath);
                    if (analysis) {
                        this.processAnalysis(analysis);
                    }
                }
            }
        } catch (error) {
            console.warn(`Warning: Could not scan directory ${dirPath}:`, error.message);
        }
    }

    // Process analysis results
    processAnalysis(analysis) {
        this.results.summary.totalFiles++;

        if (analysis.hasDirectImport || analysis.hasHeaderUsage) {
            this.results.directImports.push(analysis);
            this.results.summary.directUsage++;
        }

        if (analysis.hasConditionalImport) {
            this.results.conditionalImports.push(analysis);
            this.results.summary.conditionalUsage++;
        }

        if (analysis.headerSubComponents.length > 0 || analysis.hasUseHeaderHook) {
            this.results.headerSubComponents.push(analysis);
            this.results.summary.subComponents++;
        }

        // Categorize layout components
        if (analysis.filePath.includes('layout') || 
            analysis.filePath.includes('Layout') ||
            analysis.filePath.includes('PageLayout') ||
            analysis.filePath.includes('ConditionalHeader')) {
            this.results.layoutComponents.push(analysis);
        }
    }

    // Generate report
    generateReport() {
        console.log('\n🔍 HEADER COMPONENT USAGE ANALYSIS');
        console.log('=====================================\n');

        // Summary
        console.log('📊 SUMMARY:');
        console.log(`Total files scanned: ${this.results.summary.totalFiles}`);
        console.log(`Files with direct Header usage: ${this.results.summary.directUsage}`);
        console.log(`Files with conditional Header usage: ${this.results.summary.conditionalUsage}`);
        console.log(`Files with Header sub-components/hooks: ${this.results.summary.subComponents}`);
        console.log('\n');

        // Direct imports
        if (this.results.directImports.length > 0) {
            console.log('🎯 DIRECT HEADER USAGE:');
            console.log('------------------------');
            this.results.directImports.forEach((file, index) => {
                console.log(`${index + 1}. ${file.filePath}`);
                if (file.usage.length > 0) {
                    file.usage.forEach(usage => {
                        console.log(`   └─ ${usage}`);
                    });
                }
                console.log('');
            });
        }

        // Conditional imports
        if (this.results.conditionalImports.length > 0) {
            console.log('🔄 CONDITIONAL HEADER USAGE:');
            console.log('-----------------------------');
            this.results.conditionalImports.forEach((file, index) => {
                console.log(`${index + 1}. ${file.filePath}`);
                console.log('');
            });
        }

        // Header sub-components
        if (this.results.headerSubComponents.length > 0) {
            console.log('🧩 HEADER SUB-COMPONENTS & HOOKS:');
            console.log('----------------------------------');
            this.results.headerSubComponents.forEach((file, index) => {
                console.log(`${index + 1}. ${file.filePath}`);
                if (file.headerSubComponents.length > 0) {
                    console.log(`   Sub-components: ${file.headerSubComponents.join(', ')}`);
                }
                if (file.hasUseHeaderHook) {
                    console.log(`   Uses: useHeader hook`);
                }
                console.log('');
            });
        }

        // Layout components
        if (this.results.layoutComponents.length > 0) {
            console.log('🏗️  LAYOUT COMPONENTS:');
            console.log('----------------------');
            this.results.layoutComponents.forEach((file, index) => {
                console.log(`${index + 1}. ${file.filePath}`);
                console.log('');
            });
        }

        // Recommendations
        console.log('💡 RECOMMENDATIONS:');
        console.log('-------------------');
        console.log('1. Consider using ConditionalHeader for consistent header management');
        console.log('2. Use the useHeader hook for header-related state management');
        console.log('3. Import Header sub-components individually for better tree shaking');
        console.log('4. Consider creating a HeaderProvider for global header state');
        console.log('\n');

        return this.results;
    }

    // Save results to JSON file
    saveResults(outputPath = './header-usage-analysis.json') {
        try {
            fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
            console.log(`📁 Results saved to: ${outputPath}`);
        } catch (error) {
            console.error('Error saving results:', error.message);
        }
    }

    // Main execution method
    run(searchPath = './client') {
        console.log(`🚀 Starting Header usage analysis in: ${searchPath}`);
        console.log('Scanning files...\n');

        const startTime = Date.now();
        
        if (fs.existsSync(searchPath)) {
            this.scanDirectory(searchPath);
        } else {
            console.error(`Error: Search path '${searchPath}' does not exist.`);
            return;
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        const results = this.generateReport();
        
        console.log(`⏱️  Analysis completed in ${duration} seconds`);
        
        // Save results
        this.saveResults();
        
        return results;
    }
}

// CLI execution
const finder = new HeaderUsageFinder();
const searchPath = process.argv[2] || './client';
finder.run(searchPath);

export default HeaderUsageFinder;