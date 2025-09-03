'use client'

import { motion } from 'framer-motion'
import Container from '@/components/shared/layout/Container'
import { Calendar, Mail, Globe } from 'lucide-react'

export default function TermsAndConditionsPage() {
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

    return (
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
                            
                        </motion.div>
                        
                        <motion.h1 
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl font-bold text-white mb-4 font-league-spartan"
                        >
                            Terms and Conditions
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
                            className="text-lg text-gray-300 leading-relaxed"
                        >
                            Welcome to SpykeAI. These Terms and Conditions govern your access to and use of our 
                            AI products and services marketplace. By using our Platform, you agree to be bound by these Terms.
                        </motion.p>
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
                            {/* Section 1 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">1. Definitions</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p><strong className="text-white">Platform:</strong> The AI products and services marketplace operated by SpykeAI.</p>
                                    <p><strong className="text-white">Seller:</strong> A registered user who lists AI products, services, prompts, automation workflows, AI Agents, or related digital goods for sale on the Platform.</p>
                                    <p><strong className="text-white">Buyer:</strong> A registered user who purchases items listed on the Platform.</p>
                                    <p><strong className="text-white">Content:</strong> Any digital file, code, text, image, prompt, model, automation workflow, AI Agent, or other material uploaded or shared on the Platform.</p>
                                </div>
                            </motion.div>

                            {/* Section 2 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">2. Eligibility</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>You must be at least 18 years old (or the age of majority in your jurisdiction) to use the Platform.</p>
                                    <p>By using the Platform, you confirm that you meet these requirements.</p>
                                </div>
                            </motion.div>

                            {/* Section 3 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">3. Account Registration</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>You must create an account to buy or sell on the Platform.</p>
                                    <p>To become a Seller, you must first have a registered Buyer account, then complete the Seller onboarding process.</p>
                                    <p>Seller onboarding requires submission of documents and information as requested by SpykeAI; without this, onboarding cannot be completed.</p>
                                    <p>You agree to provide accurate, complete, and up-to-date information.</p>
                                    <p>You are responsible for maintaining the confidentiality of your login credentials and all activity under your account.</p>
                                </div>
                            </motion.div>

                            {/* Section 4 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">4. Marketplace Role</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>SpykeAI provides a platform for Buyers and Sellers to connect.</p>
                                    <p>We are not a party to the transactions between Buyers and Sellers.</p>
                                    <p>We cannot guarantee the quality, safety, legality, or accuracy of any listing.</p>
                                    <p>SpykeAI will take basic measures to check the genuineness of products but cannot guarantee 100% authenticity, due to limitations in verifying digital products.</p>
                                    <p>SpykeAI reserves the right to sell its own products through its own Seller account on the Platform.</p>
                                </div>
                            </motion.div>

                            {/* Section 5 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">5. Seller Obligations</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>You must have the legal rights to sell the products or services you list.</p>
                                    <p>You must not upload or sell content that infringes on third-party intellectual property rights.</p>
                                    <p>You are responsible for accurately describing your product or service.</p>
                                    <p>You must comply with all applicable laws, including export control laws for AI models or tools.</p>
                                    <p>Payments will be made to the bank details provided during Seller onboarding. Sellers must take extreme caution while entering account details, as SpykeAI is not responsible for errors caused by incorrect information.</p>
                                    <p>SpykeAI has the right to suspend or delist any Seller or product if violations of these Terms occur.</p>
                                </div>
                            </motion.div>

                            {/* Section 6 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">6. Buyer Obligations</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>You agree to pay for purchases as described on the Platform.</p>
                                    <p>You may not redistribute, resell, or misuse purchased products unless explicitly permitted by the Seller's license terms.</p>
                                    <p>You are responsible for ensuring compatibility before purchase; refunds may not be available for digital goods.</p>
                                </div>
                            </motion.div>

                            {/* Section 7 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">7. Payments and Fees</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Payments are processed through Stripe.</p>
                                    <p>Sellers agree to pay the Platform's commission or transaction fees as outlined in the Seller Agreement.</p>
                                    <p>Payouts may be withheld for up to 10 days to prevent fraud.</p>
                                </div>
                            </motion.div>

                            {/* Section 8 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">8. Intellectual Property Rights</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Sellers retain ownership of their content but grant SpykeAI a limited license to host, display, and promote their listings.</p>
                                    <p>Buyers receive a license to use purchased content as described in the listing or attached license agreement.</p>
                                    <p>You must not copy, reverse-engineer, or reproduce content without permission.</p>
                                </div>
                            </motion.div>

                            {/* Section 9 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">9. Prohibited Activities</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>You may not:</p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Sell stolen, pirated, or infringing content</li>
                                        <li>Upload malicious software, viruses, or harmful code</li>
                                        <li>Engage in fraudulent transactions or manipulate reviews</li>
                                        <li>Use the Platform for unlawful purposes</li>
                                    </ul>
                                </div>
                            </motion.div>

                            {/* Section 10 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">10. Refunds and Disputes</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Digital goods are generally non-refundable unless otherwise stated.</p>
                                    <p>Refunds are subject to our official Refund Policy, available on our website.</p>
                                    <p>Disputes between Buyers and Sellers should first be resolved directly; if unresolved, you may escalate to SpykeAI's support team for mediation.</p>
                                </div>
                            </motion.div>

                            {/* Section 11 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">11. Affiliate Links & Promotions</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Some products or services on the Platform may contain affiliate links or third-party promotions.</p>
                                    <p>SpykeAI does not guarantee the functioning, reliability, or continued availability of affiliate-linked products or external services.</p>
                                    <p>By purchasing through an affiliate link, Buyers acknowledge that third-party terms and conditions may apply.</p>
                                </div>
                            </motion.div>

                            {/* Section 12 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">12. Technology Disclaimer</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Due to the evolving nature of LLM (Large Language Model) systems, SpykeAI cannot guarantee that products (e.g., prompts, workflows, AI Agents) will function indefinitely as described.</p>
                                    <p>Sellers and Buyers acknowledge that updates in AI models may impact product functionality.</p>
                                </div>
                            </motion.div>

                            {/* Section 13 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">13. Termination</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>We may suspend or terminate your account without notice if you violate these Terms.</p>
                                    <p>SpykeAI reserves the right to delist any product or suspend any Seller account at its discretion.</p>
                                </div>
                            </motion.div>

                            {/* Section 14 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">14. Disclaimers</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>The Platform is provided "as is" without warranties of any kind.</p>
                                    <p>We do not guarantee uninterrupted or error-free operation.</p>
                                    <p>We are not liable for loss of data, profits, or damages arising from your use of the Platform.</p>
                                </div>
                            </motion.div>

                            {/* Section 15 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">15. Limitation of Liability</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>To the maximum extent permitted by law, our liability for any claims related to your use of the Platform will not exceed the total fees you paid to us in the past 2 months.</p>
                                </div>
                            </motion.div>

                            {/* Section 16 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">16. Changes to These Terms</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>We may update these Terms at any time. Updates will be posted on this page with a new "Effective Date."</p>
                                    <p>Continued use of the Platform means you accept the updated Terms.</p>
                                </div>
                            </motion.div>

                            {/* Section 17 */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">17. Governing Law</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>These Terms are governed by the laws of the UAE, without regard to conflict of law principles.</p>
                                </div>
                            </motion.div>

                            {/* Section 18 - Contact */}
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">18. Contact Information</h2>
                                <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                    <p className="text-gray-300 mb-4">For questions about these Terms, please contact us:</p>
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