'use client'

import { useCart } from '@/hooks/useCart'
import { ShoppingCart, Plus } from 'lucide-react'

const SAMPLE_ITEMS = [
  {
    id: 1,
    title: "Ultimate ChatGPT Prompt Collection",
    description: "200+ proven prompts for content creation, marketing, and business growth",
    price: 29.99,
    originalPrice: 49.99,
    category: "Marketing",
    seller: {
      name: "Alex Johnson",
      id: "alex-johnson"
    }
  },
  {
    id: 2,
    title: "AI Email Marketing Automation",
    description: "Complete email sequences and templates that convert at 40%+ rates",
    price: 39.99,
    originalPrice: 69.99,
    category: "Automation",
    seller: {
      name: "Sarah Chen",
      id: "sarah-chen"
    }
  }
]

export default function AddSampleItemsButton({ className = '' }) {
  const { addToCart, getCartCount } = useCart()
  const cartCount = getCartCount()

  const handleAddSampleItems = () => {
    SAMPLE_ITEMS.forEach(item => {
      addToCart(item)
    })
    
    // Show success message
    alert(`Added ${SAMPLE_ITEMS.length} sample items to cart! Cart now has ${cartCount + SAMPLE_ITEMS.length} items.`)
  }

  return (
    <button
      onClick={handleAddSampleItems}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-black font-medium rounded-lg hover:bg-brand-primary/90 transition-colors ${className}`}
    >
      <Plus className="w-4 h-4" />
      Add Sample Items to Cart
      {cartCount > 0 && (
        <span className="ml-2 px-2 py-0.5 bg-black/20 rounded-full text-xs">
          {cartCount} in cart
        </span>
      )}
    </button>
  )
}