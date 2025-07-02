'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Search, ShoppingCart, Users, TrendingUp } from 'lucide-react'
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
    { name: 'Hire', href: '/hire', icon: Users },
    { name: 'Become a Seller', href: '/become-seller', icon: TrendingUp },
  ]

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-black/95 backdrop-blur-lg shadow-2xl shadow-brand-primary/10 border-b border-brand-primary/20' 
        : 'bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm border-b border-white/5'
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

          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center gap-2 font-kumbh-sans font-medium text-base text-gray-300 hover:text-brand-primary transition-all duration-300"
              >
                {item.icon && <item.icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2.5 text-gray-300 hover:text-brand-primary bg-white/5 hover:bg-brand-primary/10 rounded-lg transition-all duration-300">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2.5 text-gray-300 hover:text-brand-primary bg-white/5 hover:bg-brand-primary/10 rounded-lg transition-all duration-300">
              <ShoppingCart className="h-5 w-5" />
            </button>
            <Link
              href="/login"
              className="px-5 py-2.5 font-kumbh-sans font-medium text-base text-gray-300 hover:text-brand-primary transition-all duration-300"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl opacity-75 blur transition duration-300 group-hover:opacity-100" />
              <span className="relative flex items-center px-6 py-3 bg-black rounded-xl text-brand-primary font-kumbh-sans font-semibold text-base transition-all duration-300">
                Get Started
              </span>
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
                  className="flex items-center gap-2 font-kumbh-sans font-medium text-base text-gray-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className="h-4 w-4 opacity-70" />}
                  <span>{item.name}</span>
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