import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import FilterSidebar from './FilterSidebar'
import { PRODUCT_TYPES, INDUSTRIES, SETUP_TIMES } from '@/data/explore/constants'

export default function MobileFilterDrawer({ isOpen, onClose, filters, categories, onFilterChange }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-black border-l border-gray-800 z-50 lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
              <FilterSidebar
                filters={filters}
                categories={categories}
                productTypes={PRODUCT_TYPES}
                industries={INDUSTRIES}
                setupTimes={SETUP_TIMES}
                onFilterChange={(newFilters) => {
                  onFilterChange(newFilters)
                }}
              />
            </div>

            {/* Apply Button */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-black border-t border-gray-800">
              <button
                onClick={onClose}
                className="w-full py-3 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}