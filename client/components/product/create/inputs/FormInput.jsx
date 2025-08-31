import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

const FormInput = ({
    label,
    type = 'text',
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
    maxLength,
    minLength,
    pattern,
    showPasswordToggle = false,
    autoFocus = false,
    onBlur,
    onFocus,
    touched = false,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const inputRef = useRef(null)

    // Auto-focus when specified
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus()
        }
    }, [autoFocus])

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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    // Determine validation state
    const hasError = error && touched
    const hasSuccess = success && !error && value && touched
    const isActive = isFocused || value

    // Character count for inputs with maxLength
    const showCharacterCount = maxLength && (isFocused || value)
    const characterCount = value ? value.length : 0
    const isNearLimit = characterCount > maxLength * 0.8

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label */}
            {label && (
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-3">
                    {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                    <span className="text-base">{label}</span>
                    {required && <span className="text-[#00FF89] text-sm">*</span>}
                    {showCharacterCount && (
                        <span className={`text-xs ml-auto ${
                            isNearLimit ? 'text-orange-400' : 
                            characterCount === maxLength ? 'text-red-400' : 
                            'text-gray-500'
                        }`}>
                            {characterCount}/{maxLength}
                        </span>
                    )}
                </label>
            )}

            {/* Input Container */}
            <div 
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <input
                    ref={inputRef}
                    type={showPasswordToggle && type === 'password' && showPassword ? 'text' : type}
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={maxLength}
                    minLength={minLength}
                    pattern={pattern}
                    className={`
                        w-full px-4 py-3.5 text-base bg-gray-900/60 backdrop-blur-sm
                        border-2 rounded-xl text-white placeholder-gray-500 
                        transition-all duration-300 ease-in-out
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
                        ${showPasswordToggle ? 'pr-12' : ''}
                        ${Icon && !showPasswordToggle ? 'pl-12' : ''}
                    `}
                    {...props}
                />

                {/* Icon (left side) */}
                {Icon && !showPasswordToggle && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <Icon className={`w-5 h-5 transition-colors duration-200 ${
                            hasError ? 'text-red-400' :
                            hasSuccess ? 'text-green-400' :
                            isFocused ? 'text-[#00FF89]' :
                            'text-gray-500'
                        }`} />
                    </div>
                )}

                {/* Password Toggle */}
                {showPasswordToggle && type === 'password' && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200 focus:outline-none"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                )}

                {/* Validation Icons */}
                {(hasError || hasSuccess) && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
            </div>
        </div>
    )
}

export default FormInput

