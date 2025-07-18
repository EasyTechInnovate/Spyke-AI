'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import SellerProfileHeader from '@/components/features/seller/profile/SellerProfileHeader'
import SellerProducts from '@/components/features/seller/profile/SellerProducts'
import SellerReviews from '@/components/features/seller/profile/SellerReviews'
import SellerAbout from '@/components/features/seller/profile/SellerAbout'
import LoadingSpinner from '@/components/shared/ui/LoadingSpinner'
import { useTrackEvent } from '@/hooks/useTrackEvent'
import { ANALYTICS_EVENTS, eventProperties } from '@/lib/analytics/events'
import toast from '@/lib/utils/toast'
import sellerAPI from '@/lib/api/seller'

export default function PublicSellerProfile() {
    const params = useParams()
    const sellerId = params.sellerId
    const track = useTrackEvent()
    
    const [seller, setSeller] = useState(null)
    const [products, setProducts] = useState([])
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('products')
    const [error, setError] = useState(null)

    useEffect(() => {
        if (sellerId) {
            track(ANALYTICS_EVENTS.SELLER.PROFILE_VIEWED, eventProperties.seller('public_profile_view', { sellerId }))
            loadSellerData()
        }
    }, [sellerId])

    const loadSellerData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Load seller profile and products in parallel
            const [sellerResponse, productsResponse] = await Promise.all([
                sellerAPI.getPublicProfile(sellerId),
                sellerAPI.getProducts({ sellerId, status: 'active' }).catch(() => ({ products: [] }))
            ])

            if (!sellerResponse) {
                throw new Error('Seller not found')
            }

            setSeller(sellerResponse)
            setProducts(productsResponse.products || productsResponse || [])
            
            // Load reviews separately as they might be optional
            try {
                // TODO: Implement reviews API
                setReviews([]) // Mock empty for now
            } catch (reviewError) {
                console.warn('Reviews not available:', reviewError)
                setReviews([])
            }

        } catch (error) {
            console.error('Error loading seller profile:', error)
            setError(error.message || 'Failed to load seller profile')
            toast.operation.genericError('Failed to load seller profile')
        } finally {
            setLoading(false)
        }
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        track(ANALYTICS_EVENTS.SELLER.PROFILE_TAB_CLICKED, eventProperties.seller('profile_tab', { 
            sellerId, 
            tab 
        }))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <Container>
                    <div className="pt-24 pb-16">
                        <LoadingSpinner message="Loading seller profile..." />
                    </div>
                </Container>
            </div>
        )
    }

    if (error || !seller) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <Container>
                    <div className="pt-24 pb-16">
                        <div className="text-center py-16">
                            <h1 className="text-2xl font-bold text-white mb-4">Seller Not Found</h1>
                            <p className="text-gray-400 mb-8">The seller profile you're looking for doesn't exist or has been removed.</p>
                            <a
                                href="/explore"
                                className="inline-flex items-center px-6 py-3 bg-brand-primary text-black rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors"
                            >
                                Explore Other Sellers
                            </a>
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
                    <div className="max-w-6xl mx-auto">
                        {/* Seller Profile Header */}
                        <SellerProfileHeader 
                            seller={seller} 
                            productsCount={products.length}
                            reviewsCount={reviews.length}
                        />

                        {/* Navigation Tabs */}
                        <div className="border-b border-gray-800 mb-8">
                            <nav className="flex space-x-8">
                                <TabButton
                                    label="Products"
                                    count={products.length}
                                    isActive={activeTab === 'products'}
                                    onClick={() => handleTabChange('products')}
                                />
                                <TabButton
                                    label="About"
                                    isActive={activeTab === 'about'}
                                    onClick={() => handleTabChange('about')}
                                />
                                <TabButton
                                    label="Reviews"
                                    count={reviews.length}
                                    isActive={activeTab === 'reviews'}
                                    onClick={() => handleTabChange('reviews')}
                                />
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[400px]">
                            {activeTab === 'products' && (
                                <SellerProducts 
                                    products={products} 
                                    sellerId={sellerId}
                                    onProductClick={(productId) => {
                                        track(ANALYTICS_EVENTS.SELLER.PRODUCT_CLICKED, eventProperties.seller('product_click', { 
                                            sellerId, 
                                            productId 
                                        }))
                                    }}
                                />
                            )}
                            
                            {activeTab === 'about' && (
                                <SellerAbout seller={seller} />
                            )}
                            
                            {activeTab === 'reviews' && (
                                <SellerReviews 
                                    reviews={reviews} 
                                    sellerId={sellerId}
                                />
                            )}
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    )
}

function TabButton({ label, count, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                isActive
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
        >
            {label}
            {count !== undefined && (
                <span className="ml-2 px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full">
                    {count}
                </span>
            )}
        </button>
    )
}