export function formatLocation(location) {
  if (!location) return ''
  if (typeof location === 'string') return location
  if (typeof location === 'object') {
    if (location.country) return location.country
    if (location.city) return location.city
    if (location.name) return location.name
    if (location.timezone) return location.timezone
    return ''
  }
  return String(location || '')
}

export function safeText(value) {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  // avoid returning objects/arrays for direct rendering
  return ''
}

// New helpers
export function formatNumber(n, options = {}) {
  if (n == null || Number.isNaN(Number(n))) return options.fallback ?? '0'
  const { compact = false, maximumFractionDigits = 0 } = options
  try {
    return new Intl.NumberFormat('en-US', {
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits
    }).format(Number(n))
  } catch (e) {
    return String(n)
  }
}

export function formatRating(rating, options = {}) {
  if (rating == null || Number.isNaN(Number(rating))) return options.fallback ?? 'N/A'
  const { max = 5, precision = 1, withStar = true } = options
  const formatted = Number(rating).toFixed(precision)
  return withStar ? `${formatted}★` : formatted
}

export function mapLevelIconName(iconName) {
  // Keep a small whitelist of expected icon names that map to lucide-react exports.
  const allowed = {
    Trophy: 'Trophy',
    Award: 'Award',
    Shield: 'Shield'
  }
  return allowed[iconName] || 'Trophy'
}