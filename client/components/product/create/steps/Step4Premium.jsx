import React from 'react'
import { motion } from 'framer-motion'
import { Settings, FileText, MessageSquare, Upload, Zap, Video, Sparkles, Plus, X } from 'lucide-react'
import FormTextarea from '../inputs/FormTextarea'

const Step4Premium = ({
    formData,
    handlePremiumContentChange,
    handlePremiumContentArrayChange,
    addPremiumContentArrayItem,
    removePremiumContentArrayItem
}) => {
    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Premium Content</h2>
                <p className="text-gray-400">Exclusive content for buyers - this is what sets your product apart</p>
            </div>

            <div className="space-y-8">
                {/* Product Type Specific Premium Content */}
                {formData.type === 'prompt' && (
                    <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">🤖 AI Prompt Premium Content</h3>

                        <div className="space-y-6">
                            <FormTextarea
                                label="Complete Prompt Text"
                                placeholder="Enter the full, ready-to-use prompt that buyers will receive..."
                                value={formData.premiumContent.promptText}
                                onChange={(value) => handlePremiumContentChange('promptText', value)}
                                rows={8}
                                description="The actual prompt text that users will copy and use"
                                icon={FileText}
                            />

                            <FormTextarea
                                label="Prompt Usage Instructions"
                                placeholder="Detailed instructions on how to use this prompt effectively..."
                                value={formData.premiumContent.promptInstructions}
                                onChange={(value) => handlePremiumContentChange('promptInstructions', value)}
                                rows={5}
                                description="Step-by-step guide on how to get the best results"
                                icon={MessageSquare}
                            />
                        </div>
                    </div>
                )}

                {formData.type === 'automation' && (
                    <div className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border border-orange-500/20 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">⚡ Automation Premium Content</h3>

                        <div className="space-y-6">
                            <FormTextarea
                                label="Automation Setup Instructions"
                                placeholder="Detailed step-by-step instructions for setting up the automation..."
                                value={formData.premiumContent.automationInstructions}
                                onChange={(value) => handlePremiumContentChange('automationInstructions', value)}
                                rows={8}
                                description="Complete guide for implementing the automation"
                                icon={Settings}
                            />

                            {/* Automation Files */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                                    <Upload className="w-4 h-4" />
                                    Automation Files (Templates, Configs, etc.)
                                </label>
                                <div className="space-y-3">
                                    {formData.premiumContent.automationFiles.map((file, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="File name"
                                                    value={file.name || ''}
                                                    onChange={(e) => {
                                                        const updated = [...formData.premiumContent.automationFiles]
                                                        updated[index] = { ...updated[index], name: e.target.value }
                                                        handlePremiumContentChange('automationFiles', updated)
                                                    }}
                                                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89]"
                                                />
                                                <input
                                                    type="url"
                                                    placeholder="File URL"
                                                    value={file.url || ''}
                                                    onChange={(e) => {
                                                        const updated = [...formData.premiumContent.automationFiles]
                                                        updated[index] = { ...updated[index], url: e.target.value }
                                                        handlePremiumContentChange('automationFiles', updated)
                                                    }}
                                                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89]"
                                                />
                                                <select
                                                    value={file.type || ''}
                                                    onChange={(e) => {
                                                        const updated = [...formData.premiumContent.automationFiles]
                                                        updated[index] = { ...updated[index], type: e.target.value }
                                                        handlePremiumContentChange('automationFiles', updated)
                                                    }}
                                                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF89]">
                                                    <option value="">Select type</option>
                                                    <option value="json">JSON</option>
                                                    <option value="csv">CSV</option>
                                                    <option value="xml">XML</option>
                                                    <option value="txt">TXT</option>
                                                    <option value="zip">ZIP</option>
                                                </select>
                                            </div>
                                            <button
                                                onClick={() => removePremiumContentArrayItem('automationFiles', index)}
                                                className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                                                Remove File
                                            </button>
                                        </motion.div>
                                    ))}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => addPremiumContentArrayItem('automationFiles', { name: '', url: '', type: '' })}
                                        className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60">
                                        <Plus className="w-4 h-4" />
                                        Add File
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {formData.type === 'agent' && (
                    <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">🚀 AI Agent Premium Content</h3>

                        <div className="space-y-6">
                            <FormTextarea
                                label="Agent Configuration"
                                placeholder="Complete configuration settings, prompts, and parameters for the AI agent..."
                                value={formData.premiumContent.agentConfiguration}
                                onChange={(value) => handlePremiumContentChange('agentConfiguration', value)}
                                rows={8}
                                description="Full agent setup and configuration details"
                                icon={Settings}
                            />

                            {/* Agent Files */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                                    <Upload className="w-4 h-4" />
                                    Agent Files (Code, Configs, etc.)
                                </label>
                                <div className="space-y-3">
                                    {formData.premiumContent.agentFiles.map((file, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="File name"
                                                    value={file.name || ''}
                                                    onChange={(e) => {
                                                        const updated = [...formData.premiumContent.agentFiles]
                                                        updated[index] = { ...updated[index], name: e.target.value }
                                                        handlePremiumContentChange('agentFiles', updated)
                                                    }}
                                                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89]"
                                                />
                                                <input
                                                    type="url"
                                                    placeholder="File URL"
                                                    value={file.url || ''}
                                                    onChange={(e) => {
                                                        const updated = [...formData.premiumContent.agentFiles]
                                                        updated[index] = { ...updated[index], url: e.target.value }
                                                        handlePremiumContentChange('agentFiles', updated)
                                                    }}
                                                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89]"
                                                />
                                                <select
                                                    value={file.type || ''}
                                                    onChange={(e) => {
                                                        const updated = [...formData.premiumContent.agentFiles]
                                                        updated[index] = { ...updated[index], type: e.target.value }
                                                        handlePremiumContentChange('agentFiles', updated)
                                                    }}
                                                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF89]">
                                                    <option value="">Select type</option>
                                                    <option value="json">JSON</option>
                                                    <option value="py">Python</option>
                                                    <option value="js">JavaScript</option>
                                                    <option value="zip">ZIP</option>
                                                </select>
                                            </div>
                                            <button
                                                onClick={() => removePremiumContentArrayItem('agentFiles', index)}
                                                className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                                                Remove File
                                            </button>
                                        </motion.div>
                                    ))}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => addPremiumContentArrayItem('agentFiles', { name: '', url: '', type: '' })}
                                        className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60">
                                        <Plus className="w-4 h-4" />
                                        Add File
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Common Premium Content - Available for all product types */}
                <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">💎 Enhanced Premium Content</h3>

                    <div className="space-y-6">
                        {/* Detailed How It Works */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                                <Zap className="w-4 h-4" />
                                Detailed How It Works (Premium Version)
                            </label>
                            <div className="space-y-3">
                                {formData.premiumContent.detailedHowItWorks.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full text-white text-sm font-bold flex-shrink-0 mt-2">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <textarea
                                                value={step}
                                                onChange={(e) => handlePremiumContentArrayChange('detailedHowItWorks', index, e.target.value)}
                                                placeholder="Detailed step description with specific instructions..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300 resize-none"
                                            />
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => removePremiumContentArrayItem('detailedHowItWorks', index)}
                                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-2">
                                            <X className="w-5 h-5" />
                                        </motion.button>
                                    </motion.div>
                                ))}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => addPremiumContentArrayItem('detailedHowItWorks')}
                                    className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60">
                                    <Plus className="w-4 h-4" />
                                    Add Detailed Step
                                </motion.button>
                            </div>
                        </div>

                        {/* Video Tutorials */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                                <Video className="w-4 h-4" />
                                Premium Video Tutorials
                            </label>
                            <div className="space-y-3">
                                {formData.premiumContent.videoTutorials.map((video, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Video title"
                                                value={video.title || ''}
                                                onChange={(e) => {
                                                    const updated = [...formData.premiumContent.videoTutorials]
                                                    updated[index] = { ...updated[index], title: e.target.value }
                                                    handlePremiumContentChange('videoTutorials', updated)
                                                }}
                                                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89]"
                                            />
                                            <input
                                                type="url"
                                                placeholder="Video URL"
                                                value={video.url || ''}
                                                onChange={(e) => {
                                                    const updated = [...formData.premiumContent.videoTutorials]
                                                    updated[index] = { ...updated[index], url: e.target.value }
                                                    handlePremiumContentChange('videoTutorials', updated)
                                                }}
                                                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89]"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Duration (e.g., 15 min)"
                                                value={video.duration || ''}
                                                onChange={(e) => {
                                                    const updated = [...formData.premiumContent.videoTutorials]
                                                    updated[index] = { ...updated[index], duration: e.target.value }
                                                    handlePremiumContentChange('videoTutorials', updated)
                                                }}
                                                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89]"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removePremiumContentArrayItem('videoTutorials', index)}
                                            className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                                            Remove Video
                                        </button>
                                    </motion.div>
                                ))}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => addPremiumContentArrayItem('videoTutorials', { title: '', url: '', duration: '' })}
                                    className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60">
                                    <Plus className="w-4 h-4" />
                                    Add Video Tutorial
                                </motion.button>
                            </div>
                        </div>

                        {/* Bonus Content */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                                <Sparkles className="w-4 h-4" />
                                Bonus Content & Resources
                            </label>
                            <div className="space-y-3">
                                {formData.premiumContent.bonusContent.map((bonus, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                            <input
                                                type="text"
                                                placeholder="Bonus title"
                                                value={bonus.title || ''}
                                                onChange={(e) => {
                                                    const updated = [...formData.premiumContent.bonusContent]
                                                    updated[index] = { ...updated[index], title: e.target.value }
                                                    handlePremiumContentChange('bonusContent', updated)
                                                }}
                                                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89]"
                                            />
                                            <select
                                                value={bonus.type || ''}
                                                onChange={(e) => {
                                                    const updated = [...formData.premiumContent.bonusContent]
                                                    updated[index] = { ...updated[index], type: e.target.value }
                                                    handlePremiumContentChange('bonusContent', updated)
                                                }}
                                                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF89]">
                                                <option value="">Select type</option>
                                                <option value="template">Template</option>
                                                <option value="guide">Guide</option>
                                                <option value="checklist">Checklist</option>
                                                <option value="resource">Resource</option>
                                                <option value="tool">Tool</option>
                                            </select>
                                        </div>
                                        <textarea
                                            placeholder="Description"
                                            value={bonus.description || ''}
                                            onChange={(e) => {
                                                const updated = [...formData.premiumContent.bonusContent]
                                                updated[index] = { ...updated[index], description: e.target.value }
                                                handlePremiumContentChange('bonusContent', updated)
                                            }}
                                            rows={2}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] resize-none mb-3"
                                        />
                                        <input
                                            type="url"
                                            placeholder="Bonus content URL"
                                            value={bonus.url || ''}
                                            onChange={(e) => {
                                                const updated = [...formData.premiumContent.bonusContent]
                                                updated[index] = { ...updated[index], url: e.target.value }
                                                handlePremiumContentChange('bonusContent', updated)
                                            }}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89]"
                                        />
                                        <button
                                            onClick={() => removePremiumContentArrayItem('bonusContent', index)}
                                            className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                                            Remove Bonus
                                        </button>
                                    </motion.div>
                                ))}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => addPremiumContentArrayItem('bonusContent', { title: '', type: '', description: '', url: '' })}
                                    className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60">
                                    <Plus className="w-4 h-4" />
                                    Add Bonus Content
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Step4Premium

