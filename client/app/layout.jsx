import './globals.css'
import { Toaster } from 'sonner'
import { appConfig } from '@/lib/config'
import Script from 'next/script'
import { AnalyticsProvider } from '@/providers/AnalyticsProvider'
import AnalyticsWrapper from '@/components/analytics/AnalyticsWrapper'
import { fontVariables } from '@/lib/fonts'
import WhatsAppButton from '@/components/shared/WhatsAppButton'
import Footer from '@/components/shared/layout/Footer'

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
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: '500',
        lineHeight: '1.5',
        maxWidth: '380px',
        minHeight: '56px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transform: 'translateZ(0)', // Force hardware acceleration
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
    },
    variants: {
        success: {
            background: '#10B981',
            color: '#ffffff',
            border: '1px solid #059669',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
        },
        error: {
            background: '#EF4444',
            color: '#ffffff',
            border: '1px solid #DC2626',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
        },
        warning: {
            background: '#F59E0B',
            color: '#ffffff',
            border: '1px solid #D97706',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
        },
        info: {
            background: '#3B82F6',
            color: '#ffffff',
            border: '1px solid #2563EB',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
        },
        loading: {
            background: '#6B7280',
            color: '#ffffff',
            border: '1px solid #4B5563',
            boxShadow: '0 4px 12px rgba(107, 114, 128, 0.4)'
        }
    }
}

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            className={`${fontVariables} scroll-smooth`}>
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
                className={`font-league-spartan bg-brand-dark text-white antialiased min-h-screen`}
                suppressHydrationWarning={true}>
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-primary text-brand-primary-text px-4 py-2 rounded-md font-bold z-50">
                    Skip to main content
                </a>

                <AnalyticsProvider>
                    <main id="main-content">{children}</main>
                    <Footer />
                    <AnalyticsWrapper />
                    <WhatsAppButton />
                </AnalyticsProvider>

                <Toaster
                    position="top-right"
                    richColors
                    expand
                    duration={5000}
                    closeButton
                    gap={12}
                    offset="24px"
                    visibleToasts={4}
                    pauseWhenPageIsHidden
                    className="toaster-wrapper"
                    toastOptions={{
                        className: 'font-kumbh-sans',
                        style: toasterConfig.baseStyle,
                        success: {
                            style: {
                                ...toasterConfig.baseStyle,
                                ...toasterConfig.variants.success
                            },
                            iconTheme: {
                                primary: '#ffffff',
                                secondary: '#10B981'
                            },
                            duration: 4000
                        },
                        error: {
                            style: {
                                ...toasterConfig.baseStyle,
                                ...toasterConfig.variants.error
                            },
                            iconTheme: {
                                primary: '#ffffff',
                                secondary: '#EF4444'
                            },
                            duration: 7000
                        },
                        warning: {
                            style: {
                                ...toasterConfig.baseStyle,
                                ...toasterConfig.variants.warning
                            },
                            iconTheme: {
                                primary: '#ffffff',
                                secondary: '#F59E0B'
                            },
                            duration: 6000
                        },
                        info: {
                            style: {
                                ...toasterConfig.baseStyle,
                                ...toasterConfig.variants.info
                            },
                            iconTheme: {
                                primary: '#ffffff',
                                secondary: '#3B82F6'
                            },
                            duration: 5000
                        },
                        loading: {
                            style: {
                                ...toasterConfig.baseStyle,
                                ...toasterConfig.variants.loading
                            },
                            iconTheme: {
                                primary: '#ffffff',
                                secondary: '#6B7280'
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
