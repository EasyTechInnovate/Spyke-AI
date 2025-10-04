'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Minus, Package, Trash2, Heart, ExternalLink, Clock, Star, Download, Shield, Award } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { calculateDiscountPercentage, formatCurrency, getItemId } from '../utils'
import { CART_CONFIG } from '../constants'
export default function CartItem({ item, index, onUpdateQuantity, onRemove }) {
    const router = useRouter()

    const { isAuthenticated } = useAuth()
    const [isRemoving, setIsRemoving] = useState(false)
    const itemId = getItemId(item)
    const discountPercentage = calculateDiscountPercentage(item.originalPrice, item.price)
    const subtotal = item.price * item.quantity
    const originalSubtotal = (item.originalPrice || item.price) * item.quantity
    const handleQuantityUpdate = (change) => {
        const newQuantity = item.quantity + change
        if (newQuantity >= CART_CONFIG.validation.minQuantity && newQuantity <= CART_CONFIG.validation.maxQuantity) {
            onUpdateQuantity(itemId, newQuantity)
        }
    }
    const handleRemove = () => {
        setIsRemoving(true)
        setTimeout(() => {
            onRemove(itemId)
        }, CART_CONFIG.animations.removeTransition.duration * 1000)
    }
    const navigateToProduct = () => {
        const productSlug = item.productId?.slug || item.slug
        const productId = item.productId?._id || item.productId?.id || item.id || item._id
        const url = productSlug ? `/products/${productSlug}` : `/products/${productId}`
        router.push(url)
    }
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{
                opacity: isRemoving ? 0 : 1,
                x: isRemoving ? -20 : 0
            }}
            transition={{
                delay: index * CART_CONFIG.animations.itemTransition.stagger,
                duration: CART_CONFIG.animations.itemTransition.duration
            }}
            className="group bg-gradient-to-br from-gray-800/40 via-gray-800/20 to-gray-900/40 border border-gray-700/50 rounded-2xl p-6 hover:bg-gradient-to-br hover:from-gray-800/60 hover:via-gray-800/30 hover:to-gray-900/50 transition-all duration-300 hover:border-gray-600/60 hover:shadow-xl hover:shadow-black/20">
            <div className="flex flex-col lg:flex-row gap-6">
                <ProductImage
                    item={item}
                    discountPercentage={discountPercentage}
                    onClick={navigateToProduct}
                />
                <div className="flex-1 space-y-4">
                    <ProductHeader
                        item={item}
                        onNavigate={navigateToProduct}
                        onRemove={handleRemove}
                    />
                    <ProductMeta item={item} />
                    <ProductFeatures item={item} />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-700/30">
                        <QuantityControls
                            quantity={item.quantity}
                            onIncrease={() => handleQuantityUpdate(1)}
                            onDecrease={() => handleQuantityUpdate(-1)}
                            canDecrease={item.quantity > CART_CONFIG.validation.minQuantity}
                        />
                        <PriceDisplay
                            subtotal={subtotal}
                            originalSubtotal={originalSubtotal}
                            discountPercentage={discountPercentage}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
function ProductImage({ item, discountPercentage, onClick }) {
    const [imageError, setImageError] = useState(false)
    const [imageLoading, setImageLoading] = useState(true)

    const handleImageLoad = () => {
        setImageLoading(false)
        setImageError(false)
    }

    const handleImageError = () => {
        setImageError(true)
        setImageLoading(false)
        console.warn('Cart item image failed to load:', item.image || item.thumbnail)
    }

    return (
        <div className="relative">
            <div
                className="w-full lg:w-48 h-40 lg:h-36 bg-gradient-to-br from-gray-700/30 to-gray-800/50 rounded-xl flex-shrink-0 overflow-hidden group/image cursor-pointer border border-gray-600/40 hover:border-gray-500/60 transition-all duration-300 shadow-lg"
                onClick={onClick}>
                {(item.image || item.thumbnail) && !imageError ? (
                    <img
                        src={item.image || item.thumbnail}
                        alt={item.title}
                        className={`w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500 ${
                            imageLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-600/20 to-gray-700/40 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                    </div>
                )}

                {imageLoading && (item.image || item.thumbnail) && <div className="absolute inset-0 bg-gray-700/30 animate-pulse" />}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white font-medium">
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm">View Details</span>
                    </div>
                </div>
            </div>
            {discountPercentage > 0 && (
                <div className="absolute -top-3 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg border border-red-400/30">
                    -{discountPercentage}% OFF
                </div>
            )}
        </div>
    )
}
function ProductHeader({ item, onNavigate, onRemove }) {
    return (
        <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h3
                        className="font-bold text-xl text-white hover:text-[#00FF89] cursor-pointer transition-colors line-clamp-2 leading-tight mb-2"
                        onClick={onNavigate}>
                        {item.title}
                    </h3>
                    {item.description && <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">{item.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="text-gray-400 hover:text-[#00FF89] transition-colors p-2 rounded-lg hover:bg-white/5 group"
                        aria-label="Save for later">
                        <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={onRemove}
                        className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/5 group"
                        aria-label="Remove from cart">
                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    )
}
function ProductMeta({ item }) {
    const sellerRating = item.seller?.averageRating || 0
    const normalizeType = (raw) => {
        if (!raw) return 'Prompt'
        const t = String(raw).toLowerCase()
        if (t.startsWith('prompt')) return 'Prompt'
        if (t.startsWith('automation')) return 'Automation'
        if (t.startsWith('agent')) return 'Agent'
        return raw
    }
    const displayType = normalizeType(item.type || item.category)
    return (
        <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
                <span className="text-gray-400">by</span>
                <span className="text-white font-medium hover:text-[#00FF89] cursor-pointer transition-colors">
                    {item.seller?.name || 'Unknown Seller'}
                </span>
                {sellerRating > 0 && (
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-400">{sellerRating.toFixed(1)}</span>
                    </div>
                )}
            </div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <span className="px-3 py-1 bg-[#00FF89]/15 text-[#00FF89] text-xs rounded-full font-medium border border-[#00FF89]/20">
                {displayType}
            </span>
        </div>
    )
}
function ProductFeatures({ item }) {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Secure Purchase</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>Premium Quality</span>
            </div>
        </div>
    )
}
function QuantityControls({ quantity, onIncrease, onDecrease, canDecrease }) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-700/30 rounded-xl border border-gray-600/40 px-1">
                <span className="px-3 py-2 text-sm font-semibold text-white">Qty: 1</span>
            </div>
        </div>
    )
}
function PriceDisplay({ subtotal, originalSubtotal, discountPercentage }) {
    const hasDiscount = originalSubtotal > subtotal
    return (
        <div className="text-right">
            <div className="flex items-center gap-3 justify-end mb-1">
                <span className="text-2xl font-bold text-[#00FF89]">{formatCurrency(subtotal)}</span>
                {hasDiscount && <span className="text-lg text-gray-400 line-through">{formatCurrency(originalSubtotal)}</span>}
            </div>
            {discountPercentage > 0 && <div className="text-sm text-[#00FF89] font-medium">🎉 You save {discountPercentage}%</div>}
            <div className="text-xs text-gray-400 mt-1">Immediate access after purchase</div>
        </div>
    )
}
