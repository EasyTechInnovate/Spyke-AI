import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map your CSS variables to Tailwind
        brand: {
          primary: 'var(--brand-primary)',
          'primary-text': 'var(--brand-primary-text)',
          dark: 'var(--brand-dark)',
          'dark-text': 'var(--brand-dark-text)',
          secondary: 'var(--brand-secondary)',
          'secondary-text': 'var(--brand-secondary-text)',
          white: 'var(--brand-white)',
          'white-text': 'var(--brand-white-text)',
        },
        // Your existing theme colors
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        // ... rest of your colors
      },
      fontFamily: {
        'league-spartan': ['var(--font-league-spartan)'],
        'kumbh-sans': ['var(--font-kumbh-sans)'],
      },
    },
  },
  plugins: [],
};

export default config;