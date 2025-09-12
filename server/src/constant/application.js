export const EApplicationEnvironment = Object.freeze({
    PRODUCTION: 'production',
    DEVELOPMENT: 'development',
    QA: 'qa'
});

export const EUserRole = Object.freeze({
    ADMIN: 'admin',
    SELLER: 'seller',
    USER: 'user'
});

export const ESellerVerificationStatus = {
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    COMMISSION_OFFERED: 'commission_offered',
    APPROVED: 'approved',
    REJECTED: 'rejected'
}

export const ECommissionOfferStatus = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    COUNTER_OFFERED: 'counter_offered'
}

export const EPayoutMethod = {
    BANK: 'bank',
    PAYPAL: 'paypal',
    STRIPE: 'stripe',
    WISE: 'wise'
}

export const ENotificationType = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success'
}

export const EOrderStatus = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
}

export const EProductStatus = {
    DRAFT: 'draft',
    PENDING_REVIEW: 'pending_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived'
}

export const EPaymentStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
}

export const ESellerNiches = {
    E_COMMERCE: 'E-commerce',
    SOCIAL_MEDIA: 'Social Media',
    EMAIL_MARKETING: 'Email Marketing',
    LEAD_GENERATION: 'Lead Generation',
    CUSTOMER_SUPPORT: 'Customer Support',
    DATA_ANALYSIS: 'Data Analysis',
    CONTENT_CREATION: 'Content Creation',
    PROJECT_MANAGEMENT: 'Project Management',
    SALES_AUTOMATION: 'Sales Automation',
    MARKETING_AUTOMATION: 'Marketing Automation',
    WORKFLOW_OPTIMIZATION: 'Workflow Optimization',
    BUSINESS_INTELLIGENCE: 'Business Intelligence'
}

export const EAutomationTools = {
    ZAPIER: 'Zapier',
    MAKE: 'Make (formerly Integromat)',
    POWER_AUTOMATE: 'Microsoft Power Automate',
    N8N: 'n8n',
    BUBBLE: 'Bubble',
    WEBFLOW: 'Webflow',
    AIRTABLE: 'Airtable',
    NOTION: 'Notion',
    PIPEDRIVE: 'Pipedrive',
    HUBSPOT: 'HubSpot',
    SALESFORCE: 'Salesforce',
    MAILCHIMP: 'Mailchimp',
    CONVERTKIT: 'ConvertKit',
    KLAVIYO: 'Klaviyo',
    GOOGLE_WORKSPACE: 'Google Workspace',
    MICROSOFT_365: 'Microsoft 365',
    SLACK: 'Slack',
    DISCORD: 'Discord',
    TELEGRAM: 'Telegram',
    WHATSAPP_BUSINESS: 'WhatsApp Business'
}

export const EFileType = {
    IMAGE: 'image',
    DOCUMENT: 'document',
    VIDEO: 'video',
    AUDIO: 'audio'
}

export const EImageFormats = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'svg'
]

// Supported document formats
export const EDocumentFormats = [
    'pdf',
    'doc',
    'docx',
    'txt',
    'rtf'
]

export const ERateLimit = {
    GENERAL: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 100
    },
    AUTH: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 5
    },
    UPLOAD: {
        WINDOW_MS: 60 * 60 * 1000,
        MAX_REQUESTS: 50
    }
}

export const EPagination = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
}


export const EProfileCompletion = {
    MIN_PERCENTAGE: 80,
    REQUIRED_FIELDS: [
        'fullName',
        'email',
        'bio',
        'niches',
        'toolsSpecialization',
        'location',
        'payoutInfo'
    ]
}

export const ECommissionLimits = {
    MIN_RATE: 1,
    MAX_RATE: 50,
    DEFAULT_RATE: 15,
    MAX_NEGOTIATION_ROUNDS: 5
}

export const EProductType = {
    PROMPT: 'prompt',
    AUTOMATION: 'automation',
    AGENT: 'agent',
    BUNDLE: 'bundle'
}

export const EProductCategory = {
    LEAD_GENERATION: 'lead_generation',
    HIRING: 'hiring',
    FOLLOW_UPS: 'follow_ups',
    ECOMMERCE: 'ecommerce',
    CONTENT_CREATION: 'content_creation',
    CUSTOMER_SERVICE: 'customer_service',
    SALES: 'sales',
    MARKETING: 'marketing',
    PRODUCTIVITY: 'productivity',
    ANALYSIS: 'analysis'
}

export const EProductIndustry = {
    COACHING: 'coaching',
    REAL_ESTATE: 'real_estate',
    ECOMMERCE: 'ecommerce',
    SAAS: 'saas',
    LOCAL_BUSINESS: 'local_business',
    HEALTHCARE: 'healthcare',
    EDUCATION: 'education',
    FINANCE: 'finance',
    TECHNOLOGY: 'technology',
    CONSULTING: 'consulting'
}

export const EProductPriceCategory = {
    FREE: 'free',
    UNDER_20: 'under_20',
    TWENTY_TO_FIFTY: '20_to_50',
    OVER_50: 'over_50'
}

export const EProductSetupTime = {
    INSTANT: 'instant',
    UNDER_30_MINS: 'under_30_mins',
    UNDER_1_HOUR: 'under_1_hour',
    OVER_1_HOUR: 'over_1_hour'
}

export const EProductSortBy = {
    CREATED_AT: 'createdAt',
    POPULARITY: 'popularity',
    RATING: 'rating',
    PRICE: 'price',
    SALES: 'sales'
}

export const EProductStatusNew = Object.freeze({
    DRAFT: 'draft',
    PENDING_REVIEW: 'pending_review',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
})

export const EAuthProvider = Object.freeze({
    LOCAL: "LOCAL",
    GOOGLE: "GOOGLE"
})