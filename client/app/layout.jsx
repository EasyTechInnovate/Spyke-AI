import { Geist, Geist_Mono } from 'next/font/google'
import { League_Spartan, Kumbh_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { appConfig } from '@/lib/config'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin']
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin']
})

// Brand fonts
const leagueSpartan = League_Spartan({
    variable: '--font-league-spartan',
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
})

const kumbhSans = Kumbh_Sans({
    variable: '--font-kumbh-sans',
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
})

// client/app/layout.jsx
export const metadata = {
    title: `${appConfig.company.name} – ${appConfig.company.tagline}`,
    description: appConfig.company.description,
    keywords: '...', 
    openGraph: {
        title: `${appConfig.company.name} – ${appConfig.company.tagline}`,
        description: appConfig.company.description,
        url: 'https://spykeai.com',
        siteName: 'Spyke AI',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
            }
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: `${appConfig.company.name} – ${appConfig.company.tagline}`,
        description: appConfig.company.description,
        images: ['/twitter-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
}

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            className="scroll-smooth">
            <head>
                <link
                    rel="icon"
                    href="/logo-icon.svg"
                    type="image/svg+xml"
                />
                <link
                    rel="apple-touch-icon"
                    href="/logo-icon.svg"
                />
                <meta
                    name="theme-color"
                    content="#00FF89"
                />
                <meta
                    name="msapplication-TileColor"
                    content="#00FF89"
                />

                {/* Preconnect to external domains for performance */}
                <link
                    rel="preconnect"
                    href="https://fonts.googleapis.com"
                />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${leagueSpartan.variable} ${kumbhSans.variable} bg-white text-gray-900 antialiased`}
                suppressHydrationWarning={true}>
                {children}

                <Toaster
                    position="top-right"
                    richColors
                    expand={true}
                    duration={4000}
                    closeButton
                    toastOptions={{
                        style: {
                            background: '#FFFFFF',
                            border: '1px solid #00FF89',
                            color: '#121212',
                        },
                        className: 'font-kumbh-sans',
                    }}
                />
            </body>
        </html>
    )
}