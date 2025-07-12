'use client'

import React from 'react'

/**
 * @typedef {Object} FormCheckboxProps
 * @property {string} name - Field name
 * @property {boolean} [checked=false] - Whether checkbox is checked
 * @property {function} onChange - Change handler
 * @property {string} [label] - Checkbox label
 * @property {string} [helperText] - Helper text
 * @property {string} [error] - Error message
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [disabled] - Whether checkbox is disabled
 */

/**
 * Reusable form checkbox component
 * @param {FormCheckboxProps} props
 */
export default function FormCheckbox({
    name,
    checked = false,
    onChange,
    label,
    helperText,
    error,
    className = '',
    disabled = false,
    ...rest
}) {
    return (
        <div className={className}>
            <label className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="w-5 h-5 text-brand-primary bg-gray-800 border-gray-600 rounded focus:ring-brand-primary focus:ring-2 mt-0.5"
                    {...rest}
                />
                <div className="flex-1">
                    {label && (
                        <span className="font-medium text-white">{label}</span>
                    )}
                    {helperText && (
                        <p className="text-sm text-gray-400 mt-1">{helperText}</p>
                    )}
                </div>
            </label>
            {error && (
                <p className="mt-1 text-sm text-red-400 ml-8">{error}</p>
            )}
        </div>
    )
}