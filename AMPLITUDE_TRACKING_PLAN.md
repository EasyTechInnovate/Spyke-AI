# Spyke AI Analytics Tracking Plan

## Overview
This document outlines the comprehensive analytics tracking implementation for Spyke AI marketplace using Amplitude Analytics.

## Implementation Status
✅ **Amplitude SDK**: Installed and configured  
✅ **Analytics Provider**: Global provider setup  
✅ **Event System**: Comprehensive event tracking system  
✅ **React Hook**: useAnalytics hook for easy integration  
✅ **Error Tracking**: Automatic error and performance tracking  

---

## 🔧 Setup & Configuration

### Environment Variables
Add to your `.env.local`:
```bash
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_amplitude_api_key_here
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Quick Start
```javascript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { track, identify } = useAnalytics();
  
  // Track an event
  track.productViewed('prod_123', 'ChatGPT Prompts Bundle', 'AI Tools', 'seller_456', 29.99);
  
  // Identify user
  identify('user_789', { user_type: 'buyer', country: 'AE' });
}
```

---

## 📊 Event Categories & Implementation

### 1. AUTHENTICATION EVENTS

| Event Name | Trigger | Properties | Priority | Owner |
|------------|---------|------------|----------|--------|
| `signup_started` | Click "Sign up" button | `method`, `source`, `page` | **HIGH** | Frontend |
| `signup_completed` | Signup success page | `user_type`, `success` | **HIGH** | Frontend |
| `signup_failed` | Signup error | `method`, `error_type`, `page` | **HIGH** | Frontend |
| `login_started` | Click "Log in" button | `method`, `page` | **HIGH** | Frontend |
| `login_completed` | Login success | `user_type`, `success` | **HIGH** | Frontend |
| `login_failed` | Login error | `method`, `error_type` | **HIGH** | Frontend |
| `logout_completed` | Logout action | - | **MEDIUM** | Frontend |

#### Implementation Examples:
```javascript
// In your signup component
const { track } = useAnalytics();

const handleSignupClick = () => {
  track.signupStarted('email', 'header_button');
};

const handleSignupSuccess = (userId) => {
  track.signupCompleted(userId, 'buyer');
};
```

### 2. PRODUCT DISCOVERY EVENTS

| Event Name | Trigger | Properties | Priority | Owner |
|------------|---------|------------|----------|--------|
| `product_viewed` | Product detail page load | `product_id`, `product_name`, `category`, `seller_id`, `price`, `currency` | **HIGH** | Frontend |
| `product_searched` | Search query submitted | `search_query`, `results_count`, `filters` | **HIGH** | Frontend |
| `category_viewed` | Category page load | `category`, `products_count` | **MEDIUM** | Frontend |
| `product_favorited` | Click favorite button | `product_id`, `product_name`, `seller_id`, `action` | **MEDIUM** | Frontend |
| `product_upvoted` | Click upvote button | `product_id`, `product_name`, `seller_id` | **MEDIUM** | Frontend |

#### Implementation Examples:
```javascript
// In your product detail component
useEffect(() => {
  if (product) {
    track.productViewed(
      product.id,
      product.name,
      product.category,
      product.seller_id,
      product.price
    );
  }
}, [product]);

// In your search component
const handleSearch = (query, results) => {
  track.productSearched(query, results.length, { category: selectedCategory });
};
```

### 3. CART & PURCHASE EVENTS

| Event Name | Trigger | Properties | Priority | Owner |
|------------|---------|------------|----------|--------|
| `product_added_to_cart` | Add to cart button click | `product_id`, `product_name`, `price`, `seller_id`, `quantity`, `currency` | **HIGH** | Frontend |
| `product_removed_from_cart` | Remove from cart | `product_id`, `product_name`, `price`, `seller_id`, `currency` | **HIGH** | Frontend |
| `cart_viewed` | Cart page load | `items_count`, `total_value`, `unique_sellers`, `currency` | **MEDIUM** | Frontend |
| `checkout_started` | Checkout button click | `items_count`, `total_value`, `payment_method`, `currency` | **HIGH** | Frontend |
| `promocode_applied` | Promocode entered | `promocode`, `discount_amount`, `discount_type`, `seller_id`, `currency` | **HIGH** | Frontend |
| `purchase_completed` | Payment success | `order_id`, `total_value`, `items_count`, `payment_method`, `currency`, `products` | **HIGH** | Backend |
| `purchase_failed` | Payment failure | `error_type`, `total_value`, `payment_method`, `currency` | **HIGH** | Backend |

#### Implementation Examples:
```javascript
// In your cart component
const handleAddToCart = (product) => {
  track.addToCart(
    product.id,
    product.name,
    product.price,
    product.seller_id,
    1
  );
};

// In your checkout component
const handlePurchaseComplete = (orderData) => {
  track.purchaseCompleted(
    orderData.id,
    orderData.total,
    orderData.items.length,
    'stripe',
    orderData.items
  );
};
```

### 4. SELLER EVENTS

| Event Name | Trigger | Properties | Priority | Owner |
|------------|---------|------------|----------|--------|
| `seller_profile_viewed` | Seller profile page load | `seller_id`, `seller_name`, `products_count` | **MEDIUM** | Frontend |
| `become_seller_started` | "Become Seller" click | `source`, `page` | **HIGH** | Frontend |
| `seller_onboarding_completed` | Seller setup complete | `seller_id` | **HIGH** | Frontend |
| `product_created` | New product created | `product_id`, `product_name`, `category`, `price`, `currency` | **HIGH** | Frontend |
| `product_published` | Product goes live | `product_id`, `product_name`, `category`, `status` | **HIGH** | Frontend |
| `payout_requested` | Payout request submitted | `amount`, `payment_method`, `seller_id`, `currency` | **HIGH** | Frontend |
| `payout_completed` | Payout processed | `amount`, `payment_method`, `seller_id`, `currency` | **HIGH** | Backend |

### 5. USER ENGAGEMENT EVENTS

| Event Name | Trigger | Properties | Priority | Owner |
|------------|---------|------------|----------|--------|
| `page_viewed` | Page load | `page_name`, `category`, `url`, `referrer` | **MEDIUM** | Frontend |
| `review_submitted` | Review form submit | `product_id`, `rating`, `seller_id` | **MEDIUM** | Frontend |
| `search_performed` | Any search action | `search_query`, `category`, `results_count` | **HIGH** | Frontend |
| `filter_applied` | Filter selection | `filter_type`, `filter_value`, `results_count` | **MEDIUM** | Frontend |
| `header_link_clicked` | Header navigation | `link_name`, `destination`, `source` | **LOW** | Frontend |
| `footer_link_clicked` | Footer navigation | `link_name`, `destination`, `source` | **LOW** | Frontend |
| `feature_used` | Feature interaction | `feature_name`, `context` | **MEDIUM** | Frontend |

### 6. SYSTEM EVENTS (Auto-tracked)

| Event Name | Trigger | Properties | Priority | Owner |
|------------|---------|------------|----------|--------|
| `page_load_time` | Page load complete | `page_name`, `load_time`, `performance_category` | **LOW** | System |
| `error_occurred` | JavaScript error | `error_type`, `error_message`, `page`, `stack` | **HIGH** | System |
| `api_call_made` | API request | `endpoint`, `method`, `response_time`, `status_code`, `success` | **LOW** | System |

---

## 👤 User Properties

### User Identification
```javascript
const { identify } = useAnalytics();

// Set user properties after login
identify(userId, {
  user_type: 'buyer|seller|admin',
  signup_date: '2025-01-01T00:00:00Z',
  country: 'AE',
  last_login: '2025-01-01T00:00:00Z',
  total_purchases: 5,
  total_spent: 299.99,
  seller_status: 'active|pending|inactive',
  seller_join_date: '2025-01-01T00:00:00Z'
});
```

### Incrementing Properties
```javascript
// After successful purchase
analytics.updateUserProperties({
  total_purchases: '$add:1',
  total_spent: '$add:29.99',
  last_purchase: new Date().toISOString()
});
```

---

## 🚀 Ready-to-Use Examples

### Complete Product Page Implementation
```javascript
'use client';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useEffect } from 'react';

export default function ProductPage({ product }) {
  const { track } = useAnalytics();

  // Track product view
  useEffect(() => {
    if (product) {
      track.productViewed(
        product.id,
        product.name,
        product.category,
        product.seller_id,
        product.price
      );
    }
  }, [product, track]);

  const handleAddToCart = () => {
    track.addToCart(
      product.id,
      product.name,
      product.price,
      product.seller_id,
      1
    );
    // Your add to cart logic
  };

  const handleFavorite = () => {
    track.productFavorited(
      product.id,
      product.name,
      product.seller_id
    );
    // Your favorite logic
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={handleFavorite}>❤️ Favorite</button>
    </div>
  );
}
```

### Complete Auth Flow Implementation
```javascript
'use client';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function AuthForm() {
  const { track, identify } = useAnalytics();

  const handleSignupStart = () => {
    track.signupStarted('email', 'auth_page');
  };

  const handleSignupSuccess = async (userData) => {
    try {
      // Your signup logic
      track.signupCompleted(userData.id, userData.type);
      identify(userData.id, {
        user_type: userData.type,
        signup_date: new Date().toISOString(),
        country: 'AE'
      });
    } catch (error) {
      track.signupFailed(error.message, 'email');
    }
  };

  const handleLogin = async (credentials) => {
    track.loginStarted('email');
    try {
      // Your login logic
      const user = await login(credentials);
      track.loginCompleted(user.id, user.type);
      identify(user.id, {
        user_type: user.type,
        last_login: new Date().toISOString()
      });
    } catch (error) {
      track.loginFailed(error.message, 'email');
    }
  };

  return (
    <form>
      <button onClick={handleSignupStart}>Sign Up</button>
      <button onClick={handleLogin}>Log In</button>
    </form>
  );
}
```

---

## 🔍 Testing & Verification

### 1. Local Testing
```javascript
// Check events in browser DevTools
// Network tab → Filter by "amplitude" → See outgoing requests

// Console verification
console.log('Tracking event:', eventName, properties);
```

### 2. Staging Environment
- Use staging API key: `NEXT_PUBLIC_AMPLITUDE_API_KEY=staging_key`
- Test user IDs: `test_user_123`, `staging_user_456`

### 3. Production Checklist
- ✅ Environment variables set
- ✅ No PII in event properties
- ✅ Consistent naming conventions
- ✅ Required properties present
- ✅ Cross-browser testing

---

## 📈 Key Funnels to Build

### 1. User Acquisition Funnel
1. `page_viewed` (homepage)
2. `signup_started`
3. `signup_completed`
4. `product_viewed`
5. `purchase_completed`

### 2. Purchase Funnel
1. `product_viewed`
2. `product_added_to_cart`
3. `checkout_started`
4. `purchase_completed`

### 3. Seller Onboarding Funnel
1. `become_seller_started`
2. `seller_onboarding_completed`
3. `product_created`
4. `product_published`

---

## 🚨 Common Gotchas & Best Practices

### ❌ Don't Do This
```javascript
// Sending PII
track.custom('user_action', {
  email: 'user@example.com', // ❌ PII
  phone: '+1234567890'       // ❌ PII
});

// Inconsistent naming
track.custom('Product_Viewed', {}); // ❌ Mixed case
track.custom('product-clicked', {}); // ❌ Different convention
```

### ✅ Do This
```javascript
// Hash or use IDs for PII
track.custom('user_action', {
  user_id: 'user_123',       // ✅ ID instead of email
  user_hash: 'abc123def'     // ✅ Hashed identifier
});

// Consistent snake_case naming
track.productViewed(...);    // ✅ Consistent
track.productFavorited(...); // ✅ Consistent
```

### Best Practices
1. **Always include context**: page, source, timestamp
2. **Use consistent property names**: `product_id`, not `productId` or `product-id`
3. **Include currency for monetary values**: Always specify `currency: 'USD'`
4. **Track both success and failure**: Don't just track happy path
5. **Use staging environment**: Test before production deployment

---

## 📋 Implementation Checklist

### Phase 1: Core Events (Week 1)
- [ ] Authentication events (signup, login, logout)
- [ ] Product view events
- [ ] Basic purchase events

### Phase 2: Commerce Events (Week 2)
- [ ] Cart management events
- [ ] Checkout flow events
- [ ] Promocode events

### Phase 3: Engagement Events (Week 3)
- [ ] Search and filter events
- [ ] Navigation events
- [ ] Review and rating events

### Phase 4: Seller Events (Week 4)
- [ ] Seller onboarding events
- [ ] Product creation events
- [ ] Payout events

### Phase 5: Analytics & Optimization (Week 5)
- [ ] Build key funnels in Amplitude
- [ ] Set up cohort analyses
- [ ] Create performance dashboards
- [ ] Set up alerts for key metrics

---

## 🎯 Next Steps

1. **Add your Amplitude API key** to environment variables
2. **Start with authentication events** - highest priority
3. **Test on staging** before production deployment
4. **Implement gradually** - one category at a time
5. **Monitor data quality** in Amplitude dashboard
6. **Build insights** once data starts flowing

Your analytics system is now ready to track comprehensive user behavior across your Spyke AI marketplace! 🚀