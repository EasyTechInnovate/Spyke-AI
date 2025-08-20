import React from 'react'

const FormInput = ({ label, required = false, type = 'text', placeholder, value, onChange, description, icon: Icon, ...props }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            {Icon && <Icon className="w-4 h-4" />}
            {label}
            {required && <span className="text-[#00FF89]">*</span>}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
            {...props}
        />
        {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
)

export default FormInput

