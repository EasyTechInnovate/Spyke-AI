'use client'

import { DESIGN_TOKENS, COMPONENT_VARIANTS, getToken } from './tokens'

export const DSButton = ({ 
  variant = 'primary', 
  size = 'medium', 
  loading = false,
  children, 
  className = '', 
  ...props 
}) => {
  const variantConfig = COMPONENT_VARIANTS.button[variant]
  
  const baseStyles = {
    height: getToken(`component.button.height.${size}`),
    paddingLeft: getToken(`component.button.paddingX.${size}`),
    paddingRight: getToken(`component.button.paddingX.${size}`),
    fontSize: getToken(`typography.fontSize.${size === 'small' ? 'sm' : 'base'}`),
    fontFamily: getToken('typography.fontFamily.body'),
    fontWeight: getToken('typography.fontWeight.semibold'),
    borderRadius: getToken('borderRadius.xl'),
    backgroundColor: variantConfig.background,
    color: variantConfig.color,
    border: variantConfig.border ? `2px solid ${variantConfig.border}` : 'none',
    transition: `all ${getToken('animation.duration.normal')} ${getToken('animation.easing.easeOut')}`,
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getToken('spacing.2'),
    outline: 'none',
    textDecoration: 'none',
    userSelect: 'none',
    opacity: loading ? 0.7 : 1
  }

  return (
    <button
      style={baseStyles}
      className={`ds-button ds-button--${variant} ds-button--${size} ds-normalize ${loading ? 'ds-button--loading' : ''} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading && (
        <div className="ds-spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
      )}
      {children}
    </button>
  )
}

export const DSHeading = ({ 
  level = 1, 
  variant = 'hero', 
  children, 
  className = '', 
  ...props 
}) => {
  const Tag = `h${level}`
  const variantConfig = COMPONENT_VARIANTS.text[variant] || {}
  
  // Check if className contains color-related classes
  const hasColorClass = className.includes('text-') || className.includes('color-')
  
  const styles = {
    fontSize: variantConfig.fontSize || getToken('typography.fontSize.4xl'),
    lineHeight: variantConfig.lineHeight || getToken('typography.lineHeight.tight'),
    letterSpacing: variantConfig.letterSpacing || getToken('typography.letterSpacing.normal'),
    fontWeight: variantConfig.fontWeight || getToken('typography.fontWeight.bold'),
    fontFamily: variantConfig.fontFamily || getToken('typography.fontFamily.title'),
    margin: 0,
    // Only set color to inherit if no color class is provided
    ...(hasColorClass ? {} : { color: 'inherit' })
  }

  return (
    <Tag
      style={styles}
      className={`ds-heading ds-heading--${variant} ds-heading--level-${level} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

export const DSText = ({ 
  variant = 'body', 
  size = 'base',
  children, 
  className = '', 
  as = 'p',
  ...props 
}) => {
  const Tag = as
  const variantConfig = COMPONENT_VARIANTS.text[variant]
  
  const styles = {
    fontSize: variantConfig?.fontSize || getToken(`typography.fontSize.${size}`),
    lineHeight: variantConfig?.lineHeight || getToken('typography.lineHeight.normal'),
    letterSpacing: variantConfig?.letterSpacing || getToken('typography.letterSpacing.normal'),
    fontWeight: variantConfig?.fontWeight || getToken('typography.fontWeight.normal'),
    fontFamily: variantConfig?.fontFamily || getToken('typography.fontFamily.body'),
    margin: 0,
    color: 'inherit'
  }

  return (
    <Tag
      style={styles}
      className={`ds-text ds-text--${variant} ds-text--${size} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

export const DSStack = ({ 
  gap = 'medium', 
  direction = 'column', 
  align = 'stretch', 
  justify = 'flex-start',
  children, 
  className = '', 
  ...props 
}) => {
  const gapValue = getToken(`component.hero.gap.${gap}`) || getToken(`spacing.${gap}`)
  
  const styles = {
    display: 'flex',
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    gap: gapValue
  }

  return (
    <div
      style={styles}
      className={`ds-stack ds-stack--${direction} ds-stack--gap-${gap} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const DSContainer = ({ 
  maxWidth = 'hero',
  padding = 'responsive',
  children, 
  className = '', 
  ...props 
}) => {
  const maxWidthValue = maxWidth === 'hero' 
    ? getToken('component.hero.maxWidth') 
    : getToken(`breakpoints.${maxWidth}`)
  
  const paddingStyles = padding === 'responsive' ? {
    paddingLeft: 'clamp(1rem, 4vw, 2rem)',
    paddingRight: 'clamp(1rem, 4vw, 2rem)'
  } : {
    paddingLeft: getToken(`spacing.${padding}`),
    paddingRight: getToken(`spacing.${padding}`)
  }
  
  const styles = {
    maxWidth: maxWidthValue,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    ...paddingStyles
  }

  return (
    <div
      style={styles}
      className={`ds-container ds-container--${maxWidth} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Loading States Component
export const DSLoadingState = ({ 
  type = 'skeleton', 
  variant = 'default',
  width = '100%',
  height = '1.5rem',
  className = ''
}) => {
  if (type === 'skeleton') {
    const styles = {
      width,
      height,
      backgroundColor: getToken('colors.background.elevated'),
      borderRadius: getToken('borderRadius.md'),
      animation: 'ds-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }

    return (
      <div
        className={`ds-skeleton ${className}`}
        style={styles}
      />
    )
  }

  if (type === 'spinner') {
    const styles = {
      width: '24px',
      height: '24px',
      border: `2px solid ${getToken('colors.text.muted')}`,
      borderTopColor: getToken('colors.brand.primary'),
      borderRadius: '50%',
      animation: 'ds-spin 1s linear infinite'
    }

    return (
      <div 
        className={`ds-spinner ${className}`}
        style={styles}
      />
    )
  }

  if (type === 'dots') {
    return (
      <div className={`ds-loading-dots ${className}`}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    )
  }

  return null
}

export const DSBadge = ({
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: {
      backgroundColor: `${getToken('colors.brand.primary')}0D`, // 5% opacity
      color: getToken('colors.brand.primary'),
      border: `1px solid ${getToken('colors.brand.primary')}1A` // 10% opacity
    },
    secondary: {
      backgroundColor: `${getToken('colors.brand.secondary')}0D`,
      color: getToken('colors.brand.secondary'),
      border: `1px solid ${getToken('colors.brand.secondary')}1A`
    }
  }

  const sizeStyles = {
    small: {
      padding: `${getToken('spacing.1')} ${getToken('spacing.3')}`,
      fontSize: getToken('typography.fontSize.xs')
    },
    medium: {
      padding: `${getToken('spacing.2')} ${getToken('spacing.4')}`,
      fontSize: getToken('typography.fontSize.sm')
    }
  }

  const styles = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    display: 'inline-flex',
    alignItems: 'center',
    gap: getToken('spacing.2'),
    borderRadius: getToken('borderRadius.full'),
    fontFamily: getToken('typography.fontFamily.body'),
    fontWeight: getToken('typography.fontWeight.medium')
  }

  return (
    <span
      style={styles}
      className={`ds-badge ds-badge--${variant} ds-badge--${size} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'small' ? 14 : 16} />}
      {children}
    </span>
  )
}

// Stats Card Component
export const DSStatsCard = ({
  icon: Icon,
  value,
  label,
  variant = 'default',
  className = '',
  ...props
}) => {
  const styles = {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: getToken('spacing.3')
  }

  const iconStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: getToken('spacing.12'),
    height: getToken('spacing.12'),
    backgroundColor: `${getToken('colors.brand.primary')}0D`,
    borderRadius: getToken('borderRadius.xl'),
    marginBottom: getToken('spacing.1')
  }

  const valueStyles = {
    fontSize: 'clamp(1rem, 2.5vw, 1.375rem)', // Further reduced to match CSS
    fontWeight: getToken('typography.fontWeight.bold'),
    fontFamily: getToken('typography.fontFamily.title'),
    color: getToken('colors.brand.white'),
    margin: 0
  }

  const labelStyles = {
    fontSize: getToken('typography.fontSize.xs'), // Reduced from sm to xs
    color: getToken('colors.text.secondary.dark'),
    fontFamily: getToken('typography.fontFamily.body'),
    margin: 0
  }

  return (
    <div
      style={styles}
      className={`ds-stats-card ds-stats-card--${variant} ds-card-normalize ${className}`}
      {...props}
    >
      <div style={iconStyles}>
        {Icon && <Icon size={18} style={{ color: getToken('colors.brand.primary') }} />}
      </div>
      <div style={valueStyles}>{value}</div>
      <div style={labelStyles}>{label}</div>
    </div>
  )
}

// Form Input Components for Design System
export const DSFormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error = '',
  touched = false,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  className = '',
  ...props
}) => {
  const hasError = touched && error
  const hasSuccess = touched && !error && value

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-300 pl-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
            disabled ? 'text-gray-500' : 
            hasError ? 'text-red-400' :
            hasSuccess ? 'text-[#00FF89]' :
            'text-gray-400 group-focus-within:text-[#00FF89]'
          }`} />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} ${RightIcon ? 'pr-12' : 'pr-4'} py-4 bg-[#121212]/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 text-base font-medium ${
            disabled ? 'opacity-50 cursor-not-allowed' :
            hasError ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' :
            hasSuccess ? 'border-[#00FF89] focus:ring-[#00FF89]/50 focus:border-[#00FF89]' :
            'border-gray-600/50 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50'
          } ${className}`}
          {...props}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            disabled={disabled}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 transition-colors ${
              disabled ? 'text-gray-500' : 'text-gray-400 hover:text-[#00FF89]'
            }`}
          >
            <RightIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      {hasError && (
        <p className="text-sm text-red-400 pl-1 font-medium">{error}</p>
      )}
    </div>
  )
}

// Checkbox Component
export const DSCheckbox = ({
  label,
  name,
  checked,
  onChange,
  required = false,
  disabled = false,
  error = '',
  touched = false,
  className = '',
  children,
  ...props
}) => {
  const hasError = touched && error

  return (
    <div className="space-y-2">
      <label className={`flex items-start gap-3 cursor-pointer group ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`w-4 h-4 rounded border-2 bg-[#121212] text-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/50 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] cursor-pointer transition-all duration-200 hover:border-gray-500 checked:bg-[#00FF89] checked:border-[#00FF89] ${
              hasError ? 'border-red-500' : 'border-gray-600'
            } ${className}`}
            style={{ accentColor: '#00FF89' }}
            {...props}
          />
        </div>
        <span className={`text-sm leading-relaxed font-medium transition-colors ${
          disabled ? 'text-gray-500' :
          hasError ? 'text-red-300' :
          'text-gray-300 group-hover:text-white'
        }`}>
          {children || label}
        </span>
      </label>
      {hasError && (
        <p className="text-sm text-red-400 ml-7 font-medium">{error}</p>
      )}
    </div>
  )
}

// Password Strength Indicator
export const DSPasswordStrength = ({ password, strength }) => {
  if (!password) return null

  const getStrengthColor = (score) => {
    if (score <= 2) return 'bg-red-500'
    if (score === 3) return 'bg-yellow-500'
    return 'bg-[#00FF89]'
  }

  const getStrengthText = (score) => {
    if (score <= 2) return 'Weak password'
    if (score === 3) return 'Good password'
    return 'Strong password'
  }

  const getStrengthTextColor = (score) => {
    if (score <= 2) return 'text-red-400'
    if (score === 3) return 'text-yellow-400'
    return 'text-[#00FF89]'
  }

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < strength.score ? getStrengthColor(strength.score) : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      <p className={`text-sm font-medium ${getStrengthTextColor(strength.score)}`}>
        {getStrengthText(strength.score)}
      </p>
    </div>
  )
}