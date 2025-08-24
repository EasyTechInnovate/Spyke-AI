'use client'

import { useState } from 'react'
import { Star, Eye, ShoppingCart, Filter, Grid, List, Package2 } from 'lucide-react'
import ProductCard from './ProductCard'

export default function SellerProducts({ products = [], sellerId, onProductClick }) {
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('newest') // 'newest', 'popular', 'price-low', 'price-high', 'rating'
    const [filterCategory, setFilterCategory] = useState('all')

    // Get unique categories from products
    const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

    // Filter and sort products
    const filteredProducts = products
        .filter(product => filterCategory === 'all' || product.category === filterCategory)
        .sort((a, b) => {
            switch (sortBy) {
                case 'popular':
                    return (b.sales || 0) - (a.sales || 0)
                case 'price-low':
                    return (a.price || 0) - (b.price || 0)
                case 'price-high':
                    return (b.price || 0) - (a.price || 0)
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0)
                case 'newest':
                default:
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            }
        })

    if (products.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="relative w-32 h-32 mx-auto mb-8">
                    {/* Glass morphism background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl rounded-3xl border border-white/20"></div>
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl flex items-center justify-center">
                            <Package2 className="w-8 h-8 text-brand-primary" />
                        </div>
                    </div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
                    No Products Yet
                </h3>
                <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
                    This seller hasn't created any products yet. Check back later for new listings!
                </p>
            </div>
        )
    }

    return (
        <div>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    {/* Category Filter */}
                    <div className="relative">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all duration-300 hover:bg-white/10 appearance-none cursor-pointer min-w-[150px]"
                        >
                            {categories.map(category => (
                                <option key={category} value={category} className="bg-gray-900 text-white">
                                    {category === 'all' ? 'All Categories' : category}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <Filter className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all duration-300 hover:bg-white/10 appearance-none cursor-pointer min-w-[160px]"
                        >
                            <option value="newest" className="bg-gray-900 text-white">Newest First</option>
                            <option value="popular" className="bg-gray-900 text-white">Most Popular</option>
                            <option value="rating" className="bg-gray-900 text-white">Highest Rated</option>
                            <option value="price-low" className="bg-gray-900 text-white">Price: Low to High</option>
                            <option value="price-high" className="bg-gray-900 text-white">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400 font-medium">
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-lg transition-all duration-300 ${
                                viewMode === 'grid'
                                    ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-black shadow-lg shadow-brand-primary/25'
                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-lg transition-all duration-300 ${
                                viewMode === 'list'
                                    ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-black shadow-lg shadow-brand-primary/25'
                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Grid/List */}
            <div className={
                viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-6'
            }>
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product._id || product.id}
                        product={product}
                        viewMode={viewMode}
                        onClick={() => onProductClick?.(product.slug || product._id || product.id)}
                    />
                ))}
            </div>

            {/* Load More */}
            {filteredProducts.length >= 9 && (
                <div className="text-center mt-12">
                    <button className="group relative px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-brand-primary/10">
                        <span className="relative z-10">Load More Products</span>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </div>
            )}
        </div>
    )
}