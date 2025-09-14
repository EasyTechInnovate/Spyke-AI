import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { VALIDATION_LIMITS, SMART_SUGGESTIONS } from '@/lib/constants/productCreate'

// LRU Cache implementation for selector memoization
class LRUCache {
    constructor(maxSize = 50) {
        this.maxSize = maxSize
        this.cache = new Map()
    }

    get(key) {
        const value = this.cache.get(key)
        if (value !== undefined) {
            // Move to end (most recently used)
            this.cache.delete(key)
            this.cache.set(key, value)
        }
        return value
    }

    set(key, value) {
        if (this.cache.has(key)) {
            // Update existing key
            this.cache.delete(key)
        } else if (this.cache.size >= this.maxSize) {
            // Remove least recently used item
            const firstKey = this.cache.keys().next().value
            this.cache.delete(firstKey)
        }
        this.cache.set(key, value)
    }

    has(key) {
        return this.cache.has(key)
    }

    clear() {
        this.cache.clear()
    }

    get size() {
        return this.cache.size
    }
}

const STORAGE_KEY = 'spyke-product-create'
const SCHEMA_VERSION = '1.0'

// Cache for memoized selectors
let selectorCache = new LRUCache(50)
let lastStateSnapshot = null

// Validation ID counter for race condition prevention
let validationCounter = 0

// Initial form state
const initialState = {
    // Step 1: Basic Information (all required)
    title: '', // Required
    type: '', // Required
    category: '', // Required
    industry: '', // Required
    shortDescription: '', // Required
    fullDescription: '', // Required

    // Step 2: Product Details
    targetAudience: '', // Optional
    keyBenefits: [], // Optional
    useCaseExamples: [], // Optional
    howItWorks: [{ title: '', detail: '' }], // Required, min 3
    expectedOutcomes: [], // Optional

    // Step 3: Technical Specifications
    toolsUsed: [], // Required
    toolsConfiguration: '', // Required (no link field)
    setupTimeEstimate: '', // Required
    // deliveryMethod field removed

    // Step 4: Premium Content (all optional)
    premiumContent: {
        promptText: '',
        promptInstructions: '',
        automationInstructions: '',
        automationFiles: [],
        agentConfiguration: '',
        agentFiles: [],
        detailedHowItWorks: [],
        configurationExamples: [],
        resultExamples: [],
        videoTutorials: [],
        supportDocuments: [],
        bonusContent: []
    },

    // Step 5: Media & Pricing
    thumbnailImage: null, // Required - File upload (changed from URL)
    profileBanner: null, // Optional - Profile banner image URL
    additionalImages: [], // Required - File uploads (changed from URLs)
    previewVideo: null, // Optional - File upload with 150MB/5min limit (changed from URL)
    productTags: [], // Required, max 10, add on enter (changed from dropdown)
    seoKeywords: [], // Optional

    // Pricing information
    price: 0,
    originalPrice: 0,
    discountPercentage: 0,
    pricingModel: 'one-time',
    currencyCode: 'USD',
    pricingNotes: '',

    // Step 6: Launch Settings
    performanceMetrics: '', // Optional
    usageInformation: '', // Optional
    supportAndMaintenance: '', // Required
    faq: [], // Required - start with empty array instead of default empty item

    // Launch preparation
    launchChecklist: [
        { title: 'Test all product functionality', description: 'Ensure everything works as expected', completed: false },
        { title: 'Review product description and details', description: 'Check for accuracy and clarity', completed: false },
        { title: 'Verify pricing information', description: 'Confirm pricing strategy and discount settings', completed: false },
        { title: 'Upload high-quality images and videos', description: 'Ensure all media is professional and clear', completed: false },
        { title: 'Complete FAQ section', description: 'Answer common customer questions', completed: false },
        { title: 'Set up customer support process', description: 'Prepare for handling customer inquiries', completed: false },
        { title: 'Define launch marketing strategy', description: 'Plan how to promote your product launch', completed: false },
        { title: 'Prepare launch announcement', description: 'Draft social media and email content', completed: false }
    ],
    launchDate: '',
    launchType: 'immediate',
    launchNotes: '',
    selectedFAQCategory: 'All',

    // Meta
    currentStep: 1,
    completedSteps: [],
    lastSaved: null,
    isDirty: false,
    errors: {},
    touchedFields: {}, // Track which fields user has interacted with
    isSubmitting: false
}

