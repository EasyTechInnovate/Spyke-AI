export const TRACKING_EVENTS = {
    // Authentication Events
    SIGNUP_STARTED: 'signup_started',
    SIGNUP_COMPLETED: 'signup_completed',
    SIGNUP_FAILED: 'signup_failed',
    SIGNIN_SUCCESS: 'signin_success',
    SIGNIN_STARTED: 'signin_started',
    SIGNIN_COMPLETED: 'signin_completed',
    SIGNIN_FAILED: 'signin_failed',

    SIGNOUT: 'signout',
    EMAIL_VERIFIED: 'email_verified',
    PASSWORD_RESET_REQUESTED: 'password_reset_requested',
    PASSWORD_RESET_COMPLETED: 'password_reset_completed',

    // Product Events
    PRODUCT_VIEWED: 'product_viewed',
    PRODUCT_ADDED: 'product_added',
    PRODUCT_ADDED_TO_CART: 'product_added_to_cart',
    PRODUCT_REMOVED_FROM_CART: 'product_removed_from_cart',
    PRODUCT_ACCESSED: 'product_accessed',

    // Purchase & Checkout Events
    CHECKOUT_STARTED: 'checkout_started',
    CHECKOUT_COMPLETED: 'checkout_completed',
    CHECKOUT_FAILED: 'checkout_failed',
    PURCHASE_COMPLETED: 'purchase_completed',
    PURCHASE_FAILED: 'purchase_failed',
    PROMO_APPLIED: 'promo_applied',

    // Search & Discovery Events
    SEARCH_PERFORMED: 'search_performed',
    FILTER_APPLIED: 'filter_applied',
    CATEGORY_VIEWED: 'category_viewed',

    SEARCH: 'search_performed_explore',
    FILTER_CHANGE: 'filter_applied', 
    CLEAR_FILTERS: 'filters_cleared',
    SORT_CHANGE: 'sort_changed',
    PAGE_CHANGE: 'page_changed',

    // User Engagement Events
    PAGE_VIEWED: 'page_viewed',
    BUTTON_CLICKED: 'button_clicked',
    LINK_CLICKED: 'link_clicked',
    PROFILE_UPDATED: 'profile_updated',
    CONTACT_FORM_SUBMITTED: 'contact_form_submitted',
    NEWSLETTER_SUBSCRIBED: 'newsletter_subscribed',

    AI_PROMPT_CREATED: 'ai_prompt_created',
    AUTOMATION_CREATED: 'automation_created',
    AI_AGENT_CREATED: 'ai_agent_created',
    WORKFLOW_CREATED: 'workflow_created',
    WORKFLOW_EXECUTED: 'workflow_executed',

    // Subscription Events
    PLAN_UPGRADED: 'plan_upgraded',
    PLAN_DOWNGRADED: 'plan_downgraded',
    TRIAL_STARTED: 'trial_started',
    TRIAL_EXPIRED: 'trial_expired',

    // Session Events
    SESSION_STARTED: 'session_started',
    SESSION_ENDED: 'session_ended',

    // Support Events
    FEEDBACK_SUBMITTED: 'feedback_submitted',
    SUPPORT_REQUESTED: 'support_requested',

    // Marketplace Events
    MARKETPLACE_BROWSED: 'marketplace_browsed',
    PROMPT_SEARCHED: 'prompt_searched',
    PROMPT_VIEWED: 'prompt_viewed',
    PROMPT_PURCHASED: 'prompt_purchased',
    CUSTOM_REQUEST_SUBMITTED: 'custom_request_submitted',
    CUSTOM_REQUEST_ACCEPTED: 'custom_request_accepted',
    REVIEW_SUBMITTED: 'review_submitted',
    WISHLIST_ADDED: 'wishlist_added',

    // Seller Events
    SELLER_PROFILE_VIEWED: 'seller_profile_viewed',
    SELLER_PRODUCT_UPLOADED: 'seller_product_uploaded',
    SELLER_DASHBOARD_VIEWED: 'seller_dashboard_viewed',
    SELLER_SIGNUP_COMPLETED: 'seller_signup_completed',
    PRODUCT_CREATED: 'product_created',
    PRODUCT_PUBLISHED: 'product_published',
    PRODUCT_UPDATED: 'product_updated',
    PROMOTION_CREATED: 'promotion_created',
    PROMOTION_STARTED: 'promotion_started',
    SALES_REPORT_VIEWED: 'sales_report_viewed',
    CUSTOM_REQUEST_RECEIVED: 'custom_request_received',
    CUSTOM_REQUEST_RESPONDED: 'custom_request_responded',
    PAYOUT_REQUESTED: 'payout_requested',

    // Admin Events
    ADMIN_LOGIN_SUCCESS: 'admin_login_success',
    PRODUCT_APPROVED: 'product_approved',
    PRODUCT_REJECTED: 'product_rejected',
    SELLER_SUSPENDED: 'seller_suspended',
    PAYOUT_APPROVED: 'payout_approved',
    PROMOTION_APPROVED: 'promotion_approved',
    MARKETPLACE_METRICS_VIEWED: 'marketplace_metrics_viewed',

    // Error Events
    ERROR_OCCURRED: 'error_occurred',
    API_ERROR: 'api_error'
}

export const TRACKING_PROPERTIES = {
    // Methods
    METHOD: {
        EMAIL: 'email',
        GOOGLE: 'google',
        FACEBOOK: 'facebook',
        APPLE: 'apple',
        STRIPE: 'stripe'
    },

    // Device Types
    DEVICE: {
        MOBILE: 'mobile',
        WEB: 'web',
        TABLET: 'tablet'
    },

    // Sources
    SOURCE: {
        HOMEPAGE: 'homepage',
        SEARCH: 'search',
        DIRECT: 'direct',
        REFERRAL: 'referral',
        SOCIAL: 'social',
        EMAIL: 'email'
    },

    // User Types
    USER_TYPE: {
        NEW: 'new',
        RETURNING: 'returning',
        PREMIUM: 'premium'
    },

    // Explore Page Properties
    SEARCH: {
        source: 'explore_page'
    },

    FILTER_CHANGE: {
        source: 'explore_page'
    },

    CLEAR_FILTERS: {
        source: 'explore_page'
    },

    SORT_CHANGE: {
        source: 'explore_page'  
    },

    PAGE_CHANGE: {
        source: 'explore_page'
    }
}

export default TRACKING_EVENTS
