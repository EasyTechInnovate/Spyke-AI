export const EApplicationEnvironment = Object.freeze({
    PRODUCTION: 'production',
    DEVELOPMENT: 'development'
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

export const ECommissionLimits = {
    MIN_RATE: 1,
    MAX_RATE: 50,
    DEFAULT_RATE: 15
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