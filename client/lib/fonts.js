import { Inter, Kumbh_Sans, League_Spartan } from 'next/font/google'

// Title font - League Spartan (as per theme.ts)
export const leagueSpartan = League_Spartan({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-league-spartan',
  weight: ['600', '700', '800'], // Bold weights for titles
  preload: true,
  adjustFontFallback: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
})

// Body font - Kumbh Sans (as per theme.ts)
export const kumbhSans = Kumbh_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-kumbh-sans',
  weight: ['400', '500', '600', '700'], // All weights for body text
  preload: true,
  adjustFontFallback: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
})

// Additional font - Inter (for specific UI elements)
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: false,
  adjustFontFallback: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
})

// Font variables for CSS
export const fontVariables = `${leagueSpartan.variable} ${kumbhSans.variable} ${inter.variable}`