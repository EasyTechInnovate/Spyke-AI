'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
export default function CheckoutCancelPage() {
    const router = useRouter()
    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <Container className="py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold mb-4">Payment Cancelled</h1>
                    <p className="text-gray-400 mb-8">
                        Your payment was cancelled. No charges were made to your account.
                    </p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => router.push('/checkout')}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors">
                            <CreditCard className="w-4 h-4" />
                            Try Payment Again
                        </button>
                        <button
                            onClick={() => router.push('/cart')}
                            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Cart
                        </button>
                    </div>
                </motion.div>
            </Container>
        </div>
    )
}