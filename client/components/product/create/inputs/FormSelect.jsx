import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, ChevronDown, Check, Search } from 'lucide-react'

const FormSelect = ({
    label,
    placeholder = 'Select an option',
    value = '',
    onChange,
    options = [],
    required = false,
    error,
    success,
    icon: Icon,
    description,
    className = '',
    disabled = false,
    searchable = false,
    multiple = false,
    autoFocus = false,
    onBlur,
    onFocus,
    touched = false,
    maxHeight = '200px',
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const selectRef = useRef(null)
    const dropdownRef = useRef(null)
    const searchInputRef = useRef(null)

    // Auto-focus when specified
    useEffect(() => {
        if (autoFocus && selectRef.current) {
            selectRef.current.focus()
        }
    }, [autoFocus])

    // Handle clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false)
                setSearchQuery('')
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!isOpen) return

            switch (event.key) {
                case 'Escape':
                    setIsOpen(false)
                    setSearchQuery('')
                    break
                case 'Enter':
                    event.preventDefault()
                    if (filteredOptions.length > 0) {
                        handleSelect(filteredOptions[0].value)
                    }
                    break
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            return () => document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen])

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100)
        }
    }, [isOpen, searchable])

    const handleFocus = (e) => {
        setIsFocused(true)
        onFocus?.(e)
    }

    const handleBlur = (e) => {
        // Don't blur if clicking inside dropdown
        if (!selectRef.current?.contains(e.relatedTarget)) {
            setIsFocused(false)
            onBlur?.(e)
        }
    }

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen)
            if (!isOpen) {
                setSearchQuery('')
            }
        }
    }

    const handleSelect = (selectedValue) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : []
            const newValues = currentValues.includes(selectedValue)
                ? currentValues.filter(v => v !== selectedValue)
                : [...currentValues, selectedValue]
            onChange?.(newValues)
        } else {
            onChange?.(selectedValue)
            setIsOpen(false)
            setSearchQuery('')
        }
    }

    // Determine validation state
    const hasError = error && touched
    const hasSuccess = success && !error && value && touched

    // Filter options based on search query
    const filteredOptions = searchable && searchQuery
        ? options.filter(option => 
            option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            option.value.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : options

    // Get display text
    const getDisplayText = () => {
        if (multiple && Array.isArray(value)) {
            if (value.length === 0) return placeholder
            if (value.length === 1) {
                const option = options.find(opt => opt.value === value[0])
                return option?.label || value[0]
            }
            return `${value.length} selected`
        } else {
            const option = options.find(opt => opt.value === value)
            return option?.label || placeholder
        }
    }

    const displayText = getDisplayText()
    const hasValue = multiple ? (Array.isArray(value) && value.length > 0) : value

    return (
        <div className={`relative space-y-2 ${className}`} ref={selectRef}>
            {/* Label */}
            {label && (
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-3">
                    {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                    <span className="text-base">{label}</span>
                    {required && <span className="text-[#00FF89] text-sm">*</span>}
                    {multiple && hasValue && (
                        <span className="text-xs text-gray-500 ml-auto">
                            {Array.isArray(value) ? value.length : 0} selected
                        </span>
                    )}
                </label>
            )}

            {/* Select Container */}
            <div 
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <button
                    type="button"
                    onClick={handleToggle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-3.5 text-base bg-gray-900/60 backdrop-blur-sm
                        border-2 rounded-xl text-left transition-all duration-300 ease-in-out
                        focus:outline-none focus:ring-0 flex items-center justify-between
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${hasError 
                            ? 'border-red-500 bg-red-500/5 focus:border-red-400 focus:bg-red-500/10' 
                            : hasSuccess 
                                ? 'border-green-500 bg-green-500/5 focus:border-green-400 focus:bg-green-500/10'
                                : isFocused || isOpen
                                    ? 'border-[#00FF89] bg-[#00FF89]/5 shadow-lg shadow-[#00FF89]/20'
                                    : isHovered
                                        ? 'border-gray-600 bg-gray-800/80'
                                        : 'border-gray-700 hover:border-gray-600'
                        }
                        ${Icon ? 'pl-12' : ''}
                    `}
                    {...props}
                >
                    <span className={`${hasValue ? 'text-white' : 'text-gray-500'} truncate`}>
                        {displayText}
                    </span>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Validation Icons */}
                        {hasError && <AlertCircle className="w-5 h-5 text-red-400" />}
                        {hasSuccess && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                        
                        {/* Dropdown Arrow */}
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                        } ${
                            hasError ? 'text-red-400' :
                            hasSuccess ? 'text-green-400' :
                            isFocused || isOpen ? 'text-[#00FF89]' :
                            'text-gray-400'
                        }`} />
                    </div>
                </button>

                {/* Icon (left side) */}
                {Icon && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <Icon className={`w-5 h-5 transition-colors duration-200 ${
                            hasError ? 'text-red-400' :
                            hasSuccess ? 'text-green-400' :
                            isFocused || isOpen ? 'text-[#00FF89]' :
                            'text-gray-500'
                        }`} />
                    </div>
                )}

                {/* Focus Ring Animation */}
                <AnimatePresence>
                    {(isFocused || isOpen) && !hasError && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 rounded-xl border-2 border-[#00FF89] pointer-events-none"
                            style={{ 
                                boxShadow: '0 0 0 3px rgba(0, 255, 137, 0.1)' 
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Dropdown */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl backdrop-blur-sm"
                            style={{ maxHeight }}
                        >
                            {/* Search Input */}
                            {searchable && (
                                <div className="p-3 border-b border-gray-700">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder="Search options..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Options List */}
                            <div className="max-h-48 overflow-y-auto py-2">
                                {filteredOptions.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                        {searchQuery ? 'No matching options' : 'No options available'}
                                    </div>
                                ) : (
                                    filteredOptions.map((option, index) => {
                                        const isSelected = multiple 
                                            ? Array.isArray(value) && value.includes(option.value)
                                            : value === option.value

                                        return (
                                            <motion.button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleSelect(option.value)}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`
                                                    w-full px-4 py-3 text-left text-sm transition-all duration-200
                                                    flex items-center justify-between hover:bg-gray-800
                                                    ${isSelected 
                                                        ? 'bg-[#00FF89]/10 text-[#00FF89] border-l-2 border-[#00FF89]' 
                                                        : 'text-white'
                                                    }
                                                `}
                                            >
                                                <span className="truncate">{option.label}</span>
                                                {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                                            </motion.button>
                                        )
                                    })
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Description and Error/Success Messages */}
            <div className="space-y-2">
                {/* Description */}
                {description && !hasError && (
                    <p className="text-sm text-gray-400 leading-relaxed">
                        {description}
                    </p>
                )}

                {/* Error Message */}
                <AnimatePresence mode="wait">
                    {hasError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                        >
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-red-300 font-medium">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success Message */}
                <AnimatePresence mode="wait">
                    {hasSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                        >
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-green-300 font-medium">{success}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Help Text */}
                {(isFocused || isOpen) && !hasError && multiple && (
                    <div className="text-xs text-gray-500">
                        Click to select multiple options
                    </div>
                )}
            </div>
        </div>
    )
}

export default FormSelect

