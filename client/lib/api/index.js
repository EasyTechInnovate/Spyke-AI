// API barrel export
export { default as apiClient } from './client'
export { default as authAPI } from './auth'
export { default as sellerAPI } from './seller'
export { adminAPI } from './admin'
// export { default as productsAPI } from './products'
// export { default as workflowAPI } from './workflow'

// Default export for backward compatibility
import apiClient from './client'
export default apiClient