'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'
import { Plus, Minus, Package, Trash2, Heart } from 'lucide-react'
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
            className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6"
        >
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Product Image */}
                <ProductImage 
                    item={item} 
                    discountPercentage={discountPercentage}
                    onClick={navigateToProduct}
                />

                {/* Product Details */}
                <div className="flex-1 space-y-3">
                    {/* Title and Actions */}
                    <ProductHeader 
                        item={item}
                        onNavigate={navigateToProduct}
                        onRemove={handleRemove}
                    />

                    {/* Meta Information */}
                    <ProductMeta item={item} />

                    {/* Quantity and Price */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {isAuthenticated ? (
                            <QuantityDisplay quantity={item.quantity} />
                        ) : (
                            <QuantityControls 
                                quantity={item.quantity}
                                onIncrease={() => handleQuantityUpdate(1)}
                                onDecrease={() => handleQuantityUpdate(-1)}
                                canDecrease={item.quantity > CART_CONFIG.validation.minQuantity}
                            />
                        )}
                        
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
        <div 
            className="w-full sm:w-32 h-32 sm:h-24 bg-[#1f1f1f] rounded-lg flex-shrink-0 overflow-hidden group relative cursor-pointer"
            onClick={onClick}
        >
            {item.image || item.thumbnail ? (
                <OptimizedImage
                    src={item.image || item.thumbnail}
                    alt={item.title}
                    width={128}
                    height={96}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1f1f1f] to-gray-800 flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-600" />
                </div>
            )}
            {discountPercentage > 0 && (
                <div className="absolute top-2 right-2 bg-[#FFC050] text-[#121212] text-xs px-2 py-1 rounded-full font-medium">
                    -{discountPercentage}%
                </div>
            )}
        </div>
    )
}

function ProductHeader({ item, onNavigate, onRemove }) {
    return (
        <div>
            <div className="flex items-start justify-between gap-2">
                <h3 
                    className="font-semibold text-white hover:text-[#00FF89] cursor-pointer transition-colors"
                    onClick={onNavigate}
                >
                    {item.title}
                </h3>
                <div className="flex items-center gap-1">
                    <button
                        className="text-gray-400 hover:text-[#00FF89] transition-colors p-1.5 rounded-lg hover:bg-[#1f1f1f]"
                        aria-label="Save for later"
                    >
                        <Heart className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onRemove}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-[#1f1f1f]"
                        aria-label="Remove from cart"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
        </div>
    )
}

function ProductMeta({ item }) {
    return (
        <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-gray-400">
                Seller: <span className="text-gray-300">{item.seller?.name || 'Unknown Seller'}</span>
            </span>
            <span className="px-2 py-1 bg-[#00FF89]/20 text-[#00FF89] text-xs rounded">
                {item.category}
            </span>
        </div>
    )
}

function QuantityDisplay({ quantity }) {
    return (
        <div className="text-sm text-gray-400">
            Quantity: {quantity || 1}
        </div>
    )
}

function QuantityControls({ quantity, onIncrease, onDecrease, canDecrease }) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onDecrease}
                disabled={!canDecrease}
                className="w-10 h-10 bg-[#1f1f1f] hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
            >
                <Minus className="w-4 h-4" />
            </button>
            <span className="w-16 text-center font-medium bg-[#1f1f1f] rounded-lg py-2">
                {quantity}
            </span>
            <button
                onClick={onIncrease}
                className="w-10 h-10 bg-[#1f1f1f] hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                aria-label="Increase quantity"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    )
}

function PriceDisplay({ subtotal, originalSubtotal, discountPercentage }) {
    const hasDiscount = originalSubtotal > subtotal
    
    return (
        <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
                <span className="text-lg font-semibold text-[#00FF89]">
                    {formatCurrency(subtotal)}
                </span>
                {hasDiscount && (
                    <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(originalSubtotal)}
                    </span>
                )}
            </div>
            {discountPercentage > 0 && (
                <span className="text-xs text-[#00FF89]">
                    Save {discountPercentage}%
                </span>
            )}
        </div>
    )
}