#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Toast patterns to find and replace
const TOAST_PATTERNS = [
    // Sonner toast patterns
    { 
        find: /import\s+{\s*toast\s*}\s+from\s+['"]sonner['"];?\s*\n?/g, 
        replace: '' 
    },
    { 
        find: /import\s+{\s*toast,\s*([^}]+)\s*}\s+from\s+['"]sonner['"];?\s*\n?/g, 
        replace: 'import { $1 } from \'sonner\';\n' 
    },
    { 
        find: /import\s+toast\s+from\s+['"]sonner['"];?\s*\n?/g, 
        replace: '' 
    },
    
    // Toast usage patterns
    { 
        find: /toast\.success\(['"`]([^'"`]+)['"`]\)/g, 
        replace: 'showMessage(\'$1\', \'success\')' 
    },
    { 
        find: /toast\.error\(['"`]([^'"`]+)['"`]\)/g, 
        replace: 'showMessage(\'$1\', \'error\')' 
    },
    { 
        find: /toast\.warning\(['"`]([^'"`]+)['"`]\)/g, 
        replace: 'showMessage(\'$1\', \'warning\')' 
    },
    { 
        find: /toast\.info\(['"`]([^'"`]+)['"`]\)/g, 
        replace: 'showMessage(\'$1\', \'info\')' 
    },
    { 
        find: /toast\(['"`]([^'"`]+)['"`]\)/g, 
        replace: 'showMessage(\'$1\')' 
    },
    
    // With variables/expressions
    { 
        find: /toast\.success\(([^)]+)\)/g, 
        replace: 'showMessage($1, \'success\')' 
    },
    { 
        find: /toast\.error\(([^)]+)\)/g, 
        replace: 'showMessage($1, \'error\')' 
    },
    { 
        find: /toast\.warning\(([^)]+)\)/g, 
        replace: 'showMessage($1, \'warning\')' 
    },
    { 
        find: /toast\.info\(([^)]+)\)/g, 
        replace: 'showMessage($1, \'info\')' 
    },
    { 
        find: /toast\(([^)]+)\)/g, 
        replace: 'showMessage($1)' 
    },
    
    // React hot toast patterns
    { 
        find: /import\s+toast\s+from\s+['"]react-hot-toast['"];?\s*\n?/g, 
        replace: '' 
    },
    { 
        find: /import\s+{\s*toast\s*}\s+from\s+['"]react-hot-toast['"];?\s*\n?/g, 
        replace: '' 
    },
]

// Files to process (exclude node_modules, .next, etc.)
const EXCLUDED_DIRS = [
    'node_modules', 
    '.next', 
    '.git', 
    'build', 
    'dist',
    '__tests__',
    'tests'
]

// File extensions to process
const VALID_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx']

// Inline notification template to add to components
const INLINE_NOTIFICATION_SETUP = `
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

const INLINE_NOTIFICATION_JSX = `
                {/* Inline Notification */}
                {notification && (
                    <InlineNotification
                        type={notification.type}
                        message={notification.message}
                        onDismiss={clearNotification}
                    />
                )}
`

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

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8')
        let modified = false
        let hasToastUsage = false
        
        // Check if file has toast usage
        const toastRegex = /\btoast\b/g
        if (toastRegex.test(content)) {
            hasToastUsage = true
        }
        
        // Apply replacements
        TOAST_PATTERNS.forEach(pattern => {
            const newContent = content.replace(pattern.find, pattern.replace)
            if (newContent !== content) {
                content = newContent
                modified = true
            }
        })
        
        // Add import for InlineNotification if needed
        if (hasToastUsage && !content.includes('InlineNotification')) {
            // Find existing imports
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
        
        // Add useState import if showMessage is used but useState is not imported
        if (content.includes('showMessage') && !content.includes('useState')) {
            const reactImportRegex = /import\s+.*\s+from\s+['"]react['"];?/
            if (reactImportRegex.test(content)) {
                content = content.replace(reactImportRegex, (match) => {
                    if (match.includes('useState')) {
                        return match
                    }
                    return match.replace(/{\s*([^}]+)\s*}/, '{ useState, $1 }')
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
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8')
            return { filePath, modified: true, hasToastUsage }
        }
        
        return { filePath, modified: false, hasToastUsage }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message)
        return { filePath, modified: false, hasToastUsage: false, error: error.message }
    }
}

function main() {
    const clientDir = path.join(__dirname, '..')
    console.log(`🔍 Scanning for toast usage in: ${clientDir}`)
    
    const allFiles = getAllFiles(clientDir)
    console.log(`📁 Found ${allFiles.length} files to process`)
    
    const results = {
        processed: 0,
        modified: 0,
        withToast: 0,
        errors: 0
    }
    
    const modifiedFiles = []
    const toastFiles = []
    const errorFiles = []
    
    allFiles.forEach(filePath => {
        const result = processFile(filePath)
        results.processed++
        
        if (result.error) {
            results.errors++
            errorFiles.push(result)
        } else {
            if (result.modified) {
                results.modified++
                modifiedFiles.push(result.filePath)
            }
            if (result.hasToastUsage) {
                results.withToast++
                toastFiles.push(result.filePath)
            }
        }
    })
    
    // Print results
    console.log('\n📊 REPLACEMENT RESULTS:')
    console.log(`✅ Files processed: ${results.processed}`)
    console.log(`🔄 Files modified: ${results.modified}`)
    console.log(`🍞 Files with toast usage: ${results.withToast}`)
    console.log(`❌ Errors: ${results.errors}`)
    
    if (modifiedFiles.length > 0) {
        console.log('\n📝 MODIFIED FILES:')
        modifiedFiles.forEach(file => {
            console.log(`  - ${file.replace(clientDir, '.')}`)
        })
    }
    
    if (toastFiles.length > 0) {
        console.log('\n🍞 FILES WITH TOAST USAGE:')
        toastFiles.forEach(file => {
            console.log(`  - ${file.replace(clientDir, '.')}`)
        })
    }
    
    if (errorFiles.length > 0) {
        console.log('\n❌ ERRORS:')
        errorFiles.forEach(result => {
            console.log(`  - ${result.filePath.replace(clientDir, '.')}: ${result.error}`)
        })
    }
    
    console.log('\n📋 NEXT STEPS:')
    console.log('1. Review the modified files for correctness')
    console.log('2. Add notification state and showMessage function to components that use it')
    console.log('3. Add InlineNotification JSX to component renders')
    console.log('4. Test the inline notifications')
    console.log('5. Remove any remaining toast providers from layout files')
    
    console.log('\n💡 NOTIFICATION SETUP TEMPLATE:')
    console.log(INLINE_NOTIFICATION_SETUP)
    
    console.log('\n💡 JSX TEMPLATE:')
    console.log(INLINE_NOTIFICATION_JSX)
}

if (require.main === module) {
    main()
}