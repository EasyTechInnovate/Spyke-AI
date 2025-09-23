'use client'
import { Elements } from '@stripe/react-stripe-js'
import getStripe, { stripeOptions } from '@/lib/stripe/stripe'
import { useEffect, useState } from 'react'
export default function StripeProvider({ children }) {
    const [stripePromise, setStripePromise] = useState(null)
    useEffect(() => {
        const initializeStripe = async () => {
            try {
                const stripe = await getStripe()
                if (stripe) {
                    setStripePromise(Promise.resolve(stripe))
                }
            } catch (error) {
                console.error('Failed to initialize Stripe:', error)
            }
        }
        initializeStripe()
    }, [])
    if (!stripePromise) {
        return children
    }
    return (
        <Elements stripe={stripePromise} options={stripeOptions}>
            {children}
        </Elements>
    )
}