# SpykeAI Stripe Payment Integration Guide

This guide provides comprehensive documentation for integrating Stripe payments into the SpykeAI platform.

## 📋 Overview

The Stripe integration allows users to:
- Purchase AI tools, prompts, and digital products
- Apply promocodes for discounts (handled by existing cart system)
- Receive instant access after payment
- Get notifications for payment status
- Handle failed/canceled payments gracefully
- **Works seamlessly with existing payment methods** (manual, other gateways)

## 🚀 Quick Setup

### 1. Environment Variables
```env
# Stripe Configuration (Test Mode)```

### 2. Dependencies
```bash
# Already added to package.json
npm install
```

## 🔄 Payment Flow

### Frontend Flow
1. **Add to Cart**: User adds products to cart using existing cart API
2. **Apply Promocode**: (Optional) Apply discount codes using existing promocode API
3. **Create Payment Intent**: Call `/payment-intent` endpoint (cart with promocodes already applied)
4. **Collect Payment**: Use Stripe.js to collect payment details
5. **Confirm Payment**: Call `/confirm-stripe-payment` with payment intent ID
6. **Grant Access**: User gets immediate access to purchased products

### Backend Flow (Integrated with Existing System)
1. **Payment Intent Created**: Uses existing cart totals (with promocodes already applied)
2. **Payment Processing**: Stripe processes payment
3. **Payment Confirmation**: Verification then calls existing `createPurchase` method
4. **Purchase Creation**: Uses existing purchase creation logic
5. **Access Granted**: Existing `grantAccess` method unlocks products
6. **Notifications**: Existing notification system alerts users and sellers

## 📡 API Endpoints

### 1. Existing Cart & Promocode APIs (Use These First)
```http
# Add products to cart
POST /v1/purchase/cart/add
Authorization: Bearer {token}
{
  "productId": "product_id"
}

# Apply promocode (optional)
POST /v1/purchase/cart/promocode
Authorization: Bearer {token}
{
  "code": "DISCOUNT10"
}

# Get cart summary
GET /v1/purchase/cart
Authorization: Bearer {token}
```

### 2. Create Payment Intent (New - Uses Existing Cart)
```http
POST /v1/purchase/payment-intent
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 29.99,
    "cartSummary": {
      "totalAmount": 39.99,
      "discountAmount": 10.00,
      "finalAmount": 29.99,
      "itemCount": 2,
      "appliedPromocode": {
        "code": "DISCOUNT10",
        "discountAmount": 10.00
      }
    }
  }
}
```

### 3. Confirm Stripe Payment (New - Calls Existing createPurchase)
```http
POST /v1/purchase/confirm-stripe-payment
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx"
}
```

**Response:** (Same as existing createPurchase response)
```json
{
  "success": true,
  "message": "Product purchased successfully",
  "data": {
    "purchaseId": "purchase_xxx",
    "totalItems": 2,
    "totalAmount": 39.99,
    "discountAmount": 10.00,
    "finalAmount": 29.99,
    "status": "COMPLETED",
    "paymentStatus": "COMPLETED",
    "paymentMethod": "stripe",
    "paymentReference": "pi_xxx",
    "purchaseDate": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Stripe Webhook (Called by Stripe)
```http
POST /v1/purchase/stripe/webhook
Stripe-Signature: whsec_xxx
Content-Type: application/json

{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "status": "succeeded",
      "amount": 2999,
      "metadata": {
        "userId": "user_xxx",
        "cartId": "cart_xxx"
      }
    }
  }
}
```

## 🛠 Complete Frontend Integration

### 1. Install Dependencies
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Environment Configuration
```javascript
// config/stripe.js
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S6VscKrLsDlIKl3VbF5RB3ZLOiAXYrPeIP0EsTQnzSGpqIFA0Ckm76ojUyzCsDNkF4uXMFsSfSNW5DJLW8ltPqz00LUMSTcJI',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/v1'
}
```

### 3. API Service Layer
```javascript
// services/purchaseApi.js
class PurchaseAPI {
  constructor(baseUrl, authToken) {
    this.baseUrl = baseUrl
    this.authToken = authToken
  }

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
        ...options.headers
      },
      ...options
    }

    const response = await fetch(url, config)
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'API request failed')
    }

    return data
  }

  // Step 1: Add product to cart
  async addToCart(productId) {
    return this.apiCall('/purchase/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId })
    })
  }

  // Step 2: Apply promocode (optional)
  async applyPromocode(code) {
    return this.apiCall('/purchase/cart/promocode', {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  }

  // Step 3: Remove promocode
  async removePromocode() {
    return this.apiCall('/purchase/cart/promocode', {
      method: 'DELETE'
    })
  }

  // Step 4: Get cart summary
  async getCart() {
    return this.apiCall('/purchase/cart')
  }

  // Step 5: Create payment intent
  async createPaymentIntent() {
    return this.apiCall('/purchase/payment-intent', {
      method: 'POST'
    })
  }

  // Step 6: Confirm payment
  async confirmStripePayment(paymentIntentId) {
    return this.apiCall('/purchase/confirm-stripe-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId })
    })
  }

  // Get user purchases
  async getUserPurchases(page = 1, limit = 10, type = null) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    if (type) params.append('type', type)

    return this.apiCall(`/purchase/my-purchases?${params}`)
  }

  // Clear cart
  async clearCart() {
    return this.apiCall('/purchase/cart/clear', {
      method: 'DELETE'
    })
  }
}

