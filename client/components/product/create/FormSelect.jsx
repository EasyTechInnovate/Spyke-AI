import React from 'react'

const FormSelect = ({ 
  label, 
  required = false, 
  value, 
  onChange, 
  options, 
  placeholder = 'Select option',
  icon: Icon 
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {required && <span className="text-[#00FF89]">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
)

export default FormSelect
