'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Search, ShoppingCart } from 'lucide-react'
import Container from './Container'
import { SpykeLogo } from '@/components/Logo'


export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Explore', href: '/explore' },
    { name: 'Categories', href: '/categories' },
    { name: 'Top Creators', href: '/creators' },
    { name: 'Pricing', href: '/pricing' },
  ]

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-black/90 backdrop-blur-lg shadow-lg border-b border-gray-800' 
        : 'bg-transparent'
    }`}>
      <Container>
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <SpykeLogo
              size={45} 
              showText={false}
              textSize="text-2xl"
              className="[&_span]:!text-white [&_div]:!text-gray-400"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-kumbh-sans font-medium text-base text-gray-300 hover:text-brand-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-300 hover:text-brand-primary transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-300 hover:text-brand-primary transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </button>
            <Link
              href="/login"
              className="px-5 py-2.5 font-kumbh-sans font-medium text-base text-gray-300 hover:text-brand-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 bg-brand-primary text-brand-dark font-kumbh-sans font-semibold text-base rounded-xl hover:bg-brand-primary/90 transition-all duration-200 shadow-lg shadow-brand-primary/25"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="font-kumbh-sans font-medium text-base text-gray-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/login"
                className="font-kumbh-sans font-medium text-base text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="w-full px-6 py-3 bg-brand-primary text-brand-dark font-kumbh-sans font-semibold text-base rounded-xl text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </Container>
    </header>
  )
}