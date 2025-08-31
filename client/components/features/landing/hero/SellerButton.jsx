import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Star } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const SellerButton = () => {
    const { user, isAuthenticated, hasRole } = useAuth()

    // Not logged in - show creative "Become Seller" with redirect to signup
    if (!isAuthenticated) {
        return (
            <Link
                href="/signup?redirect=/become-seller"
                className="group w-full sm:w-auto">
                <div className="relative overflow-hidden">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00FF89]/10 via-[#00FF89]/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm group-hover:blur-none"></div>

                    {/* Main button */}
                    <button className="relative flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 text-white font-semibold border border-white/20 rounded-lg hover:border-[#00FF89]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00FF89]/10 w-full sm:w-auto backdrop-blur-sm group-hover:backdrop-blur-md min-h-[48px] touch-manipulation">
                        {/* Subtle sparkle icon */}
                        <Sparkles className="w-4 h-4 text-[#00FF89]/70 group-hover:text-[#00FF89] transition-colors duration-300 group-hover:rotate-12 group-hover:scale-110" />

                        <span className="relative text-base sm:text-base">
                            Become Seller
                            {/* Subtle underline animation */}
                            <div className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-[#00FF89] to-transparent group-hover:w-full transition-all duration-500"></div>
                        </span>

                        {/* Arrow with smooth animation */}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:text-[#00FF89] transition-all duration-300" />
                    </button>

                    {/* Floating particles effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="absolute top-2 right-4 w-1 h-1 bg-[#00FF89] rounded-full animate-ping delay-100"></div>
                        <div className="absolute bottom-3 left-6 w-0.5 h-0.5 bg-[#00FF89]/60 rounded-full animate-pulse delay-300"></div>
                    </div>
                </div>
            </Link>
        )
    }

    // Logged in and has seller role - show elegant "Start Selling"
    if (hasRole('seller')) {
        return (
            <Link
                href="/seller/dashboard"
                className="group w-full sm:w-auto">
                <div className="relative overflow-hidden">
                    {/* Success state gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00FF89]/20 via-[#00FF89]/10 to-transparent rounded-lg opacity-60 group-hover:opacity-100 transition-all duration-500"></div>

                    <button className="relative flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 text-white font-semibold border border-[#00FF89]/30 rounded-lg hover:border-[#00FF89]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[#00FF89]/20 w-full sm:w-auto backdrop-blur-sm min-h-[48px] touch-manipulation">
                        {/* Success star icon */}
                        <Star className="w-4 h-4 text-[#00FF89] group-hover:fill-current group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />

                        <span className="relative text-[#00FF89] group-hover:text-white transition-colors duration-300 text-base sm:text-base">
                            Start Selling
                            {/* Active underline */}
                            <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-[#00FF89] to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </span>

                        <ArrowRight className="w-4 h-4 text-[#00FF89] group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </button>
                </div>
            </Link>
        )
    }

    // Logged in but not a seller - show elegant invitation
    return (
        <Link
            href="/become-seller"
            className="group w-full sm:w-auto">
            <div className="relative overflow-hidden">
                {/* Invitation gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-[#00FF89]/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                <button className="relative flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 text-white font-semibold border border-white/20 rounded-lg hover:border-[#00FF89]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00FF89]/10 w-full sm:w-auto backdrop-blur-sm min-h-[48px] touch-manipulation">
                    {/* Invitation sparkle */}
                    <Sparkles className="w-4 h-4 text-amber-400/70 group-hover:text-[#00FF89] transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />

                    <span className="relative group-hover:text-[#00FF89] transition-colors duration-300 text-base sm:text-base">
                        Become Seller
                        {/* Invitation underline */}
                        <div className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-amber-400 via-[#00FF89] to-transparent group-hover:w-full transition-all duration-500"></div>
                    </span>

                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:text-[#00FF89] transition-all duration-300" />
                </button>

                {/* Welcome particles */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute top-1 right-3 w-1 h-1 bg-amber-400 rounded-full animate-ping delay-200"></div>
                    <div className="absolute bottom-2 left-5 w-0.5 h-0.5 bg-[#00FF89]/60 rounded-full animate-pulse delay-500"></div>
                </div>
            </div>
        </Link>
    )
}

export default SellerButton
