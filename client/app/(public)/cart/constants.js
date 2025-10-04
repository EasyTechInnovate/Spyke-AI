/**
 * Cart Page Constants
 * Centralized configuration for the cart page
 */

export const CART_CONFIG = {
    animations: {
        pageTransition: { duration: 0.3, ease: 'easeOut' },
        itemTransition: { duration: 0.1, stagger: 0.1 },
        removeTransition: { duration: 0.3 }
    },
    
    ui: {
        maxVisibleToasts: 4,
        toastDuration: 5000,
        debounceDelay: 500
    },
    
    validation: {
        minQuantity: 1,
        maxQuantity: 99
    }
}

export const CHECKOUT_FEATURES = [
    {
        icon: 'CheckCircle',
        text: '30-day money-back guarantee',
        highlight: true
    },
    {
        icon: 'CheckCircle',
        text: 'Instant access after purchase',
        highlight: true
    },
    {
        icon: 'CheckCircle',
        text: 'Lifetime access to all files',
        highlight: true
    }
]

export const EMPTY_CART_MESSAGES = {
    title: 'Your Cart is Empty',
    subtitle: 'Discover amazing AI tools, prompts, and automations to supercharge your workflow. Start exploring our marketplace now!',
    primaryAction: {
        label: 'Explore Products',
        href: '/'
    },
    secondaryAction: {
        label: 'Back to Home',
        href: '/'
    }
}