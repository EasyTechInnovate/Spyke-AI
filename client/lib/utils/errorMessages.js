'use client'

import { VALIDATION_LIMITS } from '@/lib/constants/productCreate'

// Enhanced error message mapping with specific guidance
export const ERROR_MESSAGES = {
    title: {
        required: 'Product title is required. Try: "AI Tool for [Target Audience]"',
        minLength: 'Title too short. Add more detail about what your product does.',
        maxLength: `Title too long. Keep it under ${VALIDATION_LIMITS.TITLE.MAX} characters for better readability.`
    },
    type: {
        required: 'Please select a product type. This helps customers understand your offering.'
    },
    category: {
        required: 'Category selection helps customers find your product. Choose the closest match.'
    },
    industry: {
        required: 'Target industry helps with discoverability. Select your primary market.'
    },
    shortDescription: {
        required: 'Short description is required for product listings and search results.',
        minLength: `Add more detail. Minimum ${VALIDATION_LIMITS.SHORT_DESCRIPTION.MIN} characters required.`,
        maxLength: `Too long for a short description. Maximum ${VALIDATION_LIMITS.SHORT_DESCRIPTION.MAX} characters.`
    },
    fullDescription: {
        required: 'Detailed description helps customers understand your product value.',
        minLength: `Add more detail. Minimum ${VALIDATION_LIMITS.FULL_DESCRIPTION.MIN} characters required.`,
        maxLength: `Description is too long. Maximum ${VALIDATION_LIMITS.FULL_DESCRIPTION.MAX} characters.`
    },
    toolsUsed: {
        required: 'Select at least one tool or platform your product uses.'
    },
    toolsConfiguration: {
        required: 'Explain how the selected tools work together in your solution.'
    },
    setupTimeEstimate: {
        required: 'Setup time helps customers understand the implementation effort required.'
    },
    thumbnailImage: {
        required: 'A thumbnail image is required. It\'s the first thing customers see.',
        invalid: 'Please upload a valid image file (JPG, PNG, WebP).',
        size: 'Image must be less than 10MB.'
    },
    additionalImages: {
        required: 'Add at least 2-3 additional images to showcase your product.',
        maxItems: `Maximum ${VALIDATION_LIMITS.ADDITIONAL_IMAGES_MAX} images allowed.`
    },
    productTags: {
        required: 'Add relevant tags to help customers discover your product.',
        maxItems: `Maximum ${VALIDATION_LIMITS.PRODUCT_TAGS_MAX} tags allowed.`
    },
    howItWorks: {
        minSteps: `Add at least ${VALIDATION_LIMITS.HOW_IT_WORKS_MIN_STEPS} detailed steps explaining your product workflow.`,
        incomplete: 'Each step needs both a title and detailed explanation.'
    },
    supportAndMaintenance: {
        required: 'Explain what support customers can expect after purchase.',
        minLength: `Provide more details. Minimum ${VALIDATION_LIMITS.SUPPORT_MIN_LENGTH} characters required.`
    },
    faq: {
        required: 'Add at least one FAQ to address common customer questions.',
        incomplete: 'Each FAQ needs both a question and answer.'
    },
    price: {
        required: 'Price is required for customers to make purchasing decisions.',
        invalid: 'Please enter a valid price amount.',
        minimum: 'Price must be greater than $0.'
    }
}

// Helper function to get enhanced error message
export const getEnhancedErrorMessage = (field, errorType) => {
    const fieldMessages = ERROR_MESSAGES[field]
    if (!fieldMessages) {
        return errorType || 'This field has an error'
    }

    const message = fieldMessages[errorType]
    if (!message) {
        return fieldMessages.required || fieldMessages.invalid || errorType || 'This field has an error'
    }

    return message
}

// Step navigation guidance
export const STEP_NAVIGATION_ERRORS = {
    1: {
        title: 'Complete Basic Information',
        message: 'Please fill in all required fields: Title, Type, Category, Industry, and Descriptions.',
        fields: ['title', 'type', 'category', 'industry', 'shortDescription', 'fullDescription']
    },
    2: {
        title: 'Add Product Details',
        message: 'Please add at least 3 detailed steps explaining how your product works.',
        fields: ['howItWorks']
    },
    3: {
        title: 'Configure Technical Setup',
        message: 'Please select tools, add configuration details, and estimate setup time.',
        fields: ['toolsUsed', 'toolsConfiguration', 'setupTimeEstimate']
    },
    4: {
        title: 'Premium Content (Optional)',
        message: 'This step is optional but adds value to your product.',
        fields: []
    },
    5: {
        title: 'Add Media and Tags',
        message: 'Please upload images and add relevant tags for your product.',
        fields: ['thumbnailImage', 'additionalImages', 'productTags']
    },
    6: {
        title: 'Final Details',
        message: 'Please add support information and at least one FAQ.',
        fields: ['supportAndMaintenance', 'faq']
    }
}

// Field-specific guidance for improvement
export const FIELD_IMPROVEMENT_TIPS = {
    title: [
        'Include the main benefit (e.g., "Automate", "Generate", "Optimize")',
        'Mention the target audience (e.g., "for SaaS Companies")',
        'Keep it under 60 characters for better display'
    ],
    shortDescription: [
        'Start with the main benefit or outcome',
        'Use specific numbers when possible (e.g., "40% faster")',
        'End with a clear value proposition'
    ],
    fullDescription: [
        'Explain what problem your product solves',
        'Describe how it works in simple terms',
        'List 3-5 key benefits or features',
        'Include who it\'s perfect for'
    ],
    howItWorks: [
        'Start each step with an action verb',
        'Be specific about what happens in each step',
        'Include any setup or configuration details',
        'End with the expected outcome'
    ],
    productTags: [
        'Use terms your customers would search for',
        'Include industry-specific keywords',
        'Add technology or tool names',
        'Include benefit-focused tags (e.g., "time-saving")'
    ],
    supportAndMaintenance: [
        'Specify response times (e.g., "24-hour response")',
        'List support channels (email, chat, etc.)',
        'Mention update frequency if applicable',
        'Include any guarantees or warranties'
    ]
}

export default {
    ERROR_MESSAGES,
    getEnhancedErrorMessage,
    STEP_NAVIGATION_ERRORS,
    FIELD_IMPROVEMENT_TIPS
}