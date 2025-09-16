#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Remove comments from a file while preserving comments inside code blocks
 * @param {string} filePath - Path to the file to process
 * @param {object} options - Configuration options
 */
function removeCommentsFromFile(filePath, options = {}) {
    const {
        preserveInBlocks = true,
        dryRun = false,
        outputFile = null,
        verbose = false
    } = options

    try {
        // Read the file
        const content = fs.readFileSync(filePath, 'utf8')
        const lines = content.split('\n')
        const result = []
        
        let insideBlock = false
        let blockDepth = 0
        let insideString = false
        let stringChar = null
        let insideMultiLineComment = false
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            let processedLine = ''
            let j = 0
            
            while (j < line.length) {
                const char = line[j]
                const nextChar = line[j + 1]
                
                // Handle string literals
                if (!insideMultiLineComment && (char === '"' || char === "'" || char === '`')) {
                    if (!insideString) {
                        insideString = true
                        stringChar = char
                        processedLine += char
                    } else if (char === stringChar && line[j - 1] !== '\\') {
                        insideString = false
                        stringChar = null
                        processedLine += char
                    } else {
                        processedLine += char
                    }
                    j++
                    continue
                }
                
                // Skip processing if inside string
                if (insideString) {
                    processedLine += char
                    j++
                    continue
                }
                
                // Handle multi-line comments /* */
                if (!insideMultiLineComment && char === '/' && nextChar === '*') {
                    insideMultiLineComment = true
                    if (preserveInBlocks && insideBlock) {
                        processedLine += char + nextChar
                    }
                    j += 2
                    continue
                }
                
                if (insideMultiLineComment && char === '*' && nextChar === '/') {
                    insideMultiLineComment = false
                    if (preserveInBlocks && insideBlock) {
                        processedLine += char + nextChar
                    }
                    j += 2
                    continue
                }
                
                if (insideMultiLineComment) {
                    if (preserveInBlocks && insideBlock) {
                        processedLine += char
                    }
                    j++
                    continue
                }
                
                // Handle single-line comments //
                if (char === '/' && nextChar === '/') {
                    if (preserveInBlocks && insideBlock) {
                        processedLine += line.slice(j)
                    }
                    break
                }
                
                // Track block depth for JavaScript/TypeScript/similar languages
                if (char === '{') {
                    blockDepth++
                    insideBlock = blockDepth > 0
                    processedLine += char
                } else if (char === '}') {
                    blockDepth--
                    insideBlock = blockDepth > 0
                    processedLine += char
                } else {
                    processedLine += char
                }
                
                j++
            }
            
            // For HTML/XML comments
            if (!insideString && !insideMultiLineComment) {
                processedLine = processedLine.replace(/<!--[\s\S]*?-->/g, (match) => {
                    return preserveInBlocks && insideBlock ? match : ''
                })
            }
            
            // For Python/Shell comments
            if (filePath.endsWith('.py') || filePath.endsWith('.sh')) {
                if (!insideString && !insideMultiLineComment) {
                    const hashIndex = processedLine.indexOf('#')
                    if (hashIndex !== -1) {
                        if (preserveInBlocks && insideBlock) {
                            // Keep the comment
                        } else {
                            processedLine = processedLine.slice(0, hashIndex).trimRight()
                        }
                    }
                }
            }
            
            // Remove empty lines that were just comments (unless preserving structure)
            if (processedLine.trim() === '' && line.trim().startsWith('//')) {
                if (!preserveInBlocks || !insideBlock) {
                    continue
                }
            }
            
            result.push(processedLine)
        }
        
        const processedContent = result.join('\n')
        
        if (verbose) {
            console.log(`Processed ${filePath}:`)
            console.log(`  Original lines: ${lines.length}`)
            console.log(`  Processed lines: ${result.length}`)
            console.log(`  Inside block preservation: ${preserveInBlocks}`)
        }
        
        if (dryRun) {
            console.log('DRY RUN - Would write to:', outputFile || filePath)
            console.log('Preview (first 10 lines):')
            console.log(processedContent.split('\n').slice(0, 10).join('\n'))
            return processedContent
        }
        
        // Write the result
        const targetFile = outputFile || filePath
        fs.writeFileSync(targetFile, processedContent, 'utf8')
        
        if (verbose) {
            console.log(`✅ Successfully processed: ${targetFile}`)
        }
        
        return processedContent
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message)
        throw error
    }
}

/**
 * Process multiple files
 * @param {string[]} filePaths - Array of file paths to process
 * @param {object} options - Configuration options
 */
function removeCommentsFromFiles(filePaths, options = {}) {
    const results = []
    
    for (const filePath of filePaths) {
        try {
            if (!fs.existsSync(filePath)) {
                console.warn(`⚠️  File not found: ${filePath}`)
                continue
            }
            
            const result = removeCommentsFromFile(filePath, options)
            results.push({ filePath, success: true, content: result })
        } catch (error) {
            results.push({ filePath, success: false, error: error.message })
        }
    }
    
    return results
}

/**
 * Find files matching patterns
 * @param {string} pattern - Glob pattern or directory path
 * @param {string[]} extensions - File extensions to include
 */
function findFiles(pattern, extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.sh', '.html', '.css']) {
    const files = []
    
    if (fs.existsSync(pattern)) {
        const stat = fs.statSync(pattern)
        
        if (stat.isFile()) {
            files.push(pattern)
        } else if (stat.isDirectory()) {
            const scanDirectory = (dir) => {
                const items = fs.readdirSync(dir)
                
                for (const item of items) {
                    const fullPath = path.join(dir, item)
                    const itemStat = fs.statSync(fullPath)
                    
                    if (itemStat.isDirectory()) {
                        // Skip node_modules and other common directories
                        if (!item.startsWith('.') && !['node_modules', 'dist', 'build'].includes(item)) {
                            scanDirectory(fullPath)
                        }
                    } else if (itemStat.isFile()) {
                        const ext = path.extname(fullPath)
                        if (extensions.includes(ext)) {
                            files.push(fullPath)
                        }
                    }
                }
            }
            
            scanDirectory(pattern)
        }
    }
    
    return files
}

// CLI Interface
function main() {
    const args = process.argv.slice(2)
    
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
📝 Comment Remover Script

Usage: node remove-comments.js <file-or-directory> [options]

Options:
  --no-preserve-blocks    Remove comments even inside code blocks
  --dry-run              Show preview without modifying files
  --output <file>        Output to specific file (single file mode only)
  --extensions <ext>     Comma-separated list of extensions (default: js,jsx,ts,tsx,py,sh,html,css)
  --verbose              Show detailed processing information
  --help, -h             Show this help message

Examples:
  node remove-comments.js myfile.js
  node remove-comments.js src/ --dry-run
  node remove-comments.js script.py --no-preserve-blocks
  node remove-comments.js index.html --output clean-index.html
  node remove-comments.js . --extensions js,ts --verbose
        `)
        return
    }
    
    const inputPath = args[0]
    const options = {
        preserveInBlocks: !args.includes('--no-preserve-blocks'),
        dryRun: args.includes('--dry-run'),
        verbose: args.includes('--verbose'),
        outputFile: null
    }
    
    // Parse output file
    const outputIndex = args.indexOf('--output')
    if (outputIndex !== -1 && args[outputIndex + 1]) {
        options.outputFile = args[outputIndex + 1]
    }
    
    // Parse extensions
    const extensionsIndex = args.indexOf('--extensions')
    let extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.sh', '.html', '.css']
    if (extensionsIndex !== -1 && args[extensionsIndex + 1]) {
        extensions = args[extensionsIndex + 1].split(',').map(ext => ext.startsWith('.') ? ext : `.${ext}`)
    }
    
    console.log('🚀 Starting comment removal process...')
    console.log(`📁 Input: ${inputPath}`)
    console.log(`🔧 Preserve comments in blocks: ${options.preserveInBlocks}`)
    console.log(`👀 Dry run: ${options.dryRun}`)
    
    try {
        const files = findFiles(inputPath, extensions)
        
        if (files.length === 0) {
            console.log('❌ No files found to process')
            return
        }
        
        console.log(`📄 Found ${files.length} file(s) to process`)
        
        if (files.length === 1 && options.outputFile) {
            // Single file mode with custom output
            removeCommentsFromFile(files[0], options)
        } else {
            // Multiple files mode
            const results = removeCommentsFromFiles(files, options)
            
            const successful = results.filter(r => r.success).length
            const failed = results.filter(r => !r.success).length
            
            console.log(`\n📊 Processing complete:`)
            console.log(`  ✅ Successful: ${successful}`)
            console.log(`  ❌ Failed: ${failed}`)
            
            if (failed > 0) {
                console.log('\n❌ Failed files:')
                results.filter(r => !r.success).forEach(r => {
                    console.log(`  ${r.filePath}: ${r.error}`)
                })
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message)
        process.exit(1)
    }
}

// Export for use as module
export {
    removeCommentsFromFile,
    removeCommentsFromFiles,
    findFiles
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main()
}