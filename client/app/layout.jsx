// app/layout.jsx
import { League_Spartan, Kumbh_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { appConfig } from '@/lib/config'
import Script from 'next/script'

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

// ✅ Viewport - required to be outside metadata in App Router
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true
}

// ✅ Theme Color - required to be outside metadata in App Router
export const themeColor = [
    { media: '(prefers-color-scheme: light)', color: '#00FF89' },
    { media: '(prefers-color-scheme: dark)', color: '#00FF89' }
]

// ✅ Metadata
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
        google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
        yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
        bing: process.env.NEXT_PUBLIC_BING_VERIFICATION
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

                <main id="main-content">{children}</main>

                <Toaster
                    position="top-right"
                    richColors
                    expand
                    duration={4000}
                    closeButton
                    toastOptions={{
                        className: 'font-kumbh-sans shadow-lg rounded-lg border border-green-500/30 bg-[#0f0f0f] text-white',
                        style: {
                            padding: '12px 16px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'white',
                            background: '#111',
                            border: '1px solid rgba(0,255,137,0.3)',
                            backdropFilter: 'blur(10px)'
                        },
                        iconTheme: {
                            primary: '#00FF89',
                            secondary: '#0f0f0f'
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

