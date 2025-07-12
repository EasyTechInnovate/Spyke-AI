// API barrel export
export { default as apiClient } from './client'
export { authAPI } from './auth'
export { default as sellerAPI } from './seller'
export { adminAPI } from './admin'
// export { default as productsAPI } from './products'
// export { default as workflowAPI } from './workflow'

// Default export for backward compatibility with auth attached
import apiClient from './client'
import { authAPI } from './auth'

// Attach auth API to the client for backward compatibility
apiClient.auth = authAPI

export default apiClient