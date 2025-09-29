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
export { default as payoutAPI } from './payout'
export { paymentAPI } from './payment'
export { default as categoriesAPI } from './categories'

import apiClient from './client'
import { authAPI } from './auth'

apiClient.auth = authAPI

export default apiClient
