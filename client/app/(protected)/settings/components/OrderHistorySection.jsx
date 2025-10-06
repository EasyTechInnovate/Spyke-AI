'use client'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight, Package, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function OrderHistorySection() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#00FF89]/10 rounded-xl flex items-center justify-center border border-[#00FF89]/20">
                    <ShoppingBag className="w-6 h-6 text-[#00FF89]" />
                </div>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#00FF89] font-league-spartan">Order History</h2>
                    <p className="text-gray-300 text-sm">View and manage all your purchases</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-black border border-[#00FF89]/20 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-[#00FF89]/20 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-[#00FF89]" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4">Your Purchase History</h3>
                    <p className="text-gray-300 mb-6 max-w-md mx-auto">
                        Access all your purchased products.
                    </p>

                    <Link href="/purchases">
                        <button className="inline-flex items-center gap-3 px-6 py-3 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors group">
                            <span>View All Purchases</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>

                </div>
            </div>
        </motion.div>
    )
}
