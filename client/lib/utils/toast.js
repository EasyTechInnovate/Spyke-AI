// Deprecated: Toast utilities - replaced with inline notifications
// This file is kept for compatibility but should not be used in new code
// Use InlineNotification component and showMessage function instead


// Legacy compatibility - these functions now do nothing
export const toastSuccess = (message, options = {}) => {
    console.log('SUCCESS:', message)
    return null
}

export const toastError = (message, options = {}) => {
    console.error('ERROR:', message)
    return null
}

export const toastInfo = (message, options = {}) => {
    console.log('INFO:', message)
    return null
}

export const toastWarning = (message, options = {}) => {
    console.warn('WARNING:', message)
    return null
}

export const toastLoading = (message, options = {}) => {
    console.log('LOADING:', message)
    return null
}

export const toastPromise = (promise, messages = {}) => {
    console.log('PROMISE:', messages)
    return promise
}

export const toastCustom = (message, options = {}) => {
    console.log('CUSTOM:', message)
    return null
}

export const toastDismiss = (toastId) => {
    console.log('DISMISS:', toastId)
    return null
}

export const toastDismissAll = () => {
    console.log('DISMISS ALL')
    return null
}

// Legacy toast groups - now just console logging
export const authToasts = {
    loginSuccess: (userName) => console.log('LOGIN SUCCESS:', userName),
    logoutSuccess: () => console.log('LOGOUT SUCCESS'),
    loginError: (error) => console.error('LOGIN ERROR:', error),
    signupSuccess: () => console.log('SIGNUP SUCCESS'),
    signupError: (error) => console.error('SIGNUP ERROR:', error),
    verificationSent: () => console.log('VERIFICATION SENT'),
    passwordResetSent: () => console.log('PASSWORD RESET SENT'),
    sessionExpired: () => console.warn('SESSION EXPIRED')
}

export const sellerToasts = {
    productCreated: () => console.log('PRODUCT CREATED'),
    productUpdated: () => console.log('PRODUCT UPDATED'),
    productError: (error) => console.error('PRODUCT ERROR:', error),
    profileCreated: () => console.log('PROFILE CREATED'),
    profileUpdated: () => console.log('PROFILE UPDATED'),
    profileError: (error) => console.error('PROFILE ERROR:', error),
    documentUploaded: () => console.log('DOCUMENT UPLOADED'),
    documentError: (error) => console.error('DOCUMENT ERROR:', error),
    verificationSubmitted: () => console.log('VERIFICATION SUBMITTED'),
    approved: () => console.log('APPROVED'),
    rejected: (reason) => console.error('REJECTED:', reason)
}

export const operationToasts = {
    saved: () => console.log('SAVED'),
    deleted: () => console.log('DELETED'),
    copied: () => console.log('COPIED'),
    uploaded: () => console.log('UPLOADED'),
    downloadStarted: () => console.log('DOWNLOAD STARTED'),
    networkError: () => console.error('NETWORK ERROR'),
    genericError: (error) => console.error('GENERIC ERROR:', error)
}

export const searchToasts = {
    noResults: (query) => console.log('NO RESULTS:', query),
    voiceNotSupported: () => console.error('VOICE NOT SUPPORTED'),
    voiceListening: () => console.log('VOICE LISTENING'),
    voiceSuccess: (transcript) => console.log('VOICE SUCCESS:', transcript),
    voiceNoSpeech: () => console.error('VOICE NO SPEECH'),
    voiceAccessDenied: () => console.error('VOICE ACCESS DENIED'),
    voiceError: (error) => console.error('VOICE ERROR:', error),
    searchError: () => console.error('SEARCH ERROR')
}

export const validationToasts = {
    required: (field) => console.error('REQUIRED:', field),
    invalid: (field) => console.error('INVALID:', field),
    tooShort: (field, min) => console.error('TOO SHORT:', field, min),
    tooLong: (field, max) => console.error('TOO LONG:', field, max),
    maxItems: (field, max) => console.error('MAX ITEMS:', field, max)
}

// Default export for backwards compatibility
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
    
    // Grouped toasts
    auth: authToasts,
    seller: sellerToasts,
    operation: operationToasts,
    search: searchToasts,
    validation: validationToasts
}

export default toastUtils