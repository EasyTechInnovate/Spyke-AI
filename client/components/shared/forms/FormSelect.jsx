'use client'
import React from 'react'
import { ChevronRight } from 'lucide-react'
export default function FormSelect({
    label,
    name,
    value = '',
    onChange,
    error,
    placeholder = 'Select an option',
    helperText,
    required = false,
    className = '',
    options = [],
    disabled = false,
    icon,
    ...rest
}) {
    const baseSelectClasses = `
        w-full px-4 py-3 bg-gray-800 border rounded-lg 
        focus:ring-2 focus:ring-brand-primary focus:border-transparent 
        text-white appearance-none cursor-pointer
        ${icon ? 'pl-10' : ''}
        ${error ? 'border-red-500' : 'border-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label} {required && '*'}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {icon}
                    </div>
                )}
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={baseSelectClasses.trim()}
                    disabled={disabled}
                    {...rest}
                >
                    <option value="" className="bg-gray-800">
                        {placeholder}
                    </option>
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                            className="bg-gray-800"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
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