import { motion } from 'framer-motion'
import { ChevronDown, Star, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

export default function FilterSidebar({ filters, categories, onFilterChange }) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
    seller: true
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleCategoryChange = (categoryId) => {
    onFilterChange({ ...filters, category: categoryId })
  }

  const handlePriceChange = (value, index) => {
    const newRange = [...filters.priceRange]
    newRange[index] = parseInt(value)
    onFilterChange({ ...filters, priceRange: newRange })
  }

  const handleRatingChange = (rating) => {
    onFilterChange({ ...filters, rating })
  }

  const handleVerifiedChange = (e) => {
    onFilterChange({ ...filters, verified: e.target.checked })
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-8">
      <h2 className="text-xl font-semibold mb-6">Filters</h2>

      {/* Category Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between mb-4 hover:text-brand-primary transition-colors"
        >
          <h3 className="font-medium">Category</h3>
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${
              expandedSections.category ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.category ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-2">
            {categories.map(category => (
              <label
                key={category.id}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={filters.category === category.id}
                    onChange={() => handleCategoryChange(category.id)}
                    className="w-4 h-4 text-brand-primary bg-gray-800 border-gray-700 focus:ring-brand-primary focus:ring-2"
                  />
                  <span className={`text-sm ${
                    filters.category === category.id 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 group-hover:text-gray-300'
                  }`}>
                    {category.name}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {category.count}
                </span>
              </label>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="border-t border-gray-800 my-6" />

      {/* Price Range Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between mb-4 hover:text-brand-primary transition-colors"
        >
          <h3 className="font-medium">Price Range</h3>
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${
              expandedSections.price ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.price ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-400">Min</label>
                <input
                  type="number"
                  min="0"
                  max={filters.priceRange[1]}
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(e.target.value, 0)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>
              <span className="text-gray-500 mt-6">-</span>
              <div className="flex-1">
                <label className="text-xs text-gray-400">Max</label>
                <input
                  type="number"
                  min={filters.priceRange[0]}
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(e.target.value, 1)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}+</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(e.target.value, 1)}
                className="w-full accent-brand-primary"
              />
            </div>

            {/* Quick Price Options */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onFilterChange({ ...filters, priceRange: [0, 25] })}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                Under $25
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, priceRange: [25, 50] })}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                $25 - $50
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, priceRange: [50, 100] })}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                $50 - $100
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, priceRange: [100, 200] })}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                $100+
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="border-t border-gray-800 my-6" />

      {/* Rating Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between mb-4 hover:text-brand-primary transition-colors"
        >
          <h3 className="font-medium">Rating</h3>
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${
              expandedSections.rating ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.rating ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-2">
            {[4, 3, 2, 1, 0].map(rating => (
              <label
                key={rating}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={filters.rating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className="w-4 h-4 text-brand-primary bg-gray-800 border-gray-700 focus:ring-brand-primary focus:ring-2"
                />
                <div className="flex items-center gap-1">
                  {rating === 0 ? (
                    <span className="text-sm text-gray-400 group-hover:text-gray-300">
                      All ratings
                    </span>
                  ) : (
                    <>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-400 group-hover:text-gray-300">
                        & up
                      </span>
                    </>
                  )}
                </div>
              </label>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="border-t border-gray-800 my-6" />

      {/* Seller Filter */}
      <div>
        <button
          onClick={() => toggleSection('seller')}
          className="w-full flex items-center justify-between mb-4 hover:text-brand-primary transition-colors"
        >
          <h3 className="font-medium">Seller</h3>
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${
              expandedSections.seller ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.seller ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.verified}
              onChange={handleVerifiedChange}
              className="w-4 h-4 text-brand-primary bg-gray-800 border-gray-700 rounded focus:ring-brand-primary focus:ring-2"
            />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-primary" />
              <span className="text-sm text-gray-400">Verified sellers only</span>
            </div>
          </label>
        </motion.div>
      </div>

      {/* Clear All Button */}
      <button
        onClick={() => onFilterChange({
          category: 'all',
          priceRange: [0, 200],
          rating: 0,
          verified: false,
          search: filters.search
        })}
        className="w-full mt-6 py-2 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 hover:text-white transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  )
}