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
    maxHeight = 'max-h-60',
    showSelectedCount = false,
    allowClear = false,
    type = 'user' 
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const dropdownRef = useRef(null)
    const themes = {
        user: {
            button: 'bg-[#121212]/50 border-gray-600/50 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50 hover:border-gray-500',
            dropdown: 'bg-gray-800 border-gray-600',
            searchInput: 'bg-gray-700 border-gray-600 focus:ring-[#00FF89]',
            selectedTag: 'bg-[#00FF89]/20 text-[#00FF89]',
            selectedIcon: 'text-[#00FF89]',
            selectedOption: 'bg-[#00FF89]/10 text-white',
            checkIcon: 'text-[#00FF89]',
            optionHover: 'hover:bg-gray-700',
            clearButton: 'hover:bg-gray-700',
            footerBg: 'bg-gray-800/50 border-gray-700',
            optionText: 'text-gray-300'
        },
        customer: {
            button: 'bg-blue-950/30 border-blue-600/40 focus:ring-blue-400/50 focus:border-blue-400/50 hover:border-blue-500',
            dropdown: 'bg-blue-900/90 border-blue-600',
            searchInput: 'bg-blue-800/50 border-blue-600 focus:ring-blue-400',
            selectedTag: 'bg-blue-400/20 text-blue-300',
            selectedIcon: 'text-blue-400',
            selectedOption: 'bg-blue-400/15 text-white',
            checkIcon: 'text-blue-400',
            optionHover: 'hover:bg-blue-800/50',
            clearButton: 'hover:bg-blue-800/50',
            footerBg: 'bg-blue-900/50 border-blue-700',
            optionText: 'text-blue-100'
        },
        admin: {
            button: 'bg-black/80 border-green-500/60 focus:ring-green-400/50 focus:border-green-400 hover:border-green-400',
            dropdown: 'bg-black/95 border-green-500/60',
            searchInput: 'bg-gray-900 border-green-500/50 focus:ring-green-400 focus:border-green-400',
            selectedTag: 'bg-green-400/20 text-green-300',
            selectedIcon: 'text-green-400',
            selectedOption: 'bg-green-400/15 text-green-100 border-green-500/20',
            checkIcon: 'text-green-400',
            optionHover: 'hover:bg-green-900/30 text-white',
            clearButton: 'hover:bg-gray-900',
            footerBg: 'bg-gray-900/80 border-green-500/30',
            optionText: 'text-green-100',
            separatorBorder: 'border-green-500/20'
        },
        seller: {
            button: 'bg-black/80 border-green-500/60 focus:ring-green-400/50 focus:border-green-400 hover:border-green-400',
            dropdown: 'bg-black/95 border-green-500/60',
            searchInput: 'bg-gray-900 border-green-500/50 focus:ring-green-400 focus:border-green-400',
            selectedTag: 'bg-green-400/20 text-green-300',
            selectedIcon: 'text-green-400',
            selectedOption: 'bg-green-400/15 text-green-100 border-green-500/20',
            checkIcon: 'text-green-400',
            optionHover: 'hover:bg-green-900/30 text-white',
            clearButton: 'hover:bg-gray-900',
            footerBg: 'bg-gray-900/80 border-green-500/30',
            optionText: 'text-green-100',
            separatorBorder: 'border-green-500/20'
        }
    }
    const currentTheme = themes[type] || themes.user
    const filteredOptions = options.filter(
        (option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (option.searchText && option.searchText.includes(searchTerm.toLowerCase()))
    )
    const selectedOptions = multiple
        ? options.filter((opt) => (Array.isArray(value) ? value.includes(opt.value) : false))
        : options.filter((opt) => opt.value === value)
    const selectedOption = multiple ? null : options.find((opt) => opt.value === value)
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
                ? currentValues.filter((v) => v !== selectedValue)
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
        return multiple ? Array.isArray(value) && value.includes(option.value) : value === option.value
    }
    return (
        <div
            className={cn('relative', className)}
            ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-full px-3 py-3 text-sm text-left focus:outline-none focus:ring-2 transition-all flex items-center justify-between min-h-[48px]',
                    currentTheme.button,
                    error
                        ? 'border-red-500 focus:ring-red-500/50'
                        : ''
                )}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {multiple ? (
                        selectedOptions.length > 0 ? (
                            <div className="flex items-center gap-2 flex-wrap">
                                {showSelectedCount && selectedOptions.length > 3 ? (
                                    <>
                                        {selectedOptions.slice(0, 2).map((option) => (
                                            <div
                                                key={option.value}
                                                className={cn('flex items-center gap-1 px-2 py-1 rounded-md text-xs', currentTheme.selectedTag)}>
                                                {option.icon && (
                                                    <option.icon className="w-3 h-3" />
                                                )}
                                                <span className="truncate max-w-[80px]">{option.label}</span>
                                            </div>
                                        ))}
                                        <span className="font-medium text-xs" style={{ color: currentTheme.selectedIcon }}>{`+${selectedOptions.length - 2} more`}</span>
                                    </>
                                ) : (
                                    selectedOptions.slice(0, 4).map((option) => (
                                        <div
                                            key={option.value}
                                            className={cn('flex items-center gap-1 px-2 py-1 rounded-md text-xs', currentTheme.selectedTag)}>
                                            {option.icon && (
                                                <option.icon className="w-3 h-3" />
                                            )}
                                            <span className="truncate max-w-[100px]">{option.label}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <span className="text-gray-400 text-sm">{placeholder}</span>
                        )
                    ) : 
                    selectedOption ? (
                        <>
                            {selectedOption.icon && (
                                <selectedOption.icon className={cn('w-4 h-4 flex-shrink-0', currentTheme.selectedIcon)} />
                            )}
                            <span className="text-white truncate text-sm font-medium">{selectedOption.label}</span>
                        </>
                    ) : (
                        <span className="text-gray-400 text-sm">{placeholder}</span>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {allowClear && (selectedOption || (multiple && selectedOptions.length > 0)) && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className={cn('p-1 rounded transition-colors', currentTheme.clearButton)}>
                            <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
                        </button>
                    )}
                    <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', isOpen && 'rotate-180')} />
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
                            'absolute top-full left-0 right-0 mt-2 rounded-lg shadow-2xl overflow-hidden backdrop-blur-md',
                            'z-[9999]',
                            currentTheme.dropdown,
                            maxHeight
                        )}
                        style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                            position: 'absolute',
                            zIndex: 9999
                        }}>
                        {searchable && (
                            <div className="p-3 border-b sticky top-0" style={{ backgroundColor: currentTheme.dropdown, borderColor: currentTheme.footerBg }}>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search..."
                                        className={cn('w-full pl-10 pr-3 py-2 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 text-sm', currentTheme.searchInput)}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="max-h-48 overflow-y-auto">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => {
                                    const selected = isSelected(option)
                                    return (
                                        <motion.button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            className={cn(
                                                'w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-b last:border-b-0',
                                                selected 
                                                    ? `${currentTheme.selectedOption}` 
                                                    : `${currentTheme.optionHover} ${currentTheme.optionText}`,
                                                currentTheme.separatorBorder || 'border-gray-700/50'
                                            )}>
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {option.icon && (
                                                    <option.icon className={cn('w-5 h-5 flex-shrink-0', selected ? currentTheme.selectedIcon : 'text-gray-400')} />
                                                )}
                                                <span className={cn('truncate font-medium text-sm', selected ? 'text-current' : currentTheme.optionText)}>{option.label}</span>
                                            </div>
                                            {selected && <Check className={cn('w-4 h-4 flex-shrink-0', currentTheme.checkIcon)} />}
                                        </motion.button>
                                    )
                                })
                            ) : (
                                <div className="px-4 py-6 text-gray-400 text-center">
                                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No options found</p>
                                </div>
                            )}
                        </div>
                        {multiple && selectedOptions.length > 0 && (
                            <div className="p-3 border-t sticky bottom-0" style={{ backgroundColor: currentTheme.footerBg, borderColor: currentTheme.footerBg }}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">{selectedOptions.length} selected</span>
                                    {allowClear && (
                                        <button
                                            type="button"
                                            onClick={handleClear}
                                            className="text-red-400 hover:text-red-300 font-medium">
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