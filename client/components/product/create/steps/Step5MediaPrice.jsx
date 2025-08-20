import React from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Image, Video, Tag, Plus, X } from 'lucide-react'
import FormInput from '../inputs/FormInput'

const Step5MediaPrice = ({ formData, handleInputChange, handleArrayFieldChange, addArrayFieldItem, removeArrayFieldItem }) => {
    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Media & Pricing</h2>
                <p className="text-gray-400">Make your product visually appealing and set the right price</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pricing Section */}
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">💰 Pricing Strategy</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Product Price"
                                required
                                type="number"
                                placeholder="99.00"
                                value={formData.price}
                                onChange={(value) => handleInputChange('price', value)}
                                icon={DollarSign}
                                description="Your product's selling price in USD"
                            />

                            <FormInput
                                label="Original Price (Optional)"
                                type="number"
                                placeholder="149.00"
                                value={formData.originalPrice}
                                onChange={(value) => handleInputChange('originalPrice', value)}
                                description="Show a strikethrough price to highlight savings"
                            />
                        </div>

                        {/* Price Preview */}
                        {formData.price && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-xl">
                                <p className="text-sm text-gray-400 mb-2">Price Preview:</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-[#00FF89]">${formData.price}</span>
                                    {formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(formData.price) && (
                                        <>
                                            <span className="text-lg text-gray-500 line-through">${formData.originalPrice}</span>
                                            <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                                                {Math.round((1 - parseFloat(formData.price) / parseFloat(formData.originalPrice)) * 100)}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Thumbnail Image */}
                <div className="lg:col-span-2">
                    <FormInput
                        label="Thumbnail Image URL"
                        required
                        type="url"
                        placeholder="https://example.com/product-thumbnail.jpg"
                        value={formData.thumbnail}
                        onChange={(value) => handleInputChange('thumbnail', value)}
                        icon={Image}
                        description="Main product image (recommended: 1200x800px, JPG/PNG)"
                    />

                    {/* Thumbnail Preview */}
                    {formData.thumbnail && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-4 p-4 bg-gray-900/50 border border-gray-700 rounded-xl">
                            <p className="text-sm text-gray-400 mb-3">Thumbnail Preview:</p>
                            <div className="relative w-full max-w-md mx-auto">
                                <img
                                    src={formData.thumbnail}
                                    alt="Product thumbnail"
                                    className="w-full h-48 object-cover rounded-xl border border-gray-700"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                        e.target.nextSibling.style.display = 'flex'
                                    }}
                                />
                                <div className="hidden w-full h-48 bg-gray-800 border border-gray-700 rounded-xl items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Invalid image URL</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Additional Images */}
                <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                        <Image className="w-4 h-4" />
                        Additional Product Images
                    </label>
                    <div className="space-y-3">
                        {formData.images.map((image, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full text-white text-sm font-bold flex-shrink-0 mt-2">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        value={image}
                                        onChange={(e) => handleArrayFieldChange('images', index, e.target.value)}
                                        placeholder="https://example.com/product-image.jpg"
                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeArrayFieldItem('images', index)}
                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-2">
                                    <X className="w-5 h-5" />
                                </motion.button>
                            </motion.div>
                        ))}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addArrayFieldItem('images')}
                            className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60">
                            <Plus className="w-4 h-4" />
                            Add Image
                        </motion.button>
                    </div>
                </div>

                {/* Preview Video */}
                <div className="lg:col-span-2">
                    <FormInput
                        label="Preview Video URL (Optional)"
                        type="url"
                        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                        value={formData.previewVideo}
                        onChange={(value) => handleInputChange('previewVideo', value)}
                        icon={Video}
                        description="Demo video showcasing your product (YouTube, Vimeo, etc.)"
                    />
                </div>

                {/* Tags */}
                <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                        <Tag className="w-4 h-4" />
                        Product Tags
                    </label>
                    <div className="space-y-3">
                        {formData.tags.map((tag, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full text-white text-sm font-bold flex-shrink-0 mt-2">
                                    #
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={tag}
                                        onChange={(e) => handleArrayFieldChange('tags', index, e.target.value)}
                                        placeholder="e.g., productivity, automation, ai-tools"
                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeArrayFieldItem('tags', index)}
                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-2">
                                    <X className="w-5 h-5" />
                                </motion.button>
                            </motion.div>
                        ))}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addArrayFieldItem('tags')}
                            className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60">
                            <Plus className="w-4 h-4" />
                            Add Tag
                        </motion.button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Tags help users discover your product through search</p>
                </div>

                {/* Search Keywords */}
                <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                        <Tag className="w-4 h-4" />
                        SEO Keywords
                    </label>
                    <div className="space-y-3">
                        {formData.searchKeywords.map((keyword, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full text-white text-sm font-bold flex-shrink-0 mt-2">
                                    🔍
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => handleArrayFieldChange('searchKeywords', index, e.target.value)}
                                        placeholder="e.g., lead generation automation, ChatGPT prompts"
                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeArrayFieldItem('searchKeywords', index)}
                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-2">
                                    <X className="w-5 h-5" />
                                </motion.button>
                            </motion.div>
                        ))}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addArrayFieldItem('searchKeywords')}
                            className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60">
                            <Plus className="w-4 h-4" />
                            Add Keyword
                        </motion.button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Keywords improve search engine visibility and internal search results</p>
                </div>
            </div>
        </div>
    )
}

export default Step5MediaPrice

