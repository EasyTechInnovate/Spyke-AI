export const VERIFICATION_STATUSES = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  COMMISSION_OFFERED: 'commission_offered',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

export const COMMISSION_STATUSES = {
  PENDING: 'pending',
  COUNTER_OFFERED: 'counter_offered',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
}

export const MAX_NEGOTIATION_ROUNDS = 5

export const isVerification = (val) => Object.values(VERIFICATION_STATUSES).includes(val)
export const isCommissionStatus = (val) => Object.values(COMMISSION_STATUSES).includes(val)