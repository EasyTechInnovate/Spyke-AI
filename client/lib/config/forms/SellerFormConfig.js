import { countryCodes } from '@/lib/utils/utils'

export const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
    { value: 'America/New_York', label: 'Eastern Time (ET) - New York', offset: '-05:00' },
    { value: 'America/Chicago', label: 'Central Time (CT) - Chicago', offset: '-06:00' },
    { value: 'America/Denver', label: 'Mountain Time (MT) - Denver', offset: '-07:00' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT) - Los Angeles', offset: '-08:00' },
    { value: 'America/Anchorage', label: 'Alaska Time - Anchorage', offset: '-09:00' },
    { value: 'America/Honolulu', label: 'Hawaii Time - Honolulu', offset: '-10:00' },
    { value: 'America/Toronto', label: 'Eastern Time - Toronto', offset: '-05:00' },
    { value: 'America/Vancouver', label: 'Pacific Time - Vancouver', offset: '-08:00' },
    { value: 'America/Mexico_City', label: 'Central Time - Mexico City', offset: '-06:00' },
    { value: 'America/Sao_Paulo', label: 'Brasilia Time - São Paulo', offset: '-03:00' },
    { value: 'America/Buenos_Aires', label: 'Argentina Time - Buenos Aires', offset: '-03:00' },
    { value: 'America/Santiago', label: 'Chile Time - Santiago', offset: '-03:00' },
    { value: 'America/Bogota', label: 'Colombia Time - Bogotá', offset: '-05:00' },
    { value: 'America/Lima', label: 'Peru Time - Lima', offset: '-05:00' },
    { value: 'America/Caracas', label: 'Venezuela Time - Caracas', offset: '-04:00' },

    // Europe
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT) - London', offset: '+00:00' },
    { value: 'Europe/Paris', label: 'Central European Time (CET) - Paris', offset: '+01:00' },
    { value: 'Europe/Berlin', label: 'Central European Time - Berlin', offset: '+01:00' },
    { value: 'Europe/Amsterdam', label: 'Central European Time - Amsterdam', offset: '+01:00' },
    { value: 'Europe/Rome', label: 'Central European Time - Rome', offset: '+01:00' },
    { value: 'Europe/Madrid', label: 'Central European Time - Madrid', offset: '+01:00' },
    { value: 'Europe/Stockholm', label: 'Central European Time - Stockholm', offset: '+01:00' },
    { value: 'Europe/Vienna', label: 'Central European Time - Vienna', offset: '+01:00' },
    { value: 'Europe/Warsaw', label: 'Central European Time - Warsaw', offset: '+01:00' },
    { value: 'Europe/Brussels', label: 'Central European Time - Brussels', offset: '+01:00' },
    { value: 'Europe/Zurich', label: 'Central European Time - Zurich', offset: '+01:00' },
    { value: 'Europe/Athens', label: 'Eastern European Time (EET) - Athens', offset: '+02:00' },
    { value: 'Europe/Helsinki', label: 'Eastern European Time - Helsinki', offset: '+02:00' },
    { value: 'Europe/Istanbul', label: 'Turkey Time - Istanbul', offset: '+03:00' },
    { value: 'Europe/Moscow', label: 'Moscow Time - Moscow', offset: '+03:00' },
    { value: 'Europe/Kiev', label: 'Eastern European Time - Kyiv', offset: '+02:00' },
    { value: 'Europe/Dublin', label: 'Irish Standard Time - Dublin', offset: '+00:00' },
    { value: 'Europe/Lisbon', label: 'Western European Time - Lisbon', offset: '+00:00' },

    // Asia
    { value: 'Asia/Dubai', label: 'Gulf Standard Time - Dubai', offset: '+04:00' },
    { value: 'Asia/Riyadh', label: 'Arabia Standard Time - Riyadh', offset: '+03:00' },
    { value: 'Asia/Tehran', label: 'Iran Time - Tehran', offset: '+03:30' },
    { value: 'Asia/Karachi', label: 'Pakistan Time - Karachi', offset: '+05:00' },
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST) - Kolkata', offset: '+05:30' },
    { value: 'Asia/Dhaka', label: 'Bangladesh Time - Dhaka', offset: '+06:00' },
    { value: 'Asia/Colombo', label: 'Sri Lanka Time - Colombo', offset: '+05:30' },
    { value: 'Asia/Kathmandu', label: 'Nepal Time - Kathmandu', offset: '+05:45' },
    { value: 'Asia/Almaty', label: 'Kazakhstan Time - Almaty', offset: '+06:00' },
    { value: 'Asia/Bangkok', label: 'Indochina Time - Bangkok', offset: '+07:00' },
    { value: 'Asia/Jakarta', label: 'Western Indonesia Time - Jakarta', offset: '+07:00' },
    { value: 'Asia/Ho_Chi_Minh', label: 'Indochina Time - Ho Chi Minh', offset: '+07:00' },
    { value: 'Asia/Singapore', label: 'Singapore Time (SGT)', offset: '+08:00' },
    { value: 'Asia/Kuala_Lumpur', label: 'Malaysia Time - Kuala Lumpur', offset: '+08:00' },
    { value: 'Asia/Manila', label: 'Philippines Time - Manila', offset: '+08:00' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong Time', offset: '+08:00' },
    { value: 'Asia/Shanghai', label: 'China Standard Time - Shanghai', offset: '+08:00' },
    { value: 'Asia/Taipei', label: 'Taiwan Time - Taipei', offset: '+08:00' },
    { value: 'Asia/Seoul', label: 'Korea Standard Time - Seoul', offset: '+09:00' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST) - Tokyo', offset: '+09:00' },
    { value: 'Asia/Jerusalem', label: 'Israel Time - Jerusalem', offset: '+02:00' },

    // Africa
    { value: 'Africa/Cairo', label: 'Eastern European Time - Cairo', offset: '+02:00' },
    { value: 'Africa/Johannesburg', label: 'South Africa Time - Johannesburg', offset: '+02:00' },
    { value: 'Africa/Lagos', label: 'West Africa Time - Lagos', offset: '+01:00' },
    { value: 'Africa/Nairobi', label: 'East Africa Time - Nairobi', offset: '+03:00' },
    { value: 'Africa/Casablanca', label: 'Western European Time - Casablanca', offset: '+00:00' },
    { value: 'Africa/Tunis', label: 'Central European Time - Tunis', offset: '+01:00' },
    { value: 'Africa/Algiers', label: 'Central European Time - Algiers', offset: '+01:00' },

    // Oceania
    { value: 'Australia/Sydney', label: 'Australian Eastern Time - Sydney', offset: '+10:00' },
    { value: 'Australia/Melbourne', label: 'Australian Eastern Time - Melbourne', offset: '+10:00' },
    { value: 'Australia/Brisbane', label: 'Australian Eastern Time - Brisbane', offset: '+10:00' },
    { value: 'Australia/Adelaide', label: 'Australian Central Time - Adelaide', offset: '+09:30' },
    { value: 'Australia/Perth', label: 'Australian Western Time - Perth', offset: '+08:00' },
    { value: 'Australia/Darwin', label: 'Australian Central Time - Darwin', offset: '+09:30' },
    { value: 'Pacific/Auckland', label: 'New Zealand Time - Auckland', offset: '+12:00' },
    { value: 'Pacific/Fiji', label: 'Fiji Time - Suva', offset: '+12:00' },
    { value: 'Pacific/Guam', label: 'Chamorro Time - Guam', offset: '+10:00' },
    { value: 'Pacific/Port_Moresby', label: 'Papua New Guinea Time', offset: '+10:00' }
]

// Transform countryCodes for the form
export const countries = countryCodes.map((country) => ({
    value: country.country,
    label: `${country.flag} ${country.country}`,
    code: country.code,
    flag: country.flag
}))

export const popularNiches = [
    'E-commerce',
    'Social Media Marketing',
    'Email Marketing',
    'Content Creation',
    'Lead Generation',
    'Customer Support',
    'Sales Automation',
    'Data Analytics',
    'Project Management',
    'HR & Recruiting',
    'Finance & Accounting',
    'Real Estate',
    'Healthcare',
    'Education',
    'Legal Services',
    'Consulting',
    'SaaS',
    'Agency Services',
    'Coaching',
    'Non-Profit'
]

export const popularTools = [
    'Zapier',
    'Make (Integromat)',
    'Shopify',
    'Mailchimp',
    'HubSpot',
    'Notion',
    'Slack',
    'ChatGPT',
    'Claude',
    'Airtable',
    'Google Sheets',
    'Trello',
    'Asana',
    'Monday.com',
    'ClickUp',
    'ActiveCampaign',
    'ConvertKit',
    'Klaviyo',
    'Salesforce',
    'Pipedrive',
    'Typeform',
    'Calendly',
    'Stripe',
    'QuickBooks',
    'Xero',
    'Canva',
    'Figma',
    'Webflow',
    'WordPress',
    'Bubble'
]

export const formSteps = [
    {
        id: 1,
        title: 'Basic Information',
        subtitle: 'Tell us about yourself',
        fields: ['fullName', 'email', 'websiteUrl', 'bio', 'sellerBanner']
    },
    {
        id: 2,
        title: 'Expertise',
        subtitle: "What's your expertise?",
        fields: ['niches', 'toolsSpecialization', 'customAutomationServices'] // Added 'niches' field
    },
    {
        id: 3,
        title: 'Details',
        subtitle: 'Final details',
        fields: ['location', 'socialHandles', 'portfolioLinks', 'payoutInfo', 'revenueShareAgreement']
    }
]

export const formFields = {
    fullName: {
        label: 'Full Name',
        type: 'text',
        placeholder: 'John Doe',
        required: true, // REQUIRED in backend
        validation: {
            minLength: 2,
            maxLength: 100,
            pattern: /^[a-zA-Z\s'-]+$/,
            message: 'Full name must be 2-100 characters, letters and spaces only'
        }
    },
    email: {
        label: 'Business Email',
        type: 'email',
        placeholder: 'john@business.com',
        required: true, // REQUIRED in backend
        helperText: 'This will be your primary seller contact email',
        validation: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        }
    },
    websiteUrl: {
        label: 'Website URL',
        type: 'text',
        placeholder: 'https://yourwebsite.com',
        required: true, // Changed from false - now REQUIRED in backend
        validation: {
            pattern: /^https?:\/\/.+/,
            message: 'Please enter a valid URL starting with http:// or https://'
        }
    },
    bio: {
        label: 'Bio',
        type: 'textarea',
        placeholder: 'Tell potential buyers about your expertise, experience, and what makes you unique...',
        required: true, // REQUIRED in backend
        maxLength: 500,
        minLength: 50,
        rows: 4,
        validation: {
            minLength: 50,
            maxLength: 500,
            message: 'Bio should be between 50 and 500 characters'
        }
    },
    sellerBanner: {
        label: 'Profile Banner',
        type: 'text',
        placeholder: 'https://example.com/banner.jpg',
        required: false, // OPTIONAL in backend
        helperText: 'Optional - Recommended size: 1200x300px',
        validation: {
            pattern: /^https?:\/\/.+/,
            message: 'Please enter a valid URL if provided'
        }
    },
    niches: {
        label: 'Niches',
        type: 'tags',
        placeholder: 'Type and press Enter',
        required: true, // REQUIRED in backend
        minItems: 1,
        maxItems: 5,
        helperText: 'Select your areas of expertise (1-5 required)',
        suggestions: popularNiches,
        validation: {
            minItems: 1,
            maxItems: 5,
            message: 'Select 1-5 niches'
        }
    },
    toolsSpecialization: {
        label: 'Tools Specialization',
        type: 'tags',
        placeholder: 'Type and press Enter',
        required: true, // REQUIRED in backend
        minItems: 1,
        maxItems: 10,
        helperText: 'Select tools you specialize in (1-10 required)',
        suggestions: popularTools,
        validation: {
            minItems: 1,
            maxItems: 10,
            message: 'Select 1-10 tools'
        }
    },
    customAutomationServices: {
        label: 'I offer custom automation services beyond pre-built products',
        type: 'checkbox',
        required: true, // REQUIRED in backend (boolean field)
        helperText: 'Check this if you provide custom automation solutions',
        validation: {
            message: 'Please specify if you offer custom automation services'
        }
    },
    location: {
        type: 'group',
        fields: {
            country: {
                label: 'Country',
                type: 'select',
                required: true, // REQUIRED in backend
                options: countries,
                validation: {
                    message: 'Country is required'
                }
            },
            timezone: {
                label: 'Timezone',
                type: 'searchable-select',
                required: true, // REQUIRED in backend
                options: timezones,
                validation: {
                    message: 'Timezone is required'
                }
            }
        }
    },
    socialHandles: {
        type: 'group',
        required: false, // All social handles are OPTIONAL in backend
        fields: {
            linkedin: {
                label: 'LinkedIn URL',
                type: 'url',
                required: false,
                placeholder: 'https://linkedin.com/in/yourprofile'
            },
            twitter: {
                label: 'Twitter/X URL',
                type: 'url',
                required: false,
                placeholder: 'https://twitter.com/yourusername'
            },
            instagram: {
                label: 'Instagram URL',
                type: 'url',
                required: false,
                placeholder: 'https://instagram.com/yourusername'
            },
            youtube: {
                label: 'YouTube URL',
                type: 'url',
                required: false,
                placeholder: 'https://youtube.com/c/yourchannel'
            }
        }
    },
    portfolioLinks: {
        label: 'Portfolio Links',
        type: 'tags',
        placeholder: 'https://example.com/portfolio',
        required: false, // OPTIONAL in backend
        maxItems: 10,
        helperText: 'Optional - Add up to 10 portfolio links',
        validation: {
            maxItems: 10,
            itemPattern: /^https?:\/\/.+/,
            message: 'Maximum 10 valid URLs allowed'
        }
    },
    payoutInfo: {
        label: 'Payout Information',
        type: 'group',
        required: true, // Method is REQUIRED in backend
        fields: {
            method: {
                label: 'Payout Method',
                type: 'select',
                required: true,
                options: [
                    { value: 'paypal', label: 'PayPal' },
                    { value: 'bank', label: 'Bank Transfer' },
                    { value: 'stripe', label: 'Stripe' },
                    { value: 'wise', label: 'Wise (formerly TransferWise)' }
                ],
                validation: {
                    message: 'Please select a payout method'
                }
            },
            // Bank transfer fields (conditionally required)
            accountHolderName: {
                label: 'Account Holder Name',
                type: 'text',
                required: true, // Required when method is 'bank'
                showIf: (formData) => formData.payoutInfo?.method === 'bank',
                validation: {
                    message: 'Account holder name is required'
                }
            },
            accountNumber: {
                label: 'Account Number',
                type: 'text',
                required: true, // Required when method is 'bank'
                showIf: (formData) => formData.payoutInfo?.method === 'bank',
                validation: {
                    message: 'Account number is required'
                }
            },
            routingNumber: {
                label: 'Routing Number',
                type: 'text',
                required: true, // Required when method is 'bank'
                showIf: (formData) => formData.payoutInfo?.method === 'bank',
                validation: {
                    message: 'Routing number is required'
                }
            },
            bankName: {
                label: 'Bank Name',
                type: 'text',
                required: true, // Required when method is 'bank'
                showIf: (formData) => formData.payoutInfo?.method === 'bank',
                validation: {
                    message: 'Bank name is required'
                }
            },
            swiftCode: {
                label: 'SWIFT / BIC Code',
                type: 'text',
                required: false, // OPTIONAL in backend
                placeholder: '8 or 11 characters',
                showIf: (formData) => formData.payoutInfo?.method === 'bank',
                validation: {
                    pattern: /^[A-Z0-9]{8}([A-Z0-9]{3})?$/,
                    message: 'Enter a valid SWIFT/BIC code'
                }
            },
            // PayPal field (conditionally required)
            paypalEmail: {
                label: 'PayPal Email',
                type: 'email',
                required: true, // Required when method is 'paypal'
                showIf: (formData) => formData.payoutInfo?.method === 'paypal',
                validation: {
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid PayPal email'
                }
            },
            // Stripe field (conditionally required)
            stripeAccountId: {
                label: 'Stripe Account ID',
                type: 'text',
                required: true, // Required when method is 'stripe'
                showIf: (formData) => formData.payoutInfo?.method === 'stripe',
                validation: {
                    message: 'Stripe account ID is required'
                }
            },
            // Wise field (conditionally required)
            wiseEmail: {
                label: 'Wise Email',
                type: 'email',
                required: true, // Required when method is 'wise'
                showIf: (formData) => formData.payoutInfo?.method === 'wise',
                validation: {
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid Wise email'
                }
            }
        }
    },
    revenueShareAgreement: {
        label: 'Revenue Share Agreement',
        type: 'group',
        required: true, // REQUIRED in backend
        fields: {
            accepted: {
                label: 'I have read and accept the Revenue Share Agreement (required)',
                type: 'checkbox',
                required: true,
                validation: {
                    required: true,
                    mustBeTrue: true,
                    message: 'You must accept the revenue share agreement to continue'
                }
            }
        }
    }
}

export const defaultFormValues = {
    fullName: '',
    email: '',
    websiteUrl: '',
    bio: '',
    niches: [],
    toolsSpecialization: [],
    location: {
        country: '',
        timezone: ''
    },
    sellerBanner: '',
    socialHandles: {
        linkedin: '',
        twitter: '',
        instagram: '',
        youtube: ''
    },
    customAutomationServices: false,
    portfolioLinks: [],
    payoutInfo: {
        method: 'paypal',
        paypalEmail: '',
        stripeAccountId: '',
        wiseEmail: '',
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        swiftCode: ''
    },
    revenueShareAgreement: {
        accepted: false
    }
}
