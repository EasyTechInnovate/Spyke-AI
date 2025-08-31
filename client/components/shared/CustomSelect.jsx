'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  error, 
  onBlur,
  multiple = false,
  searchable = true,
  className,
  maxHeight = "max-h-60",
  showSelectedCount = false,
  allowClear = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle single vs multiple selection
  const selectedOptions = multiple 
    ? options.filter(opt => Array.isArray(value) ? value.includes(opt.value) : false)
    : options.filter(opt => opt.value === value)

  const selectedOption = multiple ? null : options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (selectedValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter(v => v !== selectedValue)
        : [...currentValues, selectedValue]
      onChange(newValues)
    } else {
      onChange(selectedValue)
      setIsOpen(false)
      setSearchTerm('')
    }
    onBlur?.()
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange(multiple ? [] : '')
    onBlur?.()
  }

  const isSelected = (option) => {
    return multiple 
      ? Array.isArray(value) && value.includes(option.value)
      : value === option.value
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-5 py-4 text-lg bg-gray-800 border rounded-lg text-left focus:outline-none focus:ring-2 transition-all flex items-center justify-between min-h-[60px]",
          error
            ? 'border-red-500 focus:ring-red-500/50'
            : 'border-gray-600 focus:ring-[#00FF89]/50 focus:border-[#00FF89] hover:border-gray-500'
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {multiple ? (
            // Multiple selection display
            selectedOptions.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                {showSelectedCount && selectedOptions.length > 3 ? (
                  <>
                    {selectedOptions.slice(0, 2).map(option => (
                      <div key={option.value} className="flex items-center gap-2 px-2 py-1 bg-[#00FF89]/20 text-[#00FF89] rounded-md text-sm">
                        <option.icon className="w-4 h-4" />
                        <span className="truncate max-w-[100px]">{option.label}</span>
                      </div>
                    ))}
                    <span className="text-[#00FF89] font-medium text-sm">
                      +{selectedOptions.length - 2} more
                    </span>
                  </>
                ) : (
                  selectedOptions.slice(0, 4).map(option => (
                    <div key={option.value} className="flex items-center gap-2 px-2 py-1 bg-[#00FF89]/20 text-[#00FF89] rounded-md text-sm">
                      <option.icon className="w-4 h-4" />
                      <span className="truncate max-w-[120px]">{option.label}</span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )
          ) : (
            // Single selection display
            selectedOption ? (
              <>
                <selectedOption.icon className="w-5 h-5 text-[#00FF89] flex-shrink-0" />
                <span className="text-white truncate">{selectedOption.label}</span>
              </>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {allowClear && (selectedOption || (multiple && selectedOptions.length > 0)) && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "w-5 h-5 text-gray-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden",
              maxHeight
            )}
          >
            {/* Search Input */}
            {searchable && (
              <div className="p-3 border-b border-gray-700 sticky top-0 bg-gray-800">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00FF89] text-sm"
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const selected = isSelected(option)
                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.5)" }}
                      className={cn(
                        "w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-b border-gray-700/50 last:border-b-0",
                        selected 
                          ? "bg-[#00FF89]/10 text-white" 
                          : "hover:bg-gray-700 text-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <option.icon className={cn(
                          "w-5 h-5 flex-shrink-0",
                          selected ? "text-[#00FF89]" : "text-gray-400"
                        )} />
                        <span className="truncate font-medium">{option.label}</span>
                      </div>
                      {selected && (
                        <Check className="w-4 h-4 text-[#00FF89] flex-shrink-0" />
                      )}
                    </motion.button>
                  )
                })
              ) : (
                <div className="px-4 py-6 text-gray-400 text-center">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No options found</p>
                </div>
              )}
            </div>

            {/* Footer with selection count for multiple */}
            {multiple && selectedOptions.length > 0 && (
              <div className="p-3 border-t border-gray-700 bg-gray-800/50 sticky bottom-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {selectedOptions.length} selected
                  </span>
                  {allowClear && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-red-400 hover:text-red-300 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}