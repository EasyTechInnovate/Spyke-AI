'use client'
export const dynamic = 'force-dynamic'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import toast from '@/lib/utils/toast'
import api from '@/lib/api'
import { checkPasswordStrength, countryCodes, validateEmail, validatePhone, formatPhone } from '@/lib/utils/utils'
import { useTrackEvent, useTrackForm } from '@/hooks/useTrackEvent'
import { ANALYTICS_EVENTS, eventProperties } from '@/lib/analytics/events'
import { Eye, EyeOff, Mail, Lock, Phone, ArrowRight, Sparkles, Shield, Zap, Users, CheckCircle, Globe, ChevronDown, Loader } from 'lucide-react'
import { getUserLocation } from '@/lib/utils/getUserLocation.js'

export const debounce = (func, wait) => {
    let timeout
    return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

export default function SignupPage() {
    const router = useRouter()
    const track = useTrackEvent()
    const { trackFormStart, trackFormSubmit, trackFormError } = useTrackForm('Sign Up Form')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [emailChecking, setEmailChecking] = useState(false)
    const [emailAvailable, setEmailAvailable] = useState(true)
    const [showCountryDropdown, setShowCountryDropdown] = useState(false)

    const [formData, setFormData] = useState({
        emailAddress: '',
        countryCode: '+1',
        phoneNumber: '',
        password: '',
        consent: false,
        marketingConsent: false
    })

    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})

    const emailCheckRef = useRef(null)
    const dropdownRef = useRef(null)

    useEffect(() => {
        track(ANALYTICS_EVENTS.AUTH.SIGNUP_VIEWED)
    }, [])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowCountryDropdown(false)
            }
        }

        if (showCountryDropdown && typeof window !== 'undefined') {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showCountryDropdown])

    useEffect(() => {
        emailCheckRef.current = debounce(async (email) => {
            if (!email || !validateEmail(email)) {
                setEmailAvailable(true)
                return
            }

            setEmailChecking(true)
            try {
                const response = await api.auth.checkEmail(email)
                const data = response.data || response
                setEmailAvailable(data.available !== false)

                if (!data.available) {
                    setErrors((prev) => ({ ...prev, emailAddress: 'This email is already registered' }))
                } else {
                    setErrors((prev) => ({ ...prev, emailAddress: '' }))
                }
            } catch (error) {
                setEmailAvailable(true)
            } finally {
                setEmailChecking(false)
            }
        }, 500)
    }, [])

    // Enhanced email validation with custom error handling
    const validateEmailInput = (email) => {
        if (!email) return 'Email is required'
        if (!email.includes('@')) return "Please include an '@' in the email address"
        if (!validateEmail(email)) return 'Please enter a valid email address'
        return ''
    }

    console.log('USER LOCATION', getUserLocation);

    const handleChange = useCallback(
        (e) => {
            const { name, value, type, checked } = e.target

            if (name === 'phoneNumber') {
                const formatted = formatPhone(value, formData.countryCode)
                setFormData((prev) => ({ ...prev, phoneNumber: formatted }))
            } else {
                setFormData((prev) => ({
                    ...prev,
                    [name]: type === 'checkbox' ? checked : value
                }))
            }

            // Clear errors and provide real-time validation
            if (name === 'emailAddress') {
                const emailError = validateEmailInput(value)
                setErrors((prev) => ({ ...prev, emailAddress: emailError }))
            } else {
                setErrors((prev) => ({ ...prev, [name]: '' }))
            }
            
            setTouched((prev) => ({ ...prev, [name]: true }))

            if (!touched.emailAddress && name === 'emailAddress' && value.length === 1) {
                trackFormStart()
            }

            if (name === 'emailAddress' && emailCheckRef.current) {
                emailCheckRef.current(value)
            }
        },
        [formData.countryCode, touched.emailAddress, trackFormStart]
    )

    const handleBlur = useCallback((e) => {
        const { name } = e.target
        setTouched((prev) => ({ ...prev, [name]: true }))
    }, [])

    const validateForm = useCallback(() => {
        const newErrors = {}

        if (!formData.emailAddress) {
            newErrors.emailAddress = 'Email is required'
        } else if (!validateEmail(formData.emailAddress)) {
            newErrors.emailAddress = 'Please enter a valid email'
        } else if (!emailAvailable) {
            newErrors.emailAddress = 'This email is already registered'
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone number is required'
        } else if (!validatePhone(formData.phoneNumber, formData.countryCode)) {
            newErrors.phoneNumber = 'Please enter a valid phone number'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (!checkPasswordStrength(formData.password).isValid) {
            newErrors.password = 'Password must be stronger'
        }

        if (!formData.consent) {
            newErrors.consent = 'You must accept the terms'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [formData, emailAvailable])

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault()

            setTouched({
                emailAddress: true,
                phoneNumber: true,
                password: true,
                consent: true
            })

            if (!validateForm()) return

            setLoading(true)
            track(ANALYTICS_EVENTS.AUTH.SIGNUP_CLICKED, {
                ...eventProperties.auth(formData.emailAddress, true),
                hasMarketingConsent: formData.marketingConsent
            })

            try {
                const countryCodeDigits = formData.countryCode.replace(/\D/g, '')
                const phoneNumberDigits = formData.phoneNumber.replace(/\D/g, '')
                const fullPhoneNumber = countryCodeDigits + phoneNumberDigits

                await api.auth.register({
                    emailAddress: formData.emailAddress.toLowerCase().trim(),
                    phoneNumber: fullPhoneNumber,
                    password: formData.password,
                    consent: formData.consent,
                    marketingConsent: formData.marketingConsent,
                    userLocation: { lat: 0, long: 0 },
                    role: 'user'
                })

                track(ANALYTICS_EVENTS.AUTH.SIGNUP_SUCCESS, {
                    ...eventProperties.auth(formData.emailAddress, true),
                    hasMarketingConsent: formData.marketingConsent
                })

                trackFormSubmit({
                    success: true,
                    hasMarketingConsent: formData.marketingConsent
                })

                toast.auth.signupSuccess()
                router.push('/')
            } catch (error) {
                track(ANALYTICS_EVENTS.AUTH.SIGNUP_FAILED, {
                    ...eventProperties.auth(formData.emailAddress, false),
                    error: error.message
                })

                trackFormError({
                    error: error.message
                })

                toast.auth.signupError(error.message)
            } finally {
                setLoading(false)
            }
        },
        [formData, router, validateForm, track, trackFormSubmit, trackFormError]
    )

    const passwordStrength = checkPasswordStrength(formData.password)
    const selectedCountry = countryCodes.find((c) => c.code === formData.countryCode) || countryCodes[0]

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] relative overflow-hidden font-league-spartan">
            {/* Enhanced animated background effects */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Primary gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#00FF89]/20 to-[#00D4FF]/20 rounded-full blur-3xl animate-pulse opacity-60" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-[#FF6B6B]/15 to-[#4ECDC4]/15 rounded-full blur-3xl animate-pulse opacity-40" />
                
                {/* Animated grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,137,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,137,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
                
                {/* Floating particles */}
                <div className="absolute top-20 left-20 w-2 h-2 bg-[#00FF89]/40 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
                <div className="absolute top-40 right-32 w-1 h-1 bg-[#00D4FF]/60 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
                <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-[#FF6B6B]/30 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }} />
            </div>

            <Header />

            <main className="relative pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 lg:pb-12">
                <Container>
                    <div className="flex min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-120px)] lg:min-h-[calc(100vh-140px)] items-center justify-center px-4 sm:px-6 lg:px-8">
                        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-6 sm:gap-8 xl:gap-12 items-start lg:items-center">
                            
                            {/* Left side - Branding & Benefits */}
                            <div className="hidden lg:block space-y-4 xl:space-y-6 pr-4 xl:pr-8">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-full">
                                        <Sparkles className="w-3 h-3 text-[#00FF89] flex-shrink-0" />
                                        <span className="text-xs font-bold text-[#00FF89] whitespace-nowrap">Join 10,000+ creators worldwide</span>
                                    </div>
                                    
                                    <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
                                        <span className="block text-white">Start your journey</span>
                                        <span className="block text-white">with</span>
                                        <span className="block bg-gradient-to-r from-[#00FF89] via-[#00D4FF] to-[#00FF89] bg-clip-text text-transparent animate-pulse">
                                            SpykeAI
                                        </span>
                                    </h1>
                                    
                                    <p className="text-base xl:text-lg text-gray-300 leading-relaxed pr-4 font-semibold">
                                        Create your account in seconds and unlock the world's largest AI marketplace. Connect with creators, discover premium tools, and scale your business.
                                    </p>
                                </div>

                                {/* Benefits showcase - Condensed */}
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-[#1a1a1a]/50 border border-gray-800/50 rounded-lg backdrop-blur-sm">
                                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Users className="w-4 h-4 text-[#00FF89]" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white text-sm">Instant Access</h3>
                                            <p className="text-xs text-gray-400 font-medium">Browse 1000+ AI tools immediately</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 p-3 bg-[#1a1a1a]/50 border border-gray-800/50 rounded-lg backdrop-blur-sm">
                                        <div className="w-8 h-8 bg-[#00D4FF]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Shield className="w-4 h-4 text-[#00D4FF]" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white text-sm">Safe & Secure</h3>
                                            <p className="text-xs text-gray-400 font-medium">Bank-level encryption & protection</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-[#1a1a1a]/50 border border-gray-800/50 rounded-lg backdrop-blur-sm">
                                        <div className="w-8 h-8 bg-[#FF6B6B]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Zap className="w-4 h-4 text-[#FF6B6B]" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white text-sm">Free to Start</h3>
                                            <p className="text-xs text-gray-400 font-medium">No hidden fees or commitments</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Signup Form */}
                            <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-none lg:w-auto">
                                {/* Mobile header - Condensed */}
                                <div className="text-center lg:hidden mb-4 sm:mb-6 px-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                                        <span className="bg-gradient-to-r from-white to-[#00FF89] bg-clip-text text-transparent">Join SpykeAI</span>
                                    </h1>
                                    <p className="text-gray-400 text-sm font-semibold">Create your account in 30 seconds</p>
                                </div>

                                {/* Enhanced form container - Optimized spacing */}
                                <div className="relative mx-auto max-w-md lg:max-w-lg">
                                    {/* Glow effect */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF89]/20 via-[#00D4FF]/20 to-[#00FF89]/20 rounded-2xl blur-xl opacity-60" />
                                    
                                    <div className="relative bg-[#1a1a1a]/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 sm:p-6 shadow-2xl">
                                        <div className="mb-4">
                                            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Create Account</h2>
                                            <p className="text-gray-400 text-sm font-semibold">Join thousands of creators and innovators</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                                            {/* Enhanced email input - Compact */}
                                            <div className="space-y-1">
                                                <label className="block text-xs font-bold text-gray-300 pl-1">Email Address</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#00FF89] transition-colors" />
                                                    <input
                                                        type="email"
                                                        name="emailAddress"
                                                        value={formData.emailAddress}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        onInvalid={(e) => {
                                                            e.preventDefault()
                                                            const emailError = validateEmailInput(e.target.value)
                                                            setErrors(prev => ({ ...prev, emailAddress: emailError }))
                                                            setTouched(prev => ({ ...prev, emailAddress: true }))
                                                        }}
                                                        className={`w-full pl-10 pr-10 py-3 bg-[#121212]/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50 transition-all duration-200 text-sm font-medium ${
                                                            touched.emailAddress && errors.emailAddress
                                                                ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                                                                : emailAvailable && formData.emailAddress && validateEmail(formData.emailAddress) && !errors.emailAddress
                                                                ? 'border-[#00FF89] focus:ring-[#00FF89]/50 focus:border-[#00FF89]'
                                                                : 'border-gray-600/50'
                                                        }`}
                                                        placeholder="you@example.com"
                                                        autoComplete="email"
                                                        disabled={loading}
                                                        noValidate
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        {emailChecking && (
                                                            <Loader className="w-4 h-4 text-gray-400 animate-spin" />
                                                        )}
                                                        {!emailChecking && emailAvailable && formData.emailAddress && validateEmail(formData.emailAddress) && !errors.emailAddress && (
                                                            <CheckCircle className="w-4 h-4 text-[#00FF89]" />
                                                        )}
                                                    </div>
                                                </div>
                                                {touched.emailAddress && errors.emailAddress && (
                                                    <p className="text-xs text-red-400 mt-1 pl-1 font-medium">{errors.emailAddress}</p>
                                                )}
                                            </div>

                                            {/* Enhanced phone input - Compact */}
                                            <div className="space-y-1">
                                                <label className="block text-xs font-bold text-gray-300 pl-1">Phone Number</label>
                                                <div className="flex gap-2">
                                                    {/* Country Code Dropdown - Compact */}
                                                    <div className="relative" ref={dropdownRef}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                            className="flex items-center gap-1.5 px-2.5 py-3 bg-[#121212]/50 border border-gray-600/50 rounded-xl text-white hover:border-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 min-w-0">
                                                            <span className="text-base flex-shrink-0">{selectedCountry.flag}</span>
                                                            <span className="font-bold text-xs whitespace-nowrap">{selectedCountry.code}</span>
                                                            <ChevronDown className={`w-3 h-3 transition-transform flex-shrink-0 ${showCountryDropdown ? 'rotate-180' : ''}`} />
                                                        </button>

                                                        {showCountryDropdown && (
                                                            <div className="absolute z-50 mt-1 w-64 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                                                {countryCodes.map(({ code, country, flag }) => (
                                                                    <button
                                                                        key={code}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData((prev) => ({ ...prev, countryCode: code, phoneNumber: '' }))
                                                                            setShowCountryDropdown(false)
                                                                        }}
                                                                        className={`w-full px-3 py-2 text-left hover:bg-gray-800 flex items-center gap-2 transition-colors font-medium ${
                                                                            code === formData.countryCode ? 'bg-gray-800' : ''
                                                                        }`}>
                                                                        <span className="text-base flex-shrink-0">{flag}</span>
                                                                        <span className="text-white font-bold text-xs">{code}</span>
                                                                        <span className="text-gray-400 text-xs truncate font-medium">{country}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Phone Input */}
                                                    <div className="relative group flex-1 min-w-0">
                                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#00FF89] transition-colors" />
                                                        <input
                                                            type="tel"
                                                            name="phoneNumber"
                                                            value={formData.phoneNumber}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            className={`w-full pl-10 pr-3 py-3 bg-[#121212]/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50 transition-all duration-200 text-sm font-medium ${
                                                                touched.phoneNumber && errors.phoneNumber ? 'border-red-500' : 'border-gray-600/50'
                                                            }`}
                                                            placeholder={formData.countryCode === '+1' ? '(555) 123-4567' : '1234567890'}
                                                            required
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                </div>
                                                {touched.phoneNumber && errors.phoneNumber && (
                                                    <p className="text-xs text-red-400 mt-1 pl-1 font-medium">{errors.phoneNumber}</p>
                                                )}
                                            </div>

                                            {/* Enhanced password input - Compact */}
                                            <div className="space-y-1">
                                                <label className="block text-xs font-bold text-gray-300 pl-1">Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#00FF89] transition-colors" />
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        className={`w-full pl-10 pr-10 py-3 bg-[#121212]/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50 transition-all duration-200 text-sm font-medium ${
                                                            touched.password && errors.password ? 'border-red-500' : 'border-gray-600/50'
                                                        }`}
                                                        placeholder="Create a strong password"
                                                        required
                                                        disabled={loading}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00FF89] transition-colors p-1">
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                
                                                {/* Enhanced password strength indicator - Compact */}
                                                {formData.password && (
                                                    <div className="space-y-1 mt-1.5">
                                                        <div className="flex gap-1">
                                                            {[0, 1, 2, 3].map((i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                                                        i < passwordStrength.score
                                                                            ? passwordStrength.score <= 2
                                                                                ? 'bg-red-500'
                                                                                : passwordStrength.score === 3
                                                                                ? 'bg-yellow-500'
                                                                                : 'bg-[#00FF89]'
                                                                            : 'bg-gray-700'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <p className={`text-xs pl-1 font-medium ${
                                                            passwordStrength.score <= 2 ? 'text-red-400' : 
                                                            passwordStrength.score === 3 ? 'text-yellow-400' : 'text-[#00FF89]'
                                                        }`}>
                                                            {passwordStrength.score <= 2 ? 'Weak password' : 
                                                             passwordStrength.score === 3 ? 'Good password' : 'Strong password'}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {touched.password && errors.password && (
                                                    <p className="text-xs text-red-400 mt-1 pl-1 font-medium">{errors.password}</p>
                                                )}
                                            </div>

                                            {/* Enhanced consent checkboxes - Compact */}
                                            <div className="space-y-2.5 pt-1">
                                                <label className="flex items-start gap-2 cursor-pointer group">
                                                    <div className="relative mt-0.5">
                                                        <input
                                                            type="checkbox"
                                                            name="consent"
                                                            checked={formData.consent}
                                                            onChange={handleChange}
                                                            className="w-4 h-4 rounded border-2 border-gray-600 bg-[#121212] text-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/50 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] cursor-pointer transition-all duration-200 hover:border-gray-500 checked:bg-[#00FF89] checked:border-[#00FF89]"
                                                            style={{ accentColor: '#00FF89' }}
                                                            required
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-300 group-hover:text-white transition-colors leading-relaxed font-medium">
                                                        I agree to SpykeAI's{' '}
                                                        <Link href="/terms" className="text-[#00FF89] hover:underline font-bold">
                                                            Terms of Service
                                                        </Link>{' '}
                                                        and{' '}
                                                        <Link href="/privacy" className="text-[#00FF89] hover:underline font-bold">
                                                            Privacy Policy
                                                        </Link>
                                                    </span>
                                                </label>
                                                {touched.consent && errors.consent && (
                                                    <p className="text-xs text-red-400 ml-6 font-medium">{errors.consent}</p>
                                                )}

                                                <label className="flex items-start gap-2 cursor-pointer group">
                                                    <div className="relative mt-0.5">
                                                        <input
                                                            type="checkbox"
                                                            name="marketingConsent"
                                                            checked={formData.marketingConsent}
                                                            onChange={handleChange}
                                                            className="w-4 h-4 rounded border-2 border-gray-600 bg-[#121212] text-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/50 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] cursor-pointer transition-all duration-200 hover:border-gray-500 checked:bg-[#00FF89] checked:border-[#00FF89]"
                                                            style={{ accentColor: '#00FF89' }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-300 group-hover:text-white transition-colors leading-relaxed font-medium">
                                                        Send me tips, updates, and exclusive offers (optional)
                                                    </span>
                                                </label>
                                            </div>

                                            {/* Enhanced submit button - Compact */}
                                            <button
                                                type="submit"
                                                disabled={loading || emailChecking || !emailAvailable || !formData.consent}
                                                className={`group w-full py-3 px-4 rounded-xl font-bold text-base transition-all duration-300 mt-4 ${
                                                    loading || emailChecking || !emailAvailable || !formData.consent
                                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-[#00FF89] to-[#00D4FF] text-[#121212] hover:from-[#00D4FF] hover:to-[#00FF89] transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00FF89]/25 active:scale-[0.98]'
                                                }`}>
                                                {loading ? (
                                                    <span className="flex items-center justify-center gap-2 font-bold">
                                                        <Loader className="w-4 h-4 animate-spin" />
                                                        <span>Creating your account...</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2 font-bold">
                                                        <span>Create Account</span>
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </span>
                                                )}
                                            </button>

                                            {/* Enhanced divider - Compact */}
                                            <div className="relative my-3">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-700" />
                                                </div>
                                                <div className="relative flex justify-center text-xs">
                                                    <span className="px-4 bg-[#1a1a1a] text-gray-400 font-bold">or continue with</span>
                                                </div>
                                            </div>

                                            {/* Enhanced Google signup button - Compact */}
                                            <button
                                                type="button"
                                                onClick={() => api.auth.googleAuth()}
                                                disabled={loading}
                                                className={`group w-full py-3 px-4 bg-white/95 hover:bg-white text-gray-800 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                                                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-lg transform active:scale-[0.98]'
                                                }`}>
                                                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                                <span>Continue with Google</span>
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                                            </button>
                                        </form>

                                        {/* Enhanced sign in link - Compact */}
                                        <div className="mt-4 text-center">
                                            <p className="text-gray-400 text-sm font-semibold">
                                                Already have an account?{' '}
                                                <Link
                                                    href="/signin"
                                                    className={`font-bold bg-gradient-to-r from-[#00FF89] to-[#00D4FF] bg-clip-text text-transparent ${
                                                        loading ? 'pointer-events-none opacity-50' : 'hover:from-[#00D4FF] hover:to-[#00FF89] transition-all duration-200'
                                                    }`}>
                                                    Sign in →
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced trust indicators - Compact */}
                                <div className="mt-4 grid grid-cols-3 gap-2 text-center max-w-md mx-auto lg:max-w-lg">
                                    <div className="flex flex-col items-center gap-1 p-2 bg-[#1a1a1a]/30 rounded-lg backdrop-blur-sm">
                                        <Shield className="w-3 h-3 text-[#00FF89] flex-shrink-0" />
                                        <span className="text-xs text-gray-400 font-semibold">SSL Secured</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 p-2 bg-[#1a1a1a]/30 rounded-lg backdrop-blur-sm">
                                        <CheckCircle className="w-3 h-3 text-[#00D4FF] flex-shrink-0" />
                                        <span className="text-xs text-gray-400 font-semibold">GDPR Compliant</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 p-2 bg-[#1a1a1a]/30 rounded-lg backdrop-blur-sm">
                                        <Globe className="w-3 h-3 text-[#FF6B6B] flex-shrink-0" />
                                        <span className="text-xs text-gray-400 font-semibold">Global Platform</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    )
}

