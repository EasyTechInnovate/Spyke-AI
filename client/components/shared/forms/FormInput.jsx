'use client'
import React from 'react'
export default function FormInput({
    label,
    name,
    type = 'text',
    value = '',
    onChange,
    error,
    placeholder,
    helperText,
    required = false,
    className = '',
    maxLength,
    disabled = false,
    dataAttributes = {},
    icon,
    rightElement,
    ...rest
}) {
    const baseInputClasses = `
        w-full px-4 py-3 bg-gray-800 border rounded-lg 
        focus:ring-2 focus:ring-brand-primary focus:border-transparent 
        transition-all text-white placeholder-gray-500
        ${icon ? 'pl-10' : ''}
        ${rightElement ? 'pr-10' : ''}
        ${error ? 'border-red-500' : 'border-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label} {required && '*'}
                    {maxLength && (
                        <span className="text-gray-500 font-normal ml-2">
                            ({value.length}/{maxLength})
                        </span>
                    )}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={baseInputClasses.trim()}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    disabled={disabled}
                    {...dataAttributes}
                    {...rest}
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {rightElement}
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