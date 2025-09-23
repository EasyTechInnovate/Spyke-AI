import './globals.css'
import { appConfig } from '@/lib/config'
import { fontVariables } from '@/lib/fonts'
import WhatsAppButton from '@/components/shared/WhatsAppButton'
import ConditionalFooter from '@/components/shared/layout/ConditionalFooter'
import ConditionalHeader from '@/components/shared/layout/ConditionalHeader'
import { NotificationProvider } from '@/components/shared/NotificationProvider'
import StripeProvider from '@/components/providers/StripeProvider'
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
                <meta name="p:domain_verify" content="ac2574a26c2baac8234b798c9c6c2724"/>
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
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','GTM-5GN3WZM9');`
                    }}
                />
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-5F5D2WWDBN"></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-5F5D2WWDBN');
                        `
                    }}
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', 'YOUR_PIXEL_ID');
                        fbq('track', 'PageView');
                        `
                    }}
                />
                <noscript>
                    <img height="1" width="1" style={{display:'none'}}
                         src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1" />
                </noscript>
                <script src="https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz"></script>
                <script src="https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.8.0-min.js.gz"></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.amplitude.add(window.sessionReplay.plugin({sampleRate: 1}));window.amplitude.init('60f1e4c9467fa9b1c4e6748e2794dd53', {"autocapture":{"elementInteractions":true}});`
                    }}
                />
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
                    imageSrcSet="/og-image.png 1200w"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            </head>
            <body
                className={`font-league-spartan bg-brand-dark text-white antialiased min-h-screen`}
                suppressHydrationWarning={true}>
                <noscript>
                    <iframe
                        src="https://www.googletagmanager.com/ns.html?id=GTM-5GN3WZM9"
                        height="0"
                        width="0"
                        style={{display:'none',visibility:'hidden'}}
                    ></iframe>
                </noscript>
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-primary text-brand-primary-text px-4 py-2 rounded-md font-bold z-50">
                    Skip to main content
                </a>
                <ConditionalHeader />
                <StripeProvider>
                    <NotificationProvider>
                        <main id="main-content">{children}</main>
                    </NotificationProvider>
                </StripeProvider>
                <ConditionalFooter />
                <WhatsAppButton />
            </body>
        </html>
    )
}