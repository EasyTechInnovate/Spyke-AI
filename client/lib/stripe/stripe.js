import { loadStripe } from '@stripe/stripe-js'

let stripePromise

const getStripe = async () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    console.log('Stripe publishable key:', publishableKey)  
    
    if (!publishableKey) {
      console.error('❌ Stripe Error: Publishable key is not configured')
      console.error('Make sure STRIPE_PUBLISHABLE_KEY is set in your environment variables')
      return null
    }

    try {
      console.log('🔄 Loading Stripe with key:', publishableKey.substring(0, 12) + '...')
      stripePromise = loadStripe(publishableKey)
      
      // Wait for the promise to resolve and check if Stripe loaded successfully
      const stripe = await stripePromise
      
      if (!stripe) {
        console.error('❌ Stripe Error: Failed to load Stripe.js')
        console.error('This could be due to:')
        console.error('- Invalid publishable key')
        console.error('- Network connectivity issues')
        console.error('- Stripe.js library not accessible')
        return null
      }
      
      console.log('✅ Stripe loaded successfully')
      return stripe
      
    } catch (error) {
      console.error('❌ Stripe Error: Exception while loading Stripe:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        publishableKey: publishableKey ? publishableKey.substring(0, 12) + '...' : 'undefined'
      })
      return null
    }
  }
  
  try {
    // If stripePromise already exists, wait for it and return
    const stripe = await stripePromise
    if (!stripe) {
      console.error('❌ Stripe Error: Cached Stripe instance is null')
      return null
    }
    return stripe
  } catch (error) {
    console.error('❌ Stripe Error: Exception while resolving cached Stripe promise:', error)
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