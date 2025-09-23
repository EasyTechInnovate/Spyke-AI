import { loadStripe } from '@stripe/stripe-js'

let stripePromise

const getStripe = async () => {
    try {
        if (stripePromise) {
            return await stripePromise
        }

        if (!stripePromise) {
            const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

            if (!publishableKey) {
                console.error('Stripe publishable key is missing')
                return null
            }

            stripePromise = loadStripe(publishableKey)
            const stripe = await stripePromise

            if (!stripe) {
                console.error('Failed to initialize Stripe')
                return null
            }

            return stripe
        }
    } catch (error) {
        console.error('Stripe initialization error:', error.message)
        return null
    }
}

const getStripeInstance = async () => {
    try {
        const stripe = await stripePromise
        if (!stripe) {
            console.error('Failed to retrieve Stripe instance')
            return null
        }
        return stripe
    } catch (error) {
        console.error('Stripe retrieval error:', error.message)
        return null
    }
}

export default getStripe
export { getStripeInstance, stripePromise }

export const stripeOptions = {
    appearance: {
        theme: 'night',
        variables: {
            colorPrimary: '#00FF89',
            colorBackground: '#1a1a1a',
            colorText: '#ffffff',
            colorDanger: '#df1b41',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
            colorTextSecondary: '#9ca3af',
            colorTextPlaceholder: '#6b7280',
            colorIconTab: '#9ca3af',
            colorIconTabSelected: '#00FF89',
            colorIconCardError: '#df1b41',
            colorIconCardCvc: '#9ca3af',
            colorIconCardCvcError: '#df1b41',
            colorIconCheckmark: '#00FF89',
            colorIconChevronDown: '#9ca3af',
            colorIconChevronDownError: '#df1b41',
            colorIconRedirect: '#9ca3af',
            colorIconWarning: '#ffb020',
            colorLogo: '#00FF89',
            colorLogoTab: '#9ca3af',
            colorLogoTabSelected: '#00FF89',
            fontSizeBase: '16px',
            fontSizeSm: '14px',
            fontSizeXs: '12px',
            fontWeightLight: '300',
            fontWeightNormal: '400',
            fontWeightMedium: '500',
            fontWeightBold: '700',
            lineHeight: '1.5',
            spacingGridColumn: '12px',
            spacingGridRow: '12px',
            spacingTab: '12px',
            spacingAccordionItem: '12px',
            spacingUnit2: '8px',
            spacingUnit3: '12px',
            spacingUnit4: '16px',
            spacingUnit5: '20px',
            spacingUnit6: '24px'
        }
    }
}

export const elementsOptions = {
    appearance: stripeOptions.appearance
}