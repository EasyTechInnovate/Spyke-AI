# Spyke AI Manual Payout System - Logic Documentation

## Overview
The Spyke AI platform implements a **manual payout system** where sellers can view earnings, request payouts, but all actual money transfers are handled manually by administrators. This ensures complete control over financial operations while providing transparency to sellers.

## System Architecture

### Core Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Seller Flow   │    │  Admin Control  │    │ Email Notifications │
│                 │    │                 │    │                 │
│ • View Earnings │    │ • Platform Fees │    │ • Request Sent  │
│ • Check Threshold│   │ • Approve/Reject│    │ • Status Updates│
│ • Request Payout│    │ • Manual Process│    │ • Completion    │
│ • Track Status  │    │ • Mark Complete │    │ • Sweet Messages│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Data Models

### 1. Platform Settings Model
**Purpose**: Configurable system-wide payout parameters
**Location**: `/server/src/model/platform.settings.model.js`

```javascript
{
  platformFeePercentage: 10,      // Platform's commission (default 10%)
  minimumPayoutThreshold: 50,     // Minimum payout amount ($50)
  payoutProcessingTime: 7,        // Expected processing time (7 days)
  paymentProcessingFee: 0,        // Additional processing fee ($0)
  holdPeriodNewSellers: 14,       // Hold period for new sellers (14 days)
  autoPayoutEnabled: false,       // Manual processing only
  maxPayoutAmount: 10000,         // Maximum single payout ($10,000)
  currency: "USD",                // Default currency
  lastUpdatedBy: ObjectId,        // Admin who made changes
  isActive: true                  // Current active settings
}
```

**Key Methods**:
- `getCurrentSettings()` - Always returns active settings, creates default if none exist
- `calculateSellerEarning(saleAmount)` - Calculates net earning after fees

### 2. Payout Request Model
**Purpose**: Tracks individual payout requests through their lifecycle
**Location**: `/server/src/model/payout.model.js`

```javascript
{
  sellerId: ObjectId,             // Reference to seller
  amount: 327.50,                 // Net payout amount after fees
  grossAmount: 700.00,            // Total earnings before fees
  platformFee: 70.00,             // Platform fee deducted
  processingFee: 2.50,            // Processing fee (if any)
  payoutMethod: "bank",           // bank, paypal, stripe, wise
  payoutDetails: {                // Snapshot of payout method details
    accountHolderName: "John Doe",
    accountNumber: "****7890",    // Masked for security
    bankName: "Chase Bank"
  },
  status: "pending",              // pending → approved → processing → completed
  requestedAt: Date,              // When seller requested
  approvedAt: Date,               // When admin approved
  approvedBy: ObjectId,           // Admin who approved
  processedAt: Date,              // When payment initiated
  completedAt: Date,              // When payment completed
  payoutPeriod: {                 // Earnings period covered
    from: Date,
    to: Date
  },
  salesIncluded: [ObjectId],      // Purchase references
  transactionId: "TXN123456789", // External payment reference
  notes: "Payment notes",         // Admin notes
  currency: "USD"
}
```

**Status Flow**:
```
pending → approved → processing → completed
    ↓         ↓          ↓
cancelled  failed   failed
```

### 3. Seller Profile Integration
**Purpose**: Minimal changes to existing seller model
**Location**: `/server/src/model/seller.profile.model.js` (existing)

**Added Fields** (Implemented):
```javascript
payoutInfo: {
  // ... existing fields remain unchanged
  lastPayoutAt: Date,             // Last successful payout
  totalPayouts: Number,           // Lifetime payout amount
  pendingEarnings: Number,        // Cached for performance
  availableForPayout: Number,     // Cached for performance
  onHold: Number,                 // Held earnings
  nextPayoutEligible: Date        // When eligible for next payout
}
```

**Key Design Decision**: Purchase model remains **unchanged** to protect buyer privacy. Seller earnings are calculated on-demand from existing purchase data and cached in seller model for performance.

## Business Logic Flow

### 1. Earnings Calculation Logic
**Location**: `/server/src/controller/Seller/payout.controller.js`

