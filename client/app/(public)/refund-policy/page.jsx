'use client'
import { motion } from 'framer-motion'
import Container from '@/components/shared/layout/Container'
import { Calendar, Mail, Globe, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
export default function RefundPolicyPage() {
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
    const refundHighlights = [
        {
            icon: Clock,
            title: '7-Day Window',
            description: 'Request refunds within 7 days of purchase',
            type: 'info'
        },
        {
            icon: CheckCircle,
            title: 'Valid Cases',
            description: 'Non-delivery, defective files, or misrepresentation',
            type: 'success'
        },
        {
            icon: XCircle,
            title: 'Digital Goods',
            description: 'Generally final sale due to nature of digital products',
            type: 'success'
        },
        {
            icon: RefreshCw,
            title: 'Fair Process',
            description: 'Thorough investigation with evidence review',
            type: 'info'
        }
    ]
    const refundExceptions = [
        {
            title: 'Non-Delivery of Product',
            description: "If you don't receive access to the purchased product within the promised delivery time due to technical issues."
        },
        {
            title: 'Defective or Corrupted File',
            description:
                'If the file provided is damaged, incomplete, or cannot be used as described, and the Seller cannot provide a working replacement.'
        },
        {
            title: 'Misrepresentation',
            description: 'If the product description is significantly different from what was delivered, with sufficient proof provided.'
        },
        {
            title: 'Unauthorized Transactions',
            description: 'If your account or payment method was used without your permission.'
        }
    ]
    const noRefundCases = [
        "Buyer's change of mind after purchase",
        "Incompatibility with Buyer's device, system, or software (unless explicitly stated as compatible)",
        "Buyer's failure to learn how to use the product",
        'Accidental or mistaken purchases by the Buyer'
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
                            Return & Refund Policy
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
                            This Return & Refund Policy outlines the terms under which refunds or returns may be issued for purchases made through
                            SpykeAI. By purchasing from our marketplace, you agree to the following terms.
                        </motion.p>
                        <motion.div
                            variants={fadeInUp}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            {refundHighlights.map((highlight, index) => {
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
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">
                                    1. General Policy for Digital Products & Services
                                </h2>
                                <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 mb-6">
                                    <div className="flex items-start gap-4">
                                        <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-2">Important Notice</h3>
                                            <p className="text-gray-300">
                                                All sales of digital products, AI models, prompts, automation workflows, AI Agents, and services are{' '}
                                                <strong className="text-white">final</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 text-gray-300">
                                    <p>
                                        Due to the nature of digital goods, we do not offer refunds or exchanges once the product has been delivered
                                        or accessed, unless otherwise stated in this policy.
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">
                                    2. Exceptions Where Refunds May Be Considered
                                </h2>
                                <div className="space-y-4 text-gray-300 mb-6">
                                    <p>Refunds may be granted only in the following cases:</p>
                                </div>
                                <div className="grid gap-4">
                                    {refundExceptions.map((exception, index) => (
                                        <div
                                            key={index}
                                            className="bg-[#1f1f1f] rounded-xl p-6 border border-green-500/20 hover:border-green-500/30 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white mb-2">{exception.title}</h3>
                                                    <p className="text-gray-300">{exception.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">3. Refund Request Process</h2>
                                <div className="space-y-6 text-gray-300">
                                    <p>To request a refund:</p>
                                    <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-[#00FF89] text-black rounded-full flex items-center justify-center font-bold text-sm">
                                                    1
                                                </div>
                                                <p className="text-white">
                                                    Contact us at <span className="text-[#00FF89]">contact@spykeai.com</span> within{' '}
                                                    <strong>7 days</strong> from the product purchase date.
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-[#00FF89] text-black rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                                                    2
                                                </div>
                                                <div>
                                                    <p className="text-white mb-2">Include:</p>
                                                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300">
                                                        <li>Order ID</li>
                                                        <li>Proof of purchase (e.g., payment receipt)</li>
                                                        <li>
                                                            Detailed description of the issue, along with any supporting evidence (Screenshots,
                                                            Recordings of Errors or any bugs faced)
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p>
                                            SpykeAI will investigate refund requests in detail after the Buyer provides sufficient proof or evidence.
                                        </p>
                                        <p>
                                            Refunds, if approved, will be processed to your original payment method within{' '}
                                            <strong className="text-white">7–10 business days</strong>.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">4. Seller Responsibilities</h2>
                                <div className="space-y-4 text-gray-300">
                                    <ul className="list-disc list-inside space-y-3 ml-4">
                                        <li>Sellers must ensure that their product listings are accurate, truthful, and complete.</li>
                                        <li>Products and services must be fully functional and as described.</li>
                                        <li>
                                            Sellers are required to cooperate with refund investigations. Failure to do so may result in account
                                            suspension, withholding of payments, or permanent removal from the Platform.
                                        </li>
                                        <li>
                                            Sellers are responsible for presenting accurate information during onboarding and in product listings.
                                        </li>
                                    </ul>
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">5. SpykeAI's Rights in Seller Disputes</h2>
                                <div className="space-y-4 text-gray-300">
                                    <ul className="list-disc list-inside space-y-3 ml-4">
                                        <li>
                                            If refund-related issues arise with a Seller, SpykeAI reserves the right to temporarily stop any pending
                                            payments to that Seller.
                                        </li>
                                        <li>
                                            SpykeAI will investigate the issue thoroughly, and if any discrepancies or violations are found, no
                                            commissions will be paid on the affected transactions.
                                        </li>
                                        <li>SpykeAI's decision after investigation will be final and binding.</li>
                                    </ul>
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">6. No Refunds For</h2>
                                <div className="space-y-4 text-gray-300 mb-6">
                                    <p>
                                        Refunds will <strong className="text-white">not</strong> be issued in the following cases:
                                    </p>
                                </div>
                                <div className="grid gap-3">
                                    {noRefundCases.map((case_item, index) => (
                                        <div
                                            key={index}
                                            className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                                            <div className="flex items-start gap-3">
                                                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                <p className="text-gray-300">{case_item}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">7. Dispute Resolution</h2>
                                <div className="space-y-4 text-gray-300">
                                    <ul className="list-disc list-inside space-y-3 ml-4">
                                        <li>If a Buyer and Seller cannot resolve a refund request directly, SpykeAI may act as a mediator.</li>
                                        <li>SpykeAI will review evidence from both parties before making a decision.</li>
                                        <li>SpykeAI's decision will be final and binding for both Buyers and Sellers.</li>
                                    </ul>
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">8. Changes to This Policy</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>We may update this policy at any time. Updates will be posted on this page with a new "Effective Date."</p>
                                </div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">Contact Information</h2>
                                <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                    <div className="space-y-3">
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