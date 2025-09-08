'use client'

import { motion } from 'framer-motion'
import Container from '@/components/shared/layout/Container'
import ConditionalHeader from '@/components/shared/layout/ConditionalHeader'
import { Calendar, Mail, Globe, Percent, Gift, Tag, Users, AlertTriangle, Star, CheckCircle } from 'lucide-react'

export default function PromotionPolicyPage() {
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

    const promotionHighlights = [
        {
            icon: Gift,
            title: "Multiple Types",
            description: "Flat discounts, percentages, bundle deals, and more",
            type: "success"
        },
        {
            icon: Users,
            title: "Fair for All",
            description: "Transparent policies for both sellers and buyers",
            type: "info"
        },
        {
            icon: Star,
            title: "Quality Focus",
            description: "All promotions reviewed to maintain platform standards",
            type: "info"
        },
        {
            icon: Tag,
            title: "Clear Terms",
            description: "Well-defined guidelines and limitations",
            type: "success"
        }
    ]

    const promotionTypes = [
        {
            icon: Percent,
            title: "Flat Discount Promotions",
            description: "A fixed amount is discounted from the product price (e.g., ₹200 off)",
            features: ["Can apply to single or multiple products"]
        },
        {
            icon: Percent,
            title: "Percentage Discount Promotions",
            description: "A percentage of the product price is discounted (e.g., 10% off)",
            features: ["Maximum or minimum limits may apply"]
        },
        {
            icon: Gift,
            title: "Buy More, Save More Promotions",
            description: "Discounts offered when a buyer purchases multiple items",
            features: ["Example: Buy 2, Get 1 Free"]
        },
        {
            icon: Tag,
            title: "Coupon Code Promotions",
            description: "Discounts applied when buyers use a unique promo code at checkout",
            features: ["Custom promotional codes", "Limited usage options"]
        },
        {
            icon: Star,
            title: "Free Trial / Limited-Time Access",
            description: "Products or services offered at no cost or reduced rate for a limited time",
            features: ["Time-limited access", "Trial versions"]
        },
        {
            icon: Users,
            title: "Affiliate Promotions",
            description: "Discounts or special offers provided through affiliate links",
            features: ["Subject to the Affiliate Policy"]
        }
    ]

    const guidelines = [
        {
            title: "Accuracy",
            description: "All promotional claims must be accurate and not misleading"
        },
        {
            title: "Transparency",
            description: "Sellers must disclose terms (duration, eligibility, limits)"
        },
        {
            title: "Fair Usage",
            description: "Promotions must not exploit loopholes or unfairly disadvantage other sellers"
        },
        {
            title: "Duration",
            description: "All promotions must have a defined start and end date"
        },
        {
            title: "Compliance",
            description: "Promotions must adhere to applicable laws and SpykeAI policies"
        }
    ]

    const violations = [
        "Suspend or terminate promotions violating the policy",
        "Take action against sellers misusing promotions (including delisting)",
        "Restrict future promotional privileges for repeat violators"
    ]

    return (
        <>
            <ConditionalHeader />
            <div className="min-h-screen bg-[#121212] text-white">
                {/* Header Section */}
                <section className="relative py-16">
                    <Container>
                        <motion.div
                            className="text-center max-w-4xl mx-auto"
                            initial="initial"
                            animate="animate"
                            variants={staggerContainer}
                        >
                            <motion.h1
                                variants={fadeInUp}
                                className="text-4xl md:text-5xl font-bold text-white mb-4 mt-12 font-league-spartan"
                            >
                                Promotion Policy
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
                                At SpykeAI, we aim to provide transparent, fair, and effective promotions for both Sellers and Buyers.
                                This Promotion Policy outlines the types of promotions available, who can initiate them, and the general terms governing promotional activities.
                            </motion.p>

                            {/* Promotion Highlights */}
                            <motion.div
                                variants={fadeInUp}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                            >
                                {promotionHighlights.map((highlight, index) => {
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
                                {/* Section 1 - Types of Promotions */}
                                <motion.div variants={fadeInUp} className="mb-16">
                                    <h2 className="text-3xl font-bold text-[#00FF89] mb-8 font-league-spartan">1. Types of Promotions</h2>

                                    <div className="grid gap-6">
                                        {promotionTypes.map((type, index) => {
                                            const Icon = type.icon
                                            return (
                                                <div key={index} className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 hover:border-[#00FF89]/30 transition-all duration-300">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-[#00FF89]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                            <Icon className="w-6 h-6 text-[#00FF89]" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-xl font-semibold text-white mb-2 font-league-spartan">
                                                                {String.fromCharCode(97 + index)}. {type.title}
                                                            </h3>
                                                            <p className="text-gray-300 mb-3">{type.description}</p>
                                                            {type.features && type.features.length > 0 && (
                                                                <ul className="text-sm text-gray-400 space-y-1">
                                                                    {type.features.map((feature, featureIndex) => (
                                                                        <li key={featureIndex} className="flex items-center gap-2">
                                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                                            {feature}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </motion.div>

                                {/* Section 2 - Who Can Initiate Promotions */}
                                <motion.div variants={fadeInUp} className="mb-16">
                                    <h2 className="text-3xl font-bold text-[#00FF89] mb-8 font-league-spartan">2. Who Can Initiate Promotions</h2>

                                    <div className="space-y-8">
                                        {/* Marketplace-Initiated */}
                                        <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                            <h3 className="text-xl font-semibold text-white mb-4 font-league-spartan">
                                                a. Marketplace-Initiated Promotions (SpykeAI)
                                            </h3>
                                            <ul className="list-disc list-inside space-y-3 ml-4 text-gray-300">
                                                <li>SpykeAI may run platform-wide campaigns (festive sales, seasonal discounts, launch offers)</li>
                                                <li>SpykeAI reserves the right to subsidize or co-sponsor discounts in collaboration with Sellers</li>
                                                <li>SpykeAI promotions will be clearly labeled as "Marketplace Promotion"</li>
                                            </ul>
                                        </div>

                                        {/* Seller-Initiated */}
                                        <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                            <h3 className="text-xl font-semibold text-white mb-4 font-league-spartan">
                                                b. Seller-Initiated Promotions
                                            </h3>
                                            <ul className="list-disc list-inside space-y-3 ml-4 text-gray-300">
                                                <li>Sellers may run their own promotional campaigns for their products</li>
                                                <li>Sellers are solely responsible for funding and honoring the discounts they initiate</li>
                                                <li>SpykeAI reserves the right to review, approve, or reject seller promotions if they violate platform guidelines</li>
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Section 3 - General Guidelines */}
                                <motion.div variants={fadeInUp} className="mb-16">
                                    <h2 className="text-3xl font-bold text-[#00FF89] mb-8 font-league-spartan">3. General Guidelines for Promotions</h2>

                                    <div className="grid gap-4">
                                        {guidelines.map((guideline, index) => (
                                            <div key={index} className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 hover:border-[#00FF89]/30 transition-all duration-300">
                                                <div className="flex items-start gap-4">
                                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white mb-2 font-league-spartan">
                                                            {guideline.title}
                                                        </h3>
                                                        <p className="text-gray-300">{guideline.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Section 4 - Limitations & Disclaimer */}
                                <motion.div variants={fadeInUp} className="mb-16">
                                    <h2 className="text-3xl font-bold text-[#00FF89] mb-8 font-league-spartan">4. Limitations & Disclaimer</h2>

                                    <div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/20">
                                        <div className="flex items-start gap-4 mb-4">
                                            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                                            <h3 className="text-lg font-semibold text-white">Important Disclaimers</h3>
                                        </div>
                                        <ul className="list-disc list-inside space-y-3 ml-4 text-gray-300">
                                            <li>Promotions are subject to availability of products</li>
                                            <li>SpykeAI reserves the right to withdraw or modify promotions at any time without prior notice</li>
                                            <li>SpykeAI cannot guarantee the performance or functionality of promoted products, especially when dependent on third-party LLM models or external factors</li>
                                        </ul>
                                    </div>
                                </motion.div>

                                {/* Section 5 - Violation of Promotion Policy */}
                                <motion.div variants={fadeInUp} className="mb-16">
                                    <h2 className="text-3xl font-bold text-[#00FF89] mb-8 font-league-spartan">5. Violation of Promotion Policy</h2>

                                    <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20">
                                        <div className="flex items-start gap-4 mb-4">
                                            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                                            <h3 className="text-lg font-semibold text-white">SpykeAI reserves the right to:</h3>
                                        </div>
                                        <div className="grid gap-3 ml-4">
                                            {violations.map((violation, index) => (
                                                <div key={index} className="bg-red-500/5 rounded-lg p-4 border border-red-500/10">
                                                    <div className="flex items-start gap-3">
                                                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                        <p className="text-gray-300">{violation}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Contact Section */}
                                <motion.div variants={fadeInUp} className="mb-12">
                                    <h2 className="text-2xl font-bold text-[#00FF89] mb-6 font-league-spartan">Contact Information</h2>
                                    <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
                                        <p className="text-gray-300 mb-4">
                                            For questions regarding this Promotion Policy, please contact us:
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
        </>
    )
}