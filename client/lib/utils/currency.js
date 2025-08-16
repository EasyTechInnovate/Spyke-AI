// Centralized currency utilities with placeholder dynamic rates fetch
// TODO: Integrate real exchange rate API (e.g., exchangerate.host) with caching

const BASE = 'USD'

let cachedRates = null
let lastFetched = 0
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

// Placeholder static rates (relative to USD)
const STATIC_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83,
  AUD: 1.52,
  CAD: 1.36,
  SGD: 1.35,
  AED: 3.67
}

export async function getExchangeRates(force = false) {
  const now = Date.now()
  if (!force && cachedRates && now - lastFetched < CACHE_TTL) return cachedRates
  // For now return static; place real fetch here
  cachedRates = STATIC_RATES
  lastFetched = now
  return cachedRates
}

export function convert(amount, from, to, rates) {
  if (!rates[from] || !rates[to]) return amount
  // normalize to USD base then convert
  const inBase = amount / rates[from]
  return inBase * rates[to]
}

export function formatCurrency(amount, currency, locale = 'en-US') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}