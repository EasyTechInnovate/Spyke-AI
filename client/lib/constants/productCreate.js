export const PRODUCT_TYPES = [
  {
    value: 'prompt',
    label: 'AI Prompt',
    description: 'Ready-to-use prompts for AI tools like ChatGPT, Claude',
    icon: 'Bot',
    features: ['Instant use', 'Multiple variations', 'Tested & optimized']
  },
  {
    value: 'automation',
    label: 'Automation',
    description: 'Workflows and processes that run automatically',
    icon: 'Zap',
    features: ['Time-saving', 'Scalable', 'Integration-ready']
  },
  {
    value: 'agent',
    label: 'AI Agent',
    description: 'Intelligent agents that perform complex tasks',
    icon: 'Rocket',
    features: ['Autonomous', 'Smart decisions', 'Task execution']
  },
  
]

export const CATEGORIES = [
  { value: 'lead_generation', label: 'Lead Generation', icon: 'Target' },
  { value: 'hiring', label: 'Hiring & Recruitment', icon: 'Users' },
  { value: 'follow_ups', label: 'Follow-ups', icon: 'Phone' },
  { value: 'ecommerce', label: 'E-commerce', icon: 'ShoppingCart' },
  { value: 'content_creation', label: 'Content Creation', icon: 'PenTool' },
  { value: 'customer_service', label: 'Customer Service', icon: 'Headphones' },
  { value: 'sales', label: 'Sales', icon: 'Briefcase' },
  { value: 'marketing', label: 'Marketing', icon: 'TrendingUp' },
  { value: 'productivity', label: 'Productivity', icon: 'Zap' },
  { value: 'analysis', label: 'Analysis', icon: 'BarChart3' }
]

export const INDUSTRIES = [
  { value: 'coaching', label: 'Coaching', icon: 'Trophy' },
  { value: 'real_estate', label: 'Real Estate', icon: 'Home' },
  { value: 'ecommerce', label: 'E-commerce', icon: 'ShoppingBag' },
  { value: 'saas', label: 'SaaS', icon: 'Monitor' },
  { value: 'local_business', label: 'Local Business', icon: 'Store' },
  { value: 'healthcare', label: 'Healthcare', icon: 'Heart' },
  { value: 'education', label: 'Education', icon: 'GraduationCap' },
  { value: 'finance', label: 'Finance', icon: 'DollarSign' },
  { value: 'technology', label: 'Technology', icon: 'Cpu' },
  { value: 'consulting', label: 'Consulting', icon: 'Clipboard' }
]

export const TOOLS_AND_PLATFORMS = [
  // AI Tools
  { value: 'CHATGPT', label: 'ChatGPT', logo: 'Bot', category: 'AI' },
  { value: 'CLAUDE', label: 'Claude', logo: 'Sparkles', category: 'AI' },
  { value: 'GEMINI', label: 'Google Gemini', logo: 'Star', category: 'AI' },
  { value: 'PERPLEXITY', label: 'Perplexity', logo: 'Search', category: 'AI' },
  
  // Automation Platforms
  { value: 'ZAPIER', label: 'Zapier', logo: 'Zap', category: 'Automation' },
  { value: 'MAKE', label: 'Make (formerly Integromat)', logo: 'Settings', category: 'Automation' },
  { value: 'POWER_AUTOMATE', label: 'Microsoft Power Automate', logo: 'RefreshCw', category: 'Automation' },
  { value: 'N8N', label: 'n8n', logo: 'Link', category: 'Automation' },
  
  // No-Code Tools
  { value: 'BUBBLE', label: 'Bubble', logo: 'Circle', category: 'No-Code' },
  { value: 'WEBFLOW', label: 'Webflow', logo: 'Globe', category: 'No-Code' },
  { value: 'AIRTABLE', label: 'Airtable', logo: 'Table', category: 'No-Code' },
  { value: 'NOTION', label: 'Notion', logo: 'FileText', category: 'No-Code' },
  
  // CRM & Sales
  { value: 'PIPEDRIVE', label: 'Pipedrive', logo: 'Target', category: 'CRM' },
  { value: 'HUBSPOT', label: 'HubSpot', logo: 'Users', category: 'CRM' },
  { value: 'SALESFORCE', label: 'Salesforce', logo: 'Cloud', category: 'CRM' },
  
  // Communication
  { value: 'SLACK', label: 'Slack', logo: 'MessageSquare', category: 'Communication' },
  { value: 'DISCORD', label: 'Discord', logo: 'MessageCircle', category: 'Communication' },
  { value: 'TELEGRAM', label: 'Telegram', logo: 'Send', category: 'Communication' },
  
  // Email Marketing
  { value: 'MAILCHIMP', label: 'Mailchimp', logo: 'Mail', category: 'Email' },
  { value: 'CONVERTKIT', label: 'ConvertKit', logo: 'AtSign', category: 'Email' },
  { value: 'KLAVIYO', label: 'Klaviyo', logo: 'Send', category: 'Email' }
]

