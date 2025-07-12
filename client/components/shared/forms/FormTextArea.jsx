'use client'

import React from 'react'

/**
 * @typedef {Object} FormTextAreaProps
 * @property {string} [label] - Field label
 * @property {string} name - Field name
 * @property {string} [value=''] - Field value
 * @property {function} onChange - Change handler
 * @property {string} [error] - Error message
 * @property {string} [placeholder] - Placeholder text
 * @property {string} [helperText] - Helper text
 * @property {boolean} [required] - Whether field is required
 * @property {string} [className] - Additional CSS classes
 * @property {number} [maxLength] - Maximum length
 * @property {number} [minLength] - Minimum length
 * @property {number} [rows=4] - Number of rows
 * @property {boolean} [disabled] - Whether field is disabled
 * @property {boolean} [showCharCount=true] - Whether to show character count
 */

/**
 * Reusable form textarea component
 * @param {FormTextAreaProps} props
 */
export default function FormTextArea({
    label,
    name,
    value = '',
    onChange,
    error,
    placeholder,
    helperText,
    required = false,
    className = '',
    maxLength,
    minLength,
    rows = 4,
    disabled = false,
    showCharCount = true,
    ...rest
}) {
    const baseTextAreaClasses = `
        w-full px-4 py-3 bg-gray-800 border rounded-lg 
        focus:ring-2 focus:ring-brand-primary focus:border-transparent 
        transition-all resize-none text-white placeholder-gray-500
        ${error ? 'border-red-500' : 'border-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label} {required && '*'}
                    {showCharCount && maxLength && (
                        <span className="text-gray-500 font-normal ml-2">
                            ({value.length}/{maxLength})
                        </span>
                    )}
                </label>
            )}
            
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                maxLength={maxLength}
                className={baseTextAreaClasses.trim()}
                placeholder={placeholder}
                disabled={disabled}
                {...rest}
            />
            
            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
            
            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
            
            {minLength && value.length < minLength && value.length > 0 && (
                <p className="mt-1 text-sm text-yellow-400">
                    Minimum {minLength} characters required ({minLength - value.length} more)
                </p>
            )}
        </div>
    )
}