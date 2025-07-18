import { toast as sonnerToast } from 'sonner'

/**
 * Enhanced toast utility with better UX and consistent styling
 * Built on top of Sonner with custom enhancements
 */

const DEFAULT_DURATION = 5000 // 5 seconds
const ERROR_DURATION = 8000 // 8 seconds for errors
const SUCCESS_DURATION = 4000 // 4 seconds for success

/**
 * Enhanced success toast
 * @param {string} message - The message to display
 * @param {Object} options - Additional options
 */
export const toastSuccess = (message, options = {}) => {
  return sonnerToast.success(message, {
    duration: SUCCESS_DURATION,
    ...options
  })
}

/**
 * Enhanced error toast
 * @param {string} message - The message to display  
 * @param {Object} options - Additional options
 */
export const toastError = (message, options = {}) => {
  return sonnerToast.error(message, {
    duration: ERROR_DURATION,
    ...options
  })
}

/**
 * Enhanced info toast
 * @param {string} message - The message to display
 * @param {Object} options - Additional options
 */
export const toastInfo = (message, options = {}) => {
  return sonnerToast.info(message, {
    duration: DEFAULT_DURATION,
    ...options
  })
}

/**
 * Enhanced warning toast
 * @param {string} message - The message to display
 * @param {Object} options - Additional options
 */
export const toastWarning = (message, options = {}) => {
  return sonnerToast.warning(message, {
    duration: DEFAULT_DURATION,
    ...options
  })
}

/**
 * Loading toast that can be updated
 * @param {string} message - The loading message
 * @param {Object} options - Additional options
 */
export const toastLoading = (message, options = {}) => {
  return sonnerToast.loading(message, {
    duration: Infinity, // Loading toasts should persist until dismissed
    ...options
  })
}

/**
 * Promise toast that automatically handles states
 * @param {Promise} promise - The promise to track
 * @param {Object} messages - Messages for different states
 */
export const toastPromise = (promise, messages = {}) => {
  const defaultMessages = {
    loading: 'Processing...',
    success: 'Success!',
    error: 'Something went wrong'
  }
  
  return sonnerToast.promise(promise, {
    loading: messages.loading || defaultMessages.loading,
    success: (data) => {
      return messages.success || defaultMessages.success
    },
    error: (error) => {
      return messages.error || error?.message || defaultMessages.error
    }
  })
}

/**
 * Custom toast with full control
 * @param {string} message - The message to display
 * @param {Object} options - Toast options
 */
export const toastCustom = (message, options = {}) => {
  return sonnerToast(message, {
    duration: DEFAULT_DURATION,
    ...options
  })
}

/**
 * Dismiss a specific toast
 * @param {string|number} toastId - The toast ID to dismiss
 */
export const toastDismiss = (toastId) => {
  return sonnerToast.dismiss(toastId)
}

/**
 * Dismiss all toasts
 */
export const toastDismissAll = () => {
  return sonnerToast.dismiss()
}

/**
 * Authentication related toasts
 */
export const authToasts = {
  loginSuccess: (userName) => toastSuccess(`Welcome back${userName ? `, ${userName}` : ''}!`),
  logoutSuccess: () => toastSuccess('Logged out successfully'),
  loginError: (error) => toastError(error || 'Login failed. Please check your credentials.'),
  signupSuccess: () => toastSuccess('Welcome to SpykeAI! Check your email to verify your account.'),
  signupError: (error) => toastError(error || 'Registration failed. Please try again.'),
  verificationSent: () => toastInfo('Verification email sent. Please check your inbox.'),
  passwordResetSent: () => toastInfo('Password reset link sent to your email.'),
  sessionExpired: () => toastWarning('Your session has expired. Please log in again.')
}

/**
 * Seller related toasts
 */
export const sellerToasts = {
  profileCreated: () => toastSuccess('🎉 Welcome to our seller community! Your profile has been created.'),
  profileUpdated: () => toastSuccess('Profile updated successfully!'),
  profileError: (error) => toastError(error || 'Failed to update profile. Please try again.'),
  documentUploaded: () => toastSuccess('Document uploaded successfully!'),
  documentError: (error) => toastError(error || 'Failed to upload document. Please try again.'),
  verificationSubmitted: () => toastSuccess('Verification documents submitted for review!'),
  approved: () => toastSuccess('🎉 Congratulations! Your seller account has been approved.'),
  rejected: (reason) => toastError(`Your seller application was rejected. ${reason || 'Please contact support for details.'}`)
}

/**
 * General operation toasts
 */
export const operationToasts = {
  saved: () => toastSuccess('Changes saved successfully!'),
  deleted: () => toastSuccess('Deleted successfully!'),
  copied: () => toastSuccess('Copied to clipboard!'),
  uploaded: () => toastSuccess('File uploaded successfully!'),
  downloadStarted: () => toastInfo('Download started...'),
  networkError: () => toastError('Network error. Please check your connection and try again.'),
  genericError: (error) => toastError(error || 'Something went wrong. Please try again.')
}

/**
 * Search related toasts
 */
export const searchToasts = {
  noResults: (query) => toastInfo(`No results found for "${query}"`),
  voiceNotSupported: () => toastError('Voice search is not supported in your browser'),
  voiceListening: () => toastInfo('Listening... Speak now'),
  voiceSuccess: (transcript) => toastSuccess(`Searching for: "${transcript}"`),
  voiceNoSpeech: () => toastError('No speech detected. Please try again.'),
  voiceAccessDenied: () => toastError('Microphone access denied.'),
  voiceError: (error) => toastError(`Voice search error: ${error}`),
  searchError: () => toastError('Search failed. Please try again.')
}

/**
 * Form validation toasts
 */
export const validationToasts = {
  required: (field) => toastError(`${field} is required`),
  invalid: (field) => toastError(`Please enter a valid ${field}`),
  tooShort: (field, min) => toastError(`${field} must be at least ${min} characters`),
  tooLong: (field, max) => toastError(`${field} must be less than ${max} characters`),
  maxItems: (field, max) => toastError(`Maximum ${max} ${field} allowed`)
}

// Default export provides the basic toast functions
const toastUtils = {
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
  warning: toastWarning,
  loading: toastLoading,
  promise: toastPromise,
  custom: toastCustom,
  dismiss: toastDismiss,
  dismissAll: toastDismissAll,
  
  // Grouped toasts for specific features
  auth: authToasts,
  seller: sellerToasts,
  operation: operationToasts,
  search: searchToasts,
  validation: validationToasts
}

export default toastUtils