export const useProductCreateStore = create(
    subscribeWithSelector(
        persist(
            immer((set, get) => ({
                ...initialState,

                // Actions
                setField: (field, value) =>
                    set((state) => {
                        const keys = field.split('.')
                        let current = state
                        for (let i = 0; i < keys.length - 1; i++) {
                            current = current[keys[i]]
                        }
                        current[keys[keys.length - 1]] = value
                        state.isDirty = true
                        // Mark field as touched when user interacts with it
                        state.touchedFields[field] = true

                        // Clear validation error if field becomes valid
                        if (field === 'supportAndMaintenance' && value.trim()) {
                            delete state.errors.supportAndMaintenance
                        }

                        // Clear other field errors when they become valid
                        if (field === 'title' && value.trim()) {
                            delete state.errors.title
                        }

                        if (field === 'shortDescription' && value.trim() && value.length >= VALIDATION_LIMITS.SHORT_DESCRIPTION.MIN) {
                            delete state.errors.shortDescription
                        }

                        if (field === 'fullDescription' && value.trim() && value.length >= VALIDATION_LIMITS.FULL_DESCRIPTION.MIN) {
                            delete state.errors.fullDescription
                        }

                        if (field === 'toolsConfiguration' && value.trim()) {
                            delete state.errors.toolsConfiguration
                        }
                    }),

                // New action to mark fields as touched (for blur events)
                markFieldTouched: (field) =>
                    set((state) => {
                        state.touchedFields[field] = true
                    }),

                // Enhanced validation with race condition prevention
                validateTouchedFields: () => {
                    const currentValidationId = ++validationCounter
                    const state = get()
                    const errors = {}
                    const touched = state.touchedFields

                    // Only validate fields that have been touched
                    if (touched.title && !state.title.trim()) {
                        errors.title = 'required'
                    } else if (touched.title && state.title.length < VALIDATION_LIMITS.TITLE.MIN) {
                        errors.title = 'minLength'
                    } else if (touched.title && state.title.length > VALIDATION_LIMITS.TITLE.MAX) {
                        errors.title = 'maxLength'
                    }

                    if (touched.type && !state.type) {
                        errors.type = 'required'
                    }

                    if (touched.category && !state.category) {
                        errors.category = 'required'
                    }

                    if (touched.industry && !state.industry) {
                        errors.industry = 'required'
                    }

                    if (touched.shortDescription && !state.shortDescription.trim()) {
                        errors.shortDescription = 'required'
                    } else if (touched.shortDescription && state.shortDescription.length < VALIDATION_LIMITS.SHORT_DESCRIPTION.MIN) {
                        errors.shortDescription = 'minLength'
                    } else if (touched.shortDescription && state.shortDescription.length > VALIDATION_LIMITS.SHORT_DESCRIPTION.MAX) {
                        errors.shortDescription = 'maxLength'
                    }

                    if (touched.fullDescription && !state.fullDescription.trim()) {
                        errors.fullDescription = 'required'
                    } else if (touched.fullDescription && state.fullDescription.length < VALIDATION_LIMITS.FULL_DESCRIPTION.MIN) {
                        errors.fullDescription = 'minLength'
                    } else if (touched.fullDescription && state.fullDescription.length > VALIDATION_LIMITS.FULL_DESCRIPTION.MAX) {
                        errors.fullDescription = 'maxLength'
                    }

                    if (touched.toolsConfiguration && !state.toolsConfiguration.trim()) {
                        errors.toolsConfiguration = 'required'
                    }

                    if (touched.setupTimeEstimate && !state.setupTimeEstimate) {
                        errors.setupTimeEstimate = 'required'
                    }

                    if (touched.supportAndMaintenance && !state.supportAndMaintenance.trim()) {
                        errors.supportAndMaintenance = 'required'
                    } else if (touched.supportAndMaintenance && state.supportAndMaintenance.length < VALIDATION_LIMITS.SUPPORT_MIN_LENGTH) {
                        errors.supportAndMaintenance = 'minLength'
                    }

                    if (touched.productTags && state.productTags.length === 0) {
                        errors.productTags = 'required'
                    } else if (touched.productTags && state.productTags.length > VALIDATION_LIMITS.PRODUCT_TAGS_MAX) {
                        errors.productTags = 'maxItems'
                    }

                    if (touched.howItWorks) {
                        const validSteps = state.howItWorks.filter((step) => step.title.trim() && step.detail.trim())
                        if (validSteps.length < VALIDATION_LIMITS.HOW_IT_WORKS_MIN_STEPS) {
                            errors.howItWorks = 'minSteps'
                        }
                    }

                    if (touched.faq) {
                        const validFaqs = state.faq.filter((faq) => faq.question.trim() && faq.answer.trim())
                        if (validFaqs.length === 0) {
                            errors.faq = 'required'
                        }
                    }

                    // Use setTimeout to prevent race conditions
                    setTimeout(() => {
                        // Only apply validation if this is still the latest validation
                        if (currentValidationId === validationCounter) {
                            set((state) => {
                                // Only update errors for touched fields, keep existing errors for untouched fields
                                state.errors = { ...state.errors, ...errors }
                                // Clear errors for touched fields that are now valid
                                Object.keys(touched).forEach((field) => {
                                    if (!errors[field]) {
                                        delete state.errors[field]
                                    }
                                })
                            })
                        }
                    }, 0)
                },

                setStep: (step) =>
                    set((state) => {
                        if (step >= 1 && step <= 6) {
                            state.currentStep = step
                        }
                    }),

                nextStep: () =>
                    set((state) => {
                        if (state.currentStep < 6) {
                            state.currentStep += 1
                        }
                    }),

                prevStep: () =>
                    set((state) => {
                        if (state.currentStep > 1) {
                            state.currentStep -= 1
                        }
                    }),

                markStepComplete: (step) =>
                    set((state) => {
                        if (!state.completedSteps.includes(step)) {
                            state.completedSteps.push(step)
                        }
                    }),

                // Array operations
                addToArray: (field, item) =>
                    set((state) => {
                        const keys = field.split('.')
                        let current = state
                        for (const key of keys.slice(0, -1)) {
                            current = current[key]
                        }
                        const arrayKey = keys[keys.length - 1]
                        if (Array.isArray(current[arrayKey])) {
                            current[arrayKey].push(item)
                            state.isDirty = true
                        }
                    }),

                removeFromArray: (field, index) =>
                    set((state) => {
                        const keys = field.split('.')
                        let current = state
                        for (const key of keys.slice(0, -1)) {
                            current = current[key]
                        }
                        const arrayKey = keys[keys.length - 1]
                        if (Array.isArray(current[arrayKey])) {
                            current[arrayKey].splice(index, 1)
                            state.isDirty = true
                        }
                    }),

                updateArrayItem: (field, index, item) =>
                    set((state) => {
                        const keys = field.split('.')
                        let current = state
                        for (const key of keys.slice(0, -1)) {
                            current = current[key]
                        }
                        const arrayKey = keys[keys.length - 1]
                        if (Array.isArray(current[arrayKey]) && index >= 0 && index < current[arrayKey].length) {
                            current[arrayKey][index] = item
                            state.isDirty = true
                        }
                    }),

                // Tag operations with deduplication
                addTag: (field, tag) =>
                    set((state) => {
                        const keys = field.split('.')
                        let current = state
                        for (const key of keys.slice(0, -1)) {
                            current = current[key]
                        }
                        const arrayKey = keys[keys.length - 1]

                        if (Array.isArray(current[arrayKey])) {
                            const normalizedTag = tag.trim().toLowerCase()
                            const exists = current[arrayKey].some((t) => t.toLowerCase() === normalizedTag)

                            if (!exists && current[arrayKey].length < VALIDATION_LIMITS.TAGS_MAX) {
                                current[arrayKey].push(tag.trim())
                                state.isDirty = true
                            }
                        }
                    }),

                removeTag: (field, index) =>
                    set((state) => {
                        get().removeFromArray(field, index)
                    }),

                // File operations
                setFile: (field, file) =>
                    set((state) => {
                        const keys = field.split('.')
                        let current = state
                        for (const key of keys.slice(0, -1)) {
                            current = current[key]
                        }
                        current[keys[keys.length - 1]] = file
                        state.isDirty = true
                    }),

                addFile: (field, file) =>
                    set((state) => {
                        const keys = field.split('.')
                        let current = state
                        for (const key of keys.slice(0, -1)) {
                            current = current[key]
                        }
                        const arrayKey = keys[keys.length - 1]
                        if (Array.isArray(current[arrayKey])) {
                            current[arrayKey].push(file)
                            state.isDirty = true
                        }
                    }),

                removeFile: (field, index) =>
                    set((state) => {
                        const keys = field.split('.')
                        let current = state
                        for (const key of keys.slice(0, -1)) {
                            current = current[key]
                        }
                        const arrayKey = keys[keys.length - 1]
                        if (Array.isArray(current[arrayKey])) {
                            current[arrayKey].splice(index, 1)
                            state.isDirty = true
                        }
                    }),

                // Validation
                validateStep: (step) => {
                    const state = get()
                    const errors = {}

                    switch (step) {
                        case 1:
                            // All fields required
                            if (!state.title.trim()) errors.title = 'Title is required'
                            else if (state.title.length > VALIDATION_LIMITS.TITLE.MAX) {
                                errors.title = `Title must be less than ${VALIDATION_LIMITS.TITLE.MAX} characters`
                            }

                            if (!state.type) errors.type = 'Product type is required'
                            if (!state.category) errors.category = 'Category is required'
                            if (!state.industry) errors.industry = 'Industry is required'

                            if (!state.shortDescription.trim()) errors.shortDescription = 'Short description is required'
                            else if (state.shortDescription.length < VALIDATION_LIMITS.SHORT_DESCRIPTION.MIN) {
                                errors.shortDescription = `Short description must be at least ${VALIDATION_LIMITS.SHORT_DESCRIPTION.MIN} characters`
                            } else if (state.shortDescription.length > VALIDATION_LIMITS.SHORT_DESCRIPTION.MAX) {
                                errors.shortDescription = `Short description must be less than ${VALIDATION_LIMITS.SHORT_DESCRIPTION.MAX} characters`
                            }

                            if (!state.fullDescription.trim()) errors.fullDescription = 'Full description is required'
                            else if (state.fullDescription.length < VALIDATION_LIMITS.FULL_DESCRIPTION.MIN) {
                                errors.fullDescription = `Full description must be at least ${VALIDATION_LIMITS.FULL_DESCRIPTION.MIN} characters`
                            }
                            break

                        case 2:
                            // How it Works is required (min 3 steps), others optional
                            const validSteps = state.howItWorks.filter((step) => step.title.trim() && step.detail.trim())
                            if (validSteps.length < VALIDATION_LIMITS.HOW_IT_WORKS_MIN_STEPS) {
                                errors.howItWorks = `Please provide at least ${VALIDATION_LIMITS.HOW_IT_WORKS_MIN_STEPS} steps for "How it Works"`
                            }
                            break

                        case 3:
                            // All fields required
                            if (!state.toolsUsed.length) errors.toolsUsed = 'Please select at least one tool'
                            if (!state.toolsConfiguration.trim()) errors.toolsConfiguration = 'Tools configuration is required'
                            if (!state.setupTimeEstimate) errors.setupTimeEstimate = 'Setup time estimate is required'
                            break

                        case 5:
                            // All fields required except previewVideo and seoKeywords
                            if (!state.thumbnailImage) errors.thumbnailImage = 'Thumbnail image is required'
                            if (!state.additionalImages.length) errors.additionalImages = 'At least one additional image is required'
                            if (!state.productTags.length) errors.productTags = 'At least one tag is required'
                            else if (state.productTags.length > VALIDATION_LIMITS.TAGS_MAX) {
                                errors.productTags = `Maximum ${VALIDATION_LIMITS.TAGS_MAX} tags allowed`
                            }
                            break

                        case 6:
                            // Support and FAQ required, others optional
                            if (!state.supportAndMaintenance.trim()) errors.supportAndMaintenance = 'Support and maintenance information is required'

                            const validFaqs = state.faq.filter((faq) => faq.question.trim() && faq.answer.trim())
                            if (validFaqs.length === 0) {
                                errors.faq = 'At least one FAQ is required'
                            }
                            break
                    }

                    // Only update errors state if validation fails (for step progression)
                    if (Object.keys(errors).length > 0) {
                        set((state) => {
                            state.errors = { ...state.errors, ...errors }
                            // Mark all error fields as touched since user tried to proceed
                            Object.keys(errors).forEach((field) => {
                                state.touchedFields[field] = true
                            })
                        })
                    }

                    return Object.keys(errors).length === 0
                },

                clearErrors: () =>
                    set((state) => {
                        state.errors = {}
                    }),

                // Smart suggestions
                applySuggestions: (type, category) =>
                    set((state) => {
                        // Auto-suggest tools based on category
                        if (category) {
                            const suggestedTools = SMART_SUGGESTIONS.getToolsByCategory(category)
                            // Don't override existing selection, just suggest
                        }

                        // Auto-suggest setup time based on type
                        if (type && !state.setupTimeEstimate) {
                            state.setupTimeEstimate = SMART_SUGGESTIONS.getSetupTimeByType(type)
                        }

                        // deliveryMethod auto-suggestion removed since field no longer exists
                    }),

                // Auto-save
                save: () =>
                    set((state) => {
                        state.lastSaved = Date.now()
                        state.isDirty = false
                    }),

                // Reset
                reset: () =>
                    set(() => ({
                        ...initialState,
                        currentStep: 1
                    })),

                // Diff calculation for review
                getDiffSinceLastSave: () => {
                    // This would compare current state with persisted state
                    // For now, return empty diff
                    return {}
                },

                // Submission
                setSubmitting: (isSubmitting) =>
                    set((state) => {
                        state.isSubmitting = isSubmitting
                    }),

                // Serialization for API
                toApiPayload: () => {
                    const state = get()
                    return {
                        title: state.title,
                        type: state.type,
                        category: state.category,
                        industry: state.industry,
                        shortDescription: state.shortDescription,
                        fullDescription: state.fullDescription,
                        targetAudience: state.targetAudience,
                        benefits: state.keyBenefits.filter((b) => b.trim()),
                        useCaseExamples: state.useCaseExamples.filter((u) => u.trim()),
                        // Fix howItWorks format - backend expects array of strings
                        howItWorks: state.howItWorks
                            .filter((step) => step.title && step.title.trim() && step.detail && step.detail.trim())
                            .map((step) => `${step.title}: ${step.detail}`),
                        outcome: state.expectedOutcomes.filter((o) => o.trim()),
                        // Fix toolsUsed format - make it truly optional and handle empty arrays
                        toolsUsed:
                            state.toolsUsed && state.toolsUsed.length > 0
                                ? state.toolsUsed.map((tool) => ({
                                      name: typeof tool === 'string' ? tool : tool.name || tool.value || tool,
                                      logo: tool.logo || '',
                                      model: tool.model || '',
                                      link: tool.link || ''
                                  }))
                                : undefined,
                        setupTime: state.setupTimeEstimate,
                        price: state.price || 0,
                        originalPrice: state.originalPrice || undefined,
                        thumbnail: typeof state.thumbnailImage === 'string' ? state.thumbnailImage : null,
                        images: state.additionalImages.filter((img) => typeof img === 'string'),
                        // Fix previewVideo - send null instead of undefined
                        previewVideo: state.previewVideo && typeof state.previewVideo === 'string' ? state.previewVideo : null,
                        tags: state.productTags.filter((tag) => tag.trim()),
                        searchKeywords: state.seoKeywords.filter((keyword) => keyword.trim()),
                        faqs: state.faq
                            .filter((faq) => faq.question.trim() && faq.answer.trim())
                            .map((faq) => ({
                                question: faq.question,
                                answer: faq.answer
                            })),
                        // Launch settings
                        performanceMetrics: state.performanceMetrics,
                        usageInformation: state.usageInformation,
                        supportAndMaintenance: state.supportAndMaintenance
                    }
                },

                // Launch-specific actions
                toggleChecklistItem: (index) =>
                    set((state) => {
                        if (index >= 0 && index < state.launchChecklist.length) {
                            state.launchChecklist[index].completed = !state.launchChecklist[index].completed
                            state.isDirty = true
                        }
                    }),

                setSelectedFAQCategory: (category) =>
                    set((state) => {
                        state.selectedFAQCategory = category
                    })
            })),
            {
                name: STORAGE_KEY,
                version: 1,
                // Custom serialization to handle File objects
                serialize: (state) => {
                    // Convert File objects to metadata for storage
                    const serializable = { ...state.state }

                    // Handle thumbnail
                    if (serializable.thumbnailImage instanceof File) {
                        serializable.thumbnailImage = {
                            name: serializable.thumbnailImage.name,
                            size: serializable.thumbnailImage.size,
                            type: serializable.thumbnailImage.type,
                            _isFile: true
                        }
                    }

                    // Handle additional images
                    serializable.additionalImages = serializable.additionalImages.map((img) => {
                        if (img instanceof File) {
                            return {
                                name: img.name,
                                size: img.size,
                                type: img.type,
                                _isFile: true
                            }
                        }
                        return img
                    })

                    // Handle preview video
                    if (serializable.previewVideo instanceof File) {
                        serializable.previewVideo = {
                            name: serializable.previewVideo.name,
                            size: serializable.previewVideo.size,
                            type: serializable.previewVideo.type,
                            _isFile: true
                        }
                    }

                    return JSON.stringify({ state: serializable, version: SCHEMA_VERSION })
                },

                deserialize: (str) => {
                    const parsed = JSON.parse(str)
                    // Note: File objects can't be restored from storage
                    // The UI will need to handle missing files gracefully
                    return parsed
                }
            }
        )
    )
)

