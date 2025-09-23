'use client'
import { motion } from 'framer-motion'
import Container from '@/components/shared/layout/Container'
import { Calendar, Mail, Globe, Shield, Eye, Lock, Users, Database } from 'lucide-react'
export default function PrivacyPolicyPage() {
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
    const privacyHighlights = [
        {
            icon: Shield,
            title: "Data Protection",
            description: "Industry-standard encryption and security measures"
        },
        {
            icon: Eye,
            title: "Transparency",
            description: "Clear information about what data we collect and why"
        },
        {
            icon: Lock,
            title: "Your Control",
            description: "Full control over your personal information"
        },
        {
            icon: Users,
            title: "No Selling",
            description: "We never sell your personal data to third parties"
        }
    ]
    return (
        <div className="min-h-screen bg-[#121212] text-white">
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
                            Privacy Policy
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
                            SpykeAI respects your privacy and is committed to protecting your personal information.
                            This Privacy Policy explains how we collect, use, store, and protect your data when you use our Platform.
                        </motion.p>
                        <motion.div
                            variants={fadeInUp}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                        >
                            {privacyHighlights.map((highlight, index) => {
                                const Icon = highlight.icon
                                return (
                                    <div key={index} className="bg-[#1f1f1f] rounded-xl p-4 border border-gray-800 hover:border-[#00FF89]/30 transition-colors">
                                        <Icon className="w-6 h-6 text-[#00FF89] mx-auto mb-2" />
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
                        variants={staggerContainer}
                    >
                        <div className="prose prose-lg prose-invert max-w-none">
                            <motion.div variants={fadeInUp} className="mb-12">
                                <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 mb-8">
                                    <p className="text-gray-300 leading-relaxed">
                                        By using our Platform, you agree to the practices described in this Privacy Policy.
                                        We are committed to maintaining the highest standards of data protection and transparency.
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan flex items-center gap-3">
                                    <Database className="w-6 h-6" />
                                    1. Information We Collect
                                </h2>
                                <div className="space-y-6 text-gray-300">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-3">a) Information You Provide Directly</h3>
                                        <ul className="list-disc list-inside space-y-2 ml-4">
                                            <li>Name, email address, phone number, and account details</li>
                                            <li>Payment and billing information (processed securely via third-party providers)</li>
                                            <li>Information you provide when listing or purchasing AI products or services</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-3">b) Automatically Collected Information</h3>
                                        <ul className="list-disc list-inside space-y-2 ml-4">
                                            <li>IP address, browser type, operating system, and device information</li>
                                            <li>Usage data, including pages visited, search queries, and interactions on the Platform</li>
                                            <li>Cookies and similar tracking technologies</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-3">c) Third-Party Data</h3>
                                        <ul className="list-disc list-inside space-y-2 ml-4">
                                            <li>Data from payment processors, analytics tools, or integrated apps</li>
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">2. How We Use Your Information</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>We use the collected information to:</p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Create and manage your account</li>
                                        <li>Process transactions between Buyers and Sellers</li>
                                        <li>Improve the performance, functionality, and security of the Platform</li>
                                        <li>Communicate with you regarding updates, promotions, and support</li>
                                        <li>Prevent fraud, abuse, and illegal activities</li>
                                        <li>Comply with legal obligations</li>
                                    </ul>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">3. How We Share Your Information</h2>
                                <div className="space-y-4 text-gray-300">
                                    <div className="bg-[#1f1f1f] rounded-xl p-4 border border-gray-800">
                                        <p className="font-semibold text-white mb-2">We do not sell your personal information.</p>
                                        <p>We may share your data with:</p>
                                    </div>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Service providers (e.g., payment processors, hosting providers, analytics tools)</li>
                                        <li>Other users, when necessary, to facilitate a transaction between Buyer and Seller</li>
                                        <li>Law enforcement or authorities, if required by law or to protect our rights</li>
                                    </ul>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">4. Cookies and Tracking Technologies</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>We use cookies and similar technologies to:</p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Improve site functionality and performance</li>
                                        <li>Remember your preferences and login details</li>
                                        <li>Analyse user activity for better services</li>
                                    </ul>
                                    <p className="mt-4">
                                        You can manage cookie preferences in your browser settings, but disabling cookies may affect site functionality.
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">5. Data Retention</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>
                                        We retain personal data only as long as necessary for the purposes described above,
                                        or as required by law.
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">6. Your Rights</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Depending on your location, you may have the following rights:</p>
                                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                                        <div className="bg-[#1f1f1f] rounded-lg p-4 border border-gray-800">
                                            <h4 className="font-semibold text-white mb-2">Access</h4>
                                            <p className="text-sm">Request a copy of your personal data</p>
                                        </div>
                                        <div className="bg-[#1f1f1f] rounded-lg p-4 border border-gray-800">
                                            <h4 className="font-semibold text-white mb-2">Correction</h4>
                                            <p className="text-sm">Request correction of inaccurate data</p>
                                        </div>
                                        <div className="bg-[#1f1f1f] rounded-lg p-4 border border-gray-800">
                                            <h4 className="font-semibold text-white mb-2">Deletion</h4>
                                            <p className="text-sm">Request deletion of your data ("right to be forgotten")</p>
                                        </div>
                                        <div className="bg-[#1f1f1f] rounded-lg p-4 border border-gray-800">
                                            <h4 className="font-semibold text-white mb-2">Restriction</h4>
                                            <p className="text-sm">Request limited processing of your data</p>
                                        </div>
                                        <div className="bg-[#1f1f1f] rounded-lg p-4 border border-gray-800">
                                            <h4 className="font-semibold text-white mb-2">Portability</h4>
                                            <p className="text-sm">Request transfer of your data to another service</p>
                                        </div>
                                        <div className="bg-[#1f1f1f] rounded-lg p-4 border border-gray-800">
                                            <h4 className="font-semibold text-white mb-2">Opt-Out</h4>
                                            <p className="text-sm">Object to marketing communications at any time</p>
                                        </div>
                                    </div>
                                    <p className="mt-4">
                                        To exercise these rights, contact us at <span className="text-[#00FF89]">contact@spykeai.com</span>.
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan flex items-center gap-3">
                                    <Shield className="w-6 h-6" />
                                    7. Data Security
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>
                                        We use industry-standard encryption, firewalls, and access controls to protect your data.
                                        However, no system is completely secure, and we cannot guarantee absolute security.
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">8. Children's Privacy</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>
                                        SpykeAI is not intended for children under 18. We do not knowingly collect personal
                                        information from minors.
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">9. International Data Transfers</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>
                                        Your data may be transferred to and stored in countries outside your own, where privacy
                                        laws may differ. We ensure appropriate safeguards are in place for such transfers.
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">10. Changes to This Privacy Policy</h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>
                                        We may update this Privacy Policy from time to time. Changes will be posted on this page
                                        with a new "Effective Date."
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="mb-12">
                                <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">11. Contact Us</h2>
                                <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                    <p className="text-gray-300 mb-4">
                                        If you have any questions or concerns about this Privacy Policy, please contact us:
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
                        </div>
                    </motion.div>
                </Container>
            </section>
        </div>
    )
}