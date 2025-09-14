// Mock payout response emulating GET /admin/payouts
// Includes a variety of statuses and realistic fields

export const mockPayoutResponse = {
  meta: {
    page: 1,
    limit: 25,
    total: 9,
    totalPages: 1,
    generatedAt: new Date().toISOString()
  },
  payouts: [
    {
      id: '675aa1111111111111111111',
      sellerId: '64fa0c111111111111111111',
      sellerName: 'Alice Johnson',
      amount: 240.75,
      currency: 'USD',
      method: 'stripe',
      status: 'pending',
      requestedAt: daysAgo(1),
      updatedAt: daysAgo(1),
      notes: null,
      history: [ { state: 'pending', at: daysAgo(1) } ]
    },
    {
      id: '675aa2222222222222222222',
      sellerId: '64fa0c222222222222222222',
      sellerName: 'Bright Labs LLC',
      amount: 1250.00,
      currency: 'USD',
      method: 'bank',
      status: 'approved',
      requestedAt: daysAgo(3),
      updatedAt: daysAgo(2),
      notes: 'Large monthly withdrawal',
      history: [ { state: 'pending', at: daysAgo(3) }, { state: 'approved', at: daysAgo(2), actor: 'admin:erica' } ]
    },
    {
      id: '675aa3333333333333333333',
      sellerId: '64fa0c333333333333333333',
      sellerName: 'CodeCraft Studio',
      amount: 78.40,
      currency: 'USD',
      method: 'paypal',
      status: 'processing',
      requestedAt: daysAgo(2),
      updatedAt: hoursAgo(5),
      transactionId: 'PP-3829101',
      history: [ { state: 'pending', at: daysAgo(2) }, { state: 'approved', at: daysAgo(2, 2) }, { state: 'processing', at: hoursAgo(5), actor: 'admin:leo' } ]
    },
    {
      id: '675aa4444444444444444444',
      sellerId: '64fa0c444444444444444444',
      sellerName: 'Echo Design',
      amount: 512.19,
      currency: 'USD',
      method: 'wise',
      status: 'hold',
      requestedAt: daysAgo(5),
      updatedAt: daysAgo(1),
      holdReason: 'Account verification pending',
      history: [ { state: 'pending', at: daysAgo(5) }, { state: 'approved', at: daysAgo(4,6) }, { state: 'hold', at: daysAgo(1), reason: 'Account verification pending' } ]
    },
    {
      id: '675aa5555555555555555555',
      sellerId: '64fa0c555555555555555555',
      sellerName: 'GrowthOps',
      amount: 960.00,
      currency: 'USD',
      method: 'stripe',
      status: 'completed',
      requestedAt: daysAgo(7),
      updatedAt: daysAgo(6,20),
      transactionId: 'tr_9k2lma',
      history: [ { state: 'pending', at: daysAgo(7) }, { state: 'approved', at: daysAgo(6, 12) }, { state: 'processing', at: daysAgo(6, 10) }, { state: 'completed', at: daysAgo(6,20) } ]
    },
    {
      id: '675aa6666666666666666666',
      sellerId: '64fa0c666666666666666666',
      sellerName: 'PixelForge',
      amount: 140.55,
      currency: 'USD',
      method: 'paypal',
      status: 'failed',
      requestedAt: daysAgo(4),
      updatedAt: daysAgo(3,18),
      failureReason: 'PayPal email mismatch',
      history: [ { state: 'pending', at: daysAgo(4) }, { state: 'approved', at: daysAgo(4, 12) }, { state: 'processing', at: daysAgo(4,10) }, { state: 'failed', at: daysAgo(3,18), reason: 'PayPal email mismatch' } ]
    },
    {
      id: '675aa7777777777777777777',
      sellerId: '64fa0c777777777777777777',
      sellerName: 'Nova Themes',
      amount: 305.10,
      currency: 'USD',
      method: 'stripe',
      status: 'completed',
      requestedAt: daysAgo(10),
      updatedAt: daysAgo(9,22),
      transactionId: 'tr_r8sj12',
      history: [ { state: 'pending', at: daysAgo(10) }, { state: 'approved', at: daysAgo(9, 16) }, { state: 'processing', at: daysAgo(9,14) }, { state: 'completed', at: daysAgo(9,22) } ]
    },
    {
      id: '675aa8888888888888888888',
      sellerId: '64fa0c888888888888888888',
      sellerName: 'Atlas Digital',
      amount: 430.00,
      currency: 'USD',
      method: 'bank',
      status: 'cancelled',
      requestedAt: daysAgo(8),
      updatedAt: daysAgo(7, 20),
      cancellationReason: 'Seller cancelled request',
      history: [ { state: 'pending', at: daysAgo(8) }, { state: 'cancelled', at: daysAgo(7,20), actor: 'seller:atlas', reason: 'Seller cancelled request' } ]
    },
    {
      id: '675aa9999999999999999999',
      sellerId: '64fa0c999999999999999999',
      sellerName: 'Quantum Tools',
      amount: 189.99,
      currency: 'USD',
      method: 'stripe',
      status: 'approved',
      requestedAt: daysAgo(2),
      updatedAt: daysAgo(1, 5),
      notes: 'Expedited review',
      history: [ { state: 'pending', at: daysAgo(2) }, { state: 'approved', at: daysAgo(1,5), actor: 'admin:maria' } ]
    }
  ]
}

// Utility helpers to generate relative ISO timestamps
function daysAgo(d, minutesOffset = 0) {
  const date = new Date(Date.now() - d * 24 * 60 * 60 * 1000)
  date.setMinutes(date.getMinutes() + minutesOffset)
  return date.toISOString()
}

function hoursAgo(h) {
  const date = new Date(Date.now() - h * 60 * 60 * 1000)
  return date.toISOString()
}

export function cloneMockPayouts() {
  // Return a deep-ish copy so mutations in UI do not change base mock
  return JSON.parse(JSON.stringify(mockPayoutResponse))
}
