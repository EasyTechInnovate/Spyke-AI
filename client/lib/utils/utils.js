import dynamic from 'next/dynamic';

export function lazyLucideIcon(iconName, sizeClass = 'w-6 h-6') {
  return dynamic(() =>
    import('lucide-react').then(mod => {
      const Icon = mod[iconName];
      if (typeof Icon !== 'function') {
        throw new Error(`Icon "${iconName}" not found in lucide-react.`);
      }
      return { default: Icon };
    }), {
      loading: () => <span className={sizeClass} />,
      ssr: false
    }
  );
}

/**
 * Formats phone number as user types
 * @param {string} value - Raw phone input
 * @returns {string} Formatted phone number
 */


/**
 * Validates if phone number is valid
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} Is valid phone number
 */
export const validatePhoneNumber = (phoneNumber) => {
  // Remove all non-numeric characters for validation
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if empty
  if (!cleaned) {
    return false;
  }
  
  // US phone number validation (10 or 11 digits)
  if (cleaned.length === 10) {
    // Valid US number without country code
    // Area code cannot start with 0 or 1
    return /^[2-9]\d{9}$/.test(cleaned);
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // Valid US number with country code
    // Second digit (area code) cannot be 0 or 1
    return /^1[2-9]\d{9}$/.test(cleaned);
  }
  
  // International phone number validation
  // Most international numbers are between 7 and 15 digits
  if (cleaned.length >= 7 && cleaned.length <= 15) {
    // Basic international validation
    // Should not start with 0 (that's usually for domestic calls)
    return /^[1-9]\d{6,14}$/.test(cleaned);
  }
  
  return false;
}

/**
 * Checks password strength and returns detailed analysis
 * @param {string} password - Password to check
 * @returns {Object} Strength analysis with score, feedback, and validity
 */
export const checkPasswordStrength = (password) => {
  let score = 0;
  const feedback = [];
  
  // Check if password exists
  if (!password) {
    return {
      score: 0,
      strength: 'none',
      feedback: ['Password is required'],
      percentage: 0,
      isValid: false
    };
  }
  
  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use at least 8 characters');
  }
  
  if (password.length >= 12) {
    score += 1;
  }
  
  // Uppercase letter check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one uppercase letter');
  }
  
  // Lowercase letter check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one lowercase letter');
  }
  
  // Number check
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one number');
  }
  
  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one special character (!@#$%^&*)');
  }
  
  // Common patterns check (negative scoring)
  const commonPatterns = [
    /12345/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /111111/,
    /123123/,
    /admin/i,
    /letmein/i,
    /welcome/i,
    /monkey/i,
    /dragon/i
  ];
  
  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
  if (hasCommonPattern) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns and words');
  }
  
  // Sequential characters check
  const hasSequential = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
  if (hasSequential) {
    score = Math.max(0, score - 1);
    feedback.push('Avoid sequential characters');
  }
  
  // Repeated characters check
  const hasRepeated = /(.)\1{2,}/.test(password);
  if (hasRepeated) {
    score = Math.max(0, score - 1);
    feedback.push('Avoid repeated characters');
  }
  
  // Determine strength label
  let strength;
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 3) {
    strength = 'fair';
  } else if (score <= 4) {
    strength = 'good';
  } else {
    strength = 'strong';
  }
  
  // Calculate percentage (max score is 6)
  const percentage = Math.min(100, Math.round((score / 6) * 100));
  
  return {
    score: Math.min(4, Math.max(0, Math.round(score * 0.67))), // Normalize to 0-4 scale
    strength,
    percentage,
    feedback: feedback.length > 0 ? feedback : ['Password is strong'],
    isValid: score >= 3 // Minimum acceptable score
  };
}

export const PasswordStrength = ({ password }) => {
  const strength = checkPasswordStrength(password)
  const requirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
    { met: /[^A-Za-z0-9]/.test(password), text: 'One special character' }
  ]

  return (
    <AnimatePresence>
      {password && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 space-y-2"
        >
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < strength.score
                    ? strength.score <= 1 ? 'bg-red-500'
                    : strength.score <= 2 ? 'bg-yellow-500'
                    : strength.score <= 3 ? 'bg-blue-500'
                    : 'bg-green-500'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="space-y-1">
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {req.met ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <X className="w-3 h-3 text-gray-500" />
                )}
                <span className={req.met ? 'text-green-500' : 'text-gray-500'}>
                  {req.text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
