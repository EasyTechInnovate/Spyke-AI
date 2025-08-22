// Design System - Export all components and tokens
export * from './components'
export * from './tokens'

// Import and re-export styles
import './styles.css'

// Design System version and metadata
export const DS_VERSION = '1.0.0'
export const DS_NAME = 'Spyke AI Design System'

// Quick access to common tokens
export const colors = {
  primary: '#00FF89',
  primaryText: '#121212',
  secondary: '#FFC050',
  dark: '#121212',
  white: '#FFFFFF'
}

export const spacing = {
  xs: '0.5rem',
  sm: '1rem', 
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem'
}

export const typography = {
  title: 'var(--font-league-spartan)',
  body: 'var(--font-kumbh-sans)'
}