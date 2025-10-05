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
import stripeService from '../../service/stripe.service.js'

const purchaseControllerExport = {
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

            // Use safe population including sellerId and populate seller information
            await cart.populate({
                path: 'items.productId',
                select: 'title slug thumbnail price type status sellerId',
                populate: {
                    path: 'sellerId',
                    model: 'SellerProfile',
                    select: 'fullName email stats.averageRating'
                }
            })

            const validItems = cart.items.filter((item) => item.productId && item.productId.status === EProductStatusNew.PUBLISHED)

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
                // Safe population including seller information
                await cart.populate({
                    path: 'items.productId',
                    select: 'title slug thumbnail price type sellerId',
                    populate: {
                        path: 'sellerId',
                        model: 'SellerProfile',
                        select: 'fullName email stats.averageRating'
                    }
                })

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
            // Safe population including seller information
            await cart.populate({
                path: 'items.productId',
                select: 'title slug thumbnail price type sellerId',
                populate: {
                    path: 'sellerId',
                    model: 'SellerProfile',
                    select: 'fullName email stats.averageRating'
                }
            })

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

            // First populate without category/industry to get basic product data
            await cart.populate('items.productId', 'title slug thumbnail price type')

            const productIds = cart.items.map((item) => item.productId._id)

            // For category/industry checking, fetch them separately to avoid casting errors
            const products = await Product.find({ _id: { $in: productIds } })
                .select('category industry')
                .lean()
            const categories = [...new Set(products.map((p) => p.category).filter(Boolean))]
            const industries = [...new Set(products.map((p) => p.industry).filter(Boolean))]

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
            // Safe population without category/industry fields
            await cart.populate('items.productId', 'title slug thumbnail price type')

            httpResponse(req, res, 200, responseMessage.PROMOCODE.REMOVED, cart)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    createPaymentIntent: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const cart = await Cart.getOrCreateCart(authenticatedUser.id)
            // Safe population without category field
            await cart.populate('items.productId', 'title price type')

            if (cart.items.length === 0) {
                return httpError(next, new Error(responseMessage.CART.EMPTY_CART), req, 400)
            }

            await cart.calculateTotals()

            if (cart.finalAmount <= 0) {
                return httpError(next, new Error('No payment required for free items'), req, 400)
            }

            const paymentIntentData = await stripeService.createPaymentIntent(cart.finalAmount, {
                userId: authenticatedUser.id,
                cartId: cart._id.toString(),
                userEmail: authenticatedUser.emailAddress || authenticatedUser.email,
                itemCount: cart.items.length,
                totalAmount: cart.totalAmount,
                discountAmount: cart.appliedPromocode?.discountAmount || 0,
                promocodeCode: cart.appliedPromocode?.code || null
            })

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                ...paymentIntentData,
                cartSummary: {
                    totalAmount: cart.totalAmount,
                    discountAmount: cart.appliedPromocode?.discountAmount || 0,
                    finalAmount: cart.finalAmount,
                    itemCount: cart.items.length,
                    appliedPromocode: cart.appliedPromocode
                }
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    createCheckoutSession: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { successUrl, cancelUrl } = req.body

            if (!successUrl || !cancelUrl) {
                return httpError(next, new Error('Success URL and Cancel URL are required'), req, 400)
            }

            const cart = await Cart.findOne({ userId: authenticatedUser.id }).populate('items.productId')

            if (!cart || cart.items.length === 0) {
                return httpError(next, new Error(responseMessage.CART.EMPTY_CART), req, 400)
            }

            await cart.calculateTotals()

            if (cart.finalAmount <= 0) {
                return httpError(next, new Error('No payment required for free items'), req, 400)
            }

            const checkoutSessionData = await stripeService.createCheckoutSession(
                cart.finalAmount,
                {
                    userId: authenticatedUser.id,
                    cartId: cart._id.toString(),
                    userEmail: authenticatedUser.emailAddress || authenticatedUser.email,
                    itemCount: cart.items.length,
                    totalAmount: cart.totalAmount,
                    discountAmount: cart.appliedPromocode?.discountAmount || 0,
                    promocodeCode: cart.appliedPromocode?.code || null
                },
                successUrl,
                cancelUrl
            )

            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                ...checkoutSessionData,
                cartSummary: {
                    totalAmount: cart.totalAmount,
                    discountAmount: cart.appliedPromocode?.discountAmount || 0,
                    finalAmount: cart.finalAmount,
                    itemCount: cart.items.length,
                    appliedPromocode: cart.appliedPromocode
                }
            })
        } catch (err) {
            return httpError(next, err, req, 500)
        }
    },

    confirmCheckoutSession: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { sessionId } = req.body
            
            if (!sessionId) return httpError(next, new Error('Session ID is required'), req, 400)

            // Retrieve checkout session
            let session
            try {
                session = await stripeService.retrieveCheckoutSession(sessionId)
            } catch (err) {
                return httpError(next, new Error('Unable to retrieve checkout session'), req, 400)
            }
            if (!session) return httpError(next, new Error('Invalid checkout session'), req, 400)
            if (!stripeService.isCheckoutSessionSuccessful(session)) {
                return httpError(next, new Error('Checkout session not completed'), req, 400)
            }
            if (session.metadata?.userId !== authenticatedUser.id) {
                return httpError(next, new Error('Session does not belong to user'), req, 403)
            }

            // Prefer payment intent id when available (stable unique reference), fallback to session id
            let paymentIntentId = null
            if (session.payment_intent) {
                try {
                    const pi = await stripeService.retrievePaymentIntent(session.payment_intent)
                    if (pi && stripeService.isPaymentSuccessful(pi) && pi.metadata?.userId === authenticatedUser.id) {
                        paymentIntentId = pi.id
                    }
                } catch (e) {
                    // Ignore error, will fall back to session id
                }
            }
            const paymentReference = paymentIntentId || sessionId

            // Return existing purchase if already created (idempotent)
            const existing = await Purchase.findOne({ paymentReference, userId: authenticatedUser.id }).populate('items.productId', 'title price type thumbnail')
            if (existing) {
                return httpResponse(req, res, 200, responseMessage.PRODUCT.PURCHASE_SUCCESSFUL, {
                    purchaseId: existing._id,
                    totalItems: existing.items.length,
                    totalAmount: existing.totalAmount,
                    discountAmount: existing.discountAmount,
                    finalAmount: existing.finalAmount,
                    status: existing.orderStatus,
                    paymentStatus: existing.paymentStatus,
                    purchaseDate: existing.purchaseDate,
                    paymentMethod: existing.paymentMethod,
                    appliedPromocode: existing.appliedPromocode,
                    items: existing.items.map(i => ({
                        productId: i.productId?._id || i.productId,
                        title: i.productId?.title,
                        price: i.productId?.price || i.price,
                        type: i.productId?.type,
                        thumbnail: i.productId?.thumbnail
                    }))
                })
            }

            // Build purchase from current cart
            const cart = await Cart.getOrCreateCart(authenticatedUser.id)
            await cart.populate('items.productId', 'title price type status sellerId thumbnail')
            
            if (!cart.items.length) {
                return httpError(next, new Error(responseMessage.CART.EMPTY_CART), req, 400)
            }

            const purchaseItems = cart.items
                .filter(it => it.productId && it.productId.status === EProductStatusNew.PUBLISHED)
                .map(it => ({ productId: it.productId._id, sellerId: it.productId.sellerId, price: it.productId.price }))
            
            if (!purchaseItems.length) return httpError(next, new Error(responseMessage.CART.NO_VALID_ITEMS), req, 400)

            // Store cart item details BEFORE clearing cart
            const cartItemsForResponse = cart.items.map(i => ({
                productId: i.productId._id,
                title: i.productId.title,
                price: i.productId.price,
                type: i.productId.type,
                thumbnail: i.productId.thumbnail
            }))

            let purchase
            try {
                purchase = await Purchase.create({
                    userId: authenticatedUser.id,
                    items: purchaseItems,
                    totalAmount: cart.totalAmount,
                    discountAmount: cart.appliedPromocode?.discountAmount || 0,
                    finalAmount: cart.finalAmount,
                    appliedPromocode: cart.appliedPromocode,
                    paymentMethod: 'stripe_checkout',
                    paymentReference,
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                })
            } catch (e) {
                if (e.code === 11000) {
                    const dup = await Purchase.findOne({ paymentReference, userId: authenticatedUser.id }).populate('items.productId', 'title price type thumbnail')
                    if (dup) {
                        return httpResponse(req, res, 200, responseMessage.PRODUCT.PURCHASE_SUCCESSFUL, {
                            purchaseId: dup._id,
                            totalItems: dup.items.length,
                            totalAmount: dup.totalAmount,
                            discountAmount: dup.discountAmount,
                            finalAmount: dup.finalAmount,
                            status: dup.orderStatus,
                            paymentStatus: dup.paymentStatus,
                            purchaseDate: dup.purchaseDate,
                            paymentMethod: dup.paymentMethod,
                            appliedPromocode: dup.appliedPromocode,
                            items: dup.items.map(i => ({
                                productId: i.productId?._id || i.productId,
                                title: i.productId?.title,
                                price: i.productId?.price || i.price,
                                type: i.productId?.type,
                                thumbnail: i.productId?.thumbnail
                            }))
                        })
                    }
                }
                throw e
            }

            await purchase.grantAccess()

            // Promo usage
            if (cart.appliedPromocode?.code) {
                try {
                    const promocode = await Promocode.findOne({ code: cart.appliedPromocode.code })
                    if (promocode) await promocode.recordUsage(authenticatedUser.id, purchase._id, cart.appliedPromocode.discountAmount)
                } catch (e) {
                    // Ignore promo update errors
                }
            }
            // Update product sales & notify sellers (best effort)
            try {
                for (const it of purchaseItems) {
                    await Product.findByIdAndUpdate(it.productId, { $inc: { sales: 1 } })
                    const seller = await sellerProfileModel.findById(it.sellerId)
                    if (seller) {
                        seller.updateStats('totalSales', 1)
                        await seller.save()
                        await notificationService.sendToUser(seller.userId, 'New Sale!', 'Your product has been purchased.', 'success')
                    }
                }
            } catch (e) {
                // Ignore seller update errors
            }
            // Clear cart (ignore errors)
            try { 
                await cart.clearCart()
            } catch (e) {
                // Ignore cart clear errors
            }
            // Notify buyer (ignore errors)
            try { 
                await notificationService.sendToUser(authenticatedUser.id, 'Purchase Successful!', 'Access granted.', 'success')
            } catch (e) {
                // Ignore notification errors
            }

            const responseData = {
                purchaseId: purchase._id,
                totalItems: purchaseItems.length,
                totalAmount: purchase.totalAmount,
                discountAmount: purchase.discountAmount,
                finalAmount: purchase.finalAmount,
                status: purchase.orderStatus,
                paymentStatus: purchase.paymentStatus,
                purchaseDate: purchase.purchaseDate,
                paymentMethod: purchase.paymentMethod,
                appliedPromocode: purchase.appliedPromocode,
                items: cartItemsForResponse
            }
            
            return httpResponse(req, res, 200, responseMessage.PRODUCT.PURCHASE_SUCCESSFUL, responseData)
        } catch (err) {
            return httpError(next, err, req, 500)
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

            // Duplicate prevention for manual / non-stripe flows
            const productIds = cart.items.map(i => i.productId && i.productId._id?.toString()).filter(Boolean).sort()
            const recentSimilarPurchase = await Purchase.findOne({
                userId: authenticatedUser.id,
                paymentMethod: paymentMethod || 'manual',
                finalAmount: cart.finalAmount,
                createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // last 5 minutes
                'items.productId': { $all: productIds }
            })

            if (recentSimilarPurchase) {
                return httpResponse(req, res, 200, 'Duplicate purchase prevented - returning existing order', {
                    purchaseId: recentSimilarPurchase._id,
                    totalItems: recentSimilarPurchase.items.length,
                    totalAmount: recentSimilarPurchase.totalAmount,
                    discountAmount: recentSimilarPurchase.discountAmount,
                    finalAmount: recentSimilarPurchase.finalAmount,
                    status: recentSimilarPurchase.orderStatus,
                    paymentStatus: recentSimilarPurchase.paymentStatus,
                    purchaseDate: recentSimilarPurchase.purchaseDate
                })
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

            // Safer dynamic reference to avoid identical hard-coded paymentReference duplicates
            const safeReference = paymentReference && paymentReference !== 'manual-payment'
                ? paymentReference
                : `manual-${Date.now()}-${Math.random().toString(36).slice(2,8)}`

            const purchase = new Purchase({
                userId: authenticatedUser.id,
                items: purchaseItems,
                totalAmount: cart.totalAmount,
                discountAmount: cart.appliedPromocode?.discountAmount || 0,
                finalAmount: cart.finalAmount,
                appliedPromocode: cart.appliedPromocode,
                paymentMethod: paymentMethod || 'manual',
                paymentReference: safeReference,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            })

            if (cart.finalAmount === 0) {
                await purchase.grantAccess()
            } else {
                try {
                    await purchase.save()
                } catch (e) {
                    if (e.code === 11000 && e.keyPattern?.paymentReference) {
                        const existing = await Purchase.findOne({ paymentReference: safeReference })
                        if (existing) {
                            return httpResponse(req, res, 200, 'Duplicate prevented - existing purchase returned', {
                                purchaseId: existing._id,
                                totalItems: existing.items.length,
                                totalAmount: existing.totalAmount,
                                discountAmount: existing.discountAmount,
                                finalAmount: existing.finalAmount,
                                status: existing.orderStatus,
                                paymentStatus: existing.paymentStatus,
                                purchaseDate: existing.purchaseDate
                            })
                        }
                    }
                    throw e
                }
            }

            if (cart.appliedPromocode && cart.appliedPromocode.code) {
                const promocode = await Promocode.findOne({ code: cart.appliedPromocode.code })
                if (promocode) {
                    await promocode.recordUsage(authenticatedUser.id, purchase._id, cart.appliedPromocode.discountAmount)
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

            httpResponse(
                req,
                res,
                201,
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

            const result = await Purchase.getUserPurchases(authenticatedUser._id, {
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

            const result = await Purchase.getUserPurchasesByType(authenticatedUser._id)

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
    },

    completePayment: async (req, res, next) => {
        try {
            const { purchaseId } = req.body

            if (!purchaseId) {
                return httpError(next, new Error('Purchase ID is required'), req, 400)
            }

            const purchase = await Purchase.findById(purchaseId).populate('items.productId', 'title type').populate('userId', 'emailAddress name')

            if (!purchase) {
                return httpError(next, new Error('Purchase not found'), req, 404)
            }

            if (purchase.paymentStatus === 'completed') {
                return httpError(next, new Error('Payment already completed'), req, 409)
            }

            await purchase.grantAccess()
            purchase.transactionId = `txn-${Date.now()}`
            purchase.completedAt = new Date()

            for (const item of purchase.items) {
                await Product.findByIdAndUpdate(item.productId._id, {
                    $inc: { sales: 1 },
                    $set: { updatedAt: new Date() }
                })

                const seller = await sellerProfileModel.findById(item.sellerId)
                if (seller) {
                    seller.stats.totalSales += 1
                    seller.stats.totalEarnings += item.price
                    await seller.save()

                    await notificationService.sendToUser(
                        seller.userId,
                        'New Sale! 💰',
                        `Your product "${item.productId.title}" was purchased for $${item.price}.`,
                        'success'
                    )
                }
            }

            await notificationService.sendToUser(
                purchase.userId._id || purchase.userId,
                'Purchase Completed!',
                `Your payment has been processed successfully. You now have access to ${purchase.items.length} product(s).`,
                'success'
            )

            const responseData = {
                purchaseId: purchase._id,
                orderStatus: purchase.orderStatus,
                paymentStatus: purchase.paymentStatus,
                transactionId: purchase.transactionId,
                completedAt: purchase.completedAt,
                totalItems: purchase.items.length,
                finalAmount: purchase.finalAmount,
                accessGranted: true,
                products: purchase.items.map((item) => ({
                    productId: item.productId._id,
                    title: item.productId.title,
                    type: item.productId.type,
                    accessGranted: item.accessGranted,
                    accessGrantedAt: item.accessGrantedAt
                }))
            }

            httpResponse(req, res, 200, 'Payment completed successfully and access granted', responseData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    confirmPayment: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { purchaseId, paymentMethod, transactionId } = req.body

            const purchase = await Purchase.findOne({
                _id: purchaseId,
                userId: authenticatedUser.id
            })

            if (!purchase) {
                return httpError(next, new Error('Purchase not found or access denied'), req, 404)
            }

            if (purchase.paymentStatus === 'completed') {
                return httpError(next, new Error('Payment already completed'), req, 400)
            }

            await purchase.grantAccess()
            purchase.paymentMethod = paymentMethod || purchase.paymentMethod
            purchase.paymentReference = transactionId || `manual-${Date.now()}`

            await notificationService.sendToUser(
                authenticatedUser.id,
                'Access Granted!',
                'Your purchase has been confirmed and you now have access to premium content.',
                'success'
            )

            const responseData = {
                purchaseId: purchase._id,
                orderStatus: purchase.orderStatus,
                paymentStatus: purchase.paymentStatus,
                accessGranted: true,
                purchaseDate: purchase.purchaseDate
            }

            httpResponse(req, res, 200, 'Purchase confirmed and access granted', responseData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    handleStripeWebhook: async (req, res, next) => {
        try {
            const signature = req.headers['stripe-signature']

            if (!signature) {
                return httpError(next, new Error('Missing stripe signature'), req, 400)
            }

            const event = await stripeService.constructWebhookEvent(req.body, signature)

            switch (event.type) {
                // ONLY handle checkout.session.completed to prevent duplicates
                case 'checkout.session.completed': {
                    const session = event.data.object
                    if (session.payment_intent && session.payment_status === 'paid') {
                        const paymentIntent = await stripeService.retrievePaymentIntent(session.payment_intent)
                        await handlePaymentSucceeded(paymentIntent, session.id)
                    }
                    break
                }
                // Keep failure handlers
                case 'payment_intent.payment_failed':
                    await handlePaymentFailed(event.data.object)
                    break
                case 'payment_intent.canceled':
                case 'payment_intent.cancelled':
                    await handlePaymentCanceled(event.data.object)
                    break
                case 'charge.failed':
                    if (event.data.object.payment_intent) {
                        const paymentIntent = await stripeService.retrievePaymentIntent(event.data.object.payment_intent)
                        await handlePaymentFailed(paymentIntent)
                    }
                    break
                // Log other events but don't process them
                default:
                    console.log(`Received unhandled webhook event: ${event.type}`)
                    break
            }

            res.status(200).json({ received: true })
        } catch (err) {
            httpError(next, err, req, 400)
        }
    }
}

async function handlePaymentSucceeded(paymentIntent, sessionId = null) {
    try {
        const { userId, cartId } = paymentIntent.metadata || {}
        if (!userId) return

        const paymentReference = paymentIntent.id

        const existingPurchase = await Purchase.findOne({ 
            paymentReference,
            userId 
        })

        if (existingPurchase) {
            console.log('Webhook: Purchase already exists for payment reference:', paymentReference)
            return
        }

        const cart = await Cart.findById(cartId)
        if (!cart) {
            console.log('Webhook: Cart not found for cartId:', cartId)
            return
        }

        await cart.populate('items.productId')

        const purchaseItems = []
        for (const item of cart.items) {
            if (item.productId && item.productId.status === EProductStatusNew.PUBLISHED) {
                purchaseItems.push({
                    productId: item.productId._id,
                    sellerId: item.productId.sellerId,
                    price: item.productId.price
                })
            }
        }
        if (purchaseItems.length === 0) {
            console.log('Webhook: No valid purchase items found')
            return
        }

        const purchase = await Purchase.findOneAndUpdate(
            { 
                paymentReference,
                userId 
            },
            {
                $setOnInsert: {
                    userId,
                    items: purchaseItems,
                    totalAmount: cart.totalAmount,
                    discountAmount: cart.appliedPromocode?.discountAmount || 0,
                    finalAmount: stripeService.formatAmount(paymentIntent.amount),
                    appliedPromocode: cart.appliedPromocode,
                    paymentMethod: 'stripe',
                    paymentReference,
                    paymentStatus: 'COMPLETED',
                    orderStatus: 'COMPLETED',
                    createdAt: new Date()
                }
            },
            { 
                upsert: true, 
                new: true,
                setDefaultsOnInsert: true
            }
        )

        if (purchase.createdAt < new Date(Date.now() - 1000)) {
            console.log('Webhook: Purchase was already processed, skipping:', purchase._id)
            return
        }

        await purchase.grantAccess()

        if (cart.appliedPromocode && cart.appliedPromocode.code) {
            try {
                const promocode = await Promocode.findOne({ code: cart.appliedPromocode.code })
                if (promocode) {
                    await promocode.recordUsage(userId, purchase._id, cart.appliedPromocode.discountAmount)
                }
            } catch (promoError) {
                console.warn('Webhook: Promocode update failed:', promoError.message)
            }
        }

        try {
            for (const item of purchaseItems) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { sales: 1 } })

                const seller = await sellerProfileModel.findById(item.sellerId)
                if (seller) {
                    await notificationService.sendToUser(seller.userId, 'New Sale!', 'Your product has been purchased via Stripe.', 'success')
                }
            }
        } catch (updateError) {
            console.warn('Webhook: Product/seller update failed:', updateError.message)
        }

        try {
            await notificationService.sendToUser(
                userId,
                'Purchase Successful!',
                'Thank you for your purchase. You now have access to your products.',
                'success'
            )
        } catch (notifError) {
            console.warn('Webhook: Notification failed:', notifError.message)
        }

        try {
            await cart.clearCart()
        } catch (clearError) {
            console.warn('Webhook: Cart clear failed:', clearError.message)
        }

        console.log('Webhook: Purchase created successfully:', purchase._id)
    } catch (error) {
        console.error('Webhook: handlePaymentSucceeded error:', error)
    }
}

const handlePaymentCancellation = async (paymentIntentId) => {
    try {
        // Handle payment cancellation logic without logging
    } catch (error) {
        // Error handling without console logging
    }
}

async function handlePaymentFailed(paymentIntent) {
    const { userId } = paymentIntent.metadata

    if (userId) {
        await notificationService.sendToUser(userId, 'Payment Failed', 'Your payment could not be processed. Please try again.', 'error')
    }
}

async function handlePaymentCanceled(paymentIntent) {
    const { userId } = paymentIntent.metadata

    if (userId) {
        await notificationService.sendToUser(userId, 'Payment Canceled', 'Your payment was canceled. Your cart items are still saved.', 'warning')
    }
}

export default purchaseControllerExport

