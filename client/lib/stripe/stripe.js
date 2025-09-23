import { loadStripe } from '@stripe/stripe-js'

let stripePromise

const getStripe = async () => {
    if (!stripePromise) {
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        console.log('Stripe publishable key:', publishableKey)

        if (!publishableKey) {
            return null
        }

        try {
            stripePromise = loadStripe(publishableKey)
            const stripe = await stripePromise

            if (!stripe) {
                return null
            }
            return stripe
        } catch (error) {
            return null
        }
    }

    try {
        const stripe = await stripePromise
        if (!stripe) {
            return null
        }
        return stripe
    } catch (error) {
        return null
    }
}

export default getStripe

export { stripePromise }

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
            borderRadius: '8px'
        },
        rules: {
            '.Input': {
                backgroundColor: '#2a2a2a',
                border: '1px solid #404040',
                color: '#ffffff'
            },
            '.Input:focus': {
                border: '1px solid #00FF89',
                boxShadow: '0 0 0 1px #00FF89'
            },
            '.Label': {
                color: '#ffffff',
                fontWeight: '500'
            },
            '.Error': {
                color: '#df1b41'
            }
        }
    }
}

export const paymentMethodTypes = ['card']

export const elementsOptions = {
    mode: 'payment',
    currency: 'usd',
    appearance: stripeOptions.appearance
}