// Auto-save subscription with debounce
let saveTimeout
useProductCreateStore.subscribe(
    (state) => state.isDirty,
    (isDirty) => {
        if (isDirty) {
            clearTimeout(saveTimeout)
            saveTimeout = setTimeout(() => {
                useProductCreateStore.getState().save()
            }, 2500) // 2.5s debounce
        }
    }
)

// Memoized selectors to prevent infinite loops
export const useProductCreateSelectors = {
    currentStep: (state) => state.currentStep,
    isStepValid: (step) => (state) => {
        const errors = state.errors
        const stepFields = {
            1: ['title', 'type', 'category', 'industry', 'shortDescription', 'fullDescription'],
            2: ['howItWorks'],
            3: ['toolsUsed', 'toolsConfiguration', 'setupTimeEstimate'],
            4: [], // No required fields
            5: ['thumbnailImage', 'additionalImages', 'productTags'],
            6: ['supportAndMaintenance', 'faq']
        }

        const fieldsToCheck = stepFields[step] || []
        return !fieldsToCheck.some((field) => errors[field])
    },
    canProceed: (step) => (state) => {
        return useProductCreateSelectors.isStepValid(step)(state)
    },
    completionPercentage: (state) => {
        const totalSteps = 6
        return Math.round((state.completedSteps.length / totalSteps) * 100)
    },
    isDirty: (state) => state.isDirty,
    lastSaved: (state) => state.lastSaved,
    isSubmitting: (state) => state.isSubmitting,
    isValid: (state) => {
        // Create a cache key based on relevant state
        const cacheKey = `isValid-${JSON.stringify({
            title: state.title,
            type: state.type,
            category: state.category,
            industry: state.industry,
            shortDescription: state.shortDescription,
            fullDescription: state.fullDescription,
            howItWorksLength: state.howItWorks.filter((s) => s.title.trim() && s.detail.trim()).length,
            toolsUsedLength: state.toolsUsed.length,
            toolsConfiguration: state.toolsConfiguration,
            setupTimeEstimate: state.setupTimeEstimate,
            thumbnailImage: !!state.thumbnailImage,
            additionalImagesLength: state.additionalImages.length,
            productTagsLength: state.productTags.length,
            supportAndMaintenance: state.supportAndMaintenance,
            validFaqsLength: state.faq.filter((faq) => faq.question.trim() && faq.answer.trim()).length
        })}`

        if (selectorCache.has(cacheKey)) {
            return selectorCache.get(cacheKey)
        }

        // Check if all required steps are valid
        const allSteps = [1, 2, 3, 5, 6] // Skip step 4 as it's optional
        const result = allSteps.every((step) => {
            const stepErrors = {}

            switch (step) {
                case 1:
                    if (!state.title.trim()) stepErrors.title = true
                    if (!state.type) stepErrors.type = true
                    if (!state.category) stepErrors.category = true
                    if (!state.industry) stepErrors.industry = true
                    if (!state.shortDescription.trim()) stepErrors.shortDescription = true
                    if (!state.fullDescription.trim()) stepErrors.fullDescription = true
                    break
                case 2:
                    const validSteps = state.howItWorks.filter((s) => s.title.trim() && s.detail.trim())
                    if (validSteps.length < 3) stepErrors.howItWorks = true
                    break
                case 3:
                    if (!state.toolsUsed.length) stepErrors.toolsUsed = true
                    if (!state.toolsConfiguration.trim()) stepErrors.toolsConfiguration = true
                    if (!state.setupTimeEstimate) stepErrors.setupTimeEstimate = true
                    break
                case 5:
                    if (!state.thumbnailImage) stepErrors.thumbnailImage = true
                    if (!state.additionalImages.length) stepErrors.additionalImages = true
                    if (!state.productTags.length) stepErrors.productTags = true
                    break
                case 6:
                    if (!state.supportAndMaintenance.trim()) stepErrors.supportAndMaintenance = true
                    const validFaqs = state.faq.filter((faq) => faq.question.trim() && faq.answer.trim())
                    if (validFaqs.length === 0) stepErrors.faq = true
                    break
            }

            return Object.keys(stepErrors).length === 0
        })

        // Cache the result
        selectorCache.set(cacheKey, result)

        // Clear old cache entries if cache gets too large
        if (selectorCache.size > 50) {
            const entries = Array.from(selectorCache.entries())
            selectorCache.clear()
            // Keep only the most recent entry
            selectorCache.set(cacheKey, result)
        }

        return result
    },
    validationErrors: (state) => {
        // Create a cache key based on the errors object
        const errorsKey = JSON.stringify(state.errors)
        const cacheKey = `validationErrors-${errorsKey}`

        if (selectorCache.has(cacheKey)) {
            return selectorCache.get(cacheKey)
        }

        const errors = []
        const errorMessages = state.errors

        Object.keys(errorMessages).forEach((field) => {
            errors.push({
                field,
                message: errorMessages[field]
            })
        })

        // Cache the result
        selectorCache.set(cacheKey, errors)

        // Clear old cache entries if cache gets too large
        if (selectorCache.size > 50) {
            const entries = Array.from(selectorCache.entries())
            selectorCache.clear()
            // Keep only the most recent entry
            selectorCache.set(cacheKey, errors)
        }

        return errors
    }
}

