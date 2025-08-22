import { theme } from '@/config/theme'

export const DESIGN_TOKENS = {
    // Colors - Using theme.js colors directly
    colors: {
        brand: {
            primary: theme.colors.brand.primary,
            primaryText: theme.colors.brand.primaryText,
            dark: theme.colors.brand.dark,
            darkText: theme.colors.brand.darkText,
            secondary: theme.colors.brand.secondary,
            secondaryText: theme.colors.brand.secondaryText,
            white: theme.colors.brand.white,
            whiteText: theme.colors.brand.whiteText
        },
        background: {
            light: theme.colors.background.light,
            dark: theme.colors.background.dark,
            card: {
                light: theme.colors.background.card.light,
                dark: theme.colors.background.card.dark
            },
            // Extended backgrounds for design system
            elevated: '#2a2a2a',
            subtle: '#151515',
            muted: '#0f0f0f'
        },
        text: {
            primary: {
                light: theme.colors.text.primary.light,
                dark: theme.colors.text.primary.dark
            },
            secondary: {
                light: theme.colors.text.secondary.light,
                dark: theme.colors.text.secondary.dark
            },
            // Extended text colors
            muted: '#6b7280',
            subtle: '#9ca3af',
            disabled: '#4b5563',
            inverse: '#FFFFFF'
        },
        semantic: {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        }
    },

    // Typography - Using theme.js fonts
    typography: {
        fontFamily: {
            title: theme.fonts.title,
            body: theme.fonts.title, // Changed from body to title (League Spartan)
            mono: '"JetBrains Mono", "Fira Code", monospace'
        },
        fontSize: {
            xs: '0.875rem',
            sm: '1rem',
            base: '1.125rem',
            lg: '1.25rem',
            xl: '1.375rem',
            '2xl': '1.625rem',
            '3xl': '2rem',
            '4xl': '2.375rem',
            '5xl': '3.125rem',
            '6xl': '3.875rem',
            '7xl': '4.625rem'
        },
        fontWeight: {
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
            extrabold: '800'
        },
        lineHeight: {
            tight: '1.25',
            snug: '1.375',
            normal: '1.5',
            relaxed: '1.625',
            loose: '2'
        },
        letterSpacing: {
            tight: '-0.025em',
            normal: '0em',
            wide: '0.025em'
        }
    },

    // Spacing Scale (4px grid)
    spacing: {
        0: '0px',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem'
    },

    // Component-specific spacing
    component: {
        hero: {
            paddingY: {
                mobile: '4rem',
                tablet: '5rem',
                desktop: '6rem'
            },
            gap: {
                small: '1.5rem',
                medium: '2rem',
                large: '3rem'
            },
            maxWidth: '80rem'
        },
        button: {
            height: {
                small: '2.5rem',
                medium: '3rem',
                large: '3.5rem'
            },
            paddingX: {
                small: '1rem',
                medium: '1.5rem',
                large: '2rem'
            }
        }
    },

    // Other design tokens
    borderRadius: {
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
    },

    shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        glow: `0 0 20px ${theme.colors.brand.primary}33`
    },

    animation: {
        duration: {
            fast: '150ms',
            normal: '300ms',
            slow: '500ms'
        },
        easing: {
            easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
    },

    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
    },

    zIndex: {
        dropdown: 1000,
        modal: 1400,
        toast: 1700
    }
}

// Utility function to get token values
export const getToken = (path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], DESIGN_TOKENS)
}

// Component variants using theme.js colors
export const COMPONENT_VARIANTS = {
    button: {
        primary: {
            background: DESIGN_TOKENS.colors.brand.primary,
            color: DESIGN_TOKENS.colors.brand.primaryText,
            hover: {
                background: DESIGN_TOKENS.colors.brand.primary,
                opacity: 0.9
            },
            focus: {
                ring: DESIGN_TOKENS.colors.brand.primary
            }
        },
        secondary: {
            background: DESIGN_TOKENS.colors.background.card.dark,
            color: DESIGN_TOKENS.colors.brand.white,
            border: DESIGN_TOKENS.colors.brand.primary,
            hover: {
                background: DESIGN_TOKENS.colors.background.elevated
            },
            focus: {
                ring: DESIGN_TOKENS.colors.brand.primary
            }
        }
    },

    text: {
        hero: {
            fontSize: 'clamp(2rem, 6vw, 3.75rem)', // Increased from clamp(1.875rem, 6vw, 3.5rem)
            lineHeight: DESIGN_TOKENS.typography.lineHeight.tight,
            letterSpacing: DESIGN_TOKENS.typography.letterSpacing.tight,
            fontWeight: DESIGN_TOKENS.typography.fontWeight.bold,
            fontFamily: DESIGN_TOKENS.typography.fontFamily.title
        },
        subhero: {
            fontSize: 'clamp(1.125rem, 3vw, 1.375rem)', // Increased from clamp(1rem, 3vw, 1.25rem)
            lineHeight: DESIGN_TOKENS.typography.lineHeight.relaxed,
            letterSpacing: DESIGN_TOKENS.typography.letterSpacing.normal,
            fontWeight: DESIGN_TOKENS.typography.fontWeight.medium,
            fontFamily: DESIGN_TOKENS.typography.fontFamily.body
        }
    }
}
