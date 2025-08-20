import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

const ToolButton = ({ tool, formData, handleInputChange, className = '' }) => {
    const isSelected = formData.toolsUsed.some((t) => t.name === tool.label)
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
                if (isSelected) {
                    handleInputChange(
                        'toolsUsed',
                        formData.toolsUsed.filter((t) => t.name !== tool.label)
                    )
                } else {
                    handleInputChange('toolsUsed', [
                        ...formData.toolsUsed,
                        {
                            name: tool.label,
                            logo: `https://placehold.co/40x40/1f1f1f/808080?text=${encodeURIComponent(tool.label.charAt(0))}`,
                            model: '',
                            link: ''
                        }
                    ])
                }
            }}
            className={`relative p-3 border rounded-xl flex flex-col items-center gap-2 transition-all duration-300 ${isSelected ? 'bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border-[#00FF89] text-white shadow-lg shadow-[#00FF89]/20' : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800/70'} ${className}`}>
            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-[#00FF89] rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-black" />
                </motion.div>
            )}
            <span className="text-2xl">{tool.logo}</span>
            <span className="text-xs font-medium text-center leading-tight">{tool.label}</span>
        </motion.button>
    )
}

export default ToolButton

