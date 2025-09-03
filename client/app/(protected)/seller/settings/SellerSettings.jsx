'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User,
    CreditCard,
    Package,
    FileText,
    Shield,
    Bell,
    Settings,
    Upload,
    Save,
    X,
    Plus,
    AlertCircle,
    Camera,
    Edit3
} from 'lucide-react'
import { useSellerProfile } from '@/hooks/useSellerProfile'
import { useSellerSettings } from '@/hooks/useSellerSettings'
import { useNotifications } from '@/hooks/useNotifications'

const SETTINGS_SECTIONS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'payment', label: 'Payment & Payouts', icon: CreditCard },
    { id: 'gigs', label: 'Gigs Management', icon: Package },
    { id: 'orders', label: 'Order History', icon: FileText },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account Management', icon: Settings }
]

export default function SellerSettings() {
    const { data: seller, loading, error, mutate } = useSellerProfile()
    const {
        updateProfile,
        updateProfileImage,
        updateBanner,
        updatePayoutInfo,
        loading: apiLoading,
        uploading,
        uploadProgress
    } = useSellerSettings()
    const { addNotification } = useNotifications()

    const [activeSection, setActiveSection] = useState('profile')
    const [formData, setFormData] = useState({})

    // Initialize form data when seller data loads
    useEffect(() => {
        if (seller) {
            setFormData({
                fullName: seller.fullName || '',
                email: seller.email || '',
                bio: seller.bio || '',
                skills: seller.niches || [],
                languages: seller.languages || [],
                websiteUrl: seller.websiteUrl || '',
                socialLinks: seller.socialHandles || {},
                profileImage: seller.profileImage || '',
                bannerImage: seller.sellerBanner || '',
                paypalEmail: seller.payoutInfo?.paypalEmail || '',
                notifications: {
                    emailNotifications: seller.settings?.emailNotifications ?? true,
                    marketingEmails: seller.settings?.marketingEmails ?? false,
                    autoApproveProducts: seller.settings?.autoApproveProducts ?? false
                }
            })
        }
    }, [seller])

    const handleSave = async (section, data = null) => {
        const dataToSave = data || formData
        let result

        try {
            switch (section) {
                case 'profile':
                    result = await updateProfile({
                        fullName: dataToSave.fullName,
                        email: dataToSave.email,
                        bio: dataToSave.bio,
                        niches: dataToSave.skills,
                        languages: dataToSave.languages,
                        websiteUrl: dataToSave.websiteUrl,
                        socialHandles: dataToSave.socialLinks,
                        profileImage: dataToSave.profileImage,
                        sellerBanner: dataToSave.bannerImage
                    })
                    break
                case 'payment':
                    result = await updatePayoutInfo({
                        method: 'paypal',
                        paypalEmail: dataToSave.paypalEmail
                    })
                    break
                case 'notifications':
                    result = await updateProfile({
                        settings: dataToSave.notifications
                    })
                    break
                default:
                    result = await updateProfile(dataToSave)
            }

            if (result.success) {
                addNotification({
                    type: 'success',
                    message: 'Settings saved successfully!'
                })
                // Refresh seller data
                mutate()
            } else {
                addNotification({
                    type: 'error',
                    message: result.error || 'Failed to save settings'
                })
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: 'An unexpected error occurred'
            })
        }
    }

    const handleFileUpload = async (file, type) => {
        let result

        if (type === 'profile') {
            result = await updateProfileImage(file)
        } else if (type === 'banner') {
            result = await updateBanner(file)
        }

        if (result.success) {
            addNotification({
                type: 'success',
                message: `${type === 'profile' ? 'Profile image' : 'Banner'} updated successfully!`
            })
            mutate() // Refresh data
        } else {
            addNotification({
                type: 'error',
                message: result.error || `Failed to update ${type} image`
            })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-700 border-t-[#00FF89] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading settings...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Unable to Load Settings</h2>
                    <p className="text-gray-400 mb-6">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <div className="border-b border-gray-800 bg-[#0f0f0f]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00FF89]/20 rounded-lg">
                            <Settings className="w-6 h-6 text-[#00FF89]" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">Seller Settings</h1>
                            <p className="text-gray-400 mt-1">Manage your account preferences and configurations</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <nav className="space-y-2">
                            {SETTINGS_SECTIONS.map((section) => {
                                const Icon = section.icon
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${activeSection === section.id
                                            ? 'bg-[#00FF89] text-black'
                                            : 'text-gray-300 hover:text-white hover:bg-[#1f1f1f]'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{section.label}</span>
                                    </button>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeSection === 'profile' && (
                                    <ProfileSettings
                                        formData={formData}
                                        setFormData={setFormData}
                                        onSave={() => handleSave('profile')}
                                        onFileUpload={handleFileUpload}
                                        saving={apiLoading}
                                        uploading={uploading}
                                        uploadProgress={uploadProgress}
                                    />
                                )}
                                {activeSection === 'payment' && (
                                    <PaymentSettings
                                        formData={formData}
                                        setFormData={setFormData}
                                        onSave={() => handleSave('payment')}
                                        saving={apiLoading}
                                    />
                                )}
                                {activeSection === 'gigs' && <GigsSettings />}
                                {activeSection === 'orders' && <OrdersSettings />}
                                {activeSection === 'security' && <SecuritySettings />}
                                {activeSection === 'notifications' && (
                                    <NotificationSettings
                                        formData={formData}
                                        setFormData={setFormData}
                                        onSave={() => handleSave('notifications')}
                                        saving={apiLoading}
                                    />
                                )}
                                {activeSection === 'account' && <AccountSettings />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Profile Settings Component
function ProfileSettings({ formData, setFormData, onSave, onFileUpload, saving, uploading, uploadProgress }) {
    const [isEditing, setIsEditing] = useState(false)
    const [originalData, setOriginalData] = useState({})
    const [hasChanges, setHasChanges] = useState(false)

    // Initialize original data when formData changes
    useEffect(() => {
        if (formData && Object.keys(formData).length > 0) {
            setOriginalData({ ...formData })
        }
    }, [formData])

    // Check for changes whenever formData updates
    useEffect(() => {
        if (Object.keys(originalData).length > 0) {
            const changes = checkForChanges(originalData, formData)
            setHasChanges(changes)
        }
    }, [formData, originalData])

    const checkForChanges = (original, current) => {
        // Compare all relevant fields
        const fieldsToCompare = [
            'fullName', 'email', 'bio', 'websiteUrl', 'profileImage', 'bannerImage'
        ]

        for (const field of fieldsToCompare) {
            if (original[field] !== current[field]) {
                return true
            }
        }

        // Compare arrays (skills, languages)
        if (JSON.stringify(original.skills || []) !== JSON.stringify(current.skills || [])) {
            return true
        }
        if (JSON.stringify(original.languages || []) !== JSON.stringify(current.languages || [])) {
            return true
        }

        // Compare social links object
        if (JSON.stringify(original.socialLinks || {}) !== JSON.stringify(current.socialLinks || {})) {
            return true
        }

        return false
    }

    const handleEdit = () => {
        setIsEditing(true)
        setOriginalData({ ...formData }) // Save current state as original
    }

    const handleCancel = () => {
        setFormData({ ...originalData }) // Restore original data
        setIsEditing(false)
        setHasChanges(false)
    }

    const handleSave = async () => {
        await onSave()
        setIsEditing(false)
        setOriginalData({ ...formData }) // Update original data after save
        setHasChanges(false)
    }

    const handleInputChange = (field, value) => {
        if (isEditing) {
            setFormData(prev => ({ ...prev, [field]: value }))
        }
    }

    const handleFileChange = async (e, type) => {
        if (!isEditing) return

        const file = e.target.files[0]
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            if (!validTypes.includes(file.type)) {
                // You'll need to add notification here
                return
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                // You'll need to add notification here
                return
            }

            await onFileUpload(file, type)
        }
    }

    const handleSkillAdd = (skill) => {
        if (isEditing && skill && !formData.skills?.includes(skill)) {
            setFormData(prev => ({
                ...prev,
                skills: [...(prev.skills || []), skill]
            }))
        }
    }

    const handleSkillRemove = (skillToRemove) => {
        if (isEditing) {
            setFormData(prev => ({
                ...prev,
                skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
            }))
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                <div className="flex items-center gap-3">
                    {!isEditing ? (
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0f0f0f] border border-gray-700 text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-4 py-2 bg-[#0f0f0f] border border-gray-700 text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !hasChanges}
                                className="flex items-center gap-2 px-4 py-2 bg-[#00FF89] text-black rounded-lg hover:bg-[#00FF89]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Profile Photo & Banner */}
            <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Photos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Photo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Profile Photo</label>
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                                {formData.profileImage ? (
                                    <img
                                        src={formData.profileImage}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#00FF89] to-blue-500 flex items-center justify-center text-2xl font-bold text-black">
                                        {formData.fullName?.charAt(0) || 'S'}
                                    </div>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="text-white text-xs">{uploadProgress}%</div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className={`flex items-center gap-2 px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white transition-colors cursor-pointer ${isEditing ? 'hover:bg-[#2a2a2a]' : 'opacity-50 cursor-not-allowed'
                                    }`}>
                                    <Camera className="w-4 h-4" />
                                    Upload Photo
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'profile')}
                                        disabled={!isEditing || uploading}
                                    />
                                </label>
                                <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Banner */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Profile Banner (Optional)</label>
                        <div className={`w-full h-20 bg-[#0f0f0f] border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden ${!isEditing ? 'opacity-50' : ''
                            }`}>
                            {formData.bannerImage ? (
                                <img
                                    src={formData.bannerImage}
                                    alt="Banner"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <label className={`flex items-center gap-2 text-sm text-gray-400 transition-colors cursor-pointer ${isEditing ? 'hover:text-white' : 'cursor-not-allowed'
                                    }`}>
                                    <Upload className="w-4 h-4" />
                                    Upload Banner
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'banner')}
                                        disabled={!isEditing || uploading}
                                    />
                                </label>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="text-white text-xs">{uploadProgress}%</div>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Recommended: 1200x400px</p>
                    </div>
                </div>
            </div>

            {/* Basic Information */}
            <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={formData.fullName || ''}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent transition-colors ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            placeholder={isEditing ? "Your full legal name" : ""}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent transition-colors ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            placeholder={isEditing ? "your@email.com" : ""}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Website URL</label>
                        <input
                            type="url"
                            value={formData.websiteUrl || ''}
                            onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent transition-colors ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            placeholder={isEditing ? "https://your-website.com" : ""}
                        />
                        {!isEditing && !formData.websiteUrl && (
                            <p className="text-sm text-gray-500 italic mt-1">No website URL provided</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bio */}
            <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Bio / About Me</h3>
                <textarea
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent resize-none transition-colors ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    placeholder={isEditing ? "Tell potential customers about yourself, your experience, and what makes you unique..." : ""}
                />
                {!isEditing && !formData.bio && (
                    <p className="text-sm text-gray-500 italic mt-2">No bio provided</p>
                )}
                {(isEditing || formData.bio) && (
                    <p className="text-xs text-gray-400 mt-2">{formData.bio?.length || 0}/500 characters</p>
                )}
            </div>

            {/* Skills & Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkillsSection
                    title="Skills / Expertise"
                    skills={formData.skills || []}
                    onAdd={handleSkillAdd}
                    onRemove={handleSkillRemove}
                    placeholder="e.g., AI Prompts, Automation, ChatGPT"
                    isEditing={isEditing}
                />
                <SkillsSection
                    title="Languages"
                    skills={formData.languages || []}
                    onAdd={(lang) => handleInputChange('languages', [...(formData.languages || []), lang])}
                    onRemove={(lang) => handleInputChange('languages', formData.languages?.filter(l => l !== lang))}
                    placeholder="e.g., English, Spanish, French"
                    isEditing={isEditing}
                />
            </div>

            {/* Social Links */}
            <SocialLinksSection
                socialLinks={formData.socialLinks || {}}
                onUpdate={(links) => handleInputChange('socialLinks', links)}
                isEditing={isEditing}
            />
        </div>
    )
}

// Skills Section Component
function SkillsSection({ title, skills, onAdd, onRemove, placeholder, isEditing }) {
    const [inputValue, setInputValue] = useState('')

    const handleAdd = () => {
        if (inputValue.trim() && isEditing) {
            onAdd(inputValue.trim())
            setInputValue('')
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAdd()
        }
    }

    return (
        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <div className="space-y-3">
                {isEditing && (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
                            placeholder={placeholder}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={!inputValue.trim()}
                            className={`p-2 bg-[#00FF89] text-black rounded-lg transition-colors ${inputValue.trim()
                                    ? 'hover:bg-[#00FF89]/90'
                                    : 'opacity-50 cursor-not-allowed'
                                }`}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#00FF89]/20 text-[#00FF89] rounded-full text-sm border border-[#00FF89]/30"
                        >
                            {skill}
                            {isEditing && (
                                <button
                                    onClick={() => onRemove(skill)}
                                    className="ml-1 hover:text-red-400 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </span>
                    ))}
                </div>

                {skills.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                        {isEditing ? `Click above to add ${title.toLowerCase()}` : `No ${title.toLowerCase()} added yet`}
                    </p>
                )}
            </div>
        </div>
    )
}

// Social Links Section
function SocialLinksSection({ socialLinks, onUpdate, isEditing }) {
    const socialPlatforms = [
        { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/your-profile' },
        { key: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/your-handle' },
        { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/your-handle' },
        { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' }
    ]

    const handleLinkChange = (platform, value) => {
        if (isEditing) {
            onUpdate({
                ...socialLinks,
                [platform]: value
            })
        }
    }

    const hasAnyLinks = socialPlatforms.some(platform => socialLinks[platform.key])

    return (
        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Social Links</h3>
            <div className="space-y-3">
                {socialPlatforms.map((platform) => (
                    <div key={platform.key}>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{platform.label}</label>
                        <input
                            type="url"
                            value={socialLinks[platform.key] || ''}
                            onChange={(e) => handleLinkChange(platform.key, e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent transition-colors ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            placeholder={isEditing ? platform.placeholder : ""}
                        />
                        {!isEditing && !socialLinks[platform.key] && (
                            <p className="text-xs text-gray-500 italic mt-1">Not provided</p>
                        )}
                    </div>
                ))}

                {!isEditing && !hasAnyLinks && (
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-500 italic">No social links added yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}