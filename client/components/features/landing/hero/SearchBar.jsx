import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'
import PopularTags from './PopularTags'

export default function SearchBar({ popularTags, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('')
  
  const handleSearch = useCallback(() => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery)
    }
  }, [searchQuery, onSearch])

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-full max-w-2xl mx-auto"
      id="search"
    >
      <div className="relative group">
        {/* Subtle glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
        
        <div className="relative flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
          <div className="flex items-center flex-1">
            <Search className="ml-4 md:ml-5 h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search AI prompts, tools, or templates..."
              className="flex-1 px-3 md:px-4 py-3 md:py-4 bg-transparent text-white placeholder:text-gray-500 focus:outline-none text-sm md:text-base font-light"
              aria-label="Search AI prompts"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 md:px-6 py-3 md:py-4 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-medium transition-all duration-200 border-l border-white/10 text-sm md:text-base"
          >
            Search
          </button>
        </div>
      </div>

      {/* Popular searches */}
      <PopularTags tags={popularTags} onTagClick={setSearchQuery} />
    </motion.div>
  )
}