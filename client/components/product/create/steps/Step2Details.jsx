import React from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, Lightbulb, Zap, Users, Plus, X } from 'lucide-react'
import FormInput from '../inputs/FormInput'

const Step2Details = ({ formData, handleInputChange, handleArrayFieldChange, addArrayFieldItem, removeArrayFieldItem }) => {
    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Product Details</h2>
                <p className="text-gray-400">Define your product's value and benefits</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2">
                    <FormInput
                        label="Target Audience"
                        required
                        placeholder="e.g., SaaS founders, E-commerce store owners, Digital marketers"
                        value={formData.targetAudience}
                        onChange={(value) => handleInputChange('targetAudience', value)}
                        icon={Users}
                        description="Who will benefit most from this product?"
                    />
                </div>

                {/* Enhanced Benefits Section */}
                <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                        <TrendingUp className="w-4 h-4" />
                        Key Benefits <span className="text-[#00FF89]">*</span>
                    </label>
                    <div className="space-y-3">
                        {formData.benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full text-white text-sm font-bold flex-shrink-0 mt-2">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={benefit}
                                        onChange={(e) => handleArrayFieldChange('benefits', index, e.target.value)}
                                        placeholder="e.g., Save 10+ hours per week"
                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
                                    />
                                </div>
                                {formData.benefits.length > 1 && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => removeArrayFieldItem('benefits', index)}
                                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-2">
                                        <X className="w-5 h-5" />
                                    </motion.button>
                                )}
                            </motion.div>
                        ))}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addArrayFieldItem('benefits')}
                            className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60">
                            <Plus className="w-4 h-4" />
                            Add Another Benefit
                        </motion.button>
                    </div>
                </div>

                {/* Enhanced Use Cases Section */}
                <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                        <Lightbulb className="w-4 h-4" />
                        Use Case Examples <span className="text-[#00FF89]">*</span>
                    </label>
                    <div className="space-y-3">
                        {formData.useCaseExamples.map((useCase, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full text-white text-sm font-bold flex-shrink-0 mt-2">
                                    💡
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={useCase}
                                        onChange={(e) => handleArrayFieldChange('useCaseExamples', index, e.target.value)}
                                        placeholder="e.g., Qualifying leads from website forms"
                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
                                    />
                                </div>
                                {formData.useCaseExamples.length > 1 && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => removeArrayFieldItem('useCaseExamples', index)}
                                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-2">
                                        <X className="w-5 h-5" />
                                    </motion.button>
                                )}
                            </motion.div>
                        ))}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addArrayFieldItem('useCaseExamples')}
                            className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60">
                            <Plus className="w-4 h-4" />
                            Add Use Case
                        </motion.button>
                    </div>
                </div>

                {/* Enhanced How It Works Section */}
                <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                        <Zap className="w-4 h-4" />
                        How It Works (Step-by-step)
                    </label>
                    <div className="space-y-3">
                        {formData.howItWorks.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full text-white text-sm font-bold flex-shrink-0 mt-2">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={step}
                                        onChange={(e) => handleArrayFieldChange('howItWorks', index, e.target.value)}
                                        placeholder="Describe this step..."
                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeArrayFieldItem('howItWorks', index)}
                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-2">
                                    <X className="w-5 h-5" />
                                </motion.button>
                            </motion.div>
                        ))}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addArrayFieldItem('howItWorks')}
                            className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60">
                            <Plus className="w-4 h-4" />
                            Add Step
                        </motion.button>
                    </div>
                </div>

                {/* Enhanced Outcomes Section */}
                <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                        <TrendingUp className="w-4 h-4" />
                        Expected Outcomes (KPIs)
                    </label>
                    <div className="space-y-3">
                        {formData.outcome.map((outcome, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full text-white text-sm font-bold flex-shrink-0 mt-2">
                                    📈
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={outcome}
                                        onChange={(e) => handleArrayFieldChange('outcome', index, e.target.value)}
                                        placeholder="e.g., 50% increase in lead conversion"
                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeArrayFieldItem('outcome', index)}
                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-2">
                                    <X className="w-5 h-5" />
                                </motion.button>
                            </motion.div>
                        ))}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addArrayFieldItem('outcome')}
                            className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60">
                            <Plus className="w-4 h-4" />
                            Add Outcome
                        </motion.button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">What measurable results can users expect?</p>
                </div>
            </div>
        </div>
    )
}

export default Step2Details

