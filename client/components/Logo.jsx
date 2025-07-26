import Image from 'next/image'
import React from 'react'

// Size presets for consistent usage
export const LOGO_SIZES = {
    xs: 32,
    sm: 40,
    md: 56,
    lg: 64,
    xl: 72,
    '2xl': 80,
    '3xl': 96
}

export const SpykeLogo = ({
    size = LOGO_SIZES.lg, // Default to 'lg' (56px)
    sizePreset, // New prop for using presets
    className = '',
    priority = false,
    showText = true,
    textSize = 'text-xl',
    darkMode = false
}) => {
    // Use preset if provided, otherwise use size
    const logoSize = sizePreset ? LOGO_SIZES[sizePreset] : size

    return (
        <div className={`flex items-center ${showText ? 'space-x-3' : ''} ${className}`}>
            <div
                className="relative flex-shrink-0"
                style={{ width: logoSize, height: logoSize }}>
                <Image
                    src="/logo.svg"
                    alt="Spyke AI Logo"
                    width={logoSize}
                    height={logoSize}
                    priority={priority}
                    className="logo-icon object-contain"
                    draggable={false}
                    onError={(e) => {
                        // Fallback for missing logo
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement.innerHTML = `
              <div class="w-full h-full rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                ${showText ? 'S' : 'SA'}
              </div>
            `
                    }}
                />
            </div>
            {showText && (
                <div className="flex flex-col justify-center">
                    <h1 className={`${textSize} font-bold ${darkMode ? 'text-white' : 'text-[#121212]'} title-font leading-tight`}>Spyke AI</h1>
                </div>
            )}
        </div>
    )
}

// Alternative compact logo for smaller spaces
export const SpykeLogoCompact = ({ size = 32, className = '', darkMode = false, showTooltip = true }) => {
    const [imageError, setImageError] = React.useState(false)

    return (
        <div
            className={`relative ${className} ${showTooltip ? 'group' : ''}`}
            style={{ width: size, height: size }}
            role="img"
            aria-label="Spyke AI Logo">
            {!imageError ? (
                <Image
                    src="/logo-icon.svg"
                    alt="Spyke AI"
                    width={size}
                    height={size}
                    className="logo-icon object-contain"
                    draggable={false}
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    S
                </div>
            )}

            {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Spyke AI
                </div>
            )}
        </div>
    )
}

// Logo with loading skeleton
export const SpykeLogoWithSkeleton = ({ size = 40, className = '', showText = true, textSize = 'text-xl' }) => {
    const [isLoading, setIsLoading] = React.useState(true)

    return (
        <div className={`flex items-center ${showText ? 'space-x-3' : ''} ${className}`}>
            <div
                className="relative"
                style={{ width: size, height: size }}>
                {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />}
                <Image
                    src="/logo.svg"
                    alt="Spyke AI Logo"
                    width={size}
                    height={size}
                    className={`logo-icon object-contain transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setIsLoading(false)}
                    draggable={false}
                />
            </div>
            {showText && (
                <div className="flex flex-col justify-center">
                    {isLoading ? (
                        <>
                            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
                            <div className="h-3 w-20 bg-gray-200 animate-pulse rounded mt-1 hidden sm:block" />
                        </>
                    ) : (
                        <>
                            <h1 className={`${textSize} font-bold text-[#121212] title-font leading-tight`}>Spyke AI</h1>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

// Example usage component showing common implementations
export default function CommonUsageExamples() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar Example */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <SpykeLogo
                            sizePreset="md"
                            priority={true}
                        />
                        <div className="flex items-center space-x-4">
                            <button className="px-4 py-2 text-gray-600">Menu</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Dark Navbar Example */}
            <nav className="bg-gray-900 mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <SpykeLogo
                            sizePreset="md"
                            darkMode={true}
                            priority={true}
                        />
                        <div className="flex items-center space-x-4">
                            <button className="px-4 py-2 text-gray-300">Menu</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content Examples */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                <section>
                    <h2 className="text-2xl font-bold mb-6">Common Usage Patterns</h2>

                    <div className="grid gap-8">
                        {/* Hero Section */}
                        <div className="bg-white rounded-lg p-8 shadow">
                            <h3 className="text-lg font-semibold mb-4">Hero Section (Large)</h3>
                            <SpykeLogo
                                sizePreset="2xl"
                                textSize="text-3xl"
                            />
                        </div>

                        {/* Sidebar */}
                        <div className="bg-white rounded-lg p-8 shadow">
                            <h3 className="text-lg font-semibold mb-4">Sidebar (Compact)</h3>
                            <SpykeLogoCompact size={40} />
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-800 rounded-lg p-8">
                            <h3 className="text-lg font-semibold mb-4 text-white">Footer</h3>
                            <SpykeLogo
                                sizePreset="lg"
                                darkMode={true}
                            />
                        </div>

                        {/* Mobile */}
                        <div className="bg-white rounded-lg p-8 shadow max-w-sm">
                            <h3 className="text-lg font-semibold mb-4">Mobile View</h3>
                            <SpykeLogo sizePreset="sm" />
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-6">Quick Reference</h2>
                    <div className="bg-white rounded-lg p-6 shadow">
                        <pre className="text-sm overflow-x-auto">
                            {`// Import
import { SpykeLogo, SpykeLogoCompact } from '@/components/Logo'

// Navbar (48px)
<SpykeLogo sizePreset="md" priority={true} />

// Hero (80px)
<SpykeLogo sizePreset="2xl" textSize="text-3xl" />

// Dark Mode
<SpykeLogo sizePreset="lg" darkMode={true} />

// Icon Only
<SpykeLogo sizePreset="lg" showText={false} />

// Custom Size
<SpykeLogo size={72} />

// Compact with Tooltip
<SpykeLogoCompact size={32} />`}
                        </pre>
                    </div>
                </section>
            </div>
        </div>
    )
}
