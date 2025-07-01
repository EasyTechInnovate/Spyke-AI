import { Geist, Geist_Mono } from 'next/font/google'
import { League_Spartan, Kumbh_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

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

export const metadata = {
    title: 'Spyke AI – Premium AI Prompts & Automation Marketplace',
    description:
        'Discover premium AI prompts, automation solutions, and digital tools created by experts. Spyke AI is the leading marketplace for battle-tested prompts, comprehensive guides, and AI-powered automation solutions that transform your workflow.',
    keywords:
        'Spyke AI, AI prompts, automation, digital tools, prompt marketplace, AI solutions, artificial intelligence, productivity tools, prompt engineering, AI marketplace, automation scripts, digital products',
    authors: [{ name: 'Spyke AI Team' }],
    creator: 'Spyke AI',
    publisher: 'Spyke AI',
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