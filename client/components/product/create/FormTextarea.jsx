import React from 'react'

const FormTextarea = ({ 
  label, 
  required = false, 
  placeholder, 
  value, 
  onChange, 
  rows = 3,
  maxLength,
  description,
  icon: Icon,
  ...props 
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {required && <span className="text-[#00FF89]">*</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300 resize-none"
      {...props}
    />
    {maxLength && (
      <p className="text-xs text-gray-500 text-right">
        {value.length}/{maxLength} characters
      </p>
    )}
    {description && <p className="text-xs text-gray-500">{description}</p>}
  </div>
)

export default FormTextarea
