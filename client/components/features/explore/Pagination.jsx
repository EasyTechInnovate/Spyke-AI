import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MoreHorizontal, Loader2 } from 'lucide-react'
import { useMemo } from 'react'
export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  isLoading = false,
  hasNextPage = true,
  hasPrevPage = true,
  showPageInfo = true,
  maxVisiblePages = 7
}) {
  const pageNumbers = useMemo(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages = []
    const halfVisible = Math.floor(maxVisiblePages / 2)
    pages.push(1)
    let startPage = Math.max(2, currentPage - halfVisible)
    let endPage = Math.min(totalPages - 1, currentPage + halfVisible)
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages - 1, maxVisiblePages - 1)
    } else if (currentPage >= totalPages - halfVisible) {
      startPage = Math.max(2, totalPages - maxVisiblePages + 2)
    }
    if (startPage > 2) {
      pages.push('ellipsis-start')
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    if (endPage < totalPages - 1) {
      pages.push('ellipsis-end')
    }
    if (totalPages > 1) {
      pages.push(totalPages)
    }
    return pages
  }, [currentPage, totalPages, maxVisiblePages])
  const handlePageClick = (page) => {
    if (page !== currentPage && !isLoading) {
      onPageChange(page)
    }
  }
  const handlePrevious = () => {
    if (hasPrevPage && currentPage > 1 && !isLoading) {
      onPageChange(currentPage - 1)
    }
  }
  const handleNext = () => {
    if (hasNextPage && currentPage < totalPages && !isLoading) {
      onPageChange(currentPage + 1)
    }
  }
  if (totalPages <= 1) return null
  return (
    <div className="flex flex-col items-center gap-6">
      {showPageInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-400 text-center"
        >
          Page {currentPage} of {totalPages}
          {isLoading && (
            <span className="ml-2 inline-flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading...
            </span>
          )}
        </motion.div>
      )}
      <nav aria-label="Pagination Navigation" className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: hasPrevPage && !isLoading ? 1.05 : 1 }}
          whileTap={{ scale: hasPrevPage && !isLoading ? 0.95 : 1 }}
          onClick={handlePrevious}
          disabled={!hasPrevPage || currentPage <= 1 || isLoading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
            ${hasPrevPage && currentPage > 1 && !isLoading
              ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700 hover:border-gray-600'
              : 'bg-gray-900/50 text-gray-600 border border-gray-800 cursor-not-allowed'
            }
          `}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </motion.button>
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (typeof page === 'string' && page.startsWith('ellipsis')) {
              return (
                <div
                  key={page}
                  className="px-2 py-2 text-gray-500"
                  aria-hidden="true"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              )
            }
            const isActive = page === currentPage
            const isClickable = !isLoading && page !== currentPage
            return (
              <motion.button
                key={page}
                whileHover={{ scale: isClickable ? 1.1 : 1 }}
                whileTap={{ scale: isClickable ? 0.9 : 1 }}
                onClick={() => handlePageClick(page)}
                disabled={isLoading || page === currentPage}
                className={`
                  min-w-[40px] h-10 px-3 py-2 rounded-xl font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/25'
                    : isClickable
                      ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700 hover:border-brand-primary/50'
                      : 'bg-gray-900/50 text-gray-600 border border-gray-800'
                  }
                `}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isLoading && isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  page
                )}
              </motion.button>
            )
          })}
        </div>
        <motion.button
          whileHover={{ scale: hasNextPage && !isLoading ? 1.05 : 1 }}
          whileTap={{ scale: hasNextPage && !isLoading ? 0.95 : 1 }}
          onClick={handleNext}
          disabled={!hasNextPage || currentPage >= totalPages || isLoading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
            ${hasNextPage && currentPage < totalPages && !isLoading
              ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700 hover:border-gray-600'
              : 'bg-gray-900/50 text-gray-600 border border-gray-800 cursor-not-allowed'
            }
          `}
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </nav>
      {totalPages > 10 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 text-sm"
        >
          <span className="text-gray-400">Jump to:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            placeholder="Page"
            className="w-20 px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const page = parseInt(e.target.value)
                if (page >= 1 && page <= totalPages && page !== currentPage) {
                  handlePageClick(page)
                  e.target.value = ''
                }
              }
            }}
            disabled={isLoading}
          />
        </motion.div>
      )}
    </div>
  )
}