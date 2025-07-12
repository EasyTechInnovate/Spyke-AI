'use client'

import { useState, useEffect } from 'react'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'

export default function CartPage() {
    const [cartItems, setCartItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate loading cart items
        setTimeout(() => {
            setCartItems([])
            setLoading(false)
        }, 1000)
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <Container>
                    <div className="pt-24 pb-16">
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF89] mx-auto mb-4"></div>
                                <p className="text-gray-400">Loading your cart...</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            
            <main className="pt-24 pb-16">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                                <ShoppingCart className="w-8 h-8 text-[#00FF89]" />
                                Your Cart
                            </h1>
                            <p className="text-gray-400 mt-2">
                                {cartItems.length === 0 ? 'Your cart is empty' : `${cartItems.length} item(s) in your cart`}
                            </p>
                        </div>

                        {cartItems.length === 0 ? (
                            <EmptyCart />
                        ) : (
                            <CartContent items={cartItems} setItems={setCartItems} />
                        )}
                    </div>
                </Container>
            </main>
        </div>
    )
}

function EmptyCart() {
    return (
        <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-500" />
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Discover amazing AI prompts and automation tools to boost your productivity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                    href="/explore"
                    className="px-6 py-3 bg-[#00FF89] text-black rounded-lg font-semibold hover:bg-[#00FF89]/90 transition-colors"
                >
                    Explore Marketplace
                </a>
                <a
                    href="/categories"
                    className="px-6 py-3 border border-gray-700 text-white rounded-lg font-semibold hover:border-gray-600 transition-colors"
                >
                    Browse Categories
                </a>
            </div>
        </div>
    )
}

function CartContent({ items, setItems }) {
    const updateQuantity = (id, newQuantity) => {
        if (newQuantity <= 0) {
            removeItem(id)
            return
        }
        
        setItems(items.map(item => 
            item.id === id ? { ...item, quantity: newQuantity } : item
        ))
    }

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id))
    }

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
                <div className="space-y-4">
                    {items.map((item) => (
                        <CartItem
                            key={item.id}
                            item={item}
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeItem}
                        />
                    ))}
                </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
                <div className="bg-gray-900 rounded-lg p-6 sticky top-24">
                    <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                    
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Subtotal</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Processing Fee</span>
                            <span>$0.00</span>
                        </div>
                        <div className="border-t border-gray-700 pt-3">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total</span>
                                <span className="text-[#00FF89]">${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-3 bg-[#00FF89] text-black rounded-lg font-semibold hover:bg-[#00FF89]/90 transition-colors">
                        Proceed to Checkout
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center mt-4">
                        Secure checkout powered by SpykeAI
                    </p>
                </div>
            </div>
        </div>
    )
}

function CartItem({ item, onUpdateQuantity, onRemove }) {
    return (
        <div className="bg-gray-900 rounded-lg p-4 flex gap-4">
            <div className="w-20 h-20 bg-gray-800 rounded-lg flex-shrink-0"></div>
            
            <div className="flex-1">
                <h4 className="font-semibold text-lg mb-1">{item.title}</h4>
                <p className="text-gray-400 text-sm mb-2">{item.category}</p>
                <p className="text-[#00FF89] font-semibold">${item.price}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
                <button
                    onClick={() => onRemove(item.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}