// Shared Product Form Constants
export const FORM_STEPS = [
  { id: 1, title: 'Basic Information', description: 'Product title, type, and description' },
  { id: 2, title: 'Product Details', description: 'Features, benefits, and use cases' },
  { id: 3, title: 'Technical Details', description: 'Tools, setup time, and delivery' },
  { id: 4, title: 'Pricing & Media', description: 'Price, images, and preview' },
  { id: 5, title: 'Advanced Settings', description: 'Tags, metrics, and support' }
]

export const PRODUCT_TYPES = [
  { value: 'prompt', label: 'AI Prompt', description: 'Pre-written prompts for AI tools' },
  { value: 'automation', label: 'Automation', description: 'Automated workflows and processes' },
  { value: 'agent', label: 'AI Agent', description: 'Intelligent agents that perform tasks' }
]

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

export const TOOLS = [
  { value: 'CHATGPT', label: 'ChatGPT', logo: '🤖' },
  { value: 'CLAUDE', label: 'Claude', logo: '🔮' },
  { value: 'GEMINI', label: 'Google Gemini', logo: '✨' },
  { value: 'PERPLEXITY', label: 'Perplexity', logo: '🔍' },
  { value: 'ZAPIER', label: 'Zapier', logo: '⚡' },
  { value: 'MAKE', label: 'Make (formerly Integromat)', logo: '🔧' },
  { value: 'POWER_AUTOMATE', label: 'Microsoft Power Automate', logo: '🔄' },
  { value: 'N8N', label: 'n8n', logo: '🔗' },
  { value: 'BUBBLE', label: 'Bubble', logo: '🫧' },
  { value: 'WEBFLOW', label: 'Webflow', logo: '🌐' },
  { value: 'AIRTABLE', label: 'Airtable', logo: '📊' },
  { value: 'NOTION', label: 'Notion', logo: '📝' },
  { value: 'PIPEDRIVE', label: 'Pipedrive', logo: '🎯' },
  { value: 'HUBSPOT', label: 'HubSpot', logo: '🟠' },
  { value: 'SALESFORCE', label: 'Salesforce', logo: '☁️' },
  { value: 'MAILCHIMP', label: 'Mailchimp', logo: '📮' },
  { value: 'CONVERTKIT', label: 'ConvertKit', logo: '✉️' },
  { value: 'KLAVIYO', label: 'Klaviyo', logo: '📧' },
  { value: 'GOOGLE_WORKSPACE', label: 'Google Workspace', logo: '🔷' },
  { value: 'MICROSOFT_365', label: 'Microsoft 365', logo: '🟦' },
  { value: 'SLACK', label: 'Slack', logo: '💬' },
  { value: 'DISCORD', label: 'Discord', logo: '🎮' },
  { value: 'TELEGRAM', label: 'Telegram', logo: '✈️' },
  { value: 'WHATSAPP_BUSINESS', label: 'WhatsApp Business', logo: '💚' }
]

export const SETUP_TIMES = [
  { value: 'instant', label: 'Instant' },
  { value: 'under_30_mins', label: 'Under 30 mins' },
  { value: 'under_1_hour', label: 'Under 1 hour' },
  { value: 'over_1_hour', label: 'Over 1 hour' }
]