export default PurchaseAPI
```

### 4. Stripe Service Hook
```javascript
// hooks/useStripePayment.js
import { useState, useCallback } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import PurchaseAPI from '../services/purchaseApi'
import { STRIPE_CONFIG } from '../config/stripe'

export const useStripePayment = (authToken) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const purchaseAPI = new PurchaseAPI(STRIPE_CONFIG.apiBaseUrl, authToken)

  const processPayment = useCallback(async (billingDetails = {}) => {
    if (!stripe || !elements) {
      setError('Stripe not properly initialized')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      // Step 1: Create payment intent
      console.log('Creating payment intent...')
      const paymentIntentResponse = await purchaseAPI.createPaymentIntent()
      const { clientSecret, paymentIntentId, amount, cartSummary } = paymentIntentResponse.data

      console.log('Payment intent created:', { paymentIntentId, amount, cartSummary })

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement)
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails
        }
      })

      if (stripeError) {
        console.error('Stripe payment error:', stripeError)
        setError(stripeError.message)
        return false
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded with Stripe:', paymentIntent.id)

        // Step 3: Confirm with backend
        const confirmResponse = await purchaseAPI.confirmStripePayment(paymentIntent.id)
        console.log('Backend confirmation successful:', confirmResponse.data)

        setPaymentSuccess(true)
        return {
          success: true,
          paymentIntent,
          purchase: confirmResponse.data
        }
      } else {
        setError(`Payment failed with status: ${paymentIntent.status}`)
        return false
      }

    } catch (err) {
      console.error('Payment processing error:', err)
      setError(err.message || 'Payment processing failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [stripe, elements, purchaseAPI])

  return {
    processPayment,
    loading,
    error,
    paymentSuccess,
    stripe,
    elements
  }
}
```

### 5. Complete Checkout Component
```javascript
// components/StripeCheckout.jsx
import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useStripePayment } from '../hooks/useStripePayment'
import PurchaseAPI from '../services/purchaseApi'
import { STRIPE_CONFIG } from '../config/stripe'

// Load Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey)

// Card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false
}

