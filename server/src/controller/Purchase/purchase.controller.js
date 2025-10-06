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
        const logPrefix = '[ConfirmCheckout]'
        try {
            const { authenticatedUser } = req
            const { sessionId } = req.body

            console.log(
                `${logPrefix} Request initiated - User: ${authenticatedUser.id}, Session: ${sessionId}, Timestamp: ${new Date().toISOString()}`
            )

            if (!sessionId) {
                console.error(`${logPrefix} Missing session ID - User: ${authenticatedUser.id}`)
                return httpError(next, new Error('Session ID is required'), req, 400)
            }

            // Retrieve checkout session
            let session
            try {
                console.log(`${logPrefix} Retrieving Stripe session...`)
                session = await stripeService.retrieveCheckoutSession(sessionId)
                console.log(
                    `${logPrefix} Stripe session retrieved - Status: ${session.status}, Payment Status: ${session.payment_status}, Payment Intent: ${session.payment_intent}`
                )
            } catch (err) {
                console.error(`${logPrefix} Failed to retrieve Stripe session - Error: ${err.message}`)
                return httpError(next, new Error('Unable to retrieve checkout session'), req, 400)
            }

            if (!session) {
                console.error(`${logPrefix} Invalid session returned from Stripe`)
                return httpError(next, new Error('Invalid checkout session'), req, 400)
            }

            if (!stripeService.isCheckoutSessionSuccessful(session)) {
                console.warn(`${logPrefix} Session not successful - Status: ${session.status}, Payment Status: ${session.payment_status}`)
                return httpError(next, new Error('Checkout session not completed'), req, 400)
            }

            if (session.metadata?.userId !== authenticatedUser.id) {
                console.error(
                    `${logPrefix} Session user mismatch - Session User: ${session.metadata?.userId}, Authenticated User: ${authenticatedUser.id}`
                )
                return httpError(next, new Error('Session does not belong to user'), req, 403)
            }

            // Prefer payment intent id when available (stable unique reference), fallback to session id
            let paymentIntentId = null
            if (session.payment_intent) {
                try {
                    console.log(`${logPrefix} Retrieving payment intent: ${session.payment_intent}`)
                    const pi = await stripeService.retrievePaymentIntent(session.payment_intent)
                    if (pi && stripeService.isPaymentSuccessful(pi) && pi.metadata?.userId === authenticatedUser.id) {
                        paymentIntentId = pi.id
                        console.log(`${logPrefix} Payment intent verified - ID: ${paymentIntentId}, Status: ${pi.status}`)
                    } else {
                        console.warn(
                            `${logPrefix} Payment intent validation failed - PI exists: ${!!pi}, Success: ${pi ? stripeService.isPaymentSuccessful(pi) : false}, User match: ${pi?.metadata?.userId === authenticatedUser.id}`
                        )
                    }
                } catch (e) {
                    console.warn(`${logPrefix} Error retrieving payment intent, falling back to session ID - Error: ${e.message}`)
                }
            }
            const paymentReference = paymentIntentId || sessionId
            console.log(`${logPrefix} Using payment reference: ${paymentReference}`)

            // Check if purchase already exists
            console.log(`${logPrefix} Checking for existing purchase...`)
            const existing = await Purchase.findOne({
                paymentReference,
                userId: authenticatedUser.id
            }).populate('items.productId', 'title price type thumbnail')

            if (existing) {
                console.log(
                    `${logPrefix} 🔁 EXISTING PURCHASE FOUND - Purchase ID: ${existing._id}, Created: ${existing.createdAt}, Payment Ref: ${existing.paymentReference}`
                )
                console.log(`${logPrefix} Returning existing purchase with ${existing.items.length} items, Total: $${existing.finalAmount}`)

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
                    items: existing.items.map((i) => ({
                        productId: i.productId?._id || i.productId,
                        title: i.productId?.title,
                        price: i.productId?.price || i.price,
                        type: i.productId?.type,
                        thumbnail: i.productId?.thumbnail
                    }))
                })
            }

            console.log(`${logPrefix} No existing purchase found, creating new purchase...`)

            // Load and validate cart
            const cart = await Cart.getOrCreateCart(authenticatedUser.id)
            await cart.populate('items.productId', 'title price type status sellerId thumbnail')

            console.log(`${logPrefix} Cart loaded - Cart ID: ${cart._id}, Items: ${cart.items.length}`)

            if (!cart.items.length) {
                console.error(`${logPrefix} Empty cart - User: ${authenticatedUser.id}`)
                return httpError(next, new Error(responseMessage.CART.EMPTY_CART), req, 400)
            }

            const purchaseItems = cart.items
                .filter((it) => it.productId && it.productId.status === EProductStatusNew.PUBLISHED)
                .map((it) => ({
                    productId: it.productId._id,
                    sellerId: it.productId.sellerId,
                    price: it.productId.price
                }))

            console.log(`${logPrefix} Valid items in cart: ${purchaseItems.length}/${cart.items.length}`)

            if (!purchaseItems.length) {
                console.error(`${logPrefix} No valid items in cart - All items filtered out`)
                return httpError(next, new Error(responseMessage.CART.NO_VALID_ITEMS), req, 400)
            }

            // Create purchase immediately
            let purchase
            try {
                console.log(`${logPrefix} Creating purchase document...`)
                purchase = new Purchase({
                    userId: authenticatedUser.id,
                    items: purchaseItems,
                    totalAmount: cart.totalAmount,
                    discountAmount: cart.appliedPromocode?.discountAmount || 0,
                    finalAmount: cart.finalAmount,
                    appliedPromocode: cart.appliedPromocode,
                    paymentMethod: 'stripe_checkout',
                    paymentReference: paymentReference,
                    paymentStatus: 'COMPLETED',
                    orderStatus: 'COMPLETED'
                })

                await purchase.save()
                console.log(`${logPrefix} ✅ Purchase created successfully - Purchase ID: ${purchase._id}`)
            } catch (saveError) {
                // Handle duplicate key error (race condition with webhook)
                if (saveError.code === 11000) {
                    console.log(`${logPrefix} 🔁 DUPLICATE KEY ERROR - Finding existing purchase with ref: ${paymentReference}`)
                    const existingFromError = await Purchase.findOne({
                        paymentReference,
                        userId: authenticatedUser.id
                    }).populate('items.productId', 'title price type thumbnail')

                    if (existingFromError) {
                        console.log(`${logPrefix} Returning existing purchase from duplicate key error - ID: ${existingFromError._id}`)
                        return httpResponse(req, res, 200, responseMessage.PRODUCT.PURCHASE_SUCCESSFUL, {
                            purchaseId: existingFromError._id,
                            totalItems: existingFromError.items.length,
                            totalAmount: existingFromError.totalAmount,
                            discountAmount: existingFromError.discountAmount,
                            finalAmount: existingFromError.finalAmount,
                            status: existingFromError.orderStatus,
                            paymentStatus: existingFromError.paymentStatus,
                            purchaseDate: existingFromError.purchaseDate,
                            paymentMethod: existingFromError.paymentMethod,
                            appliedPromocode: existingFromError.appliedPromocode,
                            items: existingFromError.items.map((i) => ({
                                productId: i.productId?._id || i.productId,
                                title: i.productId?.title,
                                price: i.productId?.price || i.price,
                                type: i.productId?.type,
                                thumbnail: i.productId?.thumbnail
                            }))
                        })
                    }
                }
                console.error(`${logPrefix} ❌ Error saving purchase - Code: ${saveError.code}, Message: ${saveError.message}`)
                throw saveError
            }

            // Grant access
            console.log(`${logPrefix} Granting access to purchased items...`)
            await purchase.grantAccess()

            // Update promocode usage
            if (cart.appliedPromocode && cart.appliedPromocode.code) {
                console.log(`${logPrefix} Recording promocode usage - Code: ${cart.appliedPromocode.code}`)
                try {
                    const promocode = await Promocode.findOne({ code: cart.appliedPromocode.code })
                    if (promocode) {
                        await promocode.recordUsage(authenticatedUser.id, purchase._id, cart.appliedPromocode.discountAmount)
                    }
                } catch (promoError) {
                    console.warn(`${logPrefix} ⚠️ Promocode update failed: ${promoError.message}`)
                }
            }

            // Update product sales and notify sellers
            console.log(`${logPrefix} Updating ${purchaseItems.length} product(s) and notifying sellers...`)
            try {
                for (const item of purchaseItems) {
                    await Product.findByIdAndUpdate(item.productId, { $inc: { sales: 1 } })

                    const seller = await sellerProfileModel.findById(item.sellerId)
                    if (seller) {
                        await notificationService.sendToUser(seller.userId, 'New Sale!', 'Your product has been purchased via Stripe.', 'success')
                        console.log(`${logPrefix} Notified seller: ${item.sellerId}`)
                    }
                }
            } catch (updateError) {
                console.warn(`${logPrefix} ⚠️ Product/seller update failed: ${updateError.message}`)
            }

            // Notify buyer
            console.log(`${logPrefix} Sending buyer notification...`)
            try {
                await notificationService.sendToUser(
                    authenticatedUser.id,
                    'Purchase Successful!',
                    'Thank you for your purchase. You now have access to your products.',
                    'success'
                )
            } catch (notifError) {
                console.warn(`${logPrefix} ⚠️ Buyer notification failed: ${notifError.message}`)
            }

            // Clear cart
            console.log(`${logPrefix} Clearing cart...`)
            try {
                await cart.clearCart()
            } catch (clearError) {
                console.warn(`${logPrefix} ⚠️ Cart clear failed: ${clearError.message}`)
            }

            // Populate items for response
            await purchase.populate('items.productId', 'title price type thumbnail')

            const responseData = {
                purchaseId: purchase._id,
                totalItems: purchase.items.length,
                totalAmount: purchase.totalAmount,
                discountAmount: purchase.discountAmount,
                finalAmount: purchase.finalAmount,
                status: purchase.orderStatus,
                paymentStatus: purchase.paymentStatus,
                purchaseDate: purchase.purchaseDate,
                paymentMethod: purchase.paymentMethod,
                appliedPromocode: purchase.appliedPromocode,
                items: purchase.items.map((i) => ({
                    productId: i.productId?._id || i.productId,
                    title: i.productId?.title,
                    price: i.productId?.price || i.price,
                    type: i.productId?.type,
                    thumbnail: i.productId?.thumbnail
                }))
            }

            console.log(
                `${logPrefix} ✅ Purchase completed successfully - Purchase ID: ${purchase._id}, Total: $${purchase.finalAmount}, Items: ${purchaseItems.length}`
            )

            return httpResponse(req, res, 200, responseMessage.PRODUCT.PURCHASE_SUCCESSFUL, responseData)
        } catch (err) {
            console.error(
                `${logPrefix} ❌ Error in confirmCheckoutSession - User: ${req.authenticatedUser?.id}, Error: ${err.message}, Stack: ${err.stack}`
            )
            return httpError(next, err, req, 500)
        }
    },

    createPurchase: async (req, res, next) => {
        const logPrefix = '[CreatePurchase]'
        try {
            const { authenticatedUser } = req
            const { paymentMethod, paymentReference } = req.body

            console.log(
                `${logPrefix} Request initiated - User: ${authenticatedUser.id}, Method: ${paymentMethod}, Ref: ${paymentReference}, Timestamp: ${new Date().toISOString()}`
            )

            const cart = await Cart.getOrCreateCart(authenticatedUser.id)
            await cart.populate('items.productId')

            console.log(`${logPrefix} Cart loaded - Cart ID: ${cart._id}, Items: ${cart.items.length}, Total: $${cart.finalAmount}`)

            if (cart.items.length === 0) {
                console.error(`${logPrefix} Empty cart - User: ${authenticatedUser.id}`)
                return httpError(next, new Error(responseMessage.CART.EMPTY_CART), req, 400)
            }

            // Duplicate prevention for manual / non-stripe flows
            console.log(`${logPrefix} Checking for duplicate purchase...`)
            const productIds = cart.items
                .map((i) => i.productId && i.productId._id?.toString())
                .filter(Boolean)
                .sort()
            const recentSimilarPurchase = await Purchase.findOne({
                userId: authenticatedUser.id,
                paymentMethod: paymentMethod || 'manual',
                finalAmount: cart.finalAmount,
                createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
                'items.productId': { $all: productIds }
            })

            if (recentSimilarPurchase) {
                console.log(
                    `${logPrefix} 🔁 DUPLICATE DETECTED - Returning existing purchase ID: ${recentSimilarPurchase._id}, Created: ${recentSimilarPurchase.createdAt}`
                )
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

            console.log(`${logPrefix} No duplicate found, processing cart items...`)
            const purchaseItems = []
            for (const item of cart.items) {
                if (!item.productId || item.productId.status !== EProductStatusNew.PUBLISHED) {
                    console.warn(`${logPrefix} Skipping invalid item - Product ID: ${item.productId?._id}, Status: ${item.productId?.status}`)
                    continue
                }

                const sellerProfile = await sellerProfileModel.findById(item.productId.sellerId)
                purchaseItems.push({
                    productId: item.productId._id,
                    sellerId: item.productId.sellerId,
                    price: item.productId.price
                })
            }

            console.log(`${logPrefix} Valid purchase items: ${purchaseItems.length}/${cart.items.length}`)

            if (purchaseItems.length === 0) {
                console.error(`${logPrefix} No valid items after filtering`)
                return httpError(next, new Error(responseMessage.CART.NO_VALID_ITEMS), req, 400)
            }

            // Safer dynamic reference to avoid identical hard-coded paymentReference duplicates
            const safeReference =
                paymentReference && paymentReference !== 'manual-payment'
                    ? paymentReference
                    : `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

            console.log(`${logPrefix} Creating purchase - Payment Ref: ${safeReference}, Is Free: ${cart.finalAmount === 0}`)

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
                console.log(`${logPrefix} Free purchase - Granting immediate access`)
                await purchase.grantAccess()
            } else {
                try {
                    await purchase.save()
                    console.log(`${logPrefix} ✅ Purchase saved successfully - Purchase ID: ${purchase._id}`)
                } catch (e) {
                    if (e.code === 11000 && e.keyPattern?.paymentReference) {
                        console.log(`${logPrefix} 🔁 DUPLICATE KEY ERROR - Finding existing purchase with ref: ${safeReference}`)
                        const existing = await Purchase.findOne({ paymentReference: safeReference })
                        if (existing) {
                            console.log(`${logPrefix} Returning existing purchase from duplicate key error - ID: ${existing._id}`)
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
                    console.error(`${logPrefix} ❌ Error saving purchase - Code: ${e.code}, Message: ${e.message}`)
                    throw e
                }
            }

            // Update promocode usage
            if (cart.appliedPromocode && cart.appliedPromocode.code) {
                console.log(`${logPrefix} Recording promocode usage - Code: ${cart.appliedPromocode.code}`)
                const promocode = await Promocode.findOne({ code: cart.appliedPromocode.code })
                if (promocode) {
                    await promocode.recordUsage(authenticatedUser.id, purchase._id, cart.appliedPromocode.discountAmount)
                }
            }

            // Update product sales and notify sellers
            console.log(`${logPrefix} Updating product sales and notifying sellers...`)
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

            console.log(`${logPrefix} Clearing cart...`)
            await cart.clearCart()

            console.log(`${logPrefix} Sending buyer notification...`)
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

            console.log(
                `${logPrefix} ✅ Purchase completed successfully - Purchase ID: ${purchase._id}, Total: $${purchase.finalAmount}, Items: ${purchaseItems.length}`
            )

            httpResponse(
                req,
                res,
                201,
                cart.finalAmount === 0 ? responseMessage.PRODUCT.FREE_PRODUCT_ACCESSED : responseMessage.PRODUCT.PURCHASE_SUCCESSFUL,
                responseData
            )
        } catch (err) {
            console.error(`${logPrefix} ❌ Error in createPurchase - User: ${req.authenticatedUser?.id}, Error: ${err.message}, Stack: ${err.stack}`)
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
    const logPrefix = '[Webhook:PaymentSucceeded]'
    const timestamp = new Date().toISOString()

    try {
        const { userId, cartId } = paymentIntent.metadata || {}

        console.log(`${logPrefix} ========== WEBHOOK PROCESSING START ==========`)
        console.log(`${logPrefix} Timestamp: ${timestamp}`)
        console.log(`${logPrefix} Payment Intent ID: ${paymentIntent.id}`)
        console.log(`${logPrefix} Session ID: ${sessionId || 'N/A'}`)
        console.log(`${logPrefix} User ID: ${userId || 'MISSING'}`)
        console.log(`${logPrefix} Cart ID: ${cartId || 'MISSING'}`)
        console.log(`${logPrefix} Amount: $${stripeService.formatAmount(paymentIntent.amount)}`)
        console.log(`${logPrefix} Status: ${paymentIntent.status}`)

        if (!userId) {
            console.error(`${logPrefix} ❌ No userId in metadata - Cannot process webhook`)
            return
        }

        console.log(`${logPrefix} Checking for existing purchase (PRIMARY CHECK - prevents duplicates)...`)
        const existingPurchase = await Purchase.findOne({
            userId,
            $or: [
                // Check by payment reference (payment intent ID)
                { paymentReference: paymentIntent.id },
                // Check by session ID if provided
                ...(sessionId ? [{ paymentReference: sessionId }] : []),
                // Check for recent purchases with same amount (catch race conditions)
                {
                    paymentMethod: { $in: ['stripe', 'stripe_checkout'] },
                    createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
                    finalAmount: stripeService.formatAmount(paymentIntent.amount)
                }
            ]
        })

        if (existingPurchase) {
            console.log(`${logPrefix} 🔁 PURCHASE ALREADY EXISTS - Frontend likely created it`)
            console.log(`${logPrefix} Existing Purchase ID: ${existingPurchase._id}`)
            console.log(`${logPrefix} Created: ${existingPurchase.createdAt}`)
            console.log(`${logPrefix} Payment Reference: ${existingPurchase.paymentReference}`)
            console.log(`${logPrefix} ✅ Webhook job: COMPLETE - No action needed`)
            console.log(`${logPrefix} ========== WEBHOOK PROCESSING END (ALREADY HANDLED) ==========\n`)
            return
        }

        console.log(`${logPrefix} ⚠️ No existing purchase found - Frontend may have failed`)
        console.log(`${logPrefix} Webhook will create purchase as BACKUP`)

        // Load and validate cart
        console.log(`${logPrefix} Loading cart: ${cartId}`)
        const cart = await Cart.findById(cartId)
        if (!cart) {
            console.error(`${logPrefix} ❌ Cart not found - Cart ID: ${cartId}`)
            console.log(`${logPrefix} ========== WEBHOOK PROCESSING END (CART NOT FOUND) ==========\n`)
            return
        }

        await cart.populate('items.productId')
        console.log(`${logPrefix} Cart loaded - Items: ${cart.items.length}, Total: $${cart.totalAmount}`)

        // Build purchase items
        const purchaseItems = []
        for (const item of cart.items) {
            if (item.productId && item.productId.status === EProductStatusNew.PUBLISHED) {
                purchaseItems.push({
                    productId: item.productId._id,
                    sellerId: item.productId.sellerId,
                    price: item.productId.price
                })
                console.log(`${logPrefix} Added item - Product: ${item.productId._id}, Price: $${item.productId.price}`)
            } else {
                console.warn(`${logPrefix} Skipping invalid item - Product: ${item.productId?._id}, Status: ${item.productId?.status}`)
            }
        }

        if (purchaseItems.length === 0) {
            console.error(`${logPrefix} ❌ No valid purchase items found in cart`)
            console.log(`${logPrefix} ========== WEBHOOK PROCESSING END (NO VALID ITEMS) ==========\n`)
            return
        }

        console.log(`${logPrefix} Valid items: ${purchaseItems.length}/${cart.items.length}`)

        // Create purchase (as backup - frontend should have already created it)
        let purchase
        try {
            console.log(`${logPrefix} Creating purchase document (BACKUP CREATION)...`)
            purchase = new Purchase({
                userId,
                items: purchaseItems,
                totalAmount: cart.totalAmount,
                discountAmount: cart.appliedPromocode?.discountAmount || 0,
                finalAmount: stripeService.formatAmount(paymentIntent.amount),
                appliedPromocode: cart.appliedPromocode,
                paymentMethod: 'stripe',
                paymentReference: paymentIntent.id,
                paymentStatus: 'COMPLETED',
                orderStatus: 'COMPLETED'
            })

            await purchase.save()
            console.log(`${logPrefix} ✅ Purchase created successfully (BACKUP) - Purchase ID: ${purchase._id}`)
        } catch (saveError) {
            if (saveError.code === 11000) {
                console.log(`${logPrefix} 🔁 DUPLICATE KEY ERROR - Frontend created purchase between our checks`)
                console.log(`${logPrefix} This is expected behavior - duplicate prevented by database`)
                console.log(`${logPrefix} Error details: ${saveError.message}`)
                console.log(`${logPrefix} ========== WEBHOOK PROCESSING END (DUPLICATE PREVENTED) ==========\n`)
                return
            }
            console.error(`${logPrefix} ❌ Error saving purchase - Code: ${saveError.code}, Message: ${saveError.message}`)
            throw saveError
        }

        // Grant access
        console.log(`${logPrefix} Granting access to purchased items...`)
        await purchase.grantAccess()

        // Update promocode usage
        if (cart.appliedPromocode && cart.appliedPromocode.code) {
            console.log(`${logPrefix} Updating promocode usage - Code: ${cart.appliedPromocode.code}`)
            try {
                const promocode = await Promocode.findOne({ code: cart.appliedPromocode.code })
                if (promocode) {
                    await promocode.recordUsage(userId, purchase._id, cart.appliedPromocode.discountAmount)
                    console.log(`${logPrefix} Promocode usage recorded`)
                }
            } catch (promoError) {
                console.warn(`${logPrefix} ⚠️ Promocode update failed: ${promoError.message}`)
            }
        }

        // Update product sales and notify sellers
        console.log(`${logPrefix} Updating ${purchaseItems.length} product(s) and notifying sellers...`)
        try {
            for (const item of purchaseItems) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { sales: 1 } })

                const seller = await sellerProfileModel.findById(item.sellerId)
                if (seller) {
                    await notificationService.sendToUser(seller.userId, 'New Sale!', 'Your product has been purchased via Stripe.', 'success')
                    console.log(`${logPrefix} Notified seller: ${item.sellerId}`)
                }
            }
        } catch (updateError) {
            console.warn(`${logPrefix} ⚠️ Product/seller update failed: ${updateError.message}`)
        }

        // Notify buyer
        console.log(`${logPrefix} Sending buyer notification...`)
        try {
            await notificationService.sendToUser(
                userId,
                'Purchase Successful!',
                'Thank you for your purchase. You now have access to your products.',
                'success'
            )
        } catch (notifError) {
            console.warn(`${logPrefix} ⚠️ Buyer notification failed: ${notifError.message}`)
        }

        // Clear cart
        console.log(`${logPrefix} Clearing cart...`)
        try {
            await cart.clearCart()
            console.log(`${logPrefix} Cart cleared successfully`)
        } catch (clearError) {
            console.warn(`${logPrefix} ⚠️ Cart clear failed: ${clearError.message}`)
        }

        console.log(`${logPrefix} ✅ WEBHOOK BACKUP PROCESSING COMPLETED`)
        console.log(`${logPrefix} Purchase ID: ${purchase._id}`)
        console.log(`${logPrefix} Total Amount: $${purchase.finalAmount}`)
        console.log(`${logPrefix} Items: ${purchaseItems.length}`)
        console.log(`${logPrefix} NOTE: This should rarely happen - frontend usually creates first`)
        console.log(`${logPrefix} ========== WEBHOOK PROCESSING END (SUCCESS) ==========\n`)
    } catch (error) {
        console.error(`${logPrefix} ❌ CRITICAL ERROR in handlePaymentSucceeded`)
        console.error(`${logPrefix} Error: ${error.message}`)
        console.error(`${logPrefix} Stack: ${error.stack}`)
        console.error(`${logPrefix} Payment Intent ID: ${paymentIntent?.id}`)
        console.error(`${logPrefix} User ID: ${paymentIntent?.metadata?.userId}`)
        console.log(`${logPrefix} ========== WEBHOOK PROCESSING END (ERROR) ==========\n`)
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

