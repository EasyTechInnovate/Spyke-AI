import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

class StripeService {
    async createPaymentIntent(amount, metadata = {}) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata
            })

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: amount
            }
        } catch (error) {
            throw new Error(`Failed to create payment intent: ${error.message}`)
        }
    }

    async retrievePaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
            return paymentIntent
        } catch (error) {
            throw new Error(`Failed to retrieve payment intent: ${error.message}`)
        }
    }

    async confirmPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)
            return paymentIntent
        } catch (error) {
            throw new Error(`Failed to confirm payment intent: ${error.message}`)
        }
    }

    async createCustomer(customerData) {
        try {
            const customer = await stripe.customers.create({
                email: customerData.email,
                name: customerData.name,
                metadata: {
                    userId: customerData.userId
                }
            })
            return customer
        } catch (error) {
            throw new Error(`Failed to create customer: ${error.message}`)
        }
    }

    async retrieveCustomer(customerId) {
        try {
            const customer = await stripe.customers.retrieve(customerId)
            return customer
        } catch (error) {
            throw new Error(`Failed to retrieve customer: ${error.message}`)
        }
    }

    async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
        try {
            const refundData = {
                payment_intent: paymentIntentId,
                reason
            }

            if (amount) {
                refundData.amount = Math.round(amount * 100)
            }

            const refund = await stripe.refunds.create(refundData)
            return refund
        } catch (error) {
            throw new Error(`Failed to create refund: ${error.message}`)
        }
    }

    async constructWebhookEvent(payload, signature) {
        try {
            const event = stripe.webhooks.constructEvent(
                payload,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            )
            return event
        } catch (error) {
            throw new Error(`Webhook signature verification failed: ${error.message}`)
        }
    }

    async listCharges(customerId, limit = 10) {
        try {
            const charges = await stripe.charges.list({
                customer: customerId,
                limit
            })
            return charges
        } catch (error) {
            throw new Error(`Failed to list charges: ${error.message}`)
        }
    }

    formatAmount(cents) {
        return (cents / 100).toFixed(2)
    }

    formatAmountForStripe(amount) {
        return Math.round(amount * 100)
    }

    isPaymentSuccessful(paymentIntent) {
        return paymentIntent.status === 'succeeded'
    }

    getPaymentStatus(paymentIntent) {
        const statusMap = {
            'requires_payment_method': 'pending',
            'requires_confirmation': 'pending',
            'requires_action': 'pending',
            'processing': 'processing',
            'succeeded': 'completed',
            'canceled': 'canceled'
        }

        return statusMap[paymentIntent.status] || 'unknown'
    }
}

export default new StripeService()