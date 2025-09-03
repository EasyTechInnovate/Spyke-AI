'use client'

import { motion } from 'framer-motion'
import Container from '@/components/shared/layout/Container'
import { ArrowRight, Shield, Globe, CheckCircle, Zap, Users, Target, Lightbulb, Star, Award } from 'lucide-react'
import Link from 'next/link'

export default function AboutUsPage() {
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

    const offerings = [
        {
            icon: Zap,
            title: "AI Models & APIs",
            description: "Pre-trained models and API integrations for various AI applications"
        },
        {
            icon: Lightbulb,
            title: "AI Prompts for ChatGPT & LLMs",
            description: "Optimized prompts for maximum AI model performance"
        },
        {
            icon: Target,
            title: "Automation Workflows",
            description: "Streamlined processes to automate complex tasks"
        },
        {
            icon: Users,
            title: "AI-Powered Services",
            description: "Content creation, analysis, consulting, and more"
        },
        {
            icon: Award,
            title: "Custom AI Development",
            description: "Bespoke AI solutions tailored to your specific needs"
        }
    ]

    const whyChooseUs = [
        {
            icon: Shield,
            title: "Verified Sellers",
            description: "Every seller is reviewed to ensure quality and compliance"
        },
        {
            icon: CheckCircle,
            title: "Secure Payments",
            description: "Safe transactions with trusted payment gateways"
        },
        {
            icon: Globe,
            title: "Global Marketplace",
            description: "Connect with AI talent and buyers from around the world"
        },
        {
            icon: Star,
            title: "Licensing Clarity",
            description: "Transparent terms for product usage and ownership"
        }
    ]

    const teamMembers = [
        {
            name: "Alex Chen",
            role: "Founder & CEO",
            description: "AI researcher with 10+ years in machine learning and marketplace development",
            image: "/images/team/alex-chen.jpg"
        },
        {
            name: "Sarah Rodriguez",
            role: "Head of Product",
            description: "Former Google PM specializing in AI product strategy and user experience",
            image: "/images/team/sarah-rodriguez.jpg"
        },
        {
            name: "Dr. Michael Kim",
            role: "Chief Technology Officer",
            description: "PhD in Computer Science, expert in AI infrastructure and scalable systems",
            image: "/images/team/michael-kim.jpg"
        },
        {
            name: "Emma Johnson",
            role: "Head of Community",
            description: "Building bridges between AI creators and businesses worldwide",
            image: "/images/team/emma-johnson.jpg"
        }
    ]

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            <section className="relative py-20 lg:py-32">
                <Container>
                    <motion.div 
                        className="text-center max-w-4xl mx-auto"
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                    >
                        
                        
                        <motion.h1 
                            variants={fadeInUp}
                            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-league-spartan"
                        >
                            Empowering the Future of{' '}
                            <span className="text-[#00FF89]">AI Innovation</span>
                        </motion.h1>
                        
                        <motion.p 
                            variants={fadeInUp}
                            className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-12 max-w-3xl mx-auto"
                        >
                            SpykeAI is where creators, developers, and businesses connect to exchange AI-powered tools, 
                            prompts, automation workflows, and services — all in one trusted marketplace.
                        </motion.p>

                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <Link
                                href="/explore"
                                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-[#00FF89] text-black font-semibold rounded-xl hover:bg-[#00FF89]/90 transition-all duration-300"
                            >
                                Explore Marketplace
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/become-seller"
                                className="group inline-flex items-center gap-2 px-8 py-4 border border-[#00FF89] text-[#00FF89] font-semibold rounded-xl hover:bg-[#00FF89] hover:text-black transition-all duration-300"
                            >
                                Start Selling
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </Container>
            </section>

            {/* Our Story */}
            <section className="py-20 lg:py-24">
                <Container>
                    <motion.div 
                        className="max-w-4xl mx-auto"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-league-spartan">
                                Our Story
                            </h2>
                        </motion.div>
                        
                        <motion.div variants={fadeInUp} className="bg-[#1f1f1f] rounded-2xl p-8 md:p-12 border border-gray-800">
                            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6">
                                Founded in 2025, SpykeAI was built to bridge the gap between AI creators and those who need AI-powered solutions. 
                                We noticed a growing demand for high-quality AI models, prompts, and automation tools — and a lack of a 
                                centralised, secure marketplace where these could be exchanged with confidence.
                            </p>
                            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                                What started as a simple idea has evolved into a comprehensive platform where innovation meets opportunity, 
                                connecting talented AI creators with businesses and individuals seeking cutting-edge solutions.
                            </p>
                        </motion.div>
                    </motion.div>
                </Container>
            </section>

            {/* Our Mission */}
            <section className="py-20 lg:py-24 bg-[#0f0f0f]">
                <Container>
                    <motion.div 
                        className="max-w-4xl mx-auto text-center"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.h2 
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl font-bold text-white mb-8 font-league-spartan"
                        >
                            Our Mission
                        </motion.h2>
                        
                        <motion.div variants={fadeInUp} className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#00FF89]/20 via-transparent to-[#00FF89]/20 rounded-2xl blur-xl"></div>
                            <div className="relative bg-[#1f1f1f] rounded-2xl p-8 md:p-12 border border-[#00FF89]/20">
                                <p className="text-xl md:text-2xl text-white leading-relaxed font-medium">
                                    To make AI innovation accessible, secure, and profitable for creators while empowering 
                                    businesses and individuals with tools that accelerate their success.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </Container>
            </section>

            {/* What We Offer */}
            <section className="py-20 lg:py-24">
                <Container>
                    <motion.div 
                        className="max-w-6xl mx-auto"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-league-spartan">
                                What We Offer
                            </h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                Discover a comprehensive range of AI solutions designed to meet every need
                            </p>
                        </motion.div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {offerings.map((offering, index) => {
                                const Icon = offering.icon
                                return (
                                    <motion.div 
                                        key={index}
                                        variants={fadeInUp}
                                        className="bg-[#1f1f1f] rounded-xl p-8 border border-gray-800 hover:border-[#00FF89]/30 transition-all duration-300 group"
                                    >
                                        <div className="mb-6">
                                            <div className="w-14 h-14 bg-[#00FF89]/10 rounded-xl flex items-center justify-center group-hover:bg-[#00FF89]/20 transition-colors">
                                                <Icon className="w-7 h-7 text-[#00FF89]" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-3 font-league-spartan">
                                            {offering.title}
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            {offering.description}
                                        </p>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                </Container>
            </section>

            {/* Why Choose SpykeAI */}
            <section className="py-20 lg:py-24 bg-[#0f0f0f]">
                <Container>
                    <motion.div 
                        className="max-w-6xl mx-auto"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-league-spartan">
                                Why Choose SpykeAI
                            </h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                Built on trust, security, and innovation to ensure the best experience for all users
                            </p>
                        </motion.div>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            {whyChooseUs.map((feature, index) => {
                                const Icon = feature.icon
                                return (
                                    <motion.div 
                                        key={index}
                                        variants={fadeInUp}
                                        className="bg-[#1f1f1f] rounded-xl p-8 border border-gray-800 hover:border-[#00FF89]/30 transition-all duration-300 group"
                                    >
                                        <div className="flex items-start gap-6">
                                            <div className="w-14 h-14 bg-[#00FF89]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#00FF89]/20 transition-colors">
                                                <Icon className="w-7 h-7 text-[#00FF89]" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-white mb-3 font-league-spartan">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-gray-300 leading-relaxed">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                </Container>
            </section>

            {/* Our Vision */}
            <section className="py-20 lg:py-24">
                <Container>
                    <motion.div 
                        className="max-w-4xl mx-auto text-center"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.h2 
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl font-bold text-white mb-8 font-league-spartan"
                        >
                            Our Vision for the Future
                        </motion.h2>
                        
                        <motion.div variants={fadeInUp} className="bg-[#1f1f1f] rounded-2xl p-8 md:p-12 border border-gray-800">
                            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                                We envision SpykeAI as the go-to global hub for AI innovation, where every creator has the tools 
                                to monetise their expertise, and every buyer can find reliable AI solutions — all in one place. 
                                Together, we're building the future of AI commerce.
                            </p>
                        </motion.div>
                    </motion.div>
                </Container>
            </section>

            {/* Team Section */}
            <section className="py-20 lg:py-24 bg-[#0f0f0f]">
                <Container>
                    <motion.div 
                        className="max-w-6xl mx-auto"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-league-spartan">
                                Meet Our Team
                            </h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                Passionate experts dedicated to revolutionizing the AI marketplace
                            </p>
                        </motion.div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {teamMembers.map((member, index) => (
                                <motion.div 
                                    key={index}
                                    variants={fadeInUp}
                                    className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 hover:border-[#00FF89]/30 transition-all duration-300 text-center group"
                                >
                                    <div className="w-24 h-24 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/5 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:from-[#00FF89]/30 group-hover:to-[#00FF89]/10 transition-all">
                                        <Users className="w-10 h-10 text-[#00FF89]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-1 font-league-spartan">
                                        {member.name}
                                    </h3>
                                    <p className="text-[#00FF89] font-medium mb-3 text-sm">
                                        {member.role}
                                    </p>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {member.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </Container>
            </section>

            {/* Join Us CTA */}
            <section className="py-20 lg:py-24">
                <Container>
                    <motion.div 
                        className="max-w-4xl mx-auto text-center"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#00FF89]/10 via-transparent to-[#00FF89]/10 rounded-3xl blur-2xl"></div>
                            <div className="relative bg-[#1f1f1f] rounded-2xl p-8 md:p-12 border border-[#00FF89]/20">
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-league-spartan">
                                    Join Us
                                </h2>
                                <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
                                    Whether you're an AI creator ready to showcase your work or a business looking for 
                                    cutting-edge solutions, SpykeAI is your trusted partner in the AI revolution.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <Link
                                        href="/signup"
                                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-[#00FF89] text-black font-semibold rounded-xl hover:bg-[#00FF89]/90 transition-all duration-300"
                                    >
                                        Get Started
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link
                                        href="/explore"
                                        className="group inline-flex items-center gap-2 px-8 py-4 border border-gray-600 text-gray-300 font-semibold rounded-xl hover:border-[#00FF89] hover:text-[#00FF89] transition-all duration-300"
                                    >
                                        Explore Now
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </Container>
            </section>
        </div>
    )
}