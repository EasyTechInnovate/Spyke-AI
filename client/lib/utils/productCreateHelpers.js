// Product creation utility helpers
export const generateProductPayload = (state) => {
    // Transform the frontend state into the backend API format
    const payload = {
        // Basic Information (Step 1)
        title: state.title,
        type: state.type,
        category: state.category,
        industry: state.industry,
        shortDescription: state.shortDescription,
        fullDescription: state.fullDescription,

        // Product Details (Step 2)
        targetAudience: state.targetAudience,
        keyBenefits: state.keyBenefits.filter((b) => b.trim()),
        useCaseExamples: state.useCaseExamples.filter((u) => u.trim()),
        howItWorks: state.howItWorks
            .filter((step) => step.title.trim() && step.detail.trim())
            .map((step, index) => ({
                stepNumber: index + 1,
                title: step.title,
                description: step.detail
            })),
        expectedOutcomes: state.expectedOutcomes.filter((o) => o.trim()),

        // Technical Specifications (Step 3)
        toolsAndPlatforms: state.toolsUsed.map((tool) => ({
            name: tool.name,
            category: tool.category,
            required: true // All selected tools are required
        })),
        toolsConfiguration: state.toolsConfiguration,
        setupTimeEstimate: state.setupTimeEstimate,
        // deliveryMethod removed since this field no longer exists

        // Media & Pricing (Step 5)
        media: {
            thumbnailImage: typeof state.thumbnailImage === 'string' ? state.thumbnailImage : null,
            additionalImages: state.additionalImages.filter((img) => typeof img === 'string').slice(0, 5), // Limit to 5 images
            previewVideo: typeof state.previewVideo === 'string' ? state.previewVideo : null
        },
        tags: state.productTags,
        seoKeywords: state.seoKeywords,

        // Launch Settings (Step 6)
        performanceMetrics: state.performanceMetrics,
        usageInformation: state.usageInformation,
        supportAndMaintenance: state.supportAndMaintenance,
        faq: state.faq
            .filter((item) => item.question.trim() && item.answer.trim())
            .map((item) => ({
                question: item.question,
                answer: item.answer
            })),

        // Metadata
        status: 'draft', // Always create as draft first
        createdAt: new Date().toISOString(),
        version: 1
    }

    // Clean up undefined/null values
    return JSON.parse(JSON.stringify(payload))
}

// Validation helpers
export const validateRequired = (value, fieldName) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
        return `${fieldName} is required`
    }
    return null
}

export const validateArray = (arr, minLength, fieldName) => {
    if (!Array.isArray(arr) || arr.length < minLength) {
        return `${fieldName} requires at least ${minLength} item${minLength > 1 ? 's' : ''}`
    }
    return null
}

export const validateLength = (value, minLength, maxLength, fieldName) => {
    if (!value) return null

    if (value.length < minLength) {
        return `${fieldName} must be at least ${minLength} characters`
    }

    if (maxLength && value.length > maxLength) {
        return `${fieldName} must be less than ${maxLength} characters`
    }

    return null
}

// File validation helpers
export const validateImageFile = (file) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    if (file.size > maxSize) {
        return 'Image file size must be less than 10MB'
    }

    if (!allowedTypes.includes(file.type)) {
        return 'Only JPEG, PNG, WebP, and GIF images are allowed'
    }

    return null
}

export const validateVideoFile = async (file) => {
    const maxSize = 150 * 1024 * 1024 // 150MB
    const maxDuration = 300 // 5 minutes
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']

    if (file.size > maxSize) {
        return 'Video file size must be less than 150MB'
    }

    if (!allowedTypes.includes(file.type)) {
        return 'Only MP4, WebM, MOV, and AVI videos are allowed'
    }

    // Check video duration
    return new Promise((resolve) => {
        const video = document.createElement('video')
        video.preload = 'metadata'

        video.onloadedmetadata = () => {
            if (video.duration > maxDuration) {
                resolve('Video duration must be less than 5 minutes')
            } else {
                resolve(null)
            }
        }

        video.onerror = () => resolve('Invalid video file')
        video.src = URL.createObjectURL(file)
    })
}

// Local storage helpers
export const saveToLocalStorage = (key, data, version = 1) => {
    try {
        const payload = {
            data,
            version,
            timestamp: Date.now()
        }
        localStorage.setItem(key, JSON.stringify(payload))
        return true
    } catch (error) {
        console.error('Failed to save to localStorage:', error)
        return false
    }
}

export const loadFromLocalStorage = (key, expectedVersion = 1) => {
    try {
        const stored = localStorage.getItem(key)
        if (!stored) return null

        const parsed = JSON.parse(stored)

        // Check version compatibility
        if (parsed.version !== expectedVersion) {
            console.warn(`Version mismatch for ${key}. Expected ${expectedVersion}, got ${parsed.version}`)
            // Could implement migration logic here
            return null
        }

        return parsed.data
    } catch (error) {
        console.error('Failed to load from localStorage:', error)
        return null
    }
}

export const clearLocalStorage = (keys) => {
    keys.forEach((key) => {
        try {
            localStorage.removeItem(key)
        } catch (error) {
            console.error(`Failed to remove ${key} from localStorage:`, error)
        }
    })
}

// Debounce helper for autosave
export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Format helpers for display
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Text processing helpers
export const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
}

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export const slugify = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Array helpers
export const moveArrayItem = (arr, fromIndex, toIndex) => {
    const newArr = [...arr]
    const [removed] = newArr.splice(fromIndex, 1)
    newArr.splice(toIndex, 0, removed)
    return newArr
}

export const dedupeArray = (arr, key) => {
    if (!key) {
        return [...new Set(arr)]
    }

    const seen = new Set()
    return arr.filter((item) => {
        const value = typeof item === 'object' ? item[key] : item
        const normalizedValue = typeof value === 'string' ? value.toLowerCase() : value

        if (seen.has(normalizedValue)) {
            return false
        }

        seen.add(normalizedValue)
        return true
    })
}
