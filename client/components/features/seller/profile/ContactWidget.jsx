'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    MessageCircle, X, Phone, Mail, Calendar, 
    MessageSquare} from 'lucide-react'

export default function ContactWidget({ seller, isOpen, onClose, className = "" }) {
    const [selectedContact, setSelectedContact] = useState(null)
    const [message, setMessage] = useState('')
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const contactOptions = [
        {
            id: 'message',
            label: 'Send Message',
            icon: <MessageSquare className="w-5 h-5" />,
            color: 'bg-[#00FF89]/20',
            textColor: 'text-[#00FF89]',
            borderColor: 'border-[#00FF89]/30',
            description: 'Quick message for general inquiries'
        },
        {
            id: 'call',
            label: 'Schedule Call',
            icon: <Phone className="w-5 h-5" />,
            color: 'bg-[#FFC050]/20',
            textColor: 'text-[#FFC050]',
            borderColor: 'border-[#FFC050]/30',
            description: 'Book a consultation call'
        },
        {
            id: 'custom',
            label: 'Custom Request',
            icon: <Mail className="w-5 h-5" />,
            color: 'bg-[#00FF89]/20',
            textColor: 'text-[#00FF89]',
            borderColor: 'border-[#00FF89]/30',
            description: 'Discuss custom automation projects'
        }
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        
        setIsSubmitting(false)
        onClose()
        setSelectedContact(null)
        setMessage('')
        setEmail('')
        setName('')
        
        // Show success message
        alert('Message sent successfully!')
    }

    if (!seller) return null

    const selectedOption = contactOptions.find(o => o.id === selectedContact)

    return (
        <>
            {/* Contact Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121212]/80 backdrop-blur-sm"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="bg-[#1f1f1f] rounded-2xl border border-[#6b7280]/20 p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 sm:mb-8">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#00FF89] to-[#FFC050] rounded-full flex items-center justify-center text-[#121212] font-bold text-sm sm:text-base" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                        {seller.fullName?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-[#FFFFFF] text-base sm:text-lg truncate" style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: 'bold' }}>
                                            Contact {seller.fullName}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#9ca3af]">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${seller.isOnline ? 'bg-[#00FF89]' : 'bg-[#6b7280]'}`} />
                                            <span className="truncate" style={{ fontFamily: 'var(--font-kumbh-sans)' }}>
                                                {seller.isOnline ? 'Online now' : 'Usually responds within 2h'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 sm:p-2 text-[#6b7280] hover:text-[#FFFFFF] transition-colors rounded-lg hover:bg-[#6b7280]/10 flex-shrink-0"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>

                            {/* Coming Soon Message */}
                            <div className="text-center py-6 sm:py-8">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#FFC050]/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFC050]" />
                                </div>
                                <h3 className="text-[#FFFFFF] text-lg sm:text-xl mb-2" style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: 'bold' }}>
                                    Direct Messaging Coming Soon
                                </h3>
                                <p className="text-[#9ca3af] mb-4 sm:mb-6 text-sm sm:text-base px-2" style={{ fontFamily: 'var(--font-kumbh-sans)' }}>
                                    We're working on a messaging system to connect you directly with sellers. For now, you can reach out via their social links or email.
                                </p>
                                
                                {/* Alternative Contact Options */}
                                <div className="space-y-2 sm:space-y-3">
                                    {seller.email && (
                                        <button
                                            onClick={() => window.location.href = `mailto:${seller.email}`}
                                            className="w-full p-2.5 sm:p-3 bg-[#00FF89]/10 hover:bg-[#00FF89]/20 border border-[#00FF89]/30 rounded-xl text-[#00FF89] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                                            style={{ fontFamily: 'var(--font-kumbh-sans)', fontWeight: '500' }}
                                        >
                                            <Mail className="w-4 h-4" />
                                            Send Email
                                        </button>
                                    )}
                                    
                                    {seller.websiteUrl && (
                                        <button
                                            onClick={() => window.open(seller.websiteUrl, '_blank')}
                                            className="w-full p-2.5 sm:p-3 bg-[#FFC050]/10 hover:bg-[#FFC050]/20 border border-[#FFC050]/30 rounded-xl text-[#FFC050] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                                            style={{ fontFamily: 'var(--font-kumbh-sans)', fontWeight: '500' }}
                                        >
                                            <Calendar className="w-4 h-4" />
                                            Visit Website
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}