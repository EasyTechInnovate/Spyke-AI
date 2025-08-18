'use client'

import { useState } from 'react'
import { Star, Eye, ShoppingCart, Filter, Grid, List } from 'lucide-react'
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
            <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Products Yet</h3>
                <p className="text-gray-400">This seller hasn't created any products yet.</p>
            </div>
        )
    }

    return (
        <div>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    {/* Category Filter */}
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category === 'all' ? 'All Categories' : category}
                            </option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                        <option value="newest">Newest First</option>
                        <option value="popular">Most Popular</option>
                        <option value="rating">Highest Rated</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 mr-2">
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-brand-primary text-black'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${
                            viewMode === 'list'
                                ? 'bg-brand-primary text-black'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Products Grid/List */}
            <div className={
                viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
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

            {/* Load More (if pagination is needed) */}
            {filteredProducts.length >= 9 && (
                <div className="text-center mt-8">
                    <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                        Load More Products
                    </button>
                </div>
            )}
        </div>
    )
}