```javascript
const calculateEarnings = async (sellerId, fromDate, toDate) => {
  // 1. Get platform settings (fees, thresholds)
  const platformSettings = await PlatformSettings.getCurrentSettings()
  
  // 2. Get seller's commission rate from existing system
  const seller = await SellerProfile.findById(sellerId)
  const commissionRate = seller.getCurrentCommissionRate() // e.g., 70%
  
  // 3. Query completed sales from Purchase model
  const salesPipeline = [
    { $match: { 
      'items.sellerId': sellerId,
      paymentStatus: 'completed',
      orderStatus: 'completed'
    }},
    { $unwind: '$items' },
    { $group: {
      totalSales: { $sum: '$items.price' },    // e.g., $1000
      salesCount: { $sum: 1 },                 // e.g., 25 sales
      salesIds: { $push: '$_id' }              // For tracking
    }}
  ]
  
  // 4. Calculate earnings breakdown
  const grossEarnings = totalSales * (commissionRate / 100)  // $700
  const platformFee = grossEarnings * (platformFeePercentage / 100)  // $70
  const processingFee = paymentProcessingFee                 // $2.50
  const netEarnings = grossEarnings - platformFee - processingFee    // $627.50
  
  // 5. Calculate available amount (subtract already paid)
  const existingPayouts = await Payout.find({
    sellerId,
    status: { $in: ['completed', 'processing', 'approved'] }
  })
  const totalPaidOut = existingPayouts.reduce((sum, payout) => sum + payout.amount, 0)
  const availableForPayout = netEarnings - totalPaidOut
  
  // 6. Check eligibility
  const isEligible = availableForPayout >= minimumPayoutThreshold
  const isOnHold = checkHoldPeriod(seller.verification.approvedAt)
  
  return {
    totalSales, salesCount, commissionRate,
    grossEarnings, platformFee, processingFee, netEarnings,
    totalPaidOut, availableForPayout,
    isEligible, isOnHold, minimumThreshold
  }
}
```

### 2. Payout Request Flow
**Seller Perspective**:

1. **View Dashboard** (`/seller/payout/dashboard`)
   - Real-time earnings calculation
   - Shows available payout amount
   - Displays eligibility status
   - Lists recent payout history

2. **Request Payout** (`POST /seller/payout/request`)
   ```javascript
   // Validation checks
   if (!seller.payoutInfo.method) return error("Payout method not configured")
   if (existingPendingPayout) return error("Payout already pending")
   if (!earningsData.isEligible) return error("Minimum threshold not met")
   if (earningsData.isOnHold) return error("Account on hold")
   
   // Create payout request
   const payout = new Payout({
     sellerId, amount, grossAmount, platformFee,
     payoutMethod: seller.payoutInfo.method,
     payoutDetails: sanitizedPayoutInfo, // Remove sensitive fields
     status: 'pending',
     payoutPeriod: { from: monthStart, to: now },
     salesIncluded: salesIds
   })
   
   // Send notifications
   emailService.send(seller.email, 'payout-request-confirmation')
   emailService.send(admins, 'payout-admin-notification')
   ```

### 3. Admin Management Flow
**Admin Perspective**:

1. **Review Requests** (`/admin/payouts`)
   - List all pending requests
   - Filter by status, date, seller
   - View detailed breakdowns
   - Sort by amount, date, priority

2. **Approve Process** (`PUT /admin/payouts/:id/approve`)
   ```javascript
   // Update status and track admin
   payout.status = 'approved'
   payout.approvedAt = new Date()
   payout.approvedBy = adminId
   
   // Send confirmation to seller
   emailService.send(seller.email, 'payout-approved', {
     estimatedProcessingTime: '3-5 business days'
   })
   ```

3. **Manual Processing** (`PUT /admin/payouts/:id/processing`)
   ```javascript
   // Admin manually sends money via external system
   // Then updates status with transaction reference
   payout.status = 'processing'
   payout.processedAt = new Date()
   payout.transactionId = externalTransactionId
   
   emailService.send(seller.email, 'payout-processing')
   ```

