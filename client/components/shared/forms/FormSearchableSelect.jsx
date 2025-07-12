'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'

/**
 * @typedef {Object} SearchableOption
 * @property {string} value - Option value
 * @property {string} label - Option label
 * @property {string} [description] - Optional description
 */

/**
 * @typedef {Object} FormSearchableSelectProps
 * @property {string} [label] - Field label
 * @property {string} name - Field name
 * @property {string} [value=''] - Selected value
 * @property {function} onChange - Change handler
 * @property {string} [error] - Error message
 * @property {string} [placeholder='Search...'] - Placeholder text
 * @property {string} [helperText] - Helper text
 * @property {boolean} [required] - Whether field is required
 * @property {string} [className] - Additional CSS classes
 * @property {SearchableOption[]} options - Select options
 * @property {boolean} [disabled] - Whether field is disabled
 * @property {string} [noResultsText='No results found'] - No results message
 */

/**
 * Reusable searchable select component
 * @param {FormSearchableSelectProps} props
 */
export default function FormSearchableSelect({
    label,
    name,
    value = '',
    onChange,
    error,
    placeholder = 'Search...',
    helperText,
    required = false,
    className = '',
    options = [],
    disabled = false,
    noResultsText = 'No results found',
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const dropdownRef = useRef(null)

    const selectedOption = options.find(opt => opt.value === value)

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsOpen(false)
                }
            }

            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } })
        setIsOpen(false)
        setSearchTerm('')
    }

    const handleClear = () => {
        onChange({ target: { name, value: '' } })
        setSearchTerm('')
    }

    return (
        <div className={className} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label} {required && '*'}
                </label>
            )}

            <div className="relative">
                {!value || !selectedOption ? (
                    <>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setIsOpen(true)}
                                className={`
                                    w-full pl-10 pr-10 py-3 bg-gray-800 border rounded-lg 
                                    focus:ring-2 focus:ring-brand-primary focus:border-transparent 
                                    text-white placeholder-gray-500
                                    ${error ? 'border-red-500' : 'border-gray-700'}
                                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                placeholder={placeholder}
                                disabled={disabled}
                            />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        </div>

                        {isOpen && !disabled && (
                            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white text-sm"
                                        >
                                            {option.label}
                                            {option.description && (
                                                <span className="block text-gray-400 text-xs">
                                                    {option.description}
                                                </span>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-gray-400 text-sm">
                                        {noResultsText}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg">
                        <span className="flex-1 text-white">{selectedOption.label}</span>
                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={disabled}
                            className="text-gray-400 hover:text-white disabled:cursor-not-allowed"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}

            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
        </div>
    )
}