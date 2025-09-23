'use client'
import { motion } from 'framer-motion'
import Container from '@/components/shared/layout/Container'
import { Calendar, Mail, Globe, DollarSign, CreditCard, Clock, TrendingUp, Shield, AlertTriangle } from 'lucide-react'
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
            title: 'Bi-Monthly Payouts',
            description: 'Regular payment schedule on 10th and 25th',
            type: 'info'
        },
        {
            icon: DollarSign,
            title: 'Minimum Threshold',
            description: 'Meet minimum balance to initiate withdrawal',
            type: 'success'
        },
        {
            icon: CreditCard,
            title: 'Multiple Methods',
            description: 'Bank transfer, PayPal, Stripe available',
            type: 'info'
        },
        {
            icon: Shield,
            title: 'Secure Process',
            description: 'Transparent fees and secure transactions',
            type: 'success'
        }
    ]
    const payoutSchedule = [
        {
            period: '1st - 15th of the month',
            payoutDate: '25th of the same month',
            description: 'For sales generated in first half of month'
        },
        {
            period: '16th - 31st of the month',
            payoutDate: '10th of the following month',
            description: 'For sales generated in second half of month'
        }
    ]
    const withdrawalMethods = [
        {
            method: 'Bank Transfer',
            fees: 'Bank transfer fees may apply',
            processing: '3-5 business days'
        },
        {
            method: 'PayPal',
            fees: 'PayPal transaction fees apply',
            processing: '1-2 business days'
        },
        {
            method: 'Stripe',
            fees: 'Stripe processing fees apply',
            processing: '2-3 business days'
        }
    ]
    return (
        <div className="min-h-screen bg-[#121212] text-white">
            <section className="relative py-16 border-b border-gray-800">
                <Container>
                    <motion.div
                        className="text-center max-w-4xl mx-auto mt-7"
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}>
                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl font-bold text-white mb-4 font-league-spartan">
                            Payment Policy
                        </motion.h1>
                        <motion.div
                            variants={fadeInUp}
                            className="flex items-center justify-center gap-2 text-gray-400 mb-6">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Effective Date: August 26, 2025</span>
                        </motion.div>
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg text-gray-300 leading-relaxed mb-8">
                            At SpykeAI, we are committed to ensuring transparent and timely payments to our sellers. This Payment Policy outlines the
                            terms, schedule, and process for revenue disbursements to sellers on our marketplace.
                        </motion.p>
                        <motion.div
                            variants={fadeInUp}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            {paymentHighlights.map((highlight, index) => {
                                const Icon = highlight.icon
                                const borderColor =
                                    highlight.type === 'success'
                                        ? 'border-green-500/30'
                                        : highlight.type === 'warning'
                                          ? 'border-yellow-500/30'
                                          : 'border-[#00FF89]/30'
                                const iconColor =
                                    highlight.type === 'success'
                                        ? 'text-green-500'
                                        : highlight.type === 'warning'
                                          ? 'text-yellow-500'
                                          : 'text-[#00FF89]'
                                return (
                                    <div
                                        key={index}
                                        className={`bg-[#1f1f1f] rounded-xl p-4 border ${borderColor} hover:${borderColor.replace('/30', '/50')} transition-colors`}>
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
            <section className="py-16">
                <Container>
                    <motion.div
                        className="max-w-4xl mx-auto"
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}>
                        <div className="prose prose-lg prose-invert max-w-none">
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">1. Revenue Collection</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>
                                        All payments from buyers for AI products and services sold on SpykeAI are collected directly by the
                                        marketplace through supported payment gateways.
                                    </p>
                                    <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                        <div className="flex items-start gap-4">
                                            <TrendingUp className="w-6 h-6 text-[#00FF89] flex-shrink-0 mt-1" />
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-2">Revenue Processing</h3>
                                                <p className="text-gray-300">
                                                    The marketplace deducts applicable fees, commissions, and taxes before releasing funds to the
                                                    seller.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">2. Payment Schedule</h2>
                                <div className="space-y-4 text-gray-300 mb-6">
                                    <p>To maintain a smooth and fair payment process, SpykeAI follows a bi-monthly payout cycle:</p>
                                </div>
                                <div className="grid gap-4">
                                    {payoutSchedule.map((schedule, index) => (
                                        <div
                                            key={index}
                                            className="bg-[#1f1f1f] rounded-xl p-6 border border-[#00FF89]/20 hover:border-[#00FF89]/30 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 bg-[#00FF89] text-black rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-white mb-2">Sales: {schedule.period}</h3>
                                                    <p className="text-[#00FF89] font-medium mb-2">➝ Withdrawal eligible on: {schedule.payoutDate}</p>
                                                    <p className="text-gray-300 text-sm">{schedule.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">3. Minimum Payout Threshold</h2>
                                <div className="space-y-4 text-gray-300">
                                    <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                        <div className="flex items-start gap-4">
                                            <DollarSign className="w-6 h-6 text-[#00FF89] flex-shrink-0 mt-1" />
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-2">Minimum Balance Required</h3>
                                                <p className="text-gray-300 mb-3">
                                                    Sellers must accumulate a minimum balance to initiate a withdrawal.
                                                </p>
                                                <p className="text-gray-300">
                                                    If the threshold is not met, the balance will roll over to the next eligible payout cycle.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">4. Withdrawal Methods</h2>
                                <div className="space-y-4 text-gray-300 mb-6">
                                    <p>
                                        Sellers can withdraw their funds via the payment methods available in their dashboard. Additional charges may
                                        be deducted depending on the chosen method.
                                    </p>
                                </div>
                                <div className="grid gap-4">
                                    {withdrawalMethods.map((method, index) => (
                                        <div
                                            key={index}
                                            className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                            <div className="flex items-start gap-4">
                                                <CreditCard className="w-6 h-6 text-[#00FF89] flex-shrink-0 mt-1" />
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-white mb-2">{method.method}</h3>
                                                    <div className="space-y-1">
                                                        <p className="text-gray-300 text-sm">
                                                            <span className="text-yellow-500">Fees:</span> {method.fees}
                                                        </p>
                                                        <p className="text-gray-300 text-sm">
                                                            <span className="text-green-500">Processing:</span> {method.processing}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">5. Currency & Exchange</h2>
                                <div className="space-y-4 text-gray-300">
                                    <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <Globe className="w-6 h-6 text-[#00FF89] flex-shrink-0 mt-1" />
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white mb-2">Payment Processing Currency</h3>
                                                    <p className="text-gray-300 mb-3">Payments will be processed in the platform's base currency.</p>
                                                </div>
                                            </div>
                                            <div className="pl-10">
                                                <p className="text-gray-300">
                                                    If sellers operate in a different currency, exchange rates applied will be based on the rates
                                                    provided by the payment processor at the time of transfer.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">6. Refunds, Chargebacks & Disputes</h2>
                                <div className="space-y-4 text-gray-300">
                                    <div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/20">
                                        <div className="flex items-start gap-4">
                                            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-2">Important Notice</h3>
                                                <ul className="list-disc list-inside space-y-2 text-gray-300">
                                                    <li>
                                                        In cases where a customer refund or chargeback is initiated, the corresponding amount will be
                                                        deducted from the seller's balance (or future payouts if the balance is insufficient).
                                                    </li>
                                                    <li>
                                                        SpykeAI reserves the right to temporarily hold payouts if fraudulent or suspicious activity is
                                                        detected until the matter is resolved.
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">7. Taxes & Compliance</h2>
                                <div className="space-y-4 text-gray-300">
                                    <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <Shield className="w-6 h-6 text-[#00FF89] flex-shrink-0 mt-1" />
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white mb-2">Tax Responsibilities</h3>
                                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                                        <li>
                                                            Sellers are responsible for reporting and paying their own taxes as per their local
                                                            jurisdiction.
                                                        </li>
                                                        <li>SpykeAI may deduct taxes if legally required under applicable laws.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">8. Policy Updates</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>
                                        SpykeAI reserves the right to update or amend this Payment Policy at any time. Sellers will be notified of
                                        major changes via email or platform notifications.
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">Contact Information</h2>
                                <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                    <div className="space-y-3">
                                        <p className="text-white mb-4">📩 For any questions related to payments, please contact us at:</p>
                                        <div className="flex items-center gap-3 text-white">
                                            <Mail className="w-5 h-5 text-[#00FF89]" />
                                            <span>contact@spykeai.com</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-white">
                                            <Globe className="w-5 h-5 text-[#00FF89]" />
                                            <span>https://spykeai.com</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </Container>
            </section>
        </div>
    )
}