import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'
import GlowingButton from './GlowingButton'
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0"
      id="search"
    >
      <div className="relative group">
        {/* Animated border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary via-green-400 to-brand-primary rounded-xl sm:rounded-2xl opacity-30 blur-md sm:blur-lg group-hover:opacity-50 animate-gradient bg-400 transition duration-300" />
        
        <div className="relative flex flex-col sm:flex-row items-center bg-black/70 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-2xl hover:border-brand-primary/50 transition-all duration-300">
          <div className="flex items-center w-full sm:flex-1">
            <Search className="ml-3 sm:ml-4 h-5 w-5 sm:h-6 sm:w-6 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search AI prompts..."
              className="flex-1 px-3 sm:px-4 py-3 sm:py-4 bg-transparent text-white placeholder:text-gray-400 focus:outline-none text-sm sm:text-base lg:text-lg"
              aria-label="Search AI prompts"
            />
          </div>
          <div className="w-full sm:w-auto mt-2 sm:mt-0 px-1.5 sm:px-0">
            <GlowingButton
              onClick={handleSearch}
              primary={true}
              className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-brand-primary hover:bg-brand-primary/90 text-black font-bold rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base"
            >
              Search
            </GlowingButton>
          </div>
        </div>
      </div>

      {/* Popular searches */}
      <PopularTags tags={popularTags} onTagClick={setSearchQuery} />
    </motion.div>
  )
}