export const SETUP_TIMES = [
  { value: 'instant', label: 'Instant', description: 'Ready to use immediately', icon: 'Zap' },
  { value: 'under_30_mins', label: 'Under 30 minutes', description: 'Quick setup required', icon: 'Clock' },
  { value: 'under_1_hour', label: 'Under 1 hour', description: 'Some configuration needed', icon: 'Clock' },
  { value: 'over_1_hour', label: 'Over 1 hour', description: 'Detailed setup process', icon: 'Clock' }
]

export const PRICING_STRATEGIES = [
  { value: 'fixed', label: 'Fixed Price', description: 'One-time payment', icon: 'DollarSign' },
  { value: 'tiered', label: 'Tiered Pricing', description: 'Multiple price options', icon: 'BarChart3' },
  { value: 'subscription', label: 'Subscription', description: 'Recurring payments', icon: 'RefreshCw' },
  { value: 'freemium', label: 'Freemium', description: 'Free with premium upgrades', icon: 'Gift' },
  { value: 'usage_based', label: 'Usage-Based', description: 'Pay per use', icon: 'TrendingUp' }
]

export const FREQUENCY_OF_USE = [
  { value: 'one_time', label: 'One-time use', description: 'Single use scenario' },
  { value: 'recurring', label: 'Recurring', description: 'Regular intervals' },
  { value: 'ongoing', label: 'Ongoing', description: 'Continuous use' }
]

// Form validation constants
export const VALIDATION_LIMITS = {
  TITLE: { MIN: 1, MAX: 100 },
  SHORT_DESCRIPTION: { MIN: 10, MAX: 200 },
  FULL_DESCRIPTION: { MIN: 50, MAX: 5000 },
  HOW_IT_WORKS_MIN_STEPS: 3,
  TAGS_MAX: 10,
  IMAGES_MAX: 10,
  ADDITIONAL_IMAGES_MAX: 8, // Maximum additional images that can be uploaded
  PRODUCT_TAGS_MAX: 15, // Maximum product tags
  SEO_KEYWORDS_MAX: 10, // Maximum SEO keywords
  FAQ_MAX: 20,
  BENEFITS_MAX: 10,
  USE_CASES_MAX: 10,
  VIDEO_MAX_SIZE_MB: 150,
  VIDEO_MAX_DURATION_SECONDS: 300
}

// Helper text and tips for each step
export const STEP_HELPERS = {
  1: {
    title: 'Essential Information',
    tips: [
      'Choose a clear, descriptive title that explains what your product does',
      'Select the type that best matches your offering',
      'Write descriptions that highlight the main benefits'
    ]
  },
  2: {
    title: 'Product Details', 
    tips: [
      'Focus on specific outcomes your product delivers',
      'Include concrete use case examples',
      'List at least 3 detailed steps for "How it Works"'
    ]
  },
  3: {
    title: 'Technical Specifications',
    tips: [
      'Select all tools and platforms your product uses',
      'Be realistic about setup time requirements',
      'Choose the delivery method that works best for your product type'
    ]
  },
  4: {
    title: 'Premium Content',
    tips: [
      'This section is for advanced features and content',
      'All fields are optional but enhance your product value'
    ]
  },
  5: {
    title: 'Media & Pricing',
    tips: [
      'High-quality images increase conversion rates',
      'Video previews can double your sales',
      'Choose relevant tags to improve discoverability'
    ]
  },
  6: {
    title: 'Launch Settings',
    tips: [
      'Include comprehensive FAQ section',
      'Set realistic support expectations',
      'Performance metrics help buyers understand value'
    ]
  }
}

// Smart suggestions based on combinations
export const SMART_SUGGESTIONS = {
  getToolsByCategory: (category) => {
    const categoryMap = {
      'lead_generation': ['CHATGPT', 'ZAPIER', 'HUBSPOT', 'PIPEDRIVE'],
      'content_creation': ['CHATGPT', 'CLAUDE', 'NOTION', 'AIRTABLE'],
      'ecommerce': ['MAILCHIMP', 'KLAVIYO', 'ZAPIER', 'HUBSPOT'],
      'customer_service': ['CHATGPT', 'SLACK', 'DISCORD', 'NOTION'],
      'sales': ['PIPEDRIVE', 'HUBSPOT', 'SALESFORCE', 'ZAPIER']
    }
    return categoryMap[category] || []
  },
  
  getSetupTimeByType: (type) => {
    const typeMap = {
      'prompt': 'instant',
      'automation': 'under_1_hour', 
      'agent': 'over_1_hour'
    }
    return typeMap[type] || 'under_30_mins'
  }
  
  // getDeliveryMethodByType function removed since deliveryMethod field no longer exists
}

export default {
  PRODUCT_TYPES,
  CATEGORIES,
  INDUSTRIES,
  TOOLS_AND_PLATFORMS,
  SETUP_TIMES,
  PRICING_STRATEGIES,
  FREQUENCY_OF_USE,
  VALIDATION_LIMITS,
  STEP_HELPERS,
  SMART_SUGGESTIONS
}