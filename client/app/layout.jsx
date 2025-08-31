import './globals.css'
// import { Toaster } from 'sonner'
import { appConfig } from '@/lib/config'
import Script from 'next/script'
import { fontVariables } from '@/lib/fonts'
import WhatsAppButton from '@/components/shared/WhatsAppButton'
import ConditionalFooter from '@/components/shared/layout/ConditionalFooter'
import ConditionalHeader from '@/components/shared/layout/ConditionalHeader'
import { NotificationProvider } from '@/components/shared/NotificationProvider'

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
    },
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/logo-icon.svg', type: 'image/svg+xml' }
        ],
        apple: '/apple-icon.png'
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
                    href="/logo-icon.svg"
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

                <link
                    rel="preload"
                    as="image"
                    href="/og-image.png"
                    imagesrcset="/og-image.png 1200w"
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

                <ConditionalHeader />
                <NotificationProvider>
                    <main id="main-content">{children}</main>
                </NotificationProvider>
                <ConditionalFooter />
                <WhatsAppButton />

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

