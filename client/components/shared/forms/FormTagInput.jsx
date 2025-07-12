'use client'

import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'

/**
 * @typedef {Object} FormTagInputProps
 * @property {string} [label] - Field label
 * @property {string} name - Field name
 * @property {string[]} [value=[]] - Array of tags
 * @property {function} onAddTag - Add tag handler
 * @property {function} onRemoveTag - Remove tag handler
 * @property {string} [error] - Error message
 * @property {string} [placeholder] - Placeholder text
 * @property {string} [helperText] - Helper text
 * @property {boolean} [required] - Whether field is required
 * @property {string} [className] - Additional CSS classes
 * @property {number} [maxItems] - Maximum number of tags
 * @property {string[]} [suggestions=[]] - Suggested tags
 * @property {boolean} [disabled] - Whether field is disabled
 * @property {string} [addButtonText='Add'] - Add button text
 */

/**
 * Reusable form tag input component
 * @param {FormTagInputProps} props
 */
export default function FormTagInput({
    label,
    name,
    value = [],
    onAddTag,
    onRemoveTag,
    error,
    placeholder = 'Type and press Enter',
    helperText,
    required = false,
    className = '',
    maxItems,
    suggestions = [],
    disabled = false,
    addButtonText = 'Add',
}) {
    const [inputValue, setInputValue] = useState('')

    const handleAdd = () => {
        if (inputValue.trim() && !value.includes(inputValue.trim())) {
            if (maxItems && value.length >= maxItems) {
                return
            }
            onAddTag(inputValue.trim())
            setInputValue('')
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAdd()
        }
    }

    const availableSuggestions = suggestions.filter(s => !value.includes(s))

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label} {required && '*'}
                    {helperText && (
                        <span className="text-gray-500 font-normal ml-2">({helperText})</span>
                    )}
                </label>
            )}

            <div className="space-y-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className={`
                            flex-1 px-4 py-3 bg-gray-800 border rounded-lg 
                            focus:ring-2 focus:ring-brand-primary focus:border-transparent 
                            text-white placeholder-gray-500
                            ${error ? 'border-red-500' : 'border-gray-700'}
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        placeholder={placeholder}
                        disabled={disabled || (maxItems && value.length >= maxItems)}
                    />
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={disabled || (maxItems && value.length >= maxItems)}
                        className="px-6 py-3 bg-brand-primary text-black font-medium rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {addButtonText}
                    </button>
                </div>

                {value.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {value.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/20 text-brand-primary rounded-full text-sm"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => onRemoveTag(tag)}
                                    disabled={disabled}
                                    className="hover:text-white disabled:cursor-not-allowed"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {availableSuggestions.length > 0 && value.length < (maxItems || Infinity) && (
                    <div className="flex flex-wrap gap-2">
                        {availableSuggestions.slice(0, 10).map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => onAddTag(suggestion)}
                                disabled={disabled}
                                className="px-3 py-1 border border-gray-700 rounded-full text-sm text-gray-300 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-3 h-3 inline mr-1" />
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}

            {maxItems && (
                <p className="mt-1 text-sm text-gray-500">
                    {value.length}/{maxItems} items
                </p>
            )}
        </div>
    )
}