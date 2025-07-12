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

    // Track page view
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

            setErrors((prev) => ({ ...prev, [name]: '' }))
            setTouched((prev) => ({ ...prev, [name]: true }))

            // Track form start on first interaction
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
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Subtle background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FF89]/5 via-transparent to-[#00FF89]/5 pointer-events-none" />
            <div className="absolute top-20 right-20 w-96 h-96 bg-[#00FF89]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#00FF89]/5 rounded-full blur-3xl pointer-events-none" />

            <Header />

            <main className="relative pt-24 pb-16">
                <Container>
                    <div className="max-w-md mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold font-league-spartan mb-3">
                                <span className="bg-gradient-to-r from-white to-[#00FF89] bg-clip-text text-transparent">Join SpykeAI</span>
                            </h1>
                            <p className="text-gray-400">Create your account in 30 seconds</p>
                        </div>

                        {/* Single Form */}
                        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 md:p-8 shadow-2xl">
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            name="emailAddress"
                                            value={formData.emailAddress}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`
                        w-full px-4 py-3 bg-black/50 border rounded-lg text-white 
                        placeholder-gray-500 transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent
                        ${
                            touched.emailAddress && errors.emailAddress
                                ? 'border-red-500'
                                : emailAvailable && formData.emailAddress && validateEmail(formData.emailAddress)
                                  ? 'border-[#00FF89]'
                                  : 'border-gray-700'
                        }
                      `}
                                            placeholder="you@example.com"
                                        />
                                        {emailChecking && (
                                            <div className="absolute right-3 top-3.5">
                                                <div className="w-5 h-5 border-2 border-gray-600 border-t-[#00FF89] rounded-full animate-spin" />
                                            </div>
                                        )}
                                        {!emailChecking &&
                                            emailAvailable &&
                                            formData.emailAddress &&
                                            validateEmail(formData.emailAddress) &&
                                            !errors.emailAddress && <div className="absolute right-3 top-3.5 text-[#00FF89]">✓</div>}
                                    </div>
                                    {touched.emailAddress && errors.emailAddress && (
                                        <p className="mt-1 text-sm text-red-500">{errors.emailAddress}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                                    <div className="flex gap-2">
                                        {/* Country Code */}
                                        <div
                                            className="relative"
                                            ref={dropdownRef}>
                                            <button
                                                type="button"
                                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                className="px-3 py-3 bg-black/50 border border-gray-700 rounded-lg text-white 
                                 hover:border-gray-600 transition-colors flex items-center gap-2 
                                 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                                <span className="text-lg">{selectedCountry.flag}</span>
                                                <span className="font-medium">{selectedCountry.code}</span>
                                                <svg
                                                    className={`w-4 h-4 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </button>

                                            {showCountryDropdown && (
                                                <div
                                                    className="absolute z-50 mt-1 w-48 bg-gray-900 border border-gray-700 
                                      rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                    {countryCodes.map(({ code, country, flag }) => (
                                                        <button
                                                            key={code}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData((prev) => ({ ...prev, countryCode: code, phoneNumber: '' }))
                                                                setShowCountryDropdown(false)
                                                            }}
                                                            className={`
                                w-full px-3 py-2 text-left hover:bg-gray-800 flex items-center gap-3 transition-colors
                                ${code === formData.countryCode ? 'bg-gray-800' : ''}
                              `}>
                                                            <span className="text-lg">{flag}</span>
                                                            <span className="text-white">{code}</span>
                                                            <span className="text-gray-400 text-sm">{country}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Phone Input */}
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`
                        flex-1 px-4 py-3 bg-black/50 border rounded-lg text-white 
                        placeholder-gray-500 transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent
                        ${touched.phoneNumber && errors.phoneNumber ? 'border-red-500' : 'border-gray-700'}
                      `}
                                            placeholder={formData.countryCode === '+1' ? '(555) 123-4567' : '1234567890'}
                                        />
                                    </div>
                                    {touched.phoneNumber && errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`
                        w-full px-4 py-3 bg-black/50 border rounded-lg text-white 
                        placeholder-gray-500 transition-all duration-200 pr-12
                        focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent
                        ${touched.password && errors.password ? 'border-red-500' : 'border-gray-700'}
                      `}
                                            placeholder="Create a strong password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                {showPassword ? (
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                    />
                                                ) : (
                                                    <>
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </>
                                                )}
                                            </svg>
                                        </button>
                                    </div>
                                    {touched.password && errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}

                                    {/* Password strength */}
                                    {formData.password && (
                                        <div className="mt-2 flex gap-1">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`
                            h-1 flex-1 rounded-full transition-all duration-300
                            ${
                                i < passwordStrength.score
                                    ? passwordStrength.score <= 2
                                        ? 'bg-red-500'
                                        : passwordStrength.score === 3
                                          ? 'bg-yellow-500'
                                          : 'bg-[#00FF89]'
                                    : 'bg-gray-800'
                            }
                          `}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Terms - Enhanced checkbox with 16px visual size */}
                                <div className="space-y-3">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                name="consent"
                                                id="consent-checkbox"
                                                checked={formData.consent}
                                                onChange={handleChange}
                                                aria-describedby={errors.consent ? 'consent-error' : undefined}
                                                className="mt-1 w-4 h-4 rounded border-2 border-gray-600 bg-black text-[#00FF89] 
                                 focus:ring-2 focus:ring-[#00FF89]/50 focus:ring-offset-2 focus:ring-offset-black
                                 cursor-pointer transition-all duration-200
                                 hover:border-gray-500 checked:bg-[#00FF89] checked:border-[#00FF89]
                                 before:content-[''] before:absolute before:inset-[-10px] before:rounded"
                                                style={{ accentColor: '#00FF89' }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                            I agree to SpykeAI's{' '}
                                            <Link
                                                href="/terms"
                                                className="text-[#00FF89] hover:underline">
                                                Terms of Service
                                            </Link>{' '}
                                            and{' '}
                                            <Link
                                                href="/privacy"
                                                className="text-[#00FF89] hover:underline">
                                                Privacy Policy
                                            </Link>
                                        </span>
                                    </label>
                                    {touched.consent && errors.consent && (
                                        <p
                                            id="consent-error"
                                            className="ml-7 text-sm text-red-500"
                                            role="alert">
                                            {errors.consent}
                                        </p>
                                    )}

                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                name="marketingConsent"
                                                id="marketing-checkbox"
                                                checked={formData.marketingConsent}
                                                onChange={handleChange}
                                                className="mt-1 w-4 h-4 rounded border-2 border-gray-600 bg-black text-[#00FF89] 
                                 focus:ring-2 focus:ring-[#00FF89]/50 focus:ring-offset-2 focus:ring-offset-black
                                 cursor-pointer transition-all duration-200
                                 hover:border-gray-500 checked:bg-[#00FF89] checked:border-[#00FF89]
                                 before:content-[''] before:absolute before:inset-[-10px] before:rounded"
                                                style={{ accentColor: '#00FF89' }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                            Send me tips and exclusive offers (optional)
                                        </span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || emailChecking || !emailAvailable || !formData.consent}
                                    className={`
                    w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200
                    ${
                        loading || emailChecking || !emailAvailable || !formData.consent
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-[#00FF89] text-black hover:bg-[#00FF89]/90 transform hover:scale-[1.02] active:scale-[0.98]'
                    }
                  `}>
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            Creating account...
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>

                                {/* Or divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-800" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-gray-900/50 text-gray-500">or continue with</span>
                                    </div>
                                </div>

                                {/* Google Sign Up */}
                                <button
                                    type="button"
                                    onClick={() => api.auth.googleAuth()}
                                    className="w-full py-3 px-6 bg-white text-black rounded-lg font-semibold 
                           hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-3">
                                    <svg
                                        className="w-5 h-5"
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
                                    Continue with Google
                                </button>
                            </form>

                            {/* Sign in link */}
                            <p className="mt-6 text-center text-gray-400 text-sm">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="text-[#00FF89] hover:underline font-semibold">
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        {/* Trust badges */}
                        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                <span>SSL Secured</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>GDPR Compliant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                                <span>Data Protected</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    )
}
