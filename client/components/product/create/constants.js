import { Lightbulb, Target, Zap, Settings, DollarSign, Rocket } from 'lucide-react'

export const FORM_STEPS = [
    {
        id: 1,
        title: 'Basics',
        description: 'Product information',
        icon: Lightbulb,
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 2,
        title: 'Details',
        description: 'Benefits & features',
        icon: Target,
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 3,
        title: 'Technical',
        description: 'Tools & setup',
        icon: Zap,
        color: 'from-orange-500 to-red-500'
    },
    {
        id: 4,
        title: 'Premium Content',
        description: 'Exclusive buyer content',
        icon: Settings,
        color: 'from-amber-500 to-yellow-500'
    },
    {
        id: 5,
        title: 'Media & Price',
        description: 'Images & pricing',
        icon: DollarSign,
        color: 'from-green-500 to-emerald-500'
    },
    {
        id: 6,
        title: 'Launch',
        description: 'Final settings',
        icon: Rocket,
        color: 'from-violet-500 to-purple-500'
    }
]

export const TOTAL_STEPS = FORM_STEPS.length

// Enhanced Product Types with better visuals
export const PRODUCT_TYPES = [
    {
        value: 'prompt',
        label: 'AI Prompt',
        description: 'Pre-written prompts for AI tools',
        icon: '🤖',
        features: ['Ready-to-use', 'Multiple variations', 'Tested prompts']
    },
    {
        value: 'automation',
        label: 'Automation',
        description: 'Automated workflows and processes',
        icon: '⚡',
        features: ['Time-saving', 'Scalable', 'Integration-ready']
    },
    {
        value: 'agent',
        label: 'AI Agent',
        description: 'Intelligent agents that perform tasks',
        icon: '🚀',
        features: ['Autonomous', 'Smart decisions', 'Task execution']
    }
]

// Categories
export const CATEGORIES = [
    { value: 'lead_generation', label: 'Lead Generation' },
    { value: 'hiring', label: 'Hiring & Recruitment' },
    { value: 'follow_ups', label: 'Follow-ups' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'content_creation', label: 'Content Creation' },
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'analysis', label: 'Analysis' }
]

// Industries
export const INDUSTRIES = [
    { value: 'coaching', label: 'Coaching' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'saas', label: 'SaaS' },
    { value: 'local_business', label: 'Local Business' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'finance', label: 'Finance' },
    { value: 'technology', label: 'Technology' },
    { value: 'consulting', label: 'Consulting' }
]

// Tools (matching backend EAutomationTools + AI tools)
export const TOOLS = [
    // AI Tools
    { value: 'CHATGPT', label: 'ChatGPT', logo: '🤖' },
    { value: 'CLAUDE', label: 'Claude', logo: '🔮' },
    { value: 'GEMINI', label: 'Google Gemini', logo: '✨' },
    { value: 'PERPLEXITY', label: 'Perplexity', logo: '🔍' },

    // Automation Tools
    { value: 'ZAPIER', label: 'Zapier', logo: '⚡' },
    { value: 'MAKE', label: 'Make (formerly Integromat)', logo: '🔧' },
    { value: 'POWER_AUTOMATE', label: 'Microsoft Power Automate', logo: '🔄' },
    { value: 'N8N', label: 'n8n', logo: '🔗' },

    // No-Code Tools
    { value: 'BUBBLE', label: 'Bubble', logo: '🫧' },
    { value: 'WEBFLOW', label: 'Webflow', logo: '🌐' },
    { value: 'AIRTABLE', label: 'Airtable', logo: '📊' },
    { value: 'NOTION', label: 'Notion', logo: '📝' },

    // CRM & Sales
    { value: 'PIPEDRIVE', label: 'Pipedrive', logo: '🎯' },
    { value: 'HUBSPOT', label: 'HubSpot', logo: '🟠' },
    { value: 'SALESFORCE', label: 'Salesforce', logo: '☁️' },

    // Email Marketing
    { value: 'MAILCHIMP', label: 'Mailchimp', logo: '📮' },
    { value: 'CONVERTKIT', label: 'ConvertKit', logo: '✉️' },
    { value: 'KLAVIYO', label: 'Klaviyo', logo: '📧' },

    // Productivity
    { value: 'GOOGLE_WORKSPACE', label: 'Google Workspace', logo: '🔷' },
    { value: 'MICROSOFT_365', label: 'Microsoft 365', logo: '🟦' },

    // Communication
    { value: 'SLACK', label: 'Slack', logo: '💬' },
    { value: 'DISCORD', label: 'Discord', logo: '🎮' },
    { value: 'TELEGRAM', label: 'Telegram', logo: '✈️' },
    { value: 'WHATSAPP_BUSINESS', label: 'WhatsApp Business', logo: '💚' }
]

// Setup Times
export const SETUP_TIMES = [
    { value: 'instant', label: 'Instant' },
    { value: 'under_30_mins', label: 'Under 30 mins' },
    { value: 'under_1_hour', label: 'Under 1 hour' },
    { value: 'over_1_hour', label: 'Over 1 hour' }
]

