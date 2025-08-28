/**
 * Country code and phone number formatting utilities
 */

// Common country codes mapping
const COUNTRY_CODES = {
  '+1': 'US', // United States/Canada
  '+44': 'UK', // United Kingdom
  '+33': 'FR', // France
  '+49': 'DE', // Germany
  '+39': 'IT', // Italy
  '+34': 'ES', // Spain
  '+31': 'NL', // Netherlands
  '+32': 'BE', // Belgium
  '+41': 'CH', // Switzerland
  '+43': 'AT', // Austria
  '+45': 'DK', // Denmark
  '+46': 'SE', // Sweden
  '+47': 'NO', // Norway
  '+48': 'PL', // Poland
  '+91': 'IN', // India
  '+86': 'CN', // China
  '+81': 'JP', // Japan
  '+82': 'KR', // South Korea
  '+61': 'AU', // Australia
  '+64': 'NZ', // New Zealand
  '+55': 'BR', // Brazil
  '+52': 'MX', // Mexico
  '+7': 'RU',  // Russia
}

/**
 * Extract country code from phone number
 * @param {string} phoneNumber - Phone number with country code
 * @returns {string} - Country code (e.g., '+1', '+44')
 */
export const getCountryCodeFromPhone = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return null
  
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '')
  
  // Check for common country codes (longest first to match correctly)
  const sortedCodes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length)
  
  for (const code of sortedCodes) {
    if (cleaned.startsWith(code)) {
      return code
    }
  }
  
  return null
}

/**
 * Format phone number for display
 * @param {string} phoneNumber - Raw phone number
 * @param {string} countryCode - Country code (optional, will be detected)
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber, countryCode = null) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return phoneNumber
  
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '')
  
  // If no country code provided, try to detect it
  const detectedCode = countryCode || getCountryCodeFromPhone(cleaned)
  
  if (!detectedCode) {
    // Return as-is if we can't detect country code
    return phoneNumber
  }
  
  // Remove country code from the number
  const numberWithoutCode = cleaned.replace(detectedCode, '')
  
  // Format based on country code
  switch (detectedCode) {
    case '+1': // US/Canada format: +1 (XXX) XXX-XXXX
      if (numberWithoutCode.length === 10) {
        return `${detectedCode} (${numberWithoutCode.slice(0, 3)}) ${numberWithoutCode.slice(3, 6)}-${numberWithoutCode.slice(6)}`
      }
      break
      
    case '+44': // UK format: +44 XXXX XXX XXX
      if (numberWithoutCode.length >= 10) {
        return `${detectedCode} ${numberWithoutCode.slice(0, 4)} ${numberWithoutCode.slice(4, 7)} ${numberWithoutCode.slice(7)}`
      }
      break
      
    case '+33': // France format: +33 X XX XX XX XX
      if (numberWithoutCode.length === 9) {
        return `${detectedCode} ${numberWithoutCode.slice(0, 1)} ${numberWithoutCode.slice(1, 3)} ${numberWithoutCode.slice(3, 5)} ${numberWithoutCode.slice(5, 7)} ${numberWithoutCode.slice(7)}`
      }
      break
      
    case '+49': // Germany format: +49 XXX XXXXXXX
      if (numberWithoutCode.length >= 10) {
        return `${detectedCode} ${numberWithoutCode.slice(0, 3)} ${numberWithoutCode.slice(3)}`
      }
      break
      
    case '+91': // India format: +91 XXXXX XXXXX
      if (numberWithoutCode.length === 10) {
        return `${detectedCode} ${numberWithoutCode.slice(0, 5)} ${numberWithoutCode.slice(5)}`
      }
      break
      
    default:
      // Generic format: +XX XXX XXX XXXX
      if (numberWithoutCode.length >= 7) {
        return `${detectedCode} ${numberWithoutCode.slice(0, 3)} ${numberWithoutCode.slice(3, 6)} ${numberWithoutCode.slice(6)}`
      }
  }
  
  // Fallback: just add spaces every 3-4 digits
  if (numberWithoutCode.length > 6) {
    return `${detectedCode} ${numberWithoutCode.slice(0, 3)} ${numberWithoutCode.slice(3, 6)} ${numberWithoutCode.slice(6)}`
  } else if (numberWithoutCode.length > 3) {
    return `${detectedCode} ${numberWithoutCode.slice(0, 3)} ${numberWithoutCode.slice(3)}`
  }
  
  return `${detectedCode} ${numberWithoutCode}`
}

/**
 * Get country name from phone number
 * @param {string} phoneNumber - Phone number with country code
 * @returns {string} - Country code abbreviation (e.g., 'US', 'UK')
 */
export const getCountryFromPhone = (phoneNumber) => {
  const countryCode = getCountryCodeFromPhone(phoneNumber)
  return countryCode ? COUNTRY_CODES[countryCode] : null
}

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
export const isValidPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return false
  
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '')
  
  // Must start with + and have country code
  if (!cleaned.startsWith('+')) return false
  
  // Must have at least 8 digits total (country code + number)
  if (cleaned.length < 8) return false
  
  // Must have a recognized country code
  const countryCode = getCountryCodeFromPhone(cleaned)
  return countryCode !== null
}

export default {
  getCountryCodeFromPhone,
  formatPhoneNumber,
  getCountryFromPhone,
  isValidPhoneNumber,
  COUNTRY_CODES
}