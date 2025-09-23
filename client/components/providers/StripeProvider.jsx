'use client'

import { Elements } from '@stripe/react-stripe-js'
import getStripe from '@/lib/stripe/stripe'

export default function StripeProvider({ children }) {
    return (
        <Elements stripe={getStripe()}>
            {children}
        </Elements>
    )
}