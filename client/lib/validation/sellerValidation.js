export const SELLER_VALIDATION_RULES = {
    fullName: {
        required: true,
        minLength: 2,
        maxLength: 100,
        trim: true,
        message: {
            required: 'Full name is required',
            minLength: 'Full name must be at least 2 characters long',
            maxLength: 'Full name cannot exceed 100 characters'
        }
    },

    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        toLowerCase: true,
        trim: true,
        message: {
            required: 'Email is required',
            pattern: 'Please provide a valid email address'
        }
    },

    bio: {
        required: true,
        minLength: 50,
        maxLength: 500,
        trim: true,
        message: {
            required: 'Bio is required',
            minLength: 'Bio must be at least 50 characters long',
            maxLength: 'Bio cannot exceed 500 characters'
        }
    },

    niches: {
        required: true,
        type: 'array',
        minItems: 1,
        maxItems: 5,
        message: {
            required: 'Please select at least one niche',
            minItems: 'Please select at least one niche',
            maxItems: 'You can select maximum 5 niches'
        }
    },

    toolsSpecialization: {
        required: true,
        type: 'array',
        minItems: 1,
        maxItems: 10,
        message: {
            required: 'Please select at least one tool specialization',
            minItems: 'Please select at least one tool specialization',
            maxItems: 'You can select maximum 10 tools'
        }
    },

    'location.country': {
        required: true,
        minLength: 1,
        trim: true,
        message: {
            required: 'Country is required',
            minLength: 'Country is required'
        }
    },

    'location.timezone': {
        required: true,
        minLength: 1,
        trim: true,
        message: {
            required: 'Timezone is required',
            minLength: 'Timezone is required'
        }
    },

    customAutomationServices: {
        required: true,
        type: 'boolean',
        message: {
            required: 'Please specify if you offer custom automation services'
        }
    },

    'revenueShareAgreement.accepted': {
        required: true,
        mustBeTrue: true,
        message: {
            required: 'You must accept the revenue share agreement to proceed',
            mustBeTrue: 'You must accept the revenue share agreement to proceed'
        }
    },

    'payoutInfo.method': {
        required: true,
        enum: ['bank', 'paypal', 'stripe', 'wise'],
        message: {
            required: 'Please select a valid payout method',
            enum: 'Please select a valid payout method'
        }
    },

    websiteUrl: {
        required: true,
        isUrl: true,
        message: {
            required: 'Website URL is required',
            pattern: 'Please provide a valid URL'
        }
    },

    sellerBanner: {
        required: false,
        isUrl: true,
        message: {
            pattern: 'Banner must be a valid URL'
        }
    },

    portfolioLinks: {
        required: false,
        type: 'array',
        maxItems: 10,
        itemIsUrl: true,
        message: {
            maxItems: 'You can add maximum 10 portfolio links',
            itemPattern: 'All portfolio links must be valid URLs'
        }
    },

    // Social handles (all optional)
    'socialHandles.linkedin': {
        required: false,
        trim: true
    },

    'socialHandles.twitter': {
        required: false,
        trim: true
    },

    'socialHandles.instagram': {
        required: false,
        trim: true
    },

    'socialHandles.youtube': {
        required: false,
        trim: true
    }
}

export const PAYOUT_VALIDATION_RULES = {
    bank: {
        'payoutInfo.bankDetails.accountHolderName': {
            required: true,
            minLength: 1,
            trim: true,
            message: {
                required: 'Account holder name is required for bank transfers',
                minLength: 'Account holder name is required for bank transfers'
            }
        },
        'payoutInfo.bankDetails.accountNumber': {
            required: true,
            minLength: 1,
            trim: true,
            message: {
                required: 'Account number is required for bank transfers',
                minLength: 'Account number is required for bank transfers'
            }
        },
        'payoutInfo.bankDetails.routingNumber': {
            required: true,
            minLength: 1,
            trim: true,
            message: {
                required: 'Routing number is required for bank transfers',
                minLength: 'Routing number is required for bank transfers'
            }
        },
        'payoutInfo.bankDetails.bankName': {
            required: true,
            minLength: 1,
            trim: true,
            message: {
                required: 'Bank name is required for bank transfers',
                minLength: 'Bank name is required for bank transfers'
            }
        },
        'payoutInfo.bankDetails.swiftCode': {
            required: false,
            trim: true
        }
    },
    paypal: {
        'payoutInfo.paypalEmail': {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            toLowerCase: true,
            trim: true,
            message: {
                required: 'PayPal email is required for PayPal payouts',
                pattern: 'Please provide a valid PayPal email'
            }
        }
    },
    stripe: {
        'payoutInfo.stripeAccountId': {
            required: true,
            minLength: 1,
            trim: true,
            message: {
                required: 'Stripe account ID is required for Stripe payouts',
                minLength: 'Stripe account ID is required for Stripe payouts'
            }
        }
    },
    wise: {
        'payoutInfo.wiseEmail': {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            toLowerCase: true,
            trim: true,
            message: {
                required: 'Wise email is required for Wise payouts',
                pattern: 'Please provide a valid Wise email'
            }
        }
    }
}

export const STEP_FIELD_MAPPING = {
    1: ['fullName', 'email', 'websiteUrl', 'bio', 'sellerBanner'],
    2: ['niches', 'toolsSpecialization', 'customAutomationServices'],
    3: [
        'location.country', 
        'location.timezone', 
        'portfolioLinks',
        'socialHandles.linkedin',
        'socialHandles.twitter', 
        'socialHandles.instagram',
        'socialHandles.youtube',
        'payoutInfo.method', 
        'revenueShareAgreement.accepted'
    ]
}