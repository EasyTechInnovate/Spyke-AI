#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Files to process (exclude node_modules, .next, etc.)
const EXCLUDED_DIRS = [
    'node_modules', 
    '.next', 
    '.git', 
    'build', 
    'dist',
    '__tests__',
    'tests',
    'scripts'
]

// File extensions to process
const VALID_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx']

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir)
    
    files.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        
        if (stat.isDirectory()) {
            if (!EXCLUDED_DIRS.includes(file)) {
                getAllFiles(filePath, fileList)
            }
        } else {
            const ext = path.extname(file)
            if (VALID_EXTENSIONS.includes(ext)) {
                fileList.push(filePath)
            }
        }
    })
    
    return fileList
}

function addNotificationSetup(content, filePath) {
    let modified = false
    
    // Check if the file uses showMessage but doesn't have notification state
    if (content.includes('showMessage(') && !content.includes('const [notification, setNotification]')) {
        
        // Find the component function/export
        const componentMatch = content.match(/(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*{)|(function\s+\w+\s*\([^)]*\)\s*{)/g)
        
        if (componentMatch) {
            const notificationState = `
    // Inline notification state
    const [notification, setNotification] = useState(null)

    // Show inline notification messages  
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        // Auto-dismiss after 5 seconds
        setTimeout(() => setNotification(null), 5000)
    }

    // Clear notification
    const clearNotification = () => setNotification(null)
`
            
            // Find where to insert the state (after the function declaration)
            const firstMatch = componentMatch[0]
            const insertIndex = content.indexOf(firstMatch) + firstMatch.length
            
            content = content.slice(0, insertIndex) + notificationState + content.slice(insertIndex)
            modified = true
        }
    }
    
    return { content, modified }
}

function addNotificationJSX(content, filePath) {
    let modified = false
    
    // Check if we need to add notification JSX
    if (content.includes('showMessage(') && content.includes('setNotification') && !content.includes('<InlineNotification')) {
        
        // Look for return statement with JSX
        const returnMatch = content.match(/return\s*\(\s*(<[^>]*>)/s)
        
        if (returnMatch) {
            const notificationJSX = `
            {/* Inline Notification */}
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}

            `
            
            // Find the opening tag after return
            const openingTag = returnMatch[1]
            const insertIndex = content.indexOf(openingTag) + openingTag.length
            
            content = content.slice(0, insertIndex) + notificationJSX + content.slice(insertIndex)
            modified = true
        } else {
            // Look for JSX without return parentheses
            const jsxMatch = content.match(/return\s*(<[^>]*>)/s)
            if (jsxMatch) {
                const notificationJSX = `
            {/* Inline Notification */}
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}

            `
                
                const openingTag = jsxMatch[1]
                const insertIndex = content.indexOf(openingTag) + openingTag.length
                
                content = content.slice(0, insertIndex) + notificationJSX + content.slice(insertIndex)
                modified = true
            }
        }
    }
    
    return { content, modified }
}

function fixImports(content, filePath) {
    let modified = false
    
    // Add useState if showMessage is used but useState is not imported
    if (content.includes('setNotification') && !content.includes('useState')) {
        const reactImportRegex = /import\s+(.+)\s+from\s+['"]react['"];?/
        if (reactImportRegex.test(content)) {
            content = content.replace(reactImportRegex, (match, imports) => {
                if (imports.includes('useState')) {
                    return match
                }
                // Handle different import patterns
                if (imports.includes('{')) {
                    return match.replace(/{\s*([^}]+)\s*}/, '{ useState, $1 }')
                } else {
                    return `import { useState } from 'react'\n${match}`
                }
            })
            modified = true
        } else {
            // Add useState import at the top
            const firstImport = content.match(/^import.*$/m)
            if (firstImport) {
                content = 'import { useState } from \'react\'\n' + content
                modified = true
            }
        }
    }
    
    // Add InlineNotification import if needed
    if (content.includes('<InlineNotification') && !content.includes('InlineNotification')) {
        const importRegex = /^import.*from.*['"].*['"];?\s*$/gm
        const imports = content.match(importRegex) || []
        
        if (imports.length > 0) {
            const lastImportIndex = content.lastIndexOf(imports[imports.length - 1])
            const afterLastImport = lastImportIndex + imports[imports.length - 1].length
            
            content = content.slice(0, afterLastImport) + 
                     '\nimport InlineNotification from \'@/components/shared/notifications/InlineNotification\'' +
                     content.slice(afterLastImport)
            modified = true
        }
    }
    
    return { content, modified }
}

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8')
        let totalModified = false
        
        // Skip if already processed or doesn't need processing
        if (!content.includes('showMessage(') || 
            (content.includes('setNotification') && content.includes('<InlineNotification'))) {
            return { filePath, modified: false, reason: 'already_processed_or_no_showMessage' }
        }
        
        // Step 1: Add notification state and functions
        const step1 = addNotificationSetup(content, filePath)
        content = step1.content
        if (step1.modified) totalModified = true
        
        // Step 2: Add notification JSX
        const step2 = addNotificationJSX(content, filePath)
        content = step2.content
        if (step2.modified) totalModified = true
        
        // Step 3: Fix imports
        const step3 = fixImports(content, filePath)
        content = step3.content
        if (step3.modified) totalModified = true
        
        if (totalModified) {
            fs.writeFileSync(filePath, content, 'utf8')
            return { filePath, modified: true, reason: 'updated' }
        }
        
        return { filePath, modified: false, reason: 'no_changes_needed' }
        
    } catch (error) {
        return { filePath, modified: false, error: error.message }
    }
}

function main() {
    const clientDir = path.join(__dirname, '..')
    console.log(`🔧 Adding notification setup to components that use showMessage...`)
    console.log(`📁 Scanning: ${clientDir}`)
    
    const allFiles = getAllFiles(clientDir)
    console.log(`📄 Found ${allFiles.length} files to check`)
    
    const results = {
        processed: 0,
        modified: 0,
        errors: 0,
        skipped: 0
    }
    
    const modifiedFiles = []
    const errorFiles = []
    const skippedFiles = []
    
    allFiles.forEach(filePath => {
        const result = processFile(filePath)
        results.processed++
        
        if (result.error) {
            results.errors++
            errorFiles.push(result)
        } else if (result.modified) {
            results.modified++
            modifiedFiles.push(result)
        } else {
            results.skipped++
            skippedFiles.push(result)
        }
    })
    
    // Print results
    console.log('\n📊 SETUP RESULTS:')
    console.log(`✅ Files processed: ${results.processed}`)
    console.log(`🔄 Files modified: ${results.modified}`)
    console.log(`⏭️  Files skipped: ${results.skipped}`)
    console.log(`❌ Errors: ${results.errors}`)
    
    if (modifiedFiles.length > 0) {
        console.log('\n✅ SUCCESSFULLY UPDATED FILES:')
        modifiedFiles.forEach(result => {
            console.log(`  ✓ ${result.filePath.replace(clientDir, '.')}`)
        })
    }
    
    if (errorFiles.length > 0) {
        console.log('\n❌ ERRORS:')
        errorFiles.forEach(result => {
            console.log(`  ✗ ${result.filePath.replace(clientDir, '.')}: ${result.error}`)
        })
    }
    
    console.log('\n🎉 NOTIFICATION SETUP COMPLETE!')
    console.log('📋 What was added to each component:')
    console.log('  1. useState import (if needed)')
    console.log('  2. InlineNotification import')
    console.log('  3. notification state management')
    console.log('  4. showMessage function')
    console.log('  5. InlineNotification JSX component')
    
    console.log('\n🧪 NEXT STEPS:')
    console.log('1. Test the components to ensure notifications work')
    console.log('2. Remove any remaining toast providers from layout files')
    console.log('3. Remove sonner/react-hot-toast dependencies')
    console.log('4. Clean up any remaining toast-related code')
}

if (require.main === module) {
    main()
}