'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import { Eye, EyeOff, MapPin, CheckCircle, Loader2, ArrowRight, Check, X, Shield, Users, Star, ChevronRight } from 'lucide-react'
import Container from '@/components/layout/Container'
import Header from '@/components/layout/Header'
import { toast } from 'sonner'
import { getUserLocation } from '@/lib/utils/getUserLocation'
import { motion, AnimatePresence } from 'framer-motion'
import { validatePhoneNumber, checkPasswordStrength } from "@/lib/utils/utils"

// Password strength component
const PasswordStrength = ({ password }) => {
  const strength = checkPasswordStrength(password)
  const requirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
    { met: /[^A-Za-z0-9]/.test(password), text: 'One special character' }
  ]

  return (
    <AnimatePresence>
      {password && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 space-y-2"
        >
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < strength.score
                    ? strength.score <= 1 ? 'bg-red-500'
                    : strength.score <= 2 ? 'bg-yellow-500'
                    : strength.score <= 3 ? 'bg-blue-500'
                    : 'bg-green-500'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="space-y-1">
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {req.met ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <X className="w-3 h-3 text-gray-500" />
                )}
                <span className={req.met ? 'text-green-500' : 'text-gray-500'}>
                  {req.text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Social proof component
const SocialProof = () => (
  <div className="mb-8 p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Users className="w-5 h-5 text-[#00FF89]" />
        <div>
          <p className="text-sm font-medium text-white">Join 50,000+ creators</p>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            ))}
            <span className="text-xs text-gray-500 ml-1">4.9/5 from 12,000+ reviews</span>
          </div>
        </div>
      </div>
      <Shield className="w-8 h-8 text-[#00FF89]/20" />
    </div>
  </div>
)

// Progress indicator for multi-step
const ProgressIndicator = ({ currentStep, totalSteps }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-400">Step {currentStep} of {totalSteps}</span>
      <span className="text-sm text-gray-400">{Math.round((currentStep / totalSteps) * 100)}% complete</span>
    </div>
    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-[#00FF89]"
        initial={{ width: 0 }}
        animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  </div>
)

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [locationStatus, setLocationStatus] = useState('idle')
  const [currentStep, setCurrentStep] = useState(1)
  const [emailVerified, setEmailVerified] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)

  const [formData, setFormData] = useState({
    emailAddress: '',
    phoneNumber: '',
    password: '',
    consent: false,
    userLocation: { lat: 0, long: 0 },
  })

  const [errors, setErrors] = useState({})

  // Auto-focus first input
  useEffect(() => {
    const firstInput = document.querySelector('input[name="emailAddress"]')
    if (firstInput) firstInput.focus()
  }, [currentStep])

  const showToast = (type, msg) => {
    if (type === 'success') toast.success(msg)
    else toast.error(msg)
  }

  const requestLocation = async () => {
    const location = await getUserLocation(setLocationStatus, showToast)
    if (location) {
      setFormData((prev) => ({ ...prev, userLocation: location }))
      setErrors((prev) => ({ ...prev, location: '' }))
    }
  }

  // Request location on component mount
  useEffect(() => {
    requestLocation()
  }, [])

  const checkEmailAvailability = useCallback(async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    
    setCheckingEmail(true)
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      setEmailVerified(!data.exists)
      if (data.exists) {
        setErrors(prev => ({ ...prev, emailAddress: 'This email is already registered' }))
      }
    } catch (error) {
      console.error('Email check error:', error)
    } finally {
      setCheckingEmail(false)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    let processedValue = value
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))

    // Real-time email validation
    if (name === 'emailAddress' && value) {
      checkEmailAvailability(value)
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.emailAddress) {
        newErrors.emailAddress = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
        newErrors.emailAddress = 'Please provide a valid email address'
      }

      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required'
      } else if (!validatePhoneNumber(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Please provide a valid phone number'
      }
      
      // Validate location
      if (locationStatus !== 'granted' || (formData.userLocation.lat === 0 && formData.userLocation.long === 0)) {
        newErrors.location = 'Location access is required to continue'
      }
    }

    if (step === 2) {
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (checkPasswordStrength(formData.password).score < 3) {
        newErrors.password = 'Please create a stronger password'
      }
    }

    if (step === 3) {
      if (!formData.consent) {
        newErrors.consent = 'You must agree to the terms and conditions'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(3)) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)
    const apiURL = 'http://localhost:5000';

    try {
      const response = await fetch(`${apiURL}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          emailAddress: formData.emailAddress.toLowerCase().trim(),
          phoneNumber: formData.phoneNumber.trim(),
          role: 'user',
        })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Account created successfully! Please check your email to verify.')
        router.push('/login?signup=success')
      } else {
        toast.error(data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    window.location.href = '/api/auth/google'
  }

  // SEO Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Sign Up - Join Our Creative Community",
    "description": "Create your account and join thousands of creators and buyers. Get started with our platform in minutes.",
    "url": "https://yoursite.com/signup",
    "mainEntity": {
      "@type": "Organization",
      "name": "Your Platform Name",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "12000"
      }
    }
  }

  return (
    <>
      <Head>
        <title>Sign Up - Join 50,000+ Creators | Your Platform</title>
        <meta name="description" content="Create your free account and join our community of 50,000+ creators. Get access to exclusive features, tools, and opportunities. Sign up in 30 seconds." />
        <meta name="keywords" content="sign up, create account, join creators, creative platform, register" />
        <link rel="canonical" href="https://yoursite.com/signup" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Sign Up - Join 50,000+ Creators" />
        <meta property="og:description" content="Create your free account and start your creative journey today." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yoursite.com/signup" />
        <meta property="og:image" content="https://yoursite.com/og-signup.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sign Up - Join 50,000+ Creators" />
        <meta name="twitter:description" content="Create your free account and start your creative journey today." />
        
        {/* Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </Head>

      <div className="min-h-screen bg-black">
        <Header />

        <main role="main" className="pt-24 pb-16">
          <Container>
            <div className="max-w-md mx-auto">
              {/* Breadcrumb Navigation */}
              <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="flex items-center space-x-2 text-sm">
                  <li>
                    <Link href="/" className="text-gray-500 hover:text-white transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </li>
                  <li>
                    <span className="text-white" aria-current="page">Sign Up</span>
                  </li>
                </ol>
              </nav>

              {/* Header */}
              <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white font-league-spartan mb-4">
                  {currentStep === 1 && "Let's get started"}
                  {currentStep === 2 && "Secure your account"}
                  {currentStep === 3 && "Almost there!"}
                </h1>
                <p className="text-gray-400 font-kumbh-sans">
                  {currentStep === 1 && "Enter your email and phone to begin"}
                  {currentStep === 2 && "Create a strong password"}
                  {currentStep === 3 && "Review and complete your signup"}
                </p>
              </header>

              {/* Progress Indicator */}
              <ProgressIndicator currentStep={currentStep} totalSteps={3} />

              {/* Social Proof */}
              {currentStep === 1 && <SocialProof />}

              {/* Google Button - Only on step 1 */}
              {currentStep === 1 && (
                <>
                  <button
                    onClick={handleGoogleSignup}
                    className="w-full flex items-center justify-center px-6 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white hover:bg-[#222] transition-all hover:scale-[1.02] active:scale-[0.98] mb-6"
                    aria-label="Sign up with Google">
                    <svg
                      className="w-5 h-5 mr-3"
                      viewBox="0 0 24 24"
                      aria-hidden="true">
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

                  {/* Divider */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-black text-gray-500">or sign up with email</span>
                    </div>
                  </div>
                </>
              )}

              {/* Multi-step Form */}
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <AnimatePresence mode="wait">
                  {/* Step 1: Email & Phone */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      {/* Email */}
                      <div>
                        <label
                          htmlFor="emailAddress"
                          className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            id="emailAddress"
                            name="emailAddress"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.emailAddress}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF89] focus:ring-1 focus:ring-[#00FF89] transition-all pr-10"
                            placeholder="you@example.com"
                            aria-describedby="email-error"
                            aria-invalid={!!errors.emailAddress}
                          />
                          {checkingEmail && (
                            <Loader2 className="absolute right-3 top-3.5 w-5 h-5 text-gray-500 animate-spin" />
                          )}
                          {emailVerified && formData.emailAddress && (
                            <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />
                          )}
                        </div>
                        {errors.emailAddress && (
                          <p id="email-error" className="mt-2 text-sm text-red-500" role="alert">
                            {errors.emailAddress}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label
                          htmlFor="phoneNumber"
                          className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          autoComplete="tel"
                          required
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF89] focus:ring-1 focus:ring-[#00FF89] transition-all"
                          placeholder="+1 (555) 000-0000"
                          aria-describedby="phone-error"
                          aria-invalid={!!errors.phoneNumber}
                        />
                        {errors.phoneNumber && (
                          <p id="phone-error" className="mt-2 text-sm text-red-500" role="alert">
                            {errors.phoneNumber}
                          </p>
                        )}
                      </div>

                      {/* Location - Required */}
                      <div className={`p-4 rounded-lg border transition-colors ${
                        locationStatus === 'granted' ? 'bg-[#00FF89]/5 border-[#00FF89]/20' : 'bg-[#1a1a1a] border-gray-800'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <MapPin className={`w-5 h-5 ${locationStatus === 'granted' ? 'text-[#00FF89]' : 'text-gray-500'}`} />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {locationStatus === 'granted' ? 'Location access granted' : 'Enable location access'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Required for personalized experience
                              </p>
                            </div>
                          </div>
                          {locationStatus === 'idle' && (
                            <button
                              type="button"
                              onClick={requestLocation}
                              className="px-4 py-2 bg-[#00FF89] text-black text-sm font-medium rounded-lg hover:bg-[#00FF89]/90 transition-colors">
                              Enable
                            </button>
                          )}
                          {locationStatus === 'loading' && (
                            <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                          )}
                          {locationStatus === 'granted' && (
                            <CheckCircle className="w-5 h-5 text-[#00FF89]" />
                          )}
                          {locationStatus === 'denied' && (
                            <button
                              type="button"
                              onClick={requestLocation}
                              className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors">
                              Retry
                            </button>
                          )}
                        </div>
                        {errors.location && (
                          <p className="mt-2 text-sm text-red-500" role="alert">
                            {errors.location}
                          </p>
                        )}
                      </div>

                      {/* Next Button */}
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full flex items-center justify-center px-6 py-3 bg-[#00FF89] text-black font-semibold rounded-lg hover:bg-[#00FF89]/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        Continue
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </button>
                    </motion.div>
                  )}

                  {/* Step 2: Password */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      {/* Password */}
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-300 mb-2">
                          Create Password
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF89] focus:ring-1 focus:ring-[#00FF89] transition-all pr-12"
                            placeholder="Enter a secure password"
                            aria-describedby="password-error password-requirements"
                            aria-invalid={!!errors.password}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}>
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p id="password-error" className="mt-2 text-sm text-red-500" role="alert">
                            {errors.password}
                          </p>
                        )}
                        <div id="password-requirements">
                          <PasswordStrength password={formData.password} />
                        </div>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="flex-1 px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all">
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="flex-1 flex items-center justify-center px-6 py-3 bg-[#00FF89] text-black font-semibold rounded-lg hover:bg-[#00FF89]/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
                          Continue
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Terms & Submit */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      {/* Account Summary */}
                      <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Account Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Email:</span>
                            <span className="text-white">{formData.emailAddress}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Phone:</span>
                            <span className="text-white">{formData.phoneNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="consent"
                            checked={formData.consent}
                            onChange={handleChange}
                            className="mt-0.5 w-4 h-4 rounded border-gray-700 bg-[#1a1a1a] text-[#00FF89] focus:ring-[#00FF89] focus:ring-offset-0"
                            aria-describedby="consent-error"
                          />
                          <span className="text-sm text-gray-400">
                            I agree to the{' '}
                            <Link
                              href="/terms"
                              className="text-[#00FF89] hover:underline"
                              target="_blank"
                              rel="noopener noreferrer">
                              Terms and Conditions
                            </Link>{' '}
                            and{' '}
                            <Link
                              href="/privacy"
                              className="text-[#00FF89] hover:underline"
                              target="_blank"
                              rel="noopener noreferrer">
                              Privacy Policy
                            </Link>
                          </span>
                        </label>
                        {errors.consent && (
                          <p id="consent-error" className="text-sm text-red-500" role="alert">
                            {errors.consent}
                          </p>
                        )}

                        {/* Marketing Consent */}
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="marketingConsent"
                            checked={formData.marketingConsent}
                            onChange={handleChange}
                            className="mt-0.5 w-4 h-4 rounded border-gray-700 bg-[#1a1a1a] text-[#00FF89] focus:ring-[#00FF89] focus:ring-offset-0"
                          />
                          <span className="text-sm text-gray-400">
                            Send me tips, trends, and exclusive offers (optional)
                          </span>
                        </label>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="flex-1 px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all">
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 flex items-center justify-center px-6 py-3 bg-[#00FF89] text-black font-semibold rounded-lg hover:bg-[#00FF89]/90 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]">
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            <>
                              Create Account
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {/* Trust Indicators */}
              <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>GDPR Compliant</span>
                </div>
              </div>

              {/* Sign in link */}
              <p className="mt-6 text-center text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-[#00FF89] hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </Container>
        </main>
      </div>
    </>
  )
}