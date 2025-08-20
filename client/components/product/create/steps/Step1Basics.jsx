import React from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Sparkles, Target, Tag, Users, Eye, FileText, CheckCircle2 } from 'lucide-react'
import { PRODUCT_TYPES, CATEGORIES, INDUSTRIES } from '../constants'
import FormInput from '../inputs/FormInput'
import FormSelect from '../inputs/FormSelect'
import FormTextarea from '../inputs/FormTextarea'

const Step1Basics = ({ formData, handleInputChange }) => {
    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Let's Start with the Basics</h2>
                <p className="text-gray-400">Tell us about your amazing product</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2">
                    <FormInput
                        label="Product Title"
                        required
                        placeholder="e.g., AI-Powered Lead Generation System"
                        value={formData.title}
                        onChange={(value) => handleInputChange('title', value)}
                        icon={Sparkles}
                    />
                </div>

                <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                        <Target className="w-4 h-4" />
                        Product Type <span className="text-[#00FF89]">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PRODUCT_TYPES.map((type) => (
                            <motion.button
                                key={type.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleInputChange('type', type.value)}
                                className={`
                  relative p-6 border rounded-2xl text-left transition-all duration-300
                  ${
                      formData.type === type.value
                          ? 'bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border-[#00FF89] shadow-lg shadow-[#00FF89]/20'
                          : 'bg-gray-900/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70'
                  }
                `}>
                                {formData.type === type.value && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-[#00FF89] rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-black" />
                                    </motion.div>
                                )}
                                <div className="text-3xl mb-3">{type.icon}</div>
                                <h3 className={`font-bold mb-2 ${formData.type === type.value ? 'text-white' : 'text-gray-300'}`}>{type.label}</h3>
                                <p className="text-sm text-gray-400 mb-3">{type.description}</p>
                                <div className="flex flex-wrap gap-1">
                                    {type.features.map((feature, index) => (
                                        <span
                                            key={index}
                                            className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-full">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                <FormSelect
                    label="Category"
                    required
                    value={formData.category}
                    onChange={(value) => handleInputChange('category', value)}
                    options={CATEGORIES}
                    placeholder="Select category"
                    icon={Tag}
                />

                <FormSelect
                    label="Industry"
                    required
                    value={formData.industry}
                    onChange={(value) => handleInputChange('industry', value)}
                    options={INDUSTRIES}
                    placeholder="Select industry"
                    icon={Users}
                />

                <div className="lg:col-span-2">
                    <FormTextarea
                        label="Short Description"
                        required
                        placeholder="Brief overview of your product (elevator pitch)"
                        value={formData.shortDescription}
                        onChange={(value) => handleInputChange('shortDescription', value)}
                        rows={2}
                        maxLength={200}
                        description="This appears in search results and product cards"
                        icon={Eye}
                    />
                </div>

                <div className="lg:col-span-2">
                    <FormTextarea
                        label="Full Description"
                        required
                        placeholder="Detailed description of your product, features, and value proposition..."
                        value={formData.fullDescription}
                        onChange={(value) => handleInputChange('fullDescription', value)}
                        rows={6}
                        description="Comprehensive product description for the product page"
                        icon={FileText}
                    />
                </div>
            </div>
        </div>
    )
}

export default Step1Basics