// Checkout Form Component
function CheckoutForm({ authToken, onSuccess, onError }) {
  const [cart, setCart] = useState(null)
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: {
      line1: '',
      city: '',
      postal_code: '',
      country: 'US'
    }
  })
  const [promocode, setPromocode] = useState('')

  const { processPayment, loading, error, paymentSuccess } = useStripePayment(authToken)
  const purchaseAPI = new PurchaseAPI(STRIPE_CONFIG.apiBaseUrl, authToken)

  // Load cart on mount
  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const response = await purchaseAPI.getCart()
      setCart(response.data)
    } catch (err) {
      console.error('Failed to load cart:', err)
      onError?.(err.message)
    }
  }

  const handleApplyPromocode = async () => {
    if (!promocode.trim()) return

    try {
      await purchaseAPI.applyPromocode(promocode)
      await loadCart() // Reload cart to show discount
      setPromocode('')
    } catch (err) {
      console.error('Promocode application failed:', err)
      onError?.(err.message)
    }
  }

  const handleRemovePromocode = async () => {
    try {
      await purchaseAPI.removePromocode()
      await loadCart()
    } catch (err) {
      console.error('Promocode removal failed:', err)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!cart || cart.totalItems === 0) {
      onError?.('Cart is empty')
      return
    }

    const result = await processPayment(billingDetails)

    if (result && result.success) {
      onSuccess?.(result.purchase)
    }
  }

  if (!cart) {
    return <div>Loading cart...</div>
  }

  if (cart.totalItems === 0) {
    return <div>Your cart is empty</div>
  }

  return (
    <div className="checkout-form">
      {/* Cart Summary */}
      <div className="cart-summary">
        <h3>Order Summary</h3>
        {cart.items.map((item) => (
          <div key={item.productId._id} className="cart-item">
            <span>{item.productId.title}</span>
            <span>${item.productId.price}</span>
          </div>
        ))}

        {/* Promocode Section */}
        <div className="promocode-section">
          <div className="promocode-input">
            <input
              type="text"
              value={promocode}
              onChange={(e) => setPromocode(e.target.value)}
              placeholder="Enter promocode"
            />
            <button onClick={handleApplyPromocode} disabled={!promocode.trim()}>
              Apply
            </button>
          </div>

          {cart.appliedPromocode?.discountAmount > 0 && (
            <div className="applied-promocode">
              <span>Discount: -${cart.appliedPromocode.discountAmount}</span>
              <button onClick={handleRemovePromocode}>Remove</button>
            </div>
          )}
        </div>

        <div className="totals">
          <div>Subtotal: ${cart.totalAmount}</div>
          {cart.appliedPromocode?.discountAmount > 0 && (
            <div>Discount: -${cart.appliedPromocode.discountAmount}</div>
          )}
          <div className="final-total">Total: ${cart.finalAmount}</div>
        </div>
      </div>

      {/* Billing Form */}
      <form onSubmit={handleSubmit} className="payment-form">
        <h3>Billing Information</h3>

        <div className="billing-fields">
          <input
            type="text"
            placeholder="Full Name"
            value={billingDetails.name}
            onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={billingDetails.email}
            onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
            required
          />

          <input
            type="text"
            placeholder="Address"
            value={billingDetails.address.line1}
            onChange={(e) => setBillingDetails(prev => ({
              ...prev,
              address: { ...prev.address, line1: e.target.value }
            }))}
            required
          />

          <input
            type="text"
            placeholder="City"
            value={billingDetails.address.city}
            onChange={(e) => setBillingDetails(prev => ({
              ...prev,
              address: { ...prev.address, city: e.target.value }
            }))}
            required
          />

          <input
            type="text"
            placeholder="Postal Code"
            value={billingDetails.address.postal_code}
            onChange={(e) => setBillingDetails(prev => ({
              ...prev,
              address: { ...prev.address, postal_code: e.target.value }
            }))}
            required
          />
        </div>

        {/* Card Element */}
        <div className="card-element-container">
          <label>Card Information</label>
          <CardElement options={cardElementOptions} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || paymentSuccess}
          className="pay-button"
        >
          {loading ? 'Processing...' : `Pay $${cart.finalAmount}`}
        </button>

        {paymentSuccess && (
          <div className="success-message" style={{ color: 'green', marginTop: '10px' }}>
            Payment successful! Redirecting...
          </div>
        )}
      </form>
    </div>
  )
}

// Main Stripe Checkout Component
export default function StripeCheckout({ authToken, onSuccess, onError }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        authToken={authToken}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  )
}
```

### 6. Usage Examples

#### Basic Usage
```javascript
// pages/checkout.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import StripeCheckout from '../components/StripeCheckout'

export default function CheckoutPage() {
  const router = useRouter()
  const [authToken] = useState(() => localStorage.getItem('authToken'))

  const handlePaymentSuccess = (purchase) => {
    console.log('Purchase successful:', purchase)
    router.push(`/purchase-success?id=${purchase.purchaseId}`)
  }

  const handlePaymentError = (error) => {
    console.error('Payment error:', error)
    alert(`Payment failed: ${error}`)
  }

  return (
    <div className="checkout-page">
      <h1>Complete Your Purchase</h1>
      <StripeCheckout
        authToken={authToken}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  )
}
```

#### With Cart Management
```javascript
// components/ProductPage.jsx
import { useState } from 'react'
import PurchaseAPI from '../services/purchaseApi'
import { STRIPE_CONFIG } from '../config/stripe'

