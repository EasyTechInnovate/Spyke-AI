import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import Cart from '../../model/cart.model.js'
import Purchase from '../../model/purchase.model.js'
import Product from '../../model/product.model.js'
import sellerProfileModel from '../../model/seller.profile.model.js'
import Promocode from '../../model/promocode.model.js'
import { notificationService } from '../../util/notification.js'
import { EProductStatusNew, EUserRole } from '../../constant/application.js'

export default {
    self: (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SERVICE('Purchase'))
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getCart: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const cart = await Cart.getOrCreateCart(authenticatedUser.id)
            await cart.populate('items.productId', 'title slug thumbnail price type category status')

            const validItems = cart.items.filter(item => 
                item.productId && item.productId.status === EProductStatusNew.PUBLISHED
            )

            if (validItems.length !== cart.items.length) {
                cart.items = validItems
                await cart.calculateTotals()
                await cart.save()
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, cart)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    addToCart: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { productId } = req.body

            const product = await Product.findById(productId).populate('sellerId')
            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            if (product.status !== EProductStatusNew.PUBLISHED) {
                return httpError(next, new Error(responseMessage.PRODUCT.PRODUCT_NOT_PUBLISHED), req, 400)
            }

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (sellerProfile && product.sellerId._id.toString() === sellerProfile._id.toString()) {
                return httpError(next, new Error(responseMessage.PRODUCT.CANNOT_ADD_OWN_PRODUCT_TO_CART), req, 400)
            }

            const existingPurchase = await Purchase.hasPurchased(authenticatedUser.id, productId)
            if (existingPurchase) {
                return httpError(next, new Error(responseMessage.PRODUCT.ALREADY_PURCHASED), req, 400)
            }

            const cart = await Cart.getOrCreateCart(authenticatedUser.id)
            
            try {
                await cart.addItem(productId)
                await cart.populate('items.productId', 'title slug thumbnail price type category')

                httpResponse(req, res, 200, responseMessage.CART.ITEM_ADDED, {
                    cart,
                    addedProduct: {
                        _id: product._id,
                        title: product.title,
                        price: product.price
                    }
                })
            } catch (error) {
                if (error.message === 'Product already in cart') {
                    return httpError(next, new Error(responseMessage.CART.ITEM_ALREADY_IN_CART), req, 400)
                }
                throw error
            }
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    removeFromCart: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { productId } = req.params

            const cart = await Cart.getOrCreateCart(authenticatedUser.id)
            await cart.removeItem(productId)
            await cart.populate('items.productId', 'title slug thumbnail price type category')

            httpResponse(req, res, 200, responseMessage.CART.ITEM_REMOVED, cart)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    clearCart: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const cart = await Cart.getOrCreateCart(authenticatedUser.id)
            await cart.clearCart()

            httpResponse(req, res, 200, responseMessage.CART.CLEARED, cart)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    applyPromocode: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { code } = req.body

            const cart = await Cart.getOrCreateCart(authenticatedUser.id)
            
            if (cart.items.length === 0) {
                return httpError(next, new Error(responseMessage.CART.EMPTY_CART), req, 400)
            }

            const promocode = await Promocode.findValidPromocode(code, authenticatedUser.id)
            if (!promocode) {
                return httpError(next, new Error(responseMessage.PROMOCODE.INVALID), req, 400)
            }

            await cart.populate('items.productId', 'title slug thumbnail price type category industry')

            const productIds = cart.items.map(item => item.productId._id)
            const categories = [...new Set(cart.items.map(item => item.productId.category))]
            const industries = [...new Set(cart.items.map(item => item.productId.industry))]

            if (!promocode.isApplicableToProducts(productIds)) {
                return httpError(next, new Error(responseMessage.PROMOCODE.NOT_APPLICABLE_TO_PRODUCTS), req, 400)
            }

            if (!promocode.isApplicableToCategories(categories)) {
                return httpError(next, new Error(responseMessage.PROMOCODE.NOT_APPLICABLE_TO_CATEGORIES), req, 400)
            }

            await cart.calculateTotals()

            if (cart.totalAmount < promocode.minimumOrderAmount) {
                return httpError(next, new Error(responseMessage.PROMOCODE.MINIMUM_ORDER_NOT_MET), req, 400)
            }

            const discountAmount = promocode.calculateDiscount(cart.totalAmount)
            
            await cart.applyPromocodeWithAmount(
                promocode.code,
                discountAmount,
                promocode.discountType === 'percentage' ? promocode.discountValue : null
            )

            httpResponse(req, res, 200, responseMessage.PROMOCODE.APPLIED, cart)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    removePromocode: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const cart = await Cart.getOrCreateCart(authenticatedUser.id)
            await cart.removePromocode()
            await cart.populate('items.productId', 'title slug thumbnail price type category')

            httpResponse(req, res, 200, responseMessage.PROMOCODE.REMOVED, cart)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    createPurchase: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { paymentMethod, paymentReference } = req.body

            const cart = await Cart.getOrCreateCart(authenticatedUser.id)
            await cart.populate('items.productId')

            if (cart.items.length === 0) {
                return httpError(next, new Error(responseMessage.CART.EMPTY_CART), req, 400)
            }

            const purchaseItems = []
            for (const item of cart.items) {
                if (!item.productId || item.productId.status !== EProductStatusNew.PUBLISHED) {
                    continue
                }

                const sellerProfile = await sellerProfileModel.findById(item.productId.sellerId)
                purchaseItems.push({
                    productId: item.productId._id,
                    sellerId: item.productId.sellerId,
                    price: item.productId.price
                })
            }

            if (purchaseItems.length === 0) {
                return httpError(next, new Error(responseMessage.CART.NO_VALID_ITEMS), req, 400)
            }

            const purchase = new Purchase({
                userId: authenticatedUser.id,
                items: purchaseItems,
                totalAmount: cart.totalAmount,
                discountAmount: cart.appliedPromocode?.discountAmount || 0,
                finalAmount: cart.finalAmount,
                appliedPromocode: cart.appliedPromocode,
                paymentMethod: paymentMethod || 'manual',
                paymentReference: paymentReference || 'manual-payment',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            })

            if (cart.finalAmount === 0) {
                await purchase.grantAccess()
            } else {
                await purchase.save()
            }

            if (cart.appliedPromocode && cart.appliedPromocode.code) {
                const promocode = await Promocode.findOne({ code: cart.appliedPromocode.code })
                if (promocode) {
                    await promocode.recordUsage(
                        authenticatedUser.id, 
                        purchase._id, 
                        cart.appliedPromocode.discountAmount
                    )
                }
            }

            for (const item of purchaseItems) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { sales: 1 } })
                
                const seller = await sellerProfileModel.findById(item.sellerId)
                if (seller) {
                    seller.updateStats('totalSales', 1)
                    await seller.save()

                    await notificationService.sendToUser(
                        seller.userId,
                        'New Sale!',
                        `Your product has been ${cart.finalAmount === 0 ? 'downloaded' : 'purchased'}.`,
                        'success'
                    )
                }
            }

            await cart.clearCart()

            await notificationService.sendToUser(
                authenticatedUser.id,
                cart.finalAmount === 0 ? 'Free Products Added!' : 'Purchase Successful!',
                `${cart.finalAmount === 0 ? 'You now have access to your selected products!' : 'Thank you for your purchase. Access will be granted once payment is confirmed.'}`,
                'success'
            )

            const responseData = {
                purchaseId: purchase._id,
                totalItems: purchaseItems.length,
                totalAmount: purchase.totalAmount,
                discountAmount: purchase.discountAmount,
                finalAmount: purchase.finalAmount,
                status: purchase.orderStatus,
                paymentStatus: purchase.paymentStatus,
                purchaseDate: purchase.purchaseDate
            }

            httpResponse(req, res, 201, 
                cart.finalAmount === 0 ? responseMessage.PRODUCT.FREE_PRODUCT_ACCESSED : responseMessage.PRODUCT.PURCHASE_SUCCESSFUL, 
                responseData
            )
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getUserPurchases: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { page = 1, limit = 10, type } = req.query

            const result = await Purchase.getUserPurchases(authenticatedUser.id, {
                page: parseInt(page),
                limit: parseInt(limit),
                type
            })

            httpResponse(req, res, 200, responseMessage.SUCCESS, result)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getUserPurchasesByType: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const result = await Purchase.getUserPurchasesByType(authenticatedUser.id)

            const responseData = {
                summary: {
                    totalPurchases: Object.values(result).reduce((sum, category) => sum + category.count, 0),
                    totalByType: {
                        prompts: result.prompts.count,
                        automations: result.automations.count,
                        agents: result.agents.count,
                        bundles: result.bundles.count
                    }
                },
                categories: result
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getProductAccess: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params

            const product = await Product.findById(id)
            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            const hasPurchased = await Purchase.hasPurchased(authenticatedUser.id, id)
            
            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            const isOwner = sellerProfile && product.sellerId.toString() === sellerProfile._id.toString()

            const canAccess = hasPurchased || isOwner || authenticatedUser.roles.includes(EUserRole.ADMIN)

            if (!canAccess) {
                return httpError(next, new Error(responseMessage.PRODUCT.ACCESS_DENIED), req, 403)
            }

            const premiumContent = product.premiumContent || {}
            
            const responseData = {
                productId: product._id,
                productTitle: product.title,
                accessType: isOwner ? 'owner' : hasPurchased ? 'purchased' : 'admin',
                premiumContent
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}