4. **Complete Payout** (`PUT /admin/payouts/:id/completed`)
   ```javascript
   // Mark as completed when money confirmed sent
   payout.status = 'completed'
   payout.completedAt = new Date()
   
   // Update seller's payout history
   seller.payoutInfo.lastPayoutAt = new Date()
   seller.payoutInfo.totalPayouts += payout.amount
   
   emailService.send(seller.email, 'payout-completed')
   ```

## Security & Validation

### 1. Authentication & Authorization
```javascript
// Seller routes require SELLER role
router.get('/payout/dashboard', 
  authentication, 
  authorization([EUserRole.SELLER]), 
  payoutController.getPayoutDashboard
)

// Admin routes require ADMIN role
router.put('/admin/payouts/:id/approve',
  authentication,
  authorization([EUserRole.ADMIN]),
  payoutController.approvePayout
)
```

### 2. Data Validation
```javascript
// Platform settings validation
platformFeePercentage: {
  min: [0, 'Platform fee cannot be negative'],
  max: [50, 'Platform fee cannot exceed 50%']
}

minimumPayoutThreshold: {
  min: [1, 'Minimum payout threshold must be at least $1']
}

// Payout amount validation
amount: {
  min: [0.01, 'Amount must be greater than 0'],
  validate: (value) => value <= maxPayoutAmount
}
```

### 3. Business Rules Enforcement
```javascript
// Prevent duplicate requests
const existingPendingPayout = await Payout.findOne({
  sellerId,
  status: { $in: ['pending', 'approved', 'processing'] }
})

// Hold period for new sellers
const sellerJoinDate = new Date(seller.verification.approvedAt)
const holdPeriodEnd = new Date(sellerJoinDate.getTime() + (holdPeriodNewSellers * 24 * 60 * 60 * 1000))
const isOnHold = new Date() < holdPeriodEnd

// Threshold enforcement
const isEligible = availableForPayout >= minimumPayoutThreshold
```

## Email Notification System

### 1. Template Structure
**Location**: `/server/src/util/email.formatter.js`

Templates use sweet, encouraging messaging:
- `payout-request-confirmation`: "🎉 It's Your Payout Day!"
- `payout-approved`: "✅ Payout Approved - Processing Soon!"
- `payout-processing`: "🔄 Your Payout is Being Processed!"
- `payout-completed`: "🎉 Payout Completed Successfully!"

### 2. Email Flow
```javascript
// 1. Seller requests payout
emailService.send(seller.email, confirmationTemplate, {
  sellerName, amount, currency, requestId, estimatedTime
})

// 2. Notify all admins
adminUsers.forEach(admin => {
  emailService.send(admin.email, adminNotificationTemplate, {
    adminName, sellerName, amount, payoutMethod
  })
})

// 3. Status updates sent automatically
// Each status change triggers appropriate email template
```

## Analytics & Reporting

### 1. Admin Analytics
**Location**: `/server/src/controller/Analytics/admin.controller.js`

```javascript
getPayoutAnalytics: {
  // Status breakdown (pending, approved, completed, failed)
  statusBreakdown: [
    { _id: 'completed', count: 150, totalAmount: 75000, avgAmount: 500 },
    { _id: 'pending', count: 25, totalAmount: 12500, avgAmount: 500 }
  ],
  
  // Daily trends for completed payouts
  dailyTrends: [
    { _id: {year: 2024, month: 1, day: 15}, count: 5, totalAmount: 2500 }
  ],
  
  // Payout method preferences
  methodBreakdown: [
    { _id: 'bank', count: 100, totalAmount: 50000 },
    { _id: 'paypal', count: 75, totalAmount: 37500 }
  ],
  
  // Processing time analysis
  processingTimes: {
    avgProcessingTime: 4.2, // days
    minProcessingTime: 1.0,
    maxProcessingTime: 10.0
  },
  
  // Top sellers by payout volume
  topSellersByPayout: [
    { sellerName: 'John Doe', totalPayouts: 15000, payoutCount: 30 }
  ],
  
  // Platform revenue from fees
  platformRevenue: {
    totalPlatformFees: 7500,   // 10% of gross earnings
    totalProcessingFees: 375,  // Processing fees
    totalRevenue: 7875,        // Total platform income
    totalPayouts: 67500        // Total paid to sellers
  }
}
```

### 2. Seller Analytics
Integrated into existing seller dashboard showing:
- Available payout amount
- Earnings breakdown with fee transparency
- Payout history and status tracking
- Next eligibility date

## Integration Points

### 1. Existing Systems
- **Commission System**: Uses existing `seller.getCurrentCommissionRate()`
- **Purchase Tracking**: Queries existing `Purchase` model for completed sales
- **User Authentication**: Uses existing JWT and role-based auth
- **Email Service**: Integrates with existing Resend email service

### 2. Database Relationships
```javascript
// Payout → Seller
sellerId: { type: ObjectId, ref: 'SellerProfile' }

// Payout → Admin (who approved)
approvedBy: { type: ObjectId, ref: 'User' }

// Payout → Sales (which sales included)
salesIncluded: [{ type: ObjectId, ref: 'Purchase' }]

// Platform Settings → Admin (who updated)
lastUpdatedBy: { type: ObjectId, ref: 'User' }
```

## API Endpoints Summary

### Seller Endpoints
- `GET /seller/payout/dashboard` - Earnings overview
- `GET /seller/payout/history` - Payout history with pagination
- `POST /seller/payout/request` - Submit new payout request  
- `GET /seller/payout/eligible-earnings` - Calculate available amount
- `PUT /seller/payout/method` - Update payout method

### Admin Endpoints
- `GET /admin/platform/settings` - Get current platform settings
- `PUT /admin/platform/settings` - Update platform configuration
- `GET /admin/payouts` - List payout requests with filtering
- `PUT /admin/payouts/:id/approve` - Approve payout request
- `PUT /admin/payouts/:id/reject` - Reject payout request
- `PUT /admin/payouts/:id/processing` - Mark as processing
- `PUT /admin/payouts/:id/completed` - Mark as completed
- `POST /admin/payouts/bulk-approve` - Bulk approve multiple payouts

### Analytics Endpoints
- `GET /analytics/admin/payouts` - Comprehensive payout analytics
- `GET /admin/payouts/analytics` - Direct payout analytics

## Error Handling

### Common Error Scenarios
1. **Insufficient Balance**: `availableForPayout < minimumThreshold`
2. **Pending Request Exists**: One active request per seller
3. **Account On Hold**: New seller hold period not expired  
4. **Invalid Payout Method**: Method not configured or invalid
5. **Processing Failures**: External payment system issues

### Error Response Format
```javascript
{
  "success": false,
  "statusCode": 400,
  "message": "Minimum payout threshold of $50 not met",
  "data": {
    "availableAmount": 35.50,
    "minimumRequired": 50.00,
    "shortfall": 14.50
  }
}
```

## Future Enhancements

### Potential Additions
1. **Multi-Currency Support**: EUR, GBP support beyond USD
2. **Automated Payouts**: Optional automation for trusted sellers
3. **Payout Scheduling**: Recurring monthly/weekly payouts
4. **Tax Document Generation**: 1099 forms for US sellers
5. **Dispute Resolution**: Payout dispute workflow
6. **Mobile Notifications**: Push notifications for status updates

### Performance Optimizations
1. **Caching**: Cache earnings calculations for frequent requests
2. **Batch Processing**: Group email notifications
3. **Database Indexes**: Optimize payout queries
4. **Async Processing**: Background email sending

## Configuration Management

### Environment Variables
```bash
CLIENT_URL=http://localhost:3000          # Frontend URL for email links
RESEND_API_KEY=re_xyz123                  # Email service API key
DATABASE_URL=mongodb://...                 # Database connection
JWT_SECRET=secret123                       # JWT signing secret
```

### Default Platform Settings
```javascript
{
  platformFeePercentage: 10,    // 10% platform fee
  minimumPayoutThreshold: 50,   // $50 minimum
  payoutProcessingTime: 7,      // 7 days processing
  paymentProcessingFee: 0,      // No processing fee
  holdPeriodNewSellers: 14,     // 14 days hold
  maxPayoutAmount: 10000,       // $10K maximum
  currency: "USD"               // US Dollars
}
```

This manual payout system provides complete administrative control while maintaining transparency and a positive user experience for sellers through automated notifications and clear earnings breakdowns.