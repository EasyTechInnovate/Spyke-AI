import { League_Spartan, Kumbh_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { appConfig } from '@/lib/config'
import Script from 'next/script'
import { AnalyticsProvider } from '@/providers/AnalyticsProvider'
import { Analytics } from '@vercel/analytics/react'
import ConsentBanner from '@/components/analytics/ConsentBanner'
import AnalyticsDebugPanel from '@/components/analytics/DebugPanel'

const leagueSpartan = League_Spartan({
    variable: '--font-league-spartan',
    subsets: ['latin'],
    weight: ['400', '700', '900'],
    display: 'swap',
    preload: true,
    fallback: ['system-ui', 'arial']
})

const kumbhSans = Kumbh_Sans({
    variable: '--font-kumbh-sans',
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
    preload: true,
    fallback: ['system-ui', 'arial']
})

const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: appConfig.company.name,
    alternateName: 'SpykeAI',
    url: 'https://spykeai.com',
    description: appConfig.company.description,
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://spykeai.com/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
    },
    publisher: {
        '@type': 'Organization',
        name: appConfig.company.name,
        url: 'https://spykeai.com',
        logo: {
            '@type': 'ImageObject',
            url: 'https://spykeai.com/logo.png',
            width: 600,
            height: 60
        }
    }
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true
}

export const themeColor = [
    { media: '(prefers-color-scheme: light)', color: '#00FF89' },
    { media: '(prefers-color-scheme: dark)', color: '#00FF89' }
]

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://spykeai.com'),
    title: {
        default: `${appConfig.company.name} - Premium AI Prompts & Automation Tools | ${appConfig.company.tagline}`,
        template: `%s | ${appConfig.company.name}`
    },
    description:
        'Discover 10,000+ premium AI prompts, ChatGPT templates, automation tools & productivity solutions. Join 5,000+ creators selling AI-powered tools. Start automating today!',
    keywords: [
        'AI prompts',
        'ChatGPT prompts',
        'automation tools',
        'AI marketplace',
        'productivity tools',
        'sales scripts',
        'content creation',
        'AI agents',
        'prompt engineering',
        'workflow automation',
        'AI templates',
        'business automation'
    ],
    authors: [{ name: appConfig.company.name, url: 'https://spykeai.com' }],
    creator: appConfig.company.name,
    publisher: appConfig.company.name,
    formatDetection: {
        email: false,
        address: false,
        telephone: false
    },
    alternates: {
        canonical: 'https://spykeai.com',
        languages: {
            'en-US': 'https://spykeai.com'
        }
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://spykeai.com',
        siteName: appConfig.company.name,
        title: `${appConfig.company.name} - Premium AI Prompts & Automation Tools`,
        description: 'Discover 10,000+ premium AI prompts and automation tools. Where Ideas Meet Intelligence.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: `${appConfig.company.name} - AI Prompts Marketplace`,
                type: 'image/png'
            },
            {
                url: '/og-image-square.png',
                width: 600,
                height: 600,
                alt: `${appConfig.company.name} Logo`,
                type: 'image/png'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        site: '@spykeai',
        creator: '@spykeai',
        title: `${appConfig.company.name} - Premium AI Prompts & Automation Tools`,
        description: 'Discover 10,000+ premium AI prompts and automation tools. Where Ideas Meet Intelligence.',
        images: {
            url: '/twitter-image.png',
            alt: `${appConfig.company.name} - AI Prompts Marketplace`
        }
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1
        }
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
        yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
        bing: process.env.NEXT_PUBLIC_BING_VERIFICATION || undefined
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: appConfig.company.name
    },
    appLinks: {
        web: {
            url: 'https://spykeai.com',
            should_fallback: true
        }
    }
}

// Enhanced Toaster configuration with improved UX
const toasterConfig = {
    baseStyle: {
        background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.98) 0%, rgba(31, 31, 31, 0.98) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 255, 137, 0.2)',
        borderRadius: '16px',
        padding: '20px',
        color: '#ffffff',
        fontSize: '15px',
        fontWeight: '500',
        lineHeight: '1.4',
        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 30px -5px rgba(0, 255, 137, 0.1)',
        maxWidth: '420px',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transform: 'translateZ(0)', // Force hardware acceleration
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    variants: {
        success: {
            background: 'linear-gradient(135deg, rgba(0, 255, 137, 0.15) 0%, rgba(15, 15, 15, 0.98) 100%)',
            border: '1px solid rgba(0, 255, 137, 0.5)',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 40px -5px rgba(0, 255, 137, 0.25)',
            animation: 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        error: {
            background: 'linear-gradient(135deg, rgba(255, 85, 85, 0.15) 0%, rgba(15, 15, 15, 0.98) 100%)',
            border: '1px solid rgba(255, 85, 85, 0.5)',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 40px -5px rgba(255, 85, 85, 0.25)',
            animation: 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        warning: {
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(15, 15, 15, 0.98) 100%)',
            border: '1px solid rgba(255, 193, 7, 0.5)',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 40px -5px rgba(255, 193, 7, 0.25)',
            animation: 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        info: {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(15, 15, 15, 0.98) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 40px -5px rgba(59, 130, 246, 0.25)',
            animation: 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        loading: {
            background: 'linear-gradient(135deg, rgba(0, 255, 137, 0.1) 0%, rgba(15, 15, 15, 0.98) 100%)',
            border: '1px solid rgba(0, 255, 137, 0.3)',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 30px -5px rgba(0, 255, 137, 0.15)',
            animation: 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }
    }
}

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            className={`${leagueSpartan.variable} ${kumbhSans.variable} scroll-smooth`}>
            <head>
                <meta charSet="utf-8" />
                <link
                    rel="icon"
                    href="/favicon.ico"
                    sizes="any"
                />
                <link
                    rel="icon"
                    href="/logo-icon.svg"
                    type="image/svg+xml"
                />
                <link
                    rel="apple-touch-icon"
                    href="/apple-touch-icon.png"
                />
                <link
                    rel="mask-icon"
                    href="/safari-pinned-tab.svg"
                    color="#00FF89"
                />

                {/* Optional (but safe) font preconnect */}
                <link
                    rel="dns-prefetch"
                    href="https://fonts.googleapis.com"
                />
                <link
                    rel="dns-prefetch"
                    href="https://fonts.gstatic.com"
                />
                <link
                    rel="preconnect"
                    href="https://fonts.googleapis.com"
                />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />

                {/* Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            </head>

            <body
                className={`font-kumbh-sans bg-black text-white antialiased min-h-screen`}
                suppressHydrationWarning={true}>
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-primary text-black px-4 py-2 rounded-md font-bold z-50">
                    Skip to main content
                </a>

                <AnalyticsProvider>
                    <main id="main-content">{children}</main>
                    <Analytics />
                    <ConsentBanner />
                    <AnalyticsDebugPanel />
                </AnalyticsProvider>

                <Toaster
                    position="top-right"
                    richColors
                    expand
                    duration={5000}
                    closeButton
                    gap={16}
                    offset="24px"
                    visibleToasts={4}
                    toastOptions={{
                        className: 'font-kumbh-sans',
                        style: toasterConfig.baseStyle,
                        success: {
                            style: {
                                ...toasterConfig.baseStyle,
                                ...toasterConfig.variants.success
                            },
                            iconTheme: {
                                primary: '#00FF89',
                                secondary: '#0f0f0f'
                            },
                            duration: 4000
                        },
                        error: {
                            style: {
                                ...toasterConfig.baseStyle,
                                ...toasterConfig.variants.error
                            },
                            iconTheme: {
                                primary: '#ff5555',
                                secondary: '#0f0f0f'
                            },
                            duration: 7000
                        },
                        warning: {
                            style: {
                                ...toasterConfig.baseStyle,
                                ...toasterConfig.variants.warning
                            },
                            iconTheme: {
                                primary: '#ffc107',
                                secondary: '#0f0f0f'
                            },
                            duration: 6000
                        },
                        info: {
                            style: {
                                ...toasterConfig.baseStyle,
                                ...toasterConfig.variants.info
                            },
                            iconTheme: {
                                primary: '#3b82f6',
                                secondary: '#0f0f0f'
                            },
                            duration: 5000
                        },
                        loading: {
                            style: {
                                ...toasterConfig.baseStyle,
                                ...toasterConfig.variants.loading
                            },
                            iconTheme: {
                                primary: '#00FF89',
                                secondary: '#0f0f0f'
                            }
                        }
                    }}
                />

                {process.env.NODE_ENV === 'production' && (
                    <Script
                        src="/scripts/analytics.js"
                        strategy="afterInteractive"
                    />
                )}
            </body>
        </html>
    )
}
