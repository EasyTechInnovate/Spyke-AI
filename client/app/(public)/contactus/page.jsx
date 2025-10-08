'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Container from '@/components/shared/layout/Container'
import {
    Mail,
    Globe,
    Clock,
    Phone,
    MessageCircle,
    MapPin,
    Send,
    FileText,
    HelpCircle,
    Shield,
    Scale,
    Twitter,
    Linkedin,
    Instagram,
    Check,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
export default function ContactUsPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState(null)
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
    const contactInfo = [
        {
            icon: Mail,
            title: "Email",
            value: "contact@spykeai.com",
            href: "mailto:contact@spykeai.com"
        },
        {
            icon: Globe,
            title: "Website",
            value: "https://spykeai.com",
            href: "https://spykeai.com"
        },
        {
            icon: Clock,
            title: "Business Hours",
            value: "Monday – Friday, 9 AM – 6 PM (UTC)",
            href: null
        },
        {
            icon: Phone,
            title: "Phone",
            value: "+971 585107689",
            href: "tel:+971 585107689"
        },
        {
            icon: MessageCircle,
            title: "WhatsApp",
            value: "Message us directly",
            href: "https://wa.link/7uwiza"
        },
        {
            icon: MapPin,
            title: "Address",
            value: "Spyke Technologies, Block C VL12-029, Sharjah Research, Technology and Innovation Park, Sharjah, UAE",
            href: null
        }
    ]
    const supportLinks = [
        {
            icon: HelpCircle,
            title: "Help Center & FAQ",
            description: "Find answers to common questions",
            href: "/payment-policy"
        },
        {
            icon: Shield,
            title: "Refund & Return Policy",
            description: "Learn about our return process",
            href: "/refund-policy"
        },
        {
            icon: Scale,
            title: "Terms & Conditions",
            description: "Review our platform terms",
            href: "/terms"
        },
        {
            icon: FileText,
            title: "Privacy Policy",
            description: "Understand how we protect your data",
            href: "/privacy-policy"
        }
    ]
    const socialLinks = [
        {
            icon: Twitter,
            name: "Twitter",
            href: "https://x.com/spykeai"
        },
        {
            icon: Linkedin,
            name: "LinkedIn",
            href: "https://www.linkedin.com/company/spykeai/"
        },
        {
            icon: Instagram,
            name: "Instagram",
            href: "https://www.instagram.com/spykeai/"
        }
    ]
    const subjectOptions = [
        { value: '', label: 'Select a subject' },
        { value: 'support', label: 'Support' },
        { value: 'sales', label: 'Sales' },
        { value: 'feedback', label: 'Feedback' },
        { value: 'partnership', label: 'Partnership' },
        { value: 'other', label: 'Other' }
    ]
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitStatus(null)
        try {
            const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyGHESNgUxqqBw9h_bQZxrBFbVBj5FppkonvzK6CU5NxJyfqIz7Ppn4cMgB6JoRgV7CPA/exec'
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            setSubmitStatus('success')
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            })
            if (typeof window !== 'undefined' && window.spykeAnalytics) {
                window.spykeAnalytics.trackEvent('Contact Form Submitted', {
                    subject: formData.subject
                })
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            setSubmitStatus('error')
        } finally {
            setIsSubmitting(false)
        }
    }
    return (
        <div className="min-h-screen bg-[#121212] text-white">
            <section className="relative py-16 lg:py-20 border-b border-gray-800">
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
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-league-spartan"
                        >
                            Contact Us
                        </motion.h1>
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
                        >
                            We're here to help! Whether you have a question about our AI marketplace, need assistance
                            with a purchase, or want to discuss collaboration opportunities, our team is ready to assist you.
                        </motion.p>
                    </motion.div>
                </Container>
            </section>
            <section className="py-16 lg:py-20">
                <Container>
                    <motion.div
                        className="max-w-6xl mx-auto"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-league-spartan">
                                Get in Touch
                            </h2>
                            <p className="text-lg text-gray-300">
                                Choose the best way to reach us
                            </p>
                        </motion.div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {contactInfo.map((info, index) => {
                                const Icon = info.icon
                                const content = (
                                    <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 hover:border-[#00FF89]/30 transition-all duration-300 group h-full">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-[#00FF89]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#00FF89]/20 transition-colors">
                                                <Icon className="w-6 h-6 text-[#00FF89]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-white mb-2 font-league-spartan">
                                                    {info.title}
                                                </h3>
                                                <p className="text-gray-300 text-sm leading-relaxed break-words">
                                                    {info.value}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                                return (
                                    <motion.div key={index} variants={fadeInUp}>
                                        {info.href ? (
                                            <a
                                                href={info.href}
                                                className="block h-full"
                                                target={info.href.startsWith('http') ? '_blank' : undefined}
                                                rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                            >
                                                {content}
                                            </a>
                                        ) : (
                                            content
                                        )}
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                </Container>
            </section>
            <section className="py-16 lg:py-20 bg-[#0f0f0f]">
                <Container>
                    <motion.div
                        className="max-w-4xl mx-auto"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-league-spartan">
                                Send us a Message
                            </h2>
                            <p className="text-lg text-gray-300">
                                Fill out the form below and we'll get back to you as soon as possible
                            </p>
                        </motion.div>
                        <motion.div variants={fadeInUp} className="bg-[#1f1f1f] rounded-2xl p-8 border border-gray-800">
                            {submitStatus === 'success' && (
                                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <p className="text-green-400">Message sent successfully! We'll get back to you soon.</p>
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <p className="text-red-400">Something went wrong. Please try again or contact us directly.</p>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                            Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                            Email Address <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                                        Subject <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent"
                                    >
                                        {subjectOptions.map(option => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                                className="bg-[#1a1a1a] text-white"
                                                style={{
                                                    backgroundColor: '#1a1a1a',
                                                    color: 'white'
                                                }}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                                        Message <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent resize-vertical"
                                        placeholder="Tell us how we can help you..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-[#00FF89] text-black font-semibold rounded-xl hover:bg-[#00FF89]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                </Container>
            </section>
            <section className="py-16 lg:py-20">
                <Container>
                    <motion.div
                        className="max-w-6xl mx-auto"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-league-spartan">
                                Self-Help Resources
                            </h2>
                            <p className="text-lg text-gray-300">
                                Find quick answers and helpful information
                            </p>
                        </motion.div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {supportLinks.map((link, index) => {
                                const Icon = link.icon
                                return (
                                    <motion.div key={index} variants={fadeInUp}>
                                        <Link
                                            href={link.href}
                                            className="block bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 hover:border-[#00FF89]/30 transition-all duration-300 group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-[#00FF89]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#00FF89]/20 transition-colors">
                                                    <Icon className="w-6 h-6 text-[#00FF89]" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white mb-2 font-league-spartan">
                                                        {link.title}
                                                    </h3>
                                                    <p className="text-gray-300 text-sm leading-relaxed">
                                                        {link.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                </Container>
            </section>
            <section className="py-16 lg:py-20 bg-[#0f0f0f]">
                <Container>
                    <motion.div
                        className="max-w-4xl mx-auto text-center"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-league-spartan">
                                Connect with Us
                            </h2>
                            <p className="text-lg text-gray-300">
                                Follow us on social media for updates and community discussions
                            </p>
                        </motion.div>
                        <motion.div variants={fadeInUp} className="flex justify-center gap-6">
                            {socialLinks.map((social, index) => {
                                const Icon = social.icon
                                return (
                                    <a
                                        key={index}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-14 h-14 bg-[#1f1f1f] rounded-xl flex items-center justify-center border border-gray-800 hover:border-[#00FF89]/50 hover:bg-[#00FF89]/10 transition-all duration-300 group"
                                        aria-label={social.name}
                                    >
                                        <Icon className="w-6 h-6 text-gray-400 group-hover:text-[#00FF89] transition-colors" />
                                    </a>
                                )
                            })}
                        </motion.div>
                    </motion.div>
                </Container>
            </section>
        </div>
    )
}