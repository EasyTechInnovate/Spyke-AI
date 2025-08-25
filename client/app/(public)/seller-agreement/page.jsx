'use client'

import { motion } from 'framer-motion'
import Container from '@/components/shared/layout/Container'
import ConditionalHeader from '@/components/shared/layout/ConditionalHeader'
import Footer from '@/components/shared/layout/Footer'
import { SpykeLogo } from '@/components/Logo'
import { Calendar, Mail, Globe, Handshake, DollarSign, Shield, AlertTriangle, Scale, FileText } from 'lucide-react'
import Link from 'next/link'

export default function SellerAgreementPage() {
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

    const agreementHighlights = [
        {
            icon: Handshake,
            title: "Partnership",
            description: "Join our trusted marketplace as a verified seller",
            type: "success"
        },
        {
            icon: DollarSign,
            title: "Fair Revenue",
            description: "Competitive commission structure with transparent payouts",
            type: "info"
        },
        {
            icon: Shield,
            title: "Protection",
            description: "Secure platform with buyer protection policies",
            type: "info"
        },
        {
            icon: Scale,
            title: "Legal Clarity",
            description: "Clear terms governing your seller relationship",
            type: "warning"
        }
    ]

    const prohibitedItems = [
        "Content that infringes third-party intellectual property rights",
        "Stolen, pirated, or unauthorized content",
        "Harmful, malicious, or illegal software"
    ]

    const prohibitedConduct = [
        "Attempt to bypass SpykeAI's payment system",
        "Manipulate ratings, reviews, or transactions",
        "Use the Platform for unlawful or fraudulent activity",
        "Share or sell Buyer data outside of what's necessary to fulfill orders"
    ]

    const terminationReasons = [
        "Violate this Agreement or any applicable law",
        "Engage in fraudulent, harmful, or illegal conduct",
        "Repeatedly fail to meet Buyer expectations"
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
                                SpykeAI Seller Agreement
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
                                This Seller Agreement governs your relationship with SpykeAI as a marketplace seller. 
                                By registering as a Seller, you agree to be bound by this Agreement, along with our Terms & Conditions and Privacy Policy.
                            </motion.p>

                            {/* Agreement Highlights */}
                            <motion.div 
                                variants={fadeInUp}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                            >
                                {agreementHighlights.map((highlight, index) => {
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
                                {/* Introduction */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 mb-8">
                                        <p className="text-gray-300 leading-relaxed">
                                            This Agreement is entered into between SpykeAI ("Platform," "we," "our," or "us") and 
                                            the individual or entity registering as a Seller ("Seller," "you," or "your").
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Section 1 */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">1. Eligibility</h2>
                                    <div className="space-y-4 text-gray-300">
                                        <ul className="list-disc list-inside space-y-3 ml-4">
                                            <li>You must be at least 18 years old and legally able to enter into binding contracts.</li>
                                            <li>If you are registering on behalf of a business or organization, you confirm you have the authority to bind that entity to this Agreement.</li>
                                        </ul>
                                    </div>
                                </motion.div>

                                {/* Section 2 */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">2. Seller Responsibilities</h2>
                                    <div className="space-y-6 text-gray-300">
                                        <p>You are solely responsible for the accuracy, quality, and legality of the products, prompts, workflows, or services you list.</p>
                                        
                                        <div>
                                            <h3 className="text-xl font-semibold text-white mb-4">You must not sell:</h3>
                                            <div className="grid gap-3">
                                                {prohibitedItems.map((item, index) => (
                                                    <div key={index} className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                                                        <div className="flex items-start gap-3">
                                                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                            <p className="text-gray-300">{item}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <ul className="list-disc list-inside space-y-3 ml-4">
                                            <li>You agree to clearly state product details, licensing terms, and any restrictions.</li>
                                            <li>You must provide timely support to Buyers regarding your products or services.</li>
                                        </ul>
                                    </div>
                                </motion.div>

                                {/* Section 3 */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">3. Intellectual Property</h2>
                                    <div className="space-y-4 text-gray-300">
                                        <ul className="list-disc list-inside space-y-3 ml-4">
                                            <li>You retain full ownership of your content.</li>
                                            <li>By listing content on SpykeAI, you grant the Platform a non-exclusive, worldwide, royalty-free license to host, display, market, and distribute your listing to facilitate transactions.</li>
                                            <li>You confirm that you own or have the necessary rights to all content you upload and sell.</li>
                                        </ul>
                                    </div>
                                </motion.div>

                                {/* Section 4 */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan flex items-center gap-3">
                                        <DollarSign className="w-6 h-6" />
                                        4. Payments & Fees
                                    </h2>
                                    <div className="space-y-4 text-gray-300">
                                        <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                            <h3 className="text-lg font-semibold text-white mb-4">Payment Structure</h3>
                                            <ul className="list-disc list-inside space-y-3 ml-4">
                                                <li>Payments will be processed via Stripe.</li>
                                                <li>SpykeAI will deduct a platform commission from each sale as outlined in your seller dashboard.</li>
                                                <li>Payouts will be made to your designated account, subject to a clearance period of up to 10 days to prevent fraud or chargebacks.</li>
                                                <li>You are responsible for reporting and paying all taxes related to your sales.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Section 5 */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">5. Refunds & Disputes</h2>
                                    <div className="space-y-4 text-gray-300">
                                        <ul className="list-disc list-inside space-y-3 ml-4">
                                            <li>You agree to honor SpykeAI's <Link href="/refund-policy" className="text-[#00FF89] hover:underline">Return & Refund Policy</Link>.</li>
                                            <li>If a Buyer files a valid complaint (e.g., defective product, misrepresentation), SpykeAI reserves the right to issue a refund at its sole discretion and adjust your payout accordingly.</li>
                                            <li>Repeated refund issues may result in account suspension or termination.</li>
                                        </ul>
                                    </div>
                                </motion.div>

                                {/* Section 6 */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">6. Prohibited Conduct</h2>
                                    <div className="space-y-4 text-gray-300 mb-6">
                                        <p>You must <strong className="text-white">not</strong>:</p>
                                    </div>
                                    <div className="grid gap-3">
                                        {prohibitedConduct.map((conduct, index) => (
                                            <div key={index} className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                                                <div className="flex items-start gap-3">
                                                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-gray-300">{conduct}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Section 7 */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">7. Account Suspension & Termination</h2>
                                    <div className="space-y-4 text-gray-300">
                                        <div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/20">
                                            <h3 className="text-lg font-semibold text-white mb-4">SpykeAI may suspend or terminate your Seller account without notice if you:</h3>
                                            <ul className="list-disc list-inside space-y-2 ml-4">
                                                {terminationReasons.map((reason, index) => (
                                                    <li key={index}>{reason}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Section 8 */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">8. Limitation of Liability</h2>
                                    <div className="space-y-4 text-gray-300">
                                        <ul className="list-disc list-inside space-y-3 ml-4">
                                            <li>SpykeAI is not liable for your sales, earnings, or product performance.</li>
                                            <li>You are solely responsible for ensuring compliance with all applicable laws.</li>
                                            <li>In no event will SpykeAI's liability exceed the total platform fees you paid in the 12 months preceding the claim.</li>
                                        </ul>
                                    </div>
                                </motion.div>

                                {/* Section 9 */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">9. Indemnification</h2>
                                    <div className="space-y-4 text-gray-300">
                                        <p>You agree to indemnify and hold SpykeAI harmless from any claims, damages, losses, or legal actions arising out of:</p>
                                        <ul className="list-disc list-inside space-y-3 ml-4">
                                            <li>Your products or services</li>
                                            <li>Your violation of third-party rights</li>
                                            <li>Your breach of this Agreement</li>
                                        </ul>
                                    </div>
                                </motion.div>

                                {/* Section 10 */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">10. Modifications</h2>
                                    <div className="space-y-4 text-gray-300">
                                        <p>
                                            SpykeAI may update this Agreement at any time. Continued use of the Platform after updates 
                                            constitutes your acceptance of the revised Agreement.
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Section 11 */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">11. Governing Law</h2>
                                    <div className="space-y-4 text-gray-300">
                                        <p>
                                            This Agreement is governed by the laws of the UAE, without regard to conflict of law principles.
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Section 12 - Contact */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">12. Contact Information</h2>
                                    <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                        <p className="text-gray-300 mb-4">
                                            For questions regarding this Agreement, please contact us:
                                        </p>
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

                                {/* CTA Section */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <div className="bg-gradient-to-r from-[#00FF89]/10 via-transparent to-[#00FF89]/10 rounded-2xl p-8 border border-[#00FF89]/20 text-center">
                                        <h3 className="text-2xl font-bold text-white mb-4 font-league-spartan">
                                            Ready to Start Selling?
                                        </h3>
                                        <p className="text-gray-300 mb-6">
                                            Join thousands of creators monetizing their AI expertise on SpykeAI
                                        </p>
                                        <Link
                                            href="/become-seller"
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#00FF89] text-black font-semibold rounded-xl hover:bg-[#00FF89]/90 transition-all duration-300"
                                        >
                                            <Handshake className="w-5 h-5" />
                                            Become a Seller
                                        </Link>
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