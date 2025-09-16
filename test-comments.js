// This is a top-level comment that will be removed
const greeting = "Hello World"

// Another top-level comment to be removed
function processData() {
    // This comment is inside a function block - will be preserved
    const data = getData()
    
    if (data) {
        // This comment is inside an if block - will be preserved
        return data.filter(item => {
            // This nested comment will also be preserved
            return item.active
        })
    }
    
    /* This multi-line comment 
       is also inside the function
       and will be preserved */
    return []
}

// This comment is outside blocks - will be removed
const result = processData()

// Final comment to be removed