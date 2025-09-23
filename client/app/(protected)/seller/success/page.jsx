'use client'
import React from 'react'
import { CheckCircle2, Clock, Mail, FileText, ArrowRight, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Header from '@/components/shared/layout/Header'
import Container from '@/components/shared/layout/Container'
export default function SellerSuccessPage() {
    const router = useRouter()
    const nextSteps = [
        {
            icon: <Mail className="w-5 h-5" />,
            title: "Check Your Email",
            description: "We've sent a confirmation email with important next steps."
        },
        {
            icon: <FileText className="w-5 h-5" />,
            title: "Document Verification",
            description: "Our team will verify your submitted information and documents."
        },
        {
            icon: <CheckCircle2 className="w-5 h-5" />,
            title: "Account Activation",
            description: "Once approved, you'll receive access to your seller dashboard."
        }
    ]
    return (
        <>
            <section className="min-h-screen bg-black pt-24 pb-16">
                <Container>
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-kumbh-sans font-bold mb-4 text-white">
                            Profile Created Successfully!
                        </h1>
                        <p className="text-xl text-gray-300 mb-8">
                            Thank you for joining Spyke AI as a seller. Your profile has been submitted for review.
                        </p>
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-10">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Clock className="w-6 h-6 text-orange-400" />
                                <h2 className="text-xl font-semibold text-orange-400">Account Under Review</h2>
                            </div>
                            <p className="text-gray-300">
                                Your seller account is currently under review by our team. We'll verify your information 
                                and documents to ensure the quality and security of our marketplace. This process typically 
                                takes 1-3 business days.
                            </p>
                        </div>
                        <div className="text-left mb-10">
                            <h3 className="text-2xl font-semibold text-white mb-6 text-center">What Happens Next?</h3>
                            <div className="space-y-4">
                                {nextSteps.map((step, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                        <div className="flex-shrink-0 w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center">
                                            <div className="text-brand-primary">
                                                {step.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                                            <p className="text-gray-400 text-sm">{step.description}</p>
                                        </div>
                                        <div className="flex-shrink-0 text-gray-600 text-sm font-medium">
                                            {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
                            <h3 className="text-lg font-semibold text-blue-400 mb-3">Important Notice</h3>
                            <ul className="text-left text-gray-300 space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">•</span>
                                    <span>Please wait for further instructions via email</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">•</span>
                                    <span>Do not create another seller account while under review</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">•</span>
                                    <span>Check your spam folder if you don't receive our email within 24 hours</span>
                                </li>
                            </ul>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => router.push('/')}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg text-white font-medium transition-all"
                            >
                                <Home className="w-4 h-4" />
                                Back to Home
                            </button>
                            <button
                                onClick={() => router.push('/explore')}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 rounded-lg text-white font-medium transition-all"
                            >
                                Explore Marketplace
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-10 pt-8 border-t border-gray-800">
                            <p className="text-gray-400 text-sm">
                                Questions about your application? Contact us at{' '}
                                <a 
                                    href="mailto:sellers@spyke-ai.com" 
                                    className="text-brand-primary hover:text-brand-primary/80 transition-colors"
                                >
                                    sellers@spyke-ai.com
                                </a>
                            </p>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    )
}