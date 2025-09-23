'use client'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
export default function SellerNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center text-white bg-[#121212] px-4">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-[#1f1f1f] rounded-full flex items-center justify-center border border-gray-800">
            <Package className="w-16 h-16 text-gray-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
          This seller page doesn't exist or is still under development.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/seller/profile"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF89] text-[#121212] font-semibold rounded-xl hover:bg-[#00FF89]/90 transition-all duration-200"
          >
            Go to Profile
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-white font-semibold rounded-xl hover:bg-gray-900 hover:border-gray-600 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}