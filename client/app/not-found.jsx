'use client'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'
import Header from '@/components/shared/layout/Header'
export const dynamic = 'force-dynamic'
export default function NotFound() {
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-white bg-[#121212] px-4 pt-20">
        <div className="max-w-2xl w-full">
          <div className="mb-8">
            <img
              src="https://media.giphy.com/media/14uQ3cOFteDaU/giphy.gif"
              alt="Lost in space"
              className="w-64 h-64 mx-auto rounded-2xl shadow-2xl border border-gray-800"
            />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-4 font-league-spartan">
            <span className="text-brand-primary">4</span>
            <span className="text-white">0</span>
            <span className="text-brand-primary">4</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
            Looks like you've ventured into uncharted territory. 
            The page you're looking for has drifted away into the digital void.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-all duration-200 group"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-white font-semibold rounded-xl hover:bg-gray-900 hover:border-gray-600 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-gray-500 mb-4">Here are some helpful links:</p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link href="/explore" className="text-brand-primary hover:text-white transition-colors">
                Explore Products
              </Link>
              <Link href="/become-seller" className="text-brand-primary hover:text-white transition-colors">
                Become a Seller
              </Link>
              <Link href="/help" className="text-brand-primary hover:text-white transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="text-brand-primary hover:text-white transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}