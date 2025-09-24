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
            await cart.populate('items.productId', 'title slug thumbnail price type category status')

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

            const productIds = cart.items.map((item) => item.productId._id)
            const categories = [...new Set(cart.items.map((item) => item.productId.category))]
            const industries = [...new Set(cart.items.map((item) => item.productId.industry))]

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

    createPaymentIntent: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const cart = await Cart.getOrCreateCart(authenticatedUser.id)
            await cart.populate('items.productId', 'title price type category')

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
            const { authenticatedUser } = req;
            const { successUrl, cancelUrl } = req.body;
    
            if (!successUrl || !cancelUrl) {
                return httpError(next, new Error('Success URL and Cancel URL are required'), req, 400);
            }
    
            const cart = await Cart.findOne({ userId: authenticatedUser.id }).populate('items.productId');
    
            if (!cart || cart.items.length === 0) {
                return httpError(next, new Error(responseMessage.CART.EMPTY_CART), req, 400);
            }
    
            await cart.calculateTotals();
    
            if (cart.finalAmount <= 0) {
                return httpError(next, new Error('No payment required for free items'), req, 400);
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
            );
    
            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                ...checkoutSessionData,
                cartSummary: {
                    totalAmount: cart.totalAmount,
                    discountAmount: cart.appliedPromocode?.discountAmount || 0,
                    finalAmount: cart.finalAmount,
                    itemCount: cart.items.length,
                    appliedPromocode: cart.appliedPromocode
                }
            });
        } catch (err) {
            return httpError(next, err, req, 500);
        }
    },
    
    
    confirmCheckoutSession: async (req, res, next) => {
        try {
            const { authenticatedUser } = req;
            const { sessionId } = req.body;
    
            if (!sessionId) {
                return httpError(next, new Error('Session ID is required'), req, 400);
            }
    
            const session = await stripeService.retrieveCheckoutSession(sessionId);
            if (!session) return httpError(next, new Error('Invalid checkout session'), req, 400);
    
            if (!stripeService.isCheckoutSessionSuccessful(session)) {
                return httpError(
                    next,
                    new Error(`Payment not completed. Status: ${session.status}, Payment Status: ${session.payment_status}`),
                    req,
                    400
                );
            }
    
            if (session.metadata.userId !== authenticatedUser.id) {
                return httpError(next, new Error('Unauthorized checkout session'), req, 403);
            }
    
            // Check if purchase already exists (webhook/duplicate retry)
            const existingPurchase = await Purchase.findOne({
                paymentReference: session.id,
                userId: authenticatedUser.id
            });
    
            if (existingPurchase) {
                return httpResponse(req, res, 200, responseMessage.PRODUCT.PURCHASE_SUCCESSFUL, existingPurchase);
            }
    
            // Get cart data before creating purchase
            const cart = await Cart.getOrCreateCart(authenticatedUser.id);
            await cart.populate('items.productId', 'title slug thumbnail price type category status sellerId');
    
            if (!cart.items || cart.items.length === 0) {
                return httpError(next, new Error(responseMessage.CART.EMPTY_CART), req, 400);
            }
    
            // Prepare purchase items
            const purchaseItems = [];
            for (const item of cart.items) {
                if (item.productId?.status !== EProductStatusNew.PUBLISHED) continue;
                purchaseItems.push({
                    productId: item.productId._id,
                    sellerId: item.productId.sellerId,
                    price: item.productId.price
                });
            }
    
            if (purchaseItems.length === 0) {
                return httpError(next, new Error(responseMessage.CART.NO_VALID_ITEMS), req, 400);
            }
    
            // Create purchase record first
            const purchase = await Purchase.create({
                userId: authenticatedUser.id,
                items: purchaseItems,
                totalAmount: cart.totalAmount,
                discountAmount: cart.appliedPromocode?.discountAmount || 0,
                finalAmount: cart.finalAmount,
                appliedPromocode: cart.appliedPromocode,
                paymentMethod: 'stripe_checkout',
                paymentReference: session.id,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
    
            // Grant access after record creation
            await purchase.grantAccess();
    
            // Update promocode usage if applicable
            if (cart.appliedPromocode?.code) {
                const promocode = await Promocode.findOne({ code: cart.appliedPromocode.code });
                if (promocode) {
                    await promocode.recordUsage(authenticatedUser.id, purchase._id, cart.appliedPromocode.discountAmount);
                }
            }
    
            // Update product sales and notify sellers
            for (const item of purchaseItems) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { sales: 1 } });
    
                const seller = await sellerProfileModel.findById(item.sellerId);
                if (seller) {
                    seller.updateStats('totalSales', 1);
                    await seller.save();
                    await notificationService.sendToUser(seller.userId, 'New Sale!', 'Your product has been purchased.', 'success');
                }
            }
    
            // Prepare response before clearing cart
            const responseData = {
                purchaseId: purchase._id,
                totalItems: purchaseItems.length,
                totalAmount: purchase.totalAmount,
                discountAmount: purchase.discountAmount,
                finalAmount: purchase.finalAmount,
                status: purchase.orderStatus,
                paymentStatus: purchase.paymentStatus,
                purchaseDate: purchase.purchaseDate,
                paymentMethod: 'stripe_checkout',
                appliedPromocode: purchase.appliedPromocode,
                items: cart.items.map(item => ({
                    productId: item.productId._id,
                    title: item.productId.title,
                    thumbnail: item.productId.thumbnail,
                    price: item.productId.price,
                    type: item.productId.type,
                    quantity: item?.quantity
                }))
            };
    
            // Clear cart after preparing response
            await cart.clearCart();
    
            // Notify buyer
            await notificationService.sendToUser(
                authenticatedUser.id,
                'Purchase Successful!',
                'Thank you for your purchase. You now have access to your products.',
                'success'
            );
    
            return httpResponse(req, res, 200, responseMessage.PRODUCT.PURCHASE_SUCCESSFUL, responseData);
        } catch (err) {
            return httpError(next, err, req, 500);
        }
    },
    
    confirmStripePayment: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { paymentIntentId } = req.body

            if (!paymentIntentId) {
                return httpError(next, new Error('Payment intent ID is required'), req, 400)
            }

            const paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId)

            if (!paymentIntent) {
                return httpError(next, new Error('Invalid payment intent'), req, 400)
            }

            if (!stripeService.isPaymentSuccessful(paymentIntent)) {
                return httpError(next, new Error(`Payment not completed. Status: ${paymentIntent.status}`), req, 400)
            }

            if (paymentIntent.metadata.userId !== authenticatedUser.id) {
                return httpError(next, new Error('Unauthorized payment intent'), req, 403)
            }

            req.body = {
                paymentMethod: 'stripe',
                paymentReference: paymentIntentId
            }

            return purchaseControllerExport.createPurchase(req, res, next)
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
                case 'payment_intent.succeeded':
                    await handlePaymentSucceeded(event.data.object)
                    break
                case 'payment_intent.payment_failed':
                    await handlePaymentFailed(event.data.object)
                    break
                case 'payment_intent.canceled':
                case 'payment_intent.cancelled':
                    await handlePaymentCanceled(event.data.object)
                    break
                case 'payment_intent.created':
                    break
                case 'payment_intent.requires_action':
                    break
                case 'checkout.session.async_payment_succeeded':
                    if (event.data.object.payment_intent) {
                        const paymentIntent = await stripeService.retrievePaymentIntent(event.data.object.payment_intent)
                        await handlePaymentSucceeded(paymentIntent)
                    }
                    break
                case 'checkout.session.completed':
                    if (event.data.object.payment_intent) {
                        const paymentIntent = await stripeService.retrievePaymentIntent(event.data.object.payment_intent)
                        await handlePaymentSucceeded(paymentIntent)
                    }
                    break
                case 'charge.succeeded':
                    if (event.data.object.payment_intent) {
                        const paymentIntent = await stripeService.retrievePaymentIntent(event.data.object.payment_intent)
                        await handlePaymentSucceeded(paymentIntent)
                    }
                    break
                case 'charge.failed':
                    if (event.data.object.payment_intent) {
                        const paymentIntent = await stripeService.retrievePaymentIntent(event.data.object.payment_intent)
                        await handlePaymentFailed(paymentIntent)
                    }
                    break
                default:
                    break
            }

            res.status(200).json({ received: true })
        } catch (err) {
            httpError(next, err, req, 400)
        }
    }
}

async function handlePaymentSucceeded(paymentIntent) {
    try {
        const { userId, cartId } = paymentIntent.metadata

        if (!userId) {
            return
        }

        const existingPurchase = await Purchase.findOne({
            paymentReference: paymentIntent.id
        })

        if (existingPurchase) {
            return httpResponse(req, res, 200, responseMessage.SUCCESS, existingPurchase);
        }

        const cart = await Cart.findById(cartId)
        if (!cart) {
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
            return
        }

        const purchase = new Purchase({
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

        await purchase.grantAccess()

        if (cart.appliedPromocode && cart.appliedPromocode.code) {
            const promocode = await Promocode.findOne({ code: cart.appliedPromocode.code })
            if (promocode) {
                await promocode.recordUsage(userId, purchase._id, cart.appliedPromocode.discountAmount)
            }
        }

        for (const item of purchaseItems) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { sales: 1 } })

            const seller = await sellerProfileModel.findById(item.sellerId)
            if (seller) {
                await notificationService.sendToUser(seller.userId, 'New Sale!', 'Your product has been purchased via Stripe.', 'success')
            }
        }

        await notificationService.sendToUser(
            userId,
            'Purchase Successful!',
            'Thank you for your purchase. You now have access to your products.',
            'success'
        )

        await cart.clearCart()
    } catch (error) {
        // Error handling without console logging
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
