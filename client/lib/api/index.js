// API barrel export
export { default as apiClient } from './client'
export { authAPI } from './auth'
export { default as sellerAPI } from './seller'
export { adminAPI } from './admin'
export { default as productsAPI } from './products'
export { default as cartAPI } from './cart'
export { default as purchaseAPI } from './purchase'
export { default as promocodeAPI } from './promocode'
export { default as analyticsAPI } from './analytics'
export { default as metadataAPI } from './metadata'
// export { default as workflowAPI } from './workflow'
export { default as payoutAPI } from './payout'

// Default export for backward compatibility with auth attached
import apiClient from './client'
import { authAPI } from './auth'

// Attach auth API to the client for backward compatibility
apiClient.auth = authAPI

export default apiClient