export default function ProductPage({ product, authToken }) {
  const [loading, setLoading] = useState(false)
  const purchaseAPI = new PurchaseAPI(STRIPE_CONFIG.apiBaseUrl, authToken)

  const handleAddToCart = async () => {
    setLoading(true)
    try {
      await purchaseAPI.addToCart(product._id)
      // Redirect to checkout
      window.location.href = '/checkout'
    } catch (err) {
      alert(`Failed to add to cart: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="product-page">
      <h1>{product.title}</h1>
      <p>Price: ${product.price}</p>
      <button onClick={handleAddToCart} disabled={loading}>
        {loading ? 'Adding...' : 'Buy Now'}
      </button>
    </div>
  )
}
```

### 7. Testing Guide

#### Test Cards for Development
```javascript
// Test card numbers for different scenarios
const TEST_CARDS = {
  success: '4242424242424242',
  decline: '4000000000000002',
  insufficientFunds: '4000000000009995',
  expiredCard: '4000000000000069',
  incorrectCVC: '4000000000000127',
  processingError: '4000000000000119'
}

// Use in development
const testBillingDetails = {
  name: 'Test User',
  email: 'test@example.com',
  address: {
    line1: '123 Test St',
    city: 'Test City',
    postal_code: '12345',
    country: 'US'
  }
}
```

#### Integration Testing
```javascript
// Example test flow
async function testPaymentFlow() {
  const purchaseAPI = new PurchaseAPI(STRIPE_CONFIG.apiBaseUrl, 'test_token')

  try {
    // 1. Add product to cart
    await purchaseAPI.addToCart('test_product_id')

    // 2. Apply promocode
    await purchaseAPI.applyPromocode('TEST10')

    // 3. Get cart
    const cart = await purchaseAPI.getCart()
    console.log('Cart:', cart.data)

    // 4. Create payment intent
    const paymentIntent = await purchaseAPI.createPaymentIntent()
    console.log('Payment Intent:', paymentIntent.data)

    // 5. (In real app, Stripe.js would process payment here)

    // 6. Confirm payment (after Stripe processing)
    // await purchaseAPI.confirmStripePayment(paymentIntentId)

  } catch (error) {
    console.error('Test failed:', error)
  }
}
```

## 🔔 Webhook Setup

### 1. Create Webhook in Stripe Dashboard
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter URL: `https://qa.spykeai.com:8443/api/v1/purchase/stripe/webhook`
4. Select events (choose the ones available in your Stripe dashboard):

   **Option 1 - If payment_intent events are available:**
   - `payment_intent.succeeded` ✅ (Required)
   - `payment_intent.payment_failed` ✅ (Required)

   **Option 2 - If checkout session events are available (your case):**
   - `checkout.session.async_payment_succeeded` ✅ (Required)
   - `checkout.session.completed` ✅ (Required)

   **Option 3 - Backup events (if above not available):**
   - `charge.succeeded` ✅ (Backup)
   - `charge.failed` ✅ (Backup)

   **Optional events:**
   - `payment_intent.created`
   - `payment_intent.requires_action`


### 2. Update Environment Variable
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 🧪 Testing

### Test Cards (Stripe Test Mode)
```
Success: 4242424242424242
Decline: 4000000000000002
Insufficient Funds: 4000000000009995
```

### Test Workflow
1. Add products to cart
2. Create payment intent
3. Use test card in Stripe Elements
4. Verify purchase creation
5. Check webhook events in Stripe Dashboard
6. Verify user access to products

## 🚨 Error Handling

### Common Errors
- **Empty Cart**: User tries to pay with no items
- **Invalid Payment**: Payment fails or is declined
- **Duplicate Purchase**: Prevents double charging
- **Webhook Verification**: Invalid signatures

### Error Responses
```json
{
  "success": false,
  "message": "Payment not completed",
  "error": "The payment intent status is 'requires_payment_method'"
}
```

## 🔒 Security

### Best Practices
- ✅ Never store card details
- ✅ Use HTTPS for all API calls
- ✅ Verify webhook signatures
- ✅ Validate payment status before granting access
- ✅ Use test keys in development
- ✅ Monitor failed payments

### Webhook Security
```javascript
// Verify webhook signature
const signature = req.headers['stripe-signature']
const event = stripe.webhooks.constructEvent(
  req.body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
)
```

## 📊 Monitoring

### Key Metrics to Track
- Payment success rate
- Failed payment reasons
- Average order value
- Refund requests
- Webhook delivery status

### Logs to Monitor
- Payment intent creation
- Webhook events
- Purchase completions
- Error responses

## 🛟 Troubleshooting

### Payment Intent Issues
```bash
# Check if payment intent exists
curl -u sk_test_xxx: https://api.stripe.com/v1/payment_intents/pi_xxx
```

### Webhook Issues
1. Check webhook endpoint URL
2. Verify webhook secret
3. Check Stripe Dashboard for delivery attempts
4. Validate request signature

### Common Solutions
- **CORS errors**: Add domain to allowed origins
- **Webhook failures**: Check server logs
- **Payment failures**: Validate card details
- **Double charges**: Check for duplicate payment intents

## 📱 Mobile Integration

### React Native
```javascript
import { StripeProvider, CardField } from '@stripe/stripe-react-native'

// Configure Stripe
const publishableKey = 'pk_test_xxx'

function App() {
  return (
    <StripeProvider publishableKey={publishableKey}>
      <PaymentScreen />
    </StripeProvider>
  )
}
```

## 🌐 Production Deployment

### Pre-Production Checklist
- [ ] Replace test keys with live keys
- [ ] Update webhook endpoints
- [ ] Test with real cards (small amounts)
- [ ] Verify SSL certificates
- [ ] Monitor error rates
- [ ] Set up alerting

### Go-Live Steps
1. Replace test keys in environment
2. Update Stripe webhook URL
3. Test with small amounts
4. Monitor payment flows
5. Check webhook delivery

## 📞 Support

### Resources
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe.js Reference](https://stripe.com/docs/js)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)

### Emergency Contacts
- Monitor failed payments in real-time
- Set up alerts for webhook failures
- Keep Stripe Dashboard accessible
- Have rollback plan ready

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Stripe API Version**: 2020-08-27
