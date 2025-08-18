import { motion } from 'framer-motion'
import { ChevronDown, Star, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

export default function FilterSidebar({ filters, categories, productTypes, industries, setupTimes, onFilterChange }) {
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    category: true,
    industry: false,
    setupTime: false,
    price: false,
    rating: false,
    seller: false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleTypeChange = (typeId) => {
    onFilterChange({ ...filters, type: typeId })
  }

  const handleCategoryChange = (categoryId) => {
    onFilterChange({ ...filters, category: categoryId })
  }

  const handleIndustryChange = (industryId) => {
    onFilterChange({ ...filters, industry: industryId })
  }

  const handleSetupTimeChange = (setupTimeId) => {
    onFilterChange({ ...filters, setupTime: setupTimeId })
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
    <div className="w-56 bg-gray-900/80 border border-gray-800 rounded-xl p-3 sticky top-8 backdrop-blur-sm">
      <h2 className="text-base font-semibold mb-3">Filters</h2>

      {/* Product Type Filter */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('type')}
          className="w-full flex items-center justify-between mb-2 hover:text-brand-primary transition-colors"
        >
          <h3 className="font-medium text-xs">Product Type</h3>
          <ChevronDown 
            className={`w-3 h-3 transition-transform ${
              expandedSections.type ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.type ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-1">
            {productTypes.map(type => (
              <label
                key={type.id}
                className="flex items-center cursor-pointer group py-0.5"
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="type"
                    value={type.id}
                    checked={filters.type === type.id}
                    onChange={() => handleTypeChange(type.id)}
                    className="w-3 h-3 text-brand-primary bg-gray-800 border-gray-700 focus:ring-brand-primary focus:ring-1"
                  />
                  <span className={`text-xs ${
                    filters.type === type.id 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 group-hover:text-gray-300'
                  }`}>
                    {type.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="border-t border-gray-800 my-3" />

      {/* Category Filter */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between mb-2 hover:text-brand-primary transition-colors"
        >
          <h3 className="font-medium text-xs">Category</h3>
          <ChevronDown 
            className={`w-3 h-3 transition-transform ${
              expandedSections.category ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.category ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-1">
            {categories.map(category => (
              <label
                key={category.id}
                className="flex items-center cursor-pointer group py-0.5"
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={filters.category === category.id}
                    onChange={() => handleCategoryChange(category.id)}
                    className="w-3 h-3 text-brand-primary bg-gray-800 border-gray-700 focus:ring-brand-primary focus:ring-1"
                  />
                  <span className={`text-xs ${
                    filters.category === category.id 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 group-hover:text-gray-300'
                  }`}>
                    {category.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="border-t border-gray-800 my-3" />

      {/* Industry Filter */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('industry')}
          className="w-full flex items-center justify-between mb-2 hover:text-brand-primary transition-colors"
        >
          <h3 className="font-medium text-xs">Industry</h3>
          <ChevronDown 
            className={`w-3 h-3 transition-transform ${
              expandedSections.industry ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.industry ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-1">
            {industries.map(industry => (
              <label
                key={industry.id}
                className="flex items-center cursor-pointer group py-0.5"
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="industry"
                    value={industry.id}
                    checked={filters.industry === industry.id}
                    onChange={() => handleIndustryChange(industry.id)}
                    className="w-3 h-3 text-brand-primary bg-gray-800 border-gray-700 focus:ring-brand-primary focus:ring-1"
                  />
                  <span className={`text-xs ${
                    filters.industry === industry.id 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 group-hover:text-gray-300'
                  }`}>
                    {industry.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="border-t border-gray-800 my-3" />

      {/* Setup Time Filter */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('setupTime')}
          className="w-full flex items-center justify-between mb-2 hover:text-brand-primary transition-colors"
        >
          <h3 className="font-medium text-xs">Setup Time</h3>
          <ChevronDown 
            className={`w-3 h-3 transition-transform ${
              expandedSections.setupTime ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.setupTime ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-1">
            {setupTimes.map(setupTime => (
              <label
                key={setupTime.id}
                className="flex items-center cursor-pointer group py-0.5"
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="setupTime"
                    value={setupTime.id}
                    checked={filters.setupTime === setupTime.id}
                    onChange={() => handleSetupTimeChange(setupTime.id)}
                    className="w-3 h-3 text-brand-primary bg-gray-800 border-gray-700 focus:ring-brand-primary focus:ring-1"
                  />
                  <span className={`text-xs ${
                    filters.setupTime === setupTime.id 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 group-hover:text-gray-300'
                  }`}>
                    {setupTime.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="border-t border-gray-800 my-3" />

      {/* Price Range Filter */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between mb-2 hover:text-brand-primary transition-colors"
        >
          <h3 className="font-medium text-xs">Price</h3>
          <ChevronDown 
            className={`w-3 h-3 transition-transform ${
              expandedSections.price ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.price ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-2">
            {/* Quick Price Options - Smaller */}
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => onFilterChange({ ...filters, priceRange: [0, 25] })}
                className="px-1.5 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors"
              >
                &lt;$25
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, priceRange: [25, 50] })}
                className="px-1.5 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors"
              >
                $25-50
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, priceRange: [50, 100] })}
                className="px-1.5 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors"
              >
                $50-100
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, priceRange: [100, 200] })}
                className="px-1.5 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors"
              >
                $100+
              </button>
            </div>

            {/* Custom Range - Ultra Compact */}
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max={filters.priceRange[1]}
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceChange(e.target.value, 0)}
                placeholder="0"
                className="w-12 px-1 py-0.5 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
              <span className="text-gray-500 text-xs">-</span>
              <input
                type="number"
                min={filters.priceRange[0]}
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(e.target.value, 1)}
                placeholder="1000"
                className="w-12 px-1 py-0.5 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="border-t border-gray-800 my-3" />

      {/* Rating Filter */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between mb-2 hover:text-brand-primary transition-colors"
        >
          <h3 className="font-medium text-xs">Rating</h3>
          <ChevronDown 
            className={`w-3 h-3 transition-transform ${
              expandedSections.rating ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.rating ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-1">
            {[4, 3, 2, 1, 0].map(rating => (
              <label
                key={rating}
                className="flex items-center gap-1.5 cursor-pointer group py-0.5"
              >
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={filters.rating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className="w-3 h-3 text-brand-primary bg-gray-800 border-gray-700 focus:ring-brand-primary focus:ring-1"
                />
                <div className="flex items-center gap-0.5">
                  {rating === 0 ? (
                    <span className="text-xs text-gray-400 group-hover:text-gray-300">
                      All
                    </span>
                  ) : (
                    <>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-2.5 h-2.5 ${
                              i < rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-gray-300">
                        +
                      </span>
                    </>
                  )}
                </div>
              </label>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="border-t border-gray-800 my-3" />

      {/* Seller Filter */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('seller')}
          className="w-full flex items-center justify-between mb-2 hover:text-brand-primary transition-colors"
        >
          <h3 className="font-medium text-xs">Seller</h3>
          <ChevronDown 
            className={`w-3 h-3 transition-transform ${
              expandedSections.seller ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.seller ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <label className="flex items-center gap-1.5 cursor-pointer py-0.5">
            <input
              type="checkbox"
              checked={filters.verified}
              onChange={handleVerifiedChange}
              className="w-3 h-3 text-brand-primary bg-gray-800 border-gray-700 rounded focus:ring-brand-primary focus:ring-1"
            />
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-brand-primary" />
              <span className="text-xs text-gray-400">Verified</span>
            </div>
          </label>
        </motion.div>
      </div>

      {/* Clear All Button - Ultra Compact */}
      <button
        onClick={() => onFilterChange({
          category: 'all',
          type: 'all',
          industry: 'all',
          setupTime: 'all',
          priceRange: [0, 200],
          rating: 0,
          verified: false,
          search: filters.search
        })}
        className="w-full mt-3 py-1 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-colors text-xs"
      >
        Clear
      </button>
    </div>
  )
}