'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, RefreshCw, AlertTriangle, Loader, ArrowLeft, CheckCircle, Sparkles, Shield } from 'lucide-react'
import api from '@/lib/api'
import Notification from '@/components/shared/Notification'
export default function VerifyEmailContent({ email }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const [notification, setNotification] = useState(null)
    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
    const scaleIn = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldown])
    const showNotification = (message, type = 'info') => {
        setNotification({
            id: Date.now(),
            type,
            message,
            duration: type === 'error' ? 6000 : 4000
        })
    }
    const handleResendEmail = async () => {
        if (!email) {
            showNotification('Please provide your email address to resend verification email.', 'error')
            return
        }
        setLoading(true)
        setTimeout(() => {
            showNotification('Verification email sent! Check your inbox and spam folder.', 'success')
            setCooldown(60)
            setLoading(false)
        }, 1000)
    }
    return (
        <div className="min-h-screen bg-[#121212] text-white font-league-spartan relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[#121212]" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF89]/6 rounded-full blur-3xl animate-pulse opacity-50" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#00FF89]/4 rounded-full blur-3xl animate-pulse opacity-30" />
            </div>
            {notification && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[60]">
                    <Notification
                        {...notification}
                        onClose={() => setNotification(null)}
                    />
                </div>
            )}
            <motion.div
                className="absolute top-8 left-8 z-20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}>
                <Link
                    href="/signin"
                    className="group inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-gray-700 hover:border-[#00FF89] transition-all duration-300 hover:bg-[#1f1f1f]">
                    <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-[#00FF89] transition-colors" />
                    <span className="text-base font-medium text-gray-300 group-hover:text-white transition-colors">Back</span>
                </Link>
            </motion.div>
            <div className="relative min-h-screen flex items-center justify-center px-6 pt-24">
                <motion.div
                    className="w-full max-w-2xl"
                    initial="initial"
                    animate="animate"
                    variants={fadeInUp}>
                    <div className="relative">
                        <div className="absolute -inset-1 bg-[#00FF89]/20 rounded-3xl blur-xl opacity-40" />
                        <motion.div
                            className="relative bg-[#1a1a1a] border border-gray-700 rounded-3xl shadow-2xl"
                            variants={scaleIn}>
                            <div className="text-center p-12 pb-8">
                                <motion.div
                                    className="relative w-24 h-24 mx-auto mb-8"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}>
                                    <div className="absolute inset-0 rounded-full border-2 border-[#00FF89]/30">
                                        <div className="absolute inset-0 rounded-full border-t-2 border-[#00FF89] animate-spin" />
                                    </div>
                                    <div className="absolute inset-2 bg-[#00FF89]/20 rounded-full" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Mail className="w-10 h-10 text-[#00FF89]" />
                                    </div>
                                </motion.div>
                                <motion.h1
                                    className="text-4xl font-bold text-white mb-6 tracking-tight"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}>
                                    Check Your Email
                                </motion.h1>
                                <motion.p
                                    className="text-gray-300 text-xl leading-relaxed mb-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}>
                                    We sent a verification link to
                                </motion.p>
                                <motion.div
                                    className="inline-flex items-center gap-3 px-6 py-3 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-xl"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.9 }}>
                                    <Mail className="w-5 h-5 text-[#00FF89]" />
                                    <span className="text-[#00FF89] font-semibold text-lg">{email}</span>
                                </motion.div>
                            </div>
                            <motion.div
                                className="mx-12 mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.0 }}>
                                <div className="relative p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <p className="text-amber-200 text-lg font-medium">
                                            <span className="font-semibold">Check your spam folder</span> if you don't see the email in your inbox
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                className="px-12 pb-12"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1 }}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleResendEmail}
                                        disabled={loading || cooldown > 0}
                                        className={`group relative overflow-hidden px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                                            loading || cooldown > 0
                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                                                : 'bg-[#00FF89] text-black hover:shadow-2xl hover:shadow-[#00FF89]/25 transform hover:scale-[1.02] active:scale-[0.98] border border-[#00FF89]'
                                        }`}>
                                        <div className="relative flex items-center justify-center gap-3">
                                            {loading ? (
                                                <>
                                                    <Loader className="w-5 h-5 animate-spin" />
                                                    <span>Sending...</span>
                                                </>
                                            ) : cooldown > 0 ? (
                                                <>
                                                    <div className="w-5 h-5 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" />
                                                    <span>Resend in {cooldown}s</span>
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="w-5 h-5" />
                                                    <span>Resend Email</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                    <Link
                                        href="/signin"
                                        className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3 text-black font-semibold bg-[#00FF89] rounded-lg hover:bg-[#00FF89]/90 transition-all duration-200 hover:shadow-lg hover:shadow-[#00FF89]/25 w-full sm:w-auto min-h-[56px] touch-manipulation border border-[#00FF89] hover:scale-[1.02] active:scale-[0.98]">
                                        <span className="text-base sm:text-base">Back to Sign In</span>
                                    </Link>
                                </div>
                            </motion.div>
                            <motion.div
                                className="border-t border-gray-700 px-12 py-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2 }}>
                                <div className="flex items-center justify-between text-lg">
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <Shield className="w-5 h-5 text-[#00FF89]" />
                                        <span>Secure & encrypted</span>
                                    </div>
                                    <Link
                                        href="/contactus"
                                        className="group text-gray-400 transition-colors flex items-center gap-2">
                                        <span className="text-gray-400">Need help?</span>
                                        <span className="text-gray-400 group-hover:text-[#00FF89] transition-colors">Contact Support</span>
                                    </Link>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
