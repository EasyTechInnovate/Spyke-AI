'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'
import { Plus, Minus, Package, Trash2, Heart, ExternalLink } from 'lucide-react'
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
        if (newQuantity >= CART_CONFIG.validation.minQuantity && 
            newQuantity <= CART_CONFIG.validation.maxQuantity) {
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
        router.push(`/products/${item.productId}`)
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
            className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300 hover:border-white/20"
        >
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Product Image */}
                <ProductImage 
                    item={item} 
                    discountPercentage={discountPercentage}
                    onClick={navigateToProduct}
                />

                {/* Product Details */}
                <div className="flex-1 space-y-4">
                    {/* Header */}
                    <ProductHeader 
                        item={item}
                        onNavigate={navigateToProduct}
                        onRemove={handleRemove}
                    />

                    {/* Meta Information */}
                    <ProductMeta item={item} />

                    {/* Controls Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
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

// Sub-components for better organization
function ProductImage({ item, discountPercentage, onClick }) {
    return (
        <div className="relative">
            <div 
                className="w-full lg:w-40 h-32 lg:h-32 bg-white/5 rounded-xl flex-shrink-0 overflow-hidden group/image cursor-pointer border border-white/10 hover:border-white/20 transition-all duration-300"
                onClick={onClick}
            >
                {item.image || item.thumbnail ? (
                    <OptimizedImage
                        src={item.image || item.thumbnail}
                        alt={item.title}
                        width={160}
                        height={128}
                        className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                        <Package className="w-10 h-10 text-white/30" />
                    </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white" />
                </div>
            </div>
            
            {/* Discount badge */}
            {discountPercentage > 0 && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#FFC050] to-[#FFD700] text-black text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                    -{discountPercentage}%
                </div>
            )}
        </div>
    )
}

function ProductHeader({ item, onNavigate, onRemove }) {
    return (
        <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h3 
                        className="font-semibold text-lg text-white hover:text-[#00FF89] cursor-pointer transition-colors line-clamp-2 leading-tight"
                        onClick={onNavigate}
                    >
                        {item.title}
                    </h3>
                    {item.description && (
                        <p className="text-sm text-white/60 line-clamp-2 mt-1">
                            {item.description}
                        </p>
                    )}
                </div>
                
                <div className="flex items-center gap-1">
                    <button
                        className="text-white/40 hover:text-[#00FF89] transition-colors p-2 rounded-lg hover:bg-white/5"
                        aria-label="Save for later"
                    >
                        <Heart className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onRemove}
                        className="text-white/40 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/5"
                        aria-label="Remove from cart"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

function ProductMeta({ item }) {
    return (
        <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="text-white/60">
                <span className="text-white/40">by</span>{' '}
                <span className="text-white/80 font-medium">{item.seller?.name || 'Unknown Seller'}</span>
            </div>
            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
            <span className="px-3 py-1 bg-[#00FF89]/15 text-[#00FF89] text-xs rounded-full font-medium border border-[#00FF89]/20">
                {item.category}
            </span>
        </div>
    )
}

function QuantityControls({ quantity, onIncrease, onDecrease, canDecrease }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-white/60 font-medium">Qty:</span>
            <div className="flex items-center bg-white/5 rounded-xl border border-white/10">
                <button
                    onClick={onDecrease}
                    disabled={!canDecrease}
                    className="w-10 h-10 hover:bg-white/10 rounded-l-xl flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 disabled:opacity-30 disabled:cursor-not-allowed text-white/80"
                    aria-label="Decrease quantity"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <div className="w-12 h-10 flex items-center justify-center font-semibold text-white border-x border-white/10">
                    {quantity}
                </div>
                <button
                    onClick={onIncrease}
                    className="w-10 h-10 hover:bg-white/10 rounded-r-xl flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 text-white/80"
                    aria-label="Increase quantity"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

function PriceDisplay({ subtotal, originalSubtotal, discountPercentage }) {
    const hasDiscount = originalSubtotal > subtotal
    
    return (
        <div className="text-right">
            <div className="flex items-center gap-3 justify-end">
                <span className="text-xl font-bold text-[#00FF89]">
                    {formatCurrency(subtotal)}
                </span>
                {hasDiscount && (
                    <span className="text-sm text-white/40 line-through">
                        {formatCurrency(originalSubtotal)}
                    </span>
                )}
            </div>
            {discountPercentage > 0 && (
                <div className="text-xs text-[#00FF89] font-medium mt-1">
                    You save {discountPercentage}%
                </div>
            )}
        </div>
    )
}