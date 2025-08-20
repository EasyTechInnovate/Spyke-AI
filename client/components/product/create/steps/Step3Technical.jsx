import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Clock, Upload, CheckCircle2 } from 'lucide-react'
import { TOOLS, SETUP_TIMES } from '../constants'
import FormInput from '../inputs/FormInput'

// Tool Button Component
const ToolButton = ({ tool, formData, handleInputChange, className = '' }) => {
    const isSelected = formData.toolsUsed.some((t) => t.name === tool.label)

    return (
        <motion.button
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
            className={`
        relative p-3 border rounded-xl flex flex-col items-center gap-2 transition-all duration-300
        ${
            isSelected
                ? 'bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border-[#00FF89] text-white shadow-lg shadow-[#00FF89]/20'
                : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800/70'
        }
        ${className}
      `}>
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

const Step3Technical = ({ formData, handleInputChange }) => {
    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Technical Specifications</h2>
                <p className="text-gray-400">Define the tools and setup requirements</p>
            </div>

            <div className="space-y-8">
                {/* Enhanced Tools Selection */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-6">
                        <Zap className="w-4 h-4" />
                        Tools & Platforms Used <span className="text-[#00FF89]">*</span>
                    </label>

                    <div className="space-y-8">
                        {/* AI Tools */}
                        <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-6">
                            <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">🤖 AI Tools</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {TOOLS.slice(0, 4).map((tool) => (
                                    <ToolButton
                                        key={tool.value}
                                        tool={tool}
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Automation Tools */}
                        <div className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border border-orange-500/20 rounded-2xl p-6">
                            <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                ⚡ Automation Platforms
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {TOOLS.slice(4, 8).map((tool) => (
                                    <ToolButton
                                        key={tool.value}
                                        tool={tool}
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* No-Code Tools */}
                        <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-2xl p-6">
                            <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                🚀 No-Code Platforms
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {TOOLS.slice(8, 12).map((tool) => (
                                    <ToolButton
                                        key={tool.value}
                                        tool={tool}
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Business Tools */}
                        <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6">
                            <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                💼 Business & Communication
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {TOOLS.slice(12).map((tool) => (
                                    <ToolButton
                                        key={tool.value}
                                        tool={tool}
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Selected Tools Details */}
                    {formData.toolsUsed.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 space-y-4">
                            <h4 className="text-lg font-semibold text-white mb-4">Selected Tools Configuration</h4>
                            {formData.toolsUsed.map((tool, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-2xl">{TOOLS.find((t) => t.label === tool.name)?.logo}</span>
                                        <h5 className="font-semibold text-white">{tool.name}</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput
                                            label="Version/Model"
                                            placeholder="e.g., GPT-4, Pro Plan"
                                            value={tool.model || ''}
                                            onChange={(value) => {
                                                const updated = [...formData.toolsUsed]
                                                updated[index] = { ...updated[index], model: value }
                                                handleInputChange('toolsUsed', updated)
                                            }}
                                        />
                                        <FormInput
                                            label="Tool Link (Optional)"
                                            type="url"
                                            placeholder="https://..."
                                            value={tool.link || ''}
                                            onChange={(value) => {
                                                const updated = [...formData.toolsUsed]
                                                updated[index] = { ...updated[index], link: value }
                                                handleInputChange('toolsUsed', updated)
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Enhanced Setup Time */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                        <Clock className="w-4 h-4" />
                        Setup Time Estimate <span className="text-[#00FF89]">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {SETUP_TIMES.map((time) => (
                            <motion.button
                                key={time.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleInputChange('setupTime', time.value)}
                                className={`
                  relative p-4 border rounded-2xl transition-all duration-300 text-center
                  ${
                      formData.setupTime === time.value
                          ? 'bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border-[#00FF89] text-white shadow-lg shadow-[#00FF89]/20'
                          : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800/70'
                  }
                `}>
                                {formData.setupTime === time.value && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-[#00FF89] rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-black" />
                                    </motion.div>
                                )}
                                <Clock className="w-6 h-6 mx-auto mb-2" />
                                <p className="font-medium">{time.label}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Enhanced Delivery Method */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                        <Upload className="w-4 h-4" />
                        Delivery Method
                    </label>
                    <div className="space-y-4">
                        <motion.label
                            whileHover={{ scale: 1.01 }}
                            className={`
                flex items-start gap-4 p-6 border rounded-2xl cursor-pointer transition-all duration-300
                ${
                    formData.deliveryMethod === 'link'
                        ? 'bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border-[#00FF89] shadow-lg shadow-[#00FF89]/20'
                        : 'bg-gray-900/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70'
                }
              `}>
                            <input
                                type="radio"
                                name="deliveryMethod"
                                value="link"
                                checked={formData.deliveryMethod === 'link'}
                                onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                                className="mt-1 w-5 h-5 text-[#00FF89] bg-gray-800 border-gray-600 focus:ring-[#00FF89] focus:ring-2"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                        🔗
                                    </div>
                                    <h3 className="font-semibold text-white">External Link</h3>
                                </div>
                                <p className="text-sm text-gray-400">Provide a link to Notion, Make, Zapier, or any external platform</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">Most Common</span>
                                    <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">Easy Setup</span>
                                </div>
                            </div>
                        </motion.label>

                        <motion.label
                            whileHover={{ scale: 1.01 }}
                            className={`
                flex items-start gap-4 p-6 border rounded-2xl cursor-pointer transition-all duration-300
                ${
                    formData.deliveryMethod === 'file'
                        ? 'bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border-[#00FF89] shadow-lg shadow-[#00FF89]/20'
                        : 'bg-gray-900/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70'
                }
              `}>
                            <input
                                type="radio"
                                name="deliveryMethod"
                                value="file"
                                checked={formData.deliveryMethod === 'file'}
                                onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                                className="mt-1 w-5 h-5 text-[#00FF89] bg-gray-800 border-gray-600 focus:ring-[#00FF89] focus:ring-2"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                        📁
                                    </div>
                                    <h3 className="font-semibold text-white">File Download</h3>
                                </div>
                                <p className="text-sm text-gray-400">Upload files (templates, documents, code) for users to download</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full">Offline Access</span>
                                    <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">Templates</span>
                                </div>
                            </div>
                        </motion.label>

                        <motion.label
                            whileHover={{ scale: 1.01 }}
                            className={`
                flex items-start gap-4 p-6 border rounded-2xl cursor-pointer transition-all duration-300
                ${
                    formData.deliveryMethod === 'instructions'
                        ? 'bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border-[#00FF89] shadow-lg shadow-[#00FF89]/20'
                        : 'bg-gray-900/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70'
                }
              `}>
                            <input
                                type="radio"
                                name="deliveryMethod"
                                value="instructions"
                                checked={formData.deliveryMethod === 'instructions'}
                                onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                                className="mt-1 w-5 h-5 text-[#00FF89] bg-gray-800 border-gray-600 focus:ring-[#00FF89] focus:ring-2"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                        📋
                                    </div>
                                    <h3 className="font-semibold text-white">Instructions Only</h3>
                                </div>
                                <p className="text-sm text-gray-400">Provide detailed setup instructions and guidance</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">Educational</span>
                                    <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">Step-by-step</span>
                                </div>
                            </div>
                        </motion.label>
                    </div>

                    {/* Conditional Input for Link */}
                    {formData.deliveryMethod === 'link' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6">
                            <FormInput
                                label="Product Access Link"
                                type="url"
                                placeholder="https://notion.so/your-template or https://zapier.com/shared/..."
                                value={formData.embedLink}
                                onChange={(value) => handleInputChange('embedLink', value)}
                                description="Users will receive this link after purchase"
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Step3Technical

