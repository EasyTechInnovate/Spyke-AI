import { loadStripe } from '@stripe/stripe-js'

let stripePromise

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY
    
    if (!publishableKey) {
      console.error('Stripe publishable key is not configured')
      return null
    }
    
    stripePromise = loadStripe(publishableKey)
  }
  
  return stripePromise
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
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        color: '#ffffff',
      },
      '.Input:focus': {
        border: '1px solid #00FF89',
        boxShadow: '0 0 0 1px #00FF89',
      },
      '.Label': {
        color: '#ffffff',
        fontWeight: '500',
      },
      '.Error': {
        color: '#df1b41',
      },
    },
  },
}

export const paymentMethodTypes = ['card']

export const elementsOptions = {
  mode: 'payment',
  currency: 'usd',
  appearance: stripeOptions.appearance,
}