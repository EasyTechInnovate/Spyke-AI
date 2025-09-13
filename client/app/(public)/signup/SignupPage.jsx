'use client'
export const dynamic = 'force-dynamic'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/shared/layout/Header'
import api from '@/lib/api'
import { checkPasswordStrength, countryCodes, validateEmail, validatePhone, formatPhone } from '@/lib/utils/utils'
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    Phone,
    ArrowRight,
    Sparkles,
    Shield,
    Zap,
    Users,
    CheckCircle,
    Globe,
    ChevronDown,
    Loader,
    X,
    AlertCircle
} from 'lucide-react'
import Notification from '@/components/shared/Notification'
import { Globe as GlobeIcon } from 'lucide-react'

export const debounce = (func, wait) => {
    let timeout
    return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

export default function SignupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [emailChecking, setEmailChecking] = useState(false)
    const [emailAvailable, setEmailAvailable] = useState(true)
    const [notification, setNotification] = useState(null)

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

    const showNotification = (message, type = 'success') => {
        setNotification({
            id: Date.now(),
            type,
            message,
            duration: type === 'error' ? 6000 : 4000
        })
    }

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

    const validateEmailInput = (email) => {
        if (!email) return 'Email is required'
        if (!email.includes('@')) return "Please include an '@' in the email address"
        if (!validateEmail(email)) return 'Please enter a valid email address'
        return ''
    }

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

            if (name === 'emailAddress') {
                const emailError = validateEmailInput(value)
                setErrors((prev) => ({ ...prev, emailAddress: emailError }))
            } else {
                setErrors((prev) => ({ ...prev, [name]: '' }))
            }

            setTouched((prev) => ({ ...prev, [name]: true }))

            if (name === 'emailAddress' && emailCheckRef.current) {
                emailCheckRef.current(value)
            }
        },
        [formData.countryCode]
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

            try {
                const countryCodeDigits = formData.countryCode.replace(/\D/g, '')
                const phoneNumberDigits = formData.phoneNumber.replace(/\D/g, '')
                const fullPhoneNumber = countryCodeDigits + phoneNumberDigits

                const response = await api.auth.register({
                    emailAddress: formData.emailAddress.toLowerCase().trim(),
                    phoneNumber: fullPhoneNumber,
                    password: formData.password,
                    consent: formData.consent,
                    marketingConsent: formData.marketingConsent,
                    userLocation: { lat: 0, long: 0 },
                    role: 'user'
                })

                if (response && (response.success === true || response.statusCode === 201 || (response.id && response.emailAddress))) {
                    showNotification('Account created successfully! Please check your email to verify your account before signing in.', 'success')

                    setTimeout(() => {
                        router.push(`/verify-email?email=${encodeURIComponent(formData.emailAddress)}`)
                    }, 3000)
                } else {
                    throw new Error(response?.message || 'Registration failed')
                }
            } catch (error) {
                const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed. Please try again.'
                showNotification(errorMessage, 'error')
            } finally {
                setLoading(false)
            }
        },
        [formData, router, validateForm]
    )

    const passwordStrength = checkPasswordStrength(formData.password)

    const countryOptions = countryCodes
        .map(({ code, country, flag }) => ({
            value: code,
            label: `${code} ${country}`,
            icon: () => <span className="text-base">{flag}</span>,
            searchText: `${country.toLowerCase()} ${code.toLowerCase()} ${code.replace('+', '').toLowerCase()}`
        }))
        .sort((a, b) => {
            const countryA = countryCodes.find((c) => c.code === a.value)?.country || ''
            const countryB = countryCodes.find((c) => c.code === b.value)?.country || ''
            return countryA.localeCompare(countryB)
        })

    const selectedCountry = countryCodes.find((c) => c.code === formData.countryCode) || countryCodes[0]

    return (
        <div className="min-h-screen bg-[#121212] relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/60 to-black" />
                <div className="absolute top-1/4 left-1/5 w-64 sm:w-80 h-64 sm:h-80 bg-[#00FF89]/8 rounded-full blur-3xl animate-pulse opacity-60" />
                <div
                    className="absolute bottom-1/4 right-1/5 w-56 sm:w-72 h-56 sm:h-72 bg-[#FFC050]/6 rounded-full blur-3xl animate-pulse opacity-40"
                    style={{ animationDelay: '2s' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
            </div>

            {notification && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[60]">
                    <Notification
                        {...notification}
                        onClose={() => setNotification(null)}
                    />
                </div>
            )}

            <Header />

            <main className="relative flex-1 flex flex-col lg:flex-row pt-12 sm:pt-16 lg:pt-20">
                <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-6 xl:px-12">
                    <div className="max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-[#00FF89]" />
                            <span className="text-sm font-semibold text-[#00FF89]">Join 10,000+ creators worldwide</span>
                        </div>

                        <h1 className="text-3xl xl:text-4xl font-bold text-white mb-4 leading-tight">
                            Start your journey with <span className="text-[#00FF89]">SpykeAI</span>
                        </h1>

                        <p className="text-base xl:text-lg text-gray-300 mb-6 leading-relaxed font-medium">
                            Create your account in seconds and unlock the world's largest AI marketplace. Connect with creators, discover premium
                            tools, and scale your business.
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-[#1a1a1a]/50 border border-gray-800/50 rounded-xl backdrop-blur-sm">
                                <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Users className="w-4 h-4 text-[#00FF89]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-0.5">Instant Access</h3>
                                    <p className="text-xs text-gray-400">Browse 1000+ AI tools immediately</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-[#1a1a1a]/50 border border-gray-800/50 rounded-xl backdrop-blur-sm">
                                <div className="w-8 h-8 bg-[#FFC050]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-4 h-4 text-[#FFC050]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-0.5">Safe & Secure</h3>
                                    <p className="text-xs text-gray-400">Bank-level encryption & protection</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-[#1a1a1a]/50 border border-gray-800/50 rounded-xl backdrop-blur-sm">
                                <div className="w-8 h-8 bg-[#ff6b6b]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-4 h-4 text-[#ff6b6b]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-0.5">Free to Start</h3>
                                    <p className="text-xs text-gray-400">No hidden fees or commitments</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
                    <div className="w-full max-w-md">
                        <div className="text-center lg:hidden mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Join SpykeAI</h1>
                            <p className="text-gray-400 font-medium">Create your account in 30 seconds</p>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF89]/15 via-[#FFC050]/15 to-[#00FF89]/15 rounded-2xl blur-xl opacity-60" />

                            <div className="relative bg-[#1a1a1a]/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                                <div className="mb-6">
                                    <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">Create Account</h2>
                                    <p className="text-gray-400 font-medium text-sm">Join thousands of creators and innovators</p>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-1.5">
                                            Email Address <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                name="emailAddress"
                                                value={formData.emailAddress}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="w-full pl-10 pr-10 py-3 bg-[#121212]/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50 transition-all duration-200 text-sm font-medium"
                                                placeholder="you@example.com"
                                                required
                                                disabled={loading}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {emailChecking && <Loader className="w-4 h-4 text-gray-400 animate-spin" />}
                                                {!emailChecking &&
                                                    emailAvailable &&
                                                    formData.emailAddress &&
                                                    validateEmail(formData.emailAddress) &&
                                                    !errors.emailAddress && <CheckCircle className="w-4 h-4 text-[#00FF89]" />}
                                            </div>
                                        </div>
                                        {errors.emailAddress && touched.emailAddress && (
                                            <p className="mt-1 text-xs text-red-400">{errors.emailAddress}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-1.5">
                                            Phone Number <span className="text-red-400">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="w-32">
                                                <div className="relative group">
                                                    <select
                                                        value={formData.countryCode}
                                                        onChange={(e) => {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                countryCode: e.target.value,
                                                                phoneNumber: ''
                                                            }))
                                                        }}
                                                        className="w-full pl-3 pr-9 py-3 bg-[#121212]/60 border border-gray-600/60 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/60 focus:border-[#00FF89]/60 focus:bg-[#121212]/80 transition-all duration-200 text-sm font-medium appearance-none cursor-pointer hover:border-gray-500/60 hover:bg-[#121212]/70 group-hover:border-gray-500/60"
                                                        disabled={loading}
                                                        style={{
                                                            backgroundImage: 'none',
                                                            WebkitAppearance: 'none',
                                                            MozAppearance: 'none',
                                                            msDropdown: 'none'
                                                        }}
                                                    >
                                                        {countryCodes.map(({ code, country, flag }) => (
                                                            <option 
                                                                key={code} 
                                                                value={code}
                                                                className="bg-[#1a1a1a] text-white py-3 px-3 border-none"
                                                                style={{
                                                                    backgroundColor: '#1a1a1a',
                                                                    color: 'white',
                                                                    padding: '12px',
                                                                    fontSize: '14px',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                {flag} {code}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors duration-200" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className="w-full pl-10 pr-3 py-3 bg-[#121212]/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50 transition-all duration-200 text-sm font-medium"
                                                    placeholder={formData.countryCode === '+1' ? '(555) 123-4567' : '1234567890'}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                        {errors.phoneNumber && touched.phoneNumber && (
                                            <p className="mt-1 text-xs text-red-400">{errors.phoneNumber}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-1.5">
                                            Password <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="w-full pl-10 pr-10 py-3 bg-[#121212]/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50 transition-all duration-200 text-sm font-medium"
                                                placeholder="Create a strong password"
                                                required
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00FF89] transition-colors p-0.5"
                                                disabled={loading}>
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        {formData.password && (
                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-300 ${
                                                                passwordStrength.score === 0
                                                                    ? 'bg-red-500 w-1/4'
                                                                    : passwordStrength.score === 1
                                                                      ? 'bg-orange-500 w-2/4'
                                                                      : passwordStrength.score === 2
                                                                        ? 'bg-yellow-500 w-3/4'
                                                                        : 'bg-[#00FF89] w-full'
                                                            }`}
                                                        />
                                                    </div>
                                                    <span
                                                        className={`text-xs font-semibold ${
                                                            passwordStrength.score === 0
                                                                ? 'text-red-400'
                                                                : passwordStrength.score === 1
                                                                  ? 'text-orange-400'
                                                                  : passwordStrength.score === 2
                                                                    ? 'text-yellow-400'
                                                                    : 'text-[#00FF89]'
                                                        }`}>
                                                        {passwordStrength.label}
                                                    </span>
                                                </div>

                                                <div className="bg-[#121212]/30 border border-gray-700/50 rounded-lg p-3">
                                                    <p className="text-xs text-gray-400 font-semibold mb-2">Password requirements:</p>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            {formData.password.length >= 8 ? (
                                                                <CheckCircle className="w-3 h-3 text-[#00FF89] flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-3 h-3 border border-gray-500 rounded-full flex-shrink-0" />
                                                            )}
                                                            <span
                                                                className={`text-xs ${formData.password.length >= 8 ? 'text-[#00FF89] font-medium' : 'text-gray-400'}`}>
                                                                At least 8 characters
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {/[A-Z]/.test(formData.password) ? (
                                                                <CheckCircle className="w-3 h-3 text-[#00FF89] flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-3 h-3 border border-gray-500 rounded-full flex-shrink-0" />
                                                            )}
                                                            <span
                                                                className={`text-xs ${/[A-Z]/.test(formData.password) ? 'text-[#00FF89] font-medium' : 'text-gray-400'}`}>
                                                                One uppercase letter (A-Z)
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {/[a-z]/.test(formData.password) ? (
                                                                <CheckCircle className="w-3 h-3 text-[#00FF89] flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-3 h-3 border border-gray-500 rounded-full flex-shrink-0" />
                                                            )}
                                                            <span
                                                                className={`text-xs ${/[a-z]/.test(formData.password) ? 'text-[#00FF89] font-medium' : 'text-gray-400'}`}>
                                                                One lowercase letter (a-z)
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {/\d/.test(formData.password) ? (
                                                                <CheckCircle className="w-3 h-3 text-[#00FF89] flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-3 h-3 border border-gray-500 rounded-full flex-shrink-0" />
                                                            )}
                                                            <span
                                                                className={`text-xs ${/\d/.test(formData.password) ? 'text-[#00FF89] font-medium' : 'text-gray-400'}`}>
                                                                One number (0-9)
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? (
                                                                <CheckCircle className="w-3 h-3 text-[#00FF89] flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-3 h-3 border border-gray-500 rounded-full flex-shrink-0" />
                                                            )}
                                                            <span
                                                                className={`text-xs ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-[#00FF89] font-medium' : 'text-gray-400'}`}>
                                                                One special character (!@#$%^&*)
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {errors.password && touched.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <input
                                                type="checkbox"
                                                name="consent"
                                                checked={formData.consent}
                                                onChange={handleChange}
                                                className="mt-0.5 w-4 h-4 text-[#00FF89] bg-[#121212]/50 border-gray-600 rounded focus:ring-[#00FF89] focus:ring-2"
                                                required
                                            />
                                            <label className="text-sm text-gray-300 leading-5">
                                                I agree to SpykeAI's{' '}
                                                <Link
                                                    href="/terms"
                                                    className="text-[#00FF89] hover:underline font-semibold">
                                                    Terms of Service
                                                </Link>{' '}
                                                and{' '}
                                                <Link
                                                    href="/privacy-policy"
                                                    className="text-[#00FF89] hover:underline font-semibold">
                                                    Privacy Policy
                                                </Link>
                                            </label>
                                        </div>
                                        {errors.consent && touched.consent && <p className="text-xs text-red-400">{errors.consent}</p>}

                                        <div className="flex items-start gap-2">
                                            <input
                                                type="checkbox"
                                                name="marketingConsent"
                                                checked={formData.marketingConsent}
                                                onChange={handleChange}
                                                className="mt-0.5 w-4 h-4 text-[#00FF89] bg-[#121212]/50 border-gray-600 rounded focus:ring-[#00FF89] focus:ring-2"
                                            />
                                            <label className="text-sm text-gray-300 leading-5">
                                                Send me tips, updates, and exclusive offers (optional)
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || emailChecking || !emailAvailable || !formData.consent}
                                        className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                                            loading || emailChecking || !emailAvailable || !formData.consent
                                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                : 'bg-[#00FF89] text-[#121212] hover:bg-[#00e67a] transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00FF89]/25 active:scale-[0.98]'
                                        }`}>
                                        {loading ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                Creating your account...
                                            </>
                                        ) : (
                                            <>
                                                <span>Create Account</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>

                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-700" />
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-3 bg-[#1a1a1a] text-gray-400 text-xs font-medium">or continue with</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => api.auth.googleAuth()}
                                        disabled={loading}
                                        className={`w-full py-3 px-6 bg-white hover:bg-gray-50 text-gray-800 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                                            loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] transform active:scale-[0.98]'
                                        }`}>
                                        <svg
                                            className="w-4 h-4"
                                            viewBox="0 0 24 24">
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        <span>Continue with Google</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                </form>

                                <div className="mt-4 text-center">
                                    <p className="text-gray-400 text-sm">
                                        Already have an account?{' '}
                                        <Link
                                            href="/signin"
                                            className={`font-bold text-[#00FF89] hover:text-[#00e67a] transition-colors ${
                                                loading ? 'pointer-events-none opacity-50' : ''
                                            }`}>
                                            Sign in →
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-2">
                            <div className="flex flex-col items-center gap-1 p-2 bg-[#1a1a1a]/30 rounded-lg backdrop-blur-sm">
                                <Shield className="w-3 h-3 text-[#00FF89]" />
                                <span className="text-xs text-gray-400 font-medium text-center">SSL Secured</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 p-2 bg-[#1a1a1a]/30 rounded-lg backdrop-blur-sm">
                                <CheckCircle className="w-3 h-3 text-[#FFC050]" />
                                <span className="text-xs text-gray-400 font-medium text-center">GDPR Compliant</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 p-2 bg-[#1a1a1a]/30 rounded-lg backdrop-blur-sm">
                                <Globe className="w-3 h-3 text-[#ff6b6b]" />
                                <span className="text-xs text-gray-400 font-medium text-center">Global Platform</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

