#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Optimized script to find Header component usage
 * Much faster version with early termination and efficient scanning
 */

class FastHeaderFinder {
    constructor() {
        this.results = [];
        this.scannedFiles = 0;
        this.startTime = Date.now();
        
        // Only scan these directories for better performance
        this.targetDirs = [
            'client/components',
            'client/app',
            'client/hooks'
        ];
        
        // Quick patterns for initial filtering
        this.quickPatterns = {
            hasHeader: /Header/,
            hasImport: /import/,
            hasJSX: /<[A-Z]/
        };
        
        // Detailed patterns for confirmed files
        this.detailedPatterns = {
            headerImport: /import\s+(?:.*\s+)?Header(?:\s+.*)?from\s+['"`][^'"`]*['"`]/g,
            headerUsage: /<Header(?:\s[^>]*)?\/?>/g,
            conditionalHeader: /ConditionalHeader/g,
            useHeaderHook: /useHeader(?:\s*\()/g,
            headerSubComponents: /from\s+['"`][^'"`]*Header\/[^'"`]*['"`]/g
        };
    }

    // Quick file content check - read only first few KB
    quickContentCheck(filePath) {
        try {
            const fd = fs.openSync(filePath, 'r');
            const buffer = Buffer.alloc(2048); // Read first 2KB only
            const bytesRead = fs.readSync(fd, buffer, 0, 2048, 0);
            fs.closeSync(fd);
            
            const content = buffer.subarray(0, bytesRead).toString('utf8');
            
            // Quick check if file might contain Header references
            return this.quickPatterns.hasHeader.test(content) && 
                   (this.quickPatterns.hasImport.test(content) || this.quickPatterns.hasJSX.test(content));
        } catch (error) {
            return false;
        }
    }

    // Full analysis for confirmed files
    analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(process.cwd(), filePath);
            
            const analysis = {
                file: relativePath,
                patterns: []
            };

            // Check each pattern
            Object.entries(this.detailedPatterns).forEach(([name, pattern]) => {
                const matches = content.match(pattern);
                if (matches) {
                    analysis.patterns.push({
                        type: name,
                        matches: matches.slice(0, 3) // Limit to first 3 matches
                    });
                }
            });

            return analysis.patterns.length > 0 ? analysis : null;
        } catch (error) {
            return null;
        }
    }

    // Efficient directory scanning
    scanDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            console.log(`⚠️  Directory not found: ${dirPath}`);
            return;
        }

        try {
            const items = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);
                
                if (item.isDirectory()) {
                    // Skip node_modules and build directories
                    if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(item.name)) {
                        this.scanDirectory(fullPath);
                    }
                } else if (item.isFile()) {
                    const ext = path.extname(item.name);
                    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
                        this.scannedFiles++;
                        
                        // Quick check first
                        if (this.quickContentCheck(fullPath)) {
                            const analysis = this.analyzeFile(fullPath);
                            if (analysis) {
                                this.results.push(analysis);
                            }
                        }
                        
                        // Progress indicator
                        if (this.scannedFiles % 50 === 0) {
                            process.stdout.write(`\rScanned ${this.scannedFiles} files...`);
                        }
                    }
                }
            }
        } catch (error) {
            console.warn(`Warning: Could not scan ${dirPath}:`, error.message);
        }
    }

    // Generate quick report
    generateReport() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        
        console.log('\n\n🔍 HEADER USAGE ANALYSIS (Fast Mode)');
        console.log('=====================================');
        console.log(`📊 Scanned ${this.scannedFiles} files in ${duration}s`);
        console.log(`🎯 Found ${this.results.length} files using Header\n`);

        if (this.results.length === 0) {
            console.log('❌ No Header usage found.');
            return;
        }

        // Group by pattern type
        const grouped = {};
        this.results.forEach(result => {
            result.patterns.forEach(pattern => {
                if (!grouped[pattern.type]) {
                    grouped[pattern.type] = [];
                }
                grouped[pattern.type].push(result.file);
            });
        });

        // Display results by category
        const categories = {
            headerImport: '📥 Direct Header Imports',
            headerUsage: '🏗️  Header JSX Usage',
            conditionalHeader: '🔄 Conditional Header',
            useHeaderHook: '🎣 useHeader Hook',
            headerSubComponents: '🧩 Header Sub-components'
        };

        Object.entries(categories).forEach(([key, title]) => {
            if (grouped[key]) {
                console.log(`${title}:`);
                const uniqueFiles = [...new Set(grouped[key])];
                uniqueFiles.forEach((file, index) => {
                    console.log(`  ${index + 1}. ${file}`);
                });
                console.log('');
            }
        });

        console.log('📁 All files with Header usage:');
        this.results.forEach((result, index) => {
            console.log(`  ${index + 1}. ${result.file}`);
            result.patterns.forEach(pattern => {
                console.log(`     └─ ${pattern.type}: ${pattern.matches.length} occurrence(s)`);
            });
        });

        return this.results;
    }

    // Main execution
    run() {
        console.log('🚀 Fast Header Usage Scanner');
        console.log('============================');
        
        // Scan target directories
        this.targetDirs.forEach(dir => {
            console.log(`📂 Scanning: ${dir}`);
            this.scanDirectory(path.join(process.cwd(), dir));
        });

        console.log('\n✅ Scan complete!');
        return this.generateReport();
    }
}

// Run the scanner
const scanner = new FastHeaderFinder();
const results = scanner.run();

// Save results
try {
    fs.writeFileSync('header-usage-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Results saved to: header-usage-results.json');
} catch (error) {
    console.log('\n⚠️  Could not save results file');
}

export default FastHeaderFinder;