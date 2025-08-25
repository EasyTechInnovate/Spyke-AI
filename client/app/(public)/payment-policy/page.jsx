'use client'

import { motion } from 'framer-motion'
import Container from '@/components/shared/layout/Container'
import ConditionalHeader from '@/components/shared/layout/ConditionalHeader'
import Footer from '@/components/shared/layout/Footer'
import { SpykeLogo } from '@/components/Logo'
import { Calendar, Mail, Globe, DollarSign, Clock, CreditCard, RefreshCw, AlertTriangle, CheckCircle, TrendingUp, Shield } from 'lucide-react'

export default function PaymentPolicyPage() {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    }

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const paymentHighlights = [
        {
            icon: Clock,
            title: "Bi-Monthly Payouts",
            description: "Regular payment schedule on 10th and 25th of each month",
            type: "success"
        },
        {
            icon: Shield,
            title: "Secure Processing",
            description: "All payments processed through trusted gateways",
            type: "info"
        },
        {
            icon: DollarSign,
            title: "Fair Revenue",
            description: "Transparent fee structure and commission deductions",
            type: "info"
        },
        {
            icon: TrendingUp,
            title: "Growth Focused",
            description: "Designed to support seller success and growth",
            type: "warning"
        }
    ]

    const paymentSchedule = [
        {
            period: "1st - 15th of the month",
            payoutDate: "25th of the same month",
            description: "Sales made in the first half of the month"
        },
        {
            period: "16th - 31st of the month", 
            payoutDate: "10th of the following month",
            description: "Sales made in the second half of the month"
        }
    ]

    const withdrawalMethods = [
        "Bank Transfer",
        "PayPal", 
        "Stripe",
        "Other supported payment processors"
    ]

    const keyPolicies = [
        {
            title: "Revenue Collection",
            description: "All buyer payments collected directly through marketplace payment gateways with fee deductions"
        },
        {
            title: "Minimum Threshold", 
            description: "Sellers must accumulate minimum balance to initiate withdrawal; balances roll over if threshold not met"
        },
        {
            title: "Currency Processing",
            description: "Payments processed in USD with exchange rates applied based on payment processor rates"
        },
        {
            title: "Tax Compliance",
            description: "Sellers responsible for own tax reporting; marketplace may deduct taxes if legally required"
        }
    ]

    return (
        <>
            <ConditionalHeader />
            <div className="min-h-screen bg-[#121212] text-white">
                {/* Header Section */}
                <section className="relative py-16 border-b border-gray-800">
                    <Container>
                        <motion.div 
                            className="text-center max-w-4xl mx-auto"
                            initial="initial"
                            animate="animate"
                            variants={staggerContainer}
                        >
                            <motion.div variants={fadeInUp} className="mb-8">
                                <SpykeLogo
                                    sizePreset="xl"
                                    showText={false}
                                    darkMode={true}
                                    className="mx-auto mb-6"
                                />
                            </motion.div>
                            
                            <motion.h1 
                                variants={fadeInUp}
                                className="text-4xl md:text-5xl font-bold text-white mb-4 font-league-spartan"
                            >
                                Payment Policy
                            </motion.h1>
                            
                            <motion.div 
                                variants={fadeInUp}
                                className="flex items-center justify-center gap-2 text-gray-400 mb-6"
                            >
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">Effective Date: August 26, 2025</span>
                            </motion.div>
                            
                            <motion.p 
                                variants={fadeInUp}
                                className="text-lg text-gray-300 leading-relaxed mb-8"
                            >
                                At SpykeAI, we are committed to ensuring transparent and timely payments to our sellers. 
                                This Payment Policy outlines the terms, schedule, and process for revenue disbursements to sellers.
                            </motion.p>

                            {/* Payment Highlights */}
                            <motion.div 
                                variants={fadeInUp}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                            >
                                {paymentHighlights.map((highlight, index) => {
                                    const Icon = highlight.icon
                                    const borderColor = highlight.type === 'success' ? 'border-green-500/30' : 
                                                      highlight.type === 'warning' ? 'border-yellow-500/30' : 
                                                      'border-[#00FF89]/30'
                                    const iconColor = highlight.type === 'success' ? 'text-green-500' : 
                                                    highlight.type === 'warning' ? 'text-yellow-500' : 
                                                    'text-[#00FF89]'
                                    
                                    return (
                                        <div key={index} className={`bg-[#1f1f1f] rounded-xl p-4 border ${borderColor} hover:${borderColor.replace('/30', '/50')} transition-colors`}>
                                            <Icon className={`w-6 h-6 ${iconColor} mx-auto mb-2`} />
                                            <h3 className="text-sm font-semibold text-white mb-1">{highlight.title}</h3>
                                            <p className="text-xs text-gray-400">{highlight.description}</p>
                                        </div>
                                    )
                                })}
                            </motion.div>
                        </motion.div>
                    </Container>
                </section>

                {/* Main Content */}
                <section className="py-16">
                    <Container>
                        <motion.div 
                            className="max-w-4xl mx-auto"
                            initial="initial"
                            animate="animate"
                            variants={staggerContainer}
                        >
                            <div className="prose prose-lg prose-invert max-w-none">
                                {/* Section 1 - Revenue Collection */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan flex items-center gap-3">
                                        <DollarSign className="w-6 h-6" />
                                        1. Revenue Collection
                                    </h2>
                                    <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                        <ul className="list-disc list-inside space-y-3 ml-4 text-gray-300">
                                            <li>All payments from buyers for AI products and services sold on SpykeAI are collected directly by the marketplace through supported payment gateways.</li>
                                            <li>The marketplace deducts applicable fees, commissions, and taxes before releasing funds to the seller.</li>
                                        </ul>
                                    </div>
                                </motion.div>

                                {/* Section 2 - Payment Schedule */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan flex items-center gap-3">
                                        <Clock className="w-6 h-6" />
                                        2. Payment Schedule
                                    </h2>
                                    <div className="space-y-4 text-gray-300 mb-6">
                                        <p>To maintain a smooth and fair payment process, SpykeAI follows a <strong className="text-white">bi-monthly payout cycle</strong>:</p>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {paymentSchedule.map((schedule, index) => (
                                            <div key={index} className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 hover:border-[#00FF89]/30 transition-all duration-300">
                                                <div className="text-center">
                                                    <div className="w-16 h-16 bg-[#00FF89]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Calendar className="w-8 h-8 text-[#00FF89]" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-white mb-2 font-league-spartan">
                                                        {schedule.period}
                                                    </h3>
                                                    <div className="mb-3">
                                                        <span className="text-2xl font-bold text-[#00FF89]">{schedule.payoutDate}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-400">{schedule.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Section 3 - Minimum Payout Threshold */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">3. Minimum Payout Threshold</h2>
                                    <div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/20">
                                        <div className="flex items-start gap-4">
                                            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                                            <div>
                                                <ul className="list-disc list-inside space-y-3 ml-4 text-gray-300">
                                                    <li>Sellers must accumulate a minimum balance of <strong className="text-white">$50</strong> to initiate a withdrawal.</li>
                                                    <li>If the threshold is not met, the balance will roll over to the next eligible payout cycle.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Section 4 - Withdrawal Methods */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan flex items-center gap-3">
                                        <CreditCard className="w-6 h-6" />
                                        4. Withdrawal Methods
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                            <h3 className="text-lg font-semibold text-white mb-4">Available Payment Methods</h3>
                                            <div className="grid md:grid-cols-2 gap-3">
                                                {withdrawalMethods.map((method, index) => (
                                                    <div key={index} className="flex items-center gap-3 bg-[#121212] rounded-lg p-3">
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                        <span className="text-gray-300">{method}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/20">
                                            <div className="flex items-start gap-4">
                                                <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                                                <p className="text-gray-300">
                                                    <strong className="text-white">Note:</strong> Additional charges (e.g., bank transfer fees or third-party transaction fees) may be deducted depending on the chosen method.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Section 5 - Currency & Exchange */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">5. Currency & Exchange</h2>
                                    <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                        <ul className="list-disc list-inside space-y-3 ml-4 text-gray-300">
                                            <li>Payments will be processed in <strong className="text-white">USD</strong>.</li>
                                            <li>If sellers operate in a different currency, exchange rates applied will be based on the rates provided by the payment processor at the time of transfer.</li>
                                        </ul>
                                    </div>
                                </motion.div>

                                {/* Section 6 - Refunds, Chargebacks & Disputes */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan flex items-center gap-3">
                                        <RefreshCw className="w-6 h-6" />
                                        6. Refunds, Chargebacks & Disputes
                                    </h2>
                                    <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20">
                                        <div className="flex items-start gap-4 mb-4">
                                            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                                            <h3 className="text-lg font-semibold text-white">Important Policy</h3>
                                        </div>
                                        <ul className="list-disc list-inside space-y-3 ml-4 text-gray-300">
                                            <li>In cases where a customer refund or chargeback is initiated, the corresponding amount will be deducted from the seller's balance (or future payouts if the balance is insufficient).</li>
                                            <li>SpykeAI reserves the right to temporarily hold payouts if fraudulent or suspicious activity is detected until the matter is resolved.</li>
                                        </ul>
                                    </div>
                                </motion.div>

                                {/* Section 7 - Taxes & Compliance */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">7. Taxes & Compliance</h2>
                                    <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                        <ul className="list-disc list-inside space-y-3 ml-4 text-gray-300">
                                            <li>Sellers are responsible for reporting and paying their own taxes as per their local jurisdiction.</li>
                                            <li>SpykeAI may deduct taxes if legally required under applicable laws.</li>
                                        </ul>
                                    </div>
                                </motion.div>

                                {/* Section 8 - Policy Updates */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">8. Policy Updates</h2>
                                    <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                        <p className="text-gray-300">
                                            SpykeAI reserves the right to update or amend this Payment Policy at any time. Sellers will be notified of major changes via email or platform notifications.
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Key Policies Summary */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-8 font-league-spartan">Quick Reference</h2>
                                    
                                    <div className="grid gap-4">
                                        {keyPolicies.map((policy, index) => (
                                            <div key={index} className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 hover:border-[#00FF89]/30 transition-all duration-300">
                                                <div className="flex items-start gap-4">
                                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white mb-2 font-league-spartan">
                                                            {policy.title}
                                                        </h3>
                                                        <p className="text-gray-300">{policy.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Contact Section */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <div className="bg-gradient-to-r from-[#00FF89]/10 via-transparent to-[#00FF89]/10 rounded-2xl p-8 border border-[#00FF89]/20 text-center">
                                        <h2 className="text-2xl font-bold text-white mb-4 font-league-spartan">
                                            Questions About Payments?
                                        </h2>
                                        <p className="text-gray-300 mb-6">
                                            For any questions related to payments, please contact us:
                                        </p>
                                        <div className="flex items-center justify-center gap-3 text-white">
                                            <Mail className="w-5 h-5 text-[#00FF89]" />
                                            <span className="text-lg">contact@spykeai.com</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </Container>
                </section>
            </div>
            <Footer />
        </>
    )
}