'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Cookie, BarChart3, Check } from 'lucide-react'
import Link from 'next/link'

export default function UnifiedConsentBanner() {
    const [show, setShow] = useState(false)
    const [preferences, setPreferences] = useState({
        essential: true, // Always true, cannot be changed
        analytics: true,
        marketing: true
    })
    const [showEssentialCheck, setShowEssentialCheck] = useState(true)

    useEffect(() => {
        // Check if consent has been given
        const consentData = localStorage.getItem('unifiedConsent')
        const cookieConsent = localStorage.getItem('cookieConsent')
        const analyticsConsent = localStorage.getItem('analytics_consent')

        // If no unified consent but has old consents, migrate
        if (!consentData && (cookieConsent || analyticsConsent)) {
            // Migrate old consent
            const migrated = {
                essential: true,
                analytics: analyticsConsent === 'true',
                marketing: cookieConsent === 'accepted'
            }
            localStorage.setItem('unifiedConsent', JSON.stringify(migrated))
            localStorage.setItem('unifiedConsentDate', new Date().toISOString())
            // Remove old keys
            localStorage.removeItem('cookieConsent')
            localStorage.removeItem('analytics_consent')
        } else if (!consentData) {
            // Show consent after a small delay for better UX
            setTimeout(() => {
                setShow(true)
            }, 1500)
        }
    }, [])

    const handleAcceptAll = () => {
        const allAccepted = {
            essential: true,
            analytics: true,
            marketing: true
        }

        localStorage.setItem('unifiedConsent', JSON.stringify(allAccepted))
        localStorage.setItem('unifiedConsentDate', new Date().toISOString())

        setShow(false)
    }

    const handleAcceptSelected = () => {
        localStorage.setItem('unifiedConsent', JSON.stringify(preferences))
        localStorage.setItem('unifiedConsentDate', new Date().toISOString())

        setShow(false)
    }

    const handleDeclineAll = () => {
        const declined = {
            essential: true, // Essential always true
            analytics: false,
            marketing: false
        }

        localStorage.setItem('unifiedConsent', JSON.stringify(declined))
        localStorage.setItem('unifiedConsentDate', new Date().toISOString())

        setShow(false)
    }

    const togglePreference = (type) => {
        if (type === 'essential') {
            // Show checkmark animation
            setShowEssentialCheck(false)
            setTimeout(() => setShowEssentialCheck(true), 100)
            return // Cannot change essential
        }
        setPreferences((prev) => ({
            ...prev,
            [type]: !prev[type]
        }))
    }

    if (!show) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="relative bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/20 to-transparent rounded-2xl blur-xl opacity-50" />

                        <div className="relative">
                            <button
                                onClick={() => setShow(false)}
                                className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white transition-colors"
                                aria-label="Close consent banner">
                                <X className="h-4 w-4" />
                            </button>

                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="p-2 bg-brand-primary/20 rounded-lg flex-shrink-0">
                                            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-league-spartan font-semibold text-lg sm:text-xl text-white mb-2">
                                                Privacy & Cookies
                                            </h3>
                                            <p className="font-kumbh-sans text-sm sm:text-base text-gray-300 leading-relaxed">
                                                We use cookies and similar technologies to enhance your experience, analyze site traffic, and deliver
                                                personalized content. You can manage your preferences below.
                                                <Link
                                                    href="/privacy"
                                                    className="text-brand-primary hover:text-white ml-1 underline underline-offset-2 transition-colors">
                                                    Learn more
                                                </Link>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Cookie Preferences */}
                                    <div className="space-y-3 mb-6">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <div className="relative mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={preferences.essential}
                                                    disabled
                                                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-brand-primary focus:ring-brand-primary cursor-not-allowed"
                                                />
                                                <AnimatePresence>
                                                    {showEssentialCheck && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            exit={{ scale: 0 }}
                                                            className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <Check className="h-3 w-3 text-brand-primary" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            <div
                                                onClick={() => togglePreference('essential')}
                                                className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Cookie className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium text-sm text-gray-300">Essential Cookies</span>
                                                    <span className="text-xs text-gray-500">(Required)</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">Required for the website to function properly</p>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={preferences.analytics}
                                                onChange={() => togglePreference('analytics')}
                                                className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-800 text-brand-primary focus:ring-brand-primary checked:bg-brand-primary"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <BarChart3 className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium text-sm text-gray-300 group-hover:text-white transition-colors">
                                                        Analytics Cookies
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">Help us understand how visitors use our site</p>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={preferences.marketing}
                                                onChange={() => togglePreference('marketing')}
                                                className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-800 text-brand-primary focus:ring-brand-primary checked:bg-brand-primary"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Cookie className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium text-sm text-gray-300 group-hover:text-white transition-colors">
                                                        Marketing Cookies
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">Used to deliver personalized advertisements</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:ml-6 lg:flex-shrink-0">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleAcceptAll}
                                        className="relative group px-6 py-2.5 font-kumbh-sans font-semibold text-sm sm:text-base text-black bg-brand-primary hover:bg-brand-primary/90 rounded-xl transition-all duration-200 whitespace-nowrap">
                                        <span className="relative z-10">Accept All</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-green-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleAcceptSelected}
                                        className="px-6 py-2.5 font-kumbh-sans font-medium text-sm sm:text-base text-gray-300 bg-white/10 hover:bg-white/20 border border-gray-600 rounded-xl transition-all duration-200 whitespace-nowrap">
                                        Accept Selected
                                    </motion.button>

                                    <button
                                        onClick={handleDeclineAll}
                                        className="text-sm text-gray-400 hover:text-white transition-colors font-kumbh-sans">
                                        Decline All
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
