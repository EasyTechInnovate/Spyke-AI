import { motion } from 'framer-motion'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const renderPageButton = (page) => (
    <button
      key={page}
      onClick={() => onPageChange(page)}
      className={`w-10 h-10 rounded-lg transition-colors ${
        page === currentPage
          ? 'bg-brand-primary text-black font-semibold'
          : 'bg-gray-900 border border-gray-800 hover:bg-gray-800'
      }`}
    >
      {page}
    </button>
  )

  const renderPageButtons = () => {
    const buttons = []
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        buttons.push(renderPageButton(i))
      } else if (
        i === currentPage - 2 || 
        i === currentPage + 2
      ) {
        buttons.push(
          <span key={`ellipsis-${i}`} className="px-2">...</span>
        )
      }
    }
    
    return buttons
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-12 flex justify-center"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <div className="flex gap-1">
          {renderPageButtons()}
        </div>
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </motion.div>
  )
}