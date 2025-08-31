import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const FormTextarea = ({
    label,
    placeholder,
    value = '',
    onChange,
    required = false,
    error,
    success,
    icon: Icon,
    description,
    className = '',
    disabled = false,
    rows = 4,
    maxLength,
    minLength,
    autoFocus = false,
    onBlur,
    onFocus,
    touched = false,
    autoResize = true,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const textareaRef = useRef(null)

    // Auto-focus when specified
    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [autoFocus])

    // Auto-resize functionality
    useEffect(() => {
        if (autoResize && textareaRef.current) {
            const textarea = textareaRef.current
            textarea.style.height = 'auto'
            textarea.style.height = `${Math.max(textarea.scrollHeight, rows * 24)}px`
        }
    }, [value, autoResize, rows])

    const handleFocus = (e) => {
        setIsFocused(true)
        onFocus?.(e)
    }

    const handleBlur = (e) => {
        setIsFocused(false)
        onBlur?.(e)
    }

    const handleChange = (e) => {
        const newValue = e.target.value
        onChange?.(newValue)
    }

    // Determine validation state
    const hasError = error && touched
    const hasSuccess = success && !error && value && touched

    // Character count for textareas with maxLength
    const showCharacterCount = maxLength && (isFocused || value)
    const characterCount = value ? value.length : 0
    const isNearLimit = characterCount > maxLength * 0.8

    // Word count
    const wordCount = value ? value.trim().split(/\s+/).filter(word => word.length > 0).length : 0

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label */}
            {label && (
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-3">
                    {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                    <span className="text-base">{label}</span>
                    {required && <span className="text-[#00FF89] text-sm">*</span>}
                    <div className="ml-auto flex items-center gap-4 text-xs">
                        {showCharacterCount && (
                            <span className={`${
                                isNearLimit ? 'text-orange-400' : 
                                characterCount === maxLength ? 'text-red-400' : 
                                'text-gray-500'
                            }`}>
                                {characterCount}/{maxLength}
                            </span>
                        )}
                        {(isFocused || value) && (
                            <span className="text-gray-500">
                                {wordCount} word{wordCount !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </label>
            )}

            {/* Textarea Container */}
            <div 
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={rows}
                    maxLength={maxLength}
                    minLength={minLength}
                    className={`
                        w-full px-4 py-3.5 text-base bg-gray-900/60 backdrop-blur-sm
                        border-2 rounded-xl text-white placeholder-gray-500 
                        transition-all duration-300 ease-in-out resize-none
                        focus:outline-none focus:ring-0
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${hasError 
                            ? 'border-red-500 bg-red-500/5 focus:border-red-400 focus:bg-red-500/10' 
                            : hasSuccess 
                                ? 'border-green-500 bg-green-500/5 focus:border-green-400 focus:bg-green-500/10'
                                : isFocused 
                                    ? 'border-[#00FF89] bg-[#00FF89]/5 shadow-lg shadow-[#00FF89]/20'
                                    : isHovered
                                        ? 'border-gray-600 bg-gray-800/80'
                                        : 'border-gray-700 hover:border-gray-600'
                        }
                        ${Icon ? 'pl-12' : ''}
                    `}
                    style={{
                        minHeight: `${rows * 24}px`,
                        lineHeight: '1.5'
                    }}
                    {...props}
                />

                {/* Icon (left side) */}
                {Icon && (
                    <div className="absolute left-4 top-4 pointer-events-none">
                        <Icon className={`w-5 h-5 transition-colors duration-200 ${
                            hasError ? 'text-red-400' :
                            hasSuccess ? 'text-green-400' :
                            isFocused ? 'text-[#00FF89]' :
                            'text-gray-500'
                        }`} />
                    </div>
                )}

                {/* Validation Icons */}
                {(hasError || hasSuccess) && (
                    <div className="absolute right-4 top-4 pointer-events-none">
                        {hasError ? (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        ) : hasSuccess ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : null}
                    </div>
                )}

                {/* Focus Ring Animation */}
                <AnimatePresence>
                    {isFocused && !hasError && (
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
                {isFocused && !hasError && (
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                        <span>Press Shift+Enter for new line</span>
                        {maxLength && (
                            <span>
                                {maxLength - characterCount} characters remaining
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default FormTextarea

