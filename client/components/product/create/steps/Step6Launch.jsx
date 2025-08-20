import React from 'react'
import { motion } from 'framer-motion'
import { Rocket, Clock, TrendingUp, Users, HelpCircle, Plus, X } from 'lucide-react'
import FormInput from '../inputs/FormInput'
import FormSelect from '../inputs/FormSelect'
import FormTextarea from '../inputs/FormTextarea'

const Step6Launch = ({ formData, handleInputChange, handleArrayFieldChange, addArrayFieldItem, removeArrayFieldItem, handleFaqChange }) => {
    const frequencyOptions = [
        { value: 'one-time', label: 'One-time use' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'ongoing', label: 'Ongoing/Daily' }
    ]

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Launch Settings</h2>
                <p className="text-gray-400">Final touches to make your product shine</p>
            </div>

            <div className="space-y-8">
                {/* Performance Metrics */}
                <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">📊 Performance Metrics</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Estimated Hours Saved"
                            type="number"
                            placeholder="10"
                            value={formData.estimatedHoursSaved}
                            onChange={(value) => handleInputChange('estimatedHoursSaved', value)}
                            icon={Clock}
                            description="How many hours per week/month does this save users?"
                        />

                        <FormInput
                            label="Key Metrics Impacted"
                            placeholder="e.g., Conversion rate, Response time, Lead quality"
                            value={formData.metricsImpacted}
                            onChange={(value) => handleInputChange('metricsImpacted', value)}
                            icon={TrendingUp}
                            description="What business metrics will this improve?"
                        />
                    </div>
                </div>

                {/* Usage Information */}
                <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">🔄 Usage Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Frequency of Use"
                            value={formData.frequencyOfUse}
                            onChange={(value) => handleInputChange('frequencyOfUse', value)}
                            options={frequencyOptions}
                            icon={Clock}
                        />

                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-300">Uses Affiliate Tools</label>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleInputChange('hasAffiliateTools', !formData.hasAffiliateTools)}
                                className={`
                  relative w-12 h-6 rounded-full transition-colors duration-300 
                  ${formData.hasAffiliateTools ? 'bg-[#00FF89]' : 'bg-gray-700'}
                `}>
                                <div
                                    className={`
                  absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300
                  ${formData.hasAffiliateTools ? 'translate-x-7' : 'translate-x-1'}
                `}
                                />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Support Information */}
                <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">🛠️ Support & Maintenance</h3>

                    <FormTextarea
                        label="Expected Support Level"
                        placeholder="Describe what kind of support you'll provide (e.g., setup help, updates, troubleshooting)..."
                        value={formData.expectedSupport}
                        onChange={(value) => handleInputChange('expectedSupport', value)}
                        rows={4}
                        icon={Users}
                        description="Help buyers understand what support they can expect"
                    />
                </div>

                {/* FAQ Section */}
                <div className="bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">❓ Frequently Asked Questions</h3>

                    <div className="space-y-6">
                        {formData.faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <h4 className="font-semibold text-white">FAQ #{index + 1}</h4>
                                    </div>
                                    {formData.faqs.length > 1 && (
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => removeArrayFieldItem('faqs', index)}
                                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                            <X className="w-5 h-5" />
                                        </motion.button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Question</label>
                                        <input
                                            type="text"
                                            value={faq.question}
                                            onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                            placeholder="e.g., How long does setup take?"
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Answer</label>
                                        <textarea
                                            value={faq.answer}
                                            onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                            placeholder="Provide a detailed answer..."
                                            rows={3}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300 resize-none"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addArrayFieldItem('faqs', { question: '', answer: '' })}
                            className="inline-flex items-center gap-2 px-6 py-4 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60">
                            <Plus className="w-5 h-5" />
                            Add FAQ
                        </motion.button>
                    </div>
                </div>

                {/* Product Summary */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">📋 Product Summary</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-400">Product Type</p>
                                <p className="text-white font-semibold capitalize">{formData.type || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Category</p>
                                <p className="text-white font-semibold">{formData.category || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Industry</p>
                                <p className="text-white font-semibold">{formData.industry || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Setup Time</p>
                                <p className="text-white font-semibold capitalize">{formData.setupTime?.replace('_', ' ') || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-400">Price</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-[#00FF89]">${formData.price || '0.00'}</p>
                                    {formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(formData.price || 0) && (
                                        <p className="text-lg text-gray-500 line-through">${formData.originalPrice}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Tools Used</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {formData.toolsUsed.length > 0 ? (
                                        formData.toolsUsed.slice(0, 3).map((tool, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded-full">
                                                {tool.name}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-white">None specified</p>
                                    )}
                                    {formData.toolsUsed.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded-full">
                                            +{formData.toolsUsed.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Benefits</p>
                                <p className="text-white">{formData.benefits.filter((b) => b).length} benefits defined</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Premium Content</p>
                                <p className="text-white">
                                    {Object.values(formData.premiumContent).some((v) => (Array.isArray(v) ? v.length > 0 : v))
                                        ? 'Configured'
                                        : 'Not configured'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-[#00FF89]/10 to-emerald-500/10 border border-[#00FF89]/20 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#00FF89] to-emerald-500 rounded-full flex items-center justify-center">
                                <Rocket className="w-4 h-4 text-black" />
                            </div>
                            <div>
                                <p className="text-white font-semibold">Ready to Launch!</p>
                                <p className="text-sm text-gray-400">Your product is configured and ready to be created</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Step6Launch
