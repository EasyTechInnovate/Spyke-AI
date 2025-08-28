'use client'

import { useState, useEffect } from 'react'
import { X, Save, User, Mail, MapPin, Globe, Clock, Briefcase, FileText, ExternalLink, Plus, Trash2, Loader2, AlertCircle, Phone } from 'lucide-react'
import { leagueSpartan } from '@/lib/fonts'
import { validatePhone, formatPhone, countryCodes } from '@/lib/utils/utils'

const SOCIAL_PLATFORMS = [
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
    { key: 'twitter', label: 'Twitter', placeholder: 'twitter.com/username' },
    { key: 'instagram', label: 'Instagram', placeholder: 'instagram.com/username' },
    { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/channel/...' }
]

const AVAILABLE_NICHES = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Digital Marketing',
    'Content Writing',
    'SEO/SEM',
    'Social Media Marketing',
    'E-commerce',
    'Data Analysis',
    'Graphic Design',
    'Video Editing',
    'Photography',
    'Branding',
    'Copywriting',
    'Lead Generation',
    'Email Marketing'
]

const AVAILABLE_TOOLS = [
    'React',
    'Node.js',
    'Python',
    'JavaScript',
    'TypeScript',
    'Figma',
    'Adobe Creative Suite',
    'Google Analytics',
    'WordPress',
    'Shopify',
    'MongoDB',
    'PostgreSQL',
    'AWS',
    'Google Cloud',
    'Azure',
    'Docker'
]

const COUNTRIES = [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'India',
    'Singapore',
    'Japan',
    'Netherlands',
    'Sweden',
    'Switzerland',
    'Brazil',
    'Mexico',
    'Spain',
    'Italy',
    'Other'
]

const TIMEZONES = [
    'UTC-12:00',
    'UTC-11:00',
    'UTC-10:00',
    'UTC-09:00',
    'UTC-08:00',
    'UTC-07:00',
    'UTC-06:00',
    'UTC-05:00',
    'UTC-04:00',
    'UTC-03:00',
    'UTC-02:00',
    'UTC-01:00',
    'UTC+00:00',
    'UTC+01:00',
    'UTC+02:00',
    'UTC+03:00',
    'UTC+04:00',
    'UTC+05:00',
    'UTC+05:30',
    'UTC+06:00',
    'UTC+07:00',
    'UTC+08:00',
    'UTC+09:00',
    'UTC+10:00',
    'UTC+11:00',
    'UTC+12:00'
]

export default function ProfileEditModal({ seller, isOpen, onClose, onSave, loading = false }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        bio: '',
        tagline: '',
        phone: {
            countryCode: '+1',
            number: ''
        },
        location: {
            country: '',
            timezone: ''
        },
        websiteUrl: '',
        socialHandles: {
            linkedin: '',
            twitter: '',
            instagram: '',
            youtube: ''
        },
        niches: [],
        toolsSpecialization: [],
        portfolioLinks: []
    })

    const [errors, setErrors] = useState({})
    const [newPortfolioLink, setNewPortfolioLink] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (seller && isOpen) {
            setFormData({
                fullName: seller.fullName || '',
                email: seller.email || '',
                bio: seller.bio || '',
                tagline: seller.tagline || '',
                phone: {
                    countryCode: seller.phone?.countryCode || '+1',
                    number: seller.phone?.number || ''
                },
                location: {
                    country: seller.location?.country || '',
                    timezone: seller.location?.timezone || ''
                },
                websiteUrl: seller.websiteUrl || '',
                socialHandles: {
                    linkedin: seller.socialHandles?.linkedin || '',
                    twitter: seller.socialHandles?.twitter || '',
                    instagram: seller.socialHandles?.instagram || '',
                    youtube: seller.socialHandles?.youtube || ''
                },
                niches: seller.niches || [],
                toolsSpecialization: seller.toolsSpecialization || [],
                portfolioLinks: seller.portfolioLinks || []
            })
            setErrors({})
        }
    }, [seller, isOpen])

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.')
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: value
            }))
        }
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }))
        }
    }

    const handlePhoneNumberChange = (value) => {
        const formatted = formatPhone(value, formData.phone.countryCode)
        handleInputChange('phone.number', formatted)
    }

    const handleArrayFieldChange = (field, values) => {
        setFormData((prev) => ({
            ...prev,
            [field]: values
        }))
    }

    const addPortfolioLink = () => {
        if (newPortfolioLink.trim()) {
            const updatedLinks = [...formData.portfolioLinks, newPortfolioLink.trim()]
            setFormData((prev) => ({ ...prev, portfolioLinks: updatedLinks }))
            setNewPortfolioLink('')
        }
    }

    const removePortfolioLink = (index) => {
        const updatedLinks = formData.portfolioLinks.filter((_, i) => i !== index)
        setFormData((prev) => ({ ...prev, portfolioLinks: updatedLinks }))
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        // Validate phone number if provided
        if (formData.phone.number && !validatePhone(formData.phone.number, formData.phone.countryCode)) {
            newErrors.phone = 'Please enter a valid phone number'
        }

        if (formData.websiteUrl && !isValidUrl(formData.websiteUrl)) {
            newErrors.websiteUrl = 'Please enter a valid URL'
        }

        // Validate social handles
        Object.keys(formData.socialHandles).forEach((platform) => {
            const value = formData.socialHandles[platform]
            if (value && !isValidUrl(value) && !value.includes(platform === 'twitter' ? 'twitter.com' : `${platform}.com`)) {
                newErrors[`socialHandles.${platform}`] = `Please enter a valid ${platform} URL`
            }
        })

        // Validate portfolio links
        formData.portfolioLinks.forEach((link, index) => {
            if (!isValidUrl(link)) {
                newErrors[`portfolioLink_${index}`] = 'Please enter a valid URL'
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const isValidUrl = (url) => {
        try {
            new URL(url.startsWith('http') ? url : `https://${url}`)
            return true
        } catch {
            return false
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        try {
            await onSave(formData)
        } catch (error) {
            console.error('Error saving profile:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className={`${leagueSpartan.className} fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
            <div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        disabled={isSubmitting}>
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Form Content */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Basic Information */}
                        <section>
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent ${
                                            errors.fullName ? 'border-red-500' : 'border-gray-700'
                                        }`}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.fullName && (
                                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.fullName}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent ${
                                            errors.email ? 'border-red-500' : 'border-gray-700'
                                        }`}
                                        placeholder="Enter your email address"
                                    />
                                    {errors.email && (
                                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Phone Number
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.phone.countryCode}
                                        onChange={(e) => handleInputChange('phone.countryCode', e.target.value)}
                                        className="w-32 px-3 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent">
                                        {countryCodes.map((country) => (
                                            <option
                                                key={country.code}
                                                value={country.code}>
                                                {country.flag} {country.code}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        value={formData.phone.number}
                                        onChange={(e) => handlePhoneNumberChange(e.target.value)}
                                        className={`flex-1 px-4 py-3 bg-[#0a0a0a] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent ${
                                            errors.phone ? 'border-red-500' : 'border-gray-700'
                                        }`}
                                        placeholder={formData.phone.countryCode === '+1' ? '(555) 123-4567' : 'Enter phone number'}
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.phone}
                                    </p>
                                )}
                                <p className="text-gray-500 text-xs mt-1">Optional - Used for important account notifications only</p>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Professional Tagline</label>
                                <input
                                    type="text"
                                    value={formData.tagline}
                                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent"
                                    placeholder="e.g., Full-Stack Developer & UI/UX Designer"
                                    maxLength={100}
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent resize-none"
                                    placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                                    maxLength={500}
                                />
                                <p className="text-gray-500 text-xs mt-1">{formData.bio.length}/500 characters</p>
                            </div>
                        </section>

                        {/* Location & Timezone */}
                        <section>
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Location & Availability
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                                    <select
                                        value={formData.location.country}
                                        onChange={(e) => handleInputChange('location.country', e.target.value)}
                                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent">
                                        <option value="">Select your country</option>
                                        {COUNTRIES.map((country) => (
                                            <option
                                                key={country}
                                                value={country}>
                                                {country}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                                    <select
                                        value={formData.location.timezone}
                                        onChange={(e) => handleInputChange('location.timezone', e.target.value)}
                                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent">
                                        <option value="">Select your timezone</option>
                                        {TIMEZONES.map((timezone) => (
                                            <option
                                                key={timezone}
                                                value={timezone}>
                                                {timezone}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Professional Information */}
                        <section>
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5" />
                                Professional Information
                            </h3>

                            {/* Niches */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Specialization Areas</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {AVAILABLE_NICHES.map((niche) => (
                                        <label
                                            key={niche}
                                            className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.niches.includes(niche)}
                                                onChange={(e) => {
                                                    const newNiches = e.target.checked
                                                        ? [...formData.niches, niche]
                                                        : formData.niches.filter((n) => n !== niche)
                                                    handleArrayFieldChange('niches', newNiches)
                                                }}
                                                className="w-4 h-4 text-[#00FF89] bg-[#0a0a0a] border-gray-600 rounded focus:ring-[#00FF89] focus:ring-2"
                                            />
                                            <span className="text-sm text-gray-300">{niche}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Tools */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Tools & Technologies</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {AVAILABLE_TOOLS.map((tool) => (
                                        <label
                                            key={tool}
                                            className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.toolsSpecialization.includes(tool)}
                                                onChange={(e) => {
                                                    const newTools = e.target.checked
                                                        ? [...formData.toolsSpecialization, tool]
                                                        : formData.toolsSpecialization.filter((t) => t !== tool)
                                                    handleArrayFieldChange('toolsSpecialization', newTools)
                                                }}
                                                className="w-4 h-4 text-[#00FF89] bg-[#0a0a0a] border-gray-600 rounded focus:ring-[#00FF89] focus:ring-2"
                                            />
                                            <span className="text-sm text-gray-300">{tool}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Contact Information */}
                        <section>
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                Contact & Links
                            </h3>

                            {/* Website */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Website URL</label>
                                <input
                                    type="url"
                                    value={formData.websiteUrl}
                                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                                    className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent ${
                                        errors.websiteUrl ? 'border-red-500' : 'border-gray-700'
                                    }`}
                                    placeholder="https://yourwebsite.com"
                                />
                                {errors.websiteUrl && (
                                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.websiteUrl}
                                    </p>
                                )}
                            </div>

                            {/* Social Handles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {SOCIAL_PLATFORMS.map((platform) => (
                                    <div key={platform.key}>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">{platform.label}</label>
                                        <input
                                            type="url"
                                            value={formData.socialHandles[platform.key]}
                                            onChange={(e) => handleInputChange(`socialHandles.${platform.key}`, e.target.value)}
                                            className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent ${
                                                errors[`socialHandles.${platform.key}`] ? 'border-red-500' : 'border-gray-700'
                                            }`}
                                            placeholder={`https://${platform.placeholder}`}
                                        />
                                        {errors[`socialHandles.${platform.key}`] && (
                                            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors[`socialHandles.${platform.key}`]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Portfolio Links */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio Links</label>

                                {/* Existing links */}
                                <div className="space-y-2 mb-3">
                                    {formData.portfolioLinks.map((link, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2">
                                            <input
                                                type="url"
                                                value={link}
                                                onChange={(e) => {
                                                    const updatedLinks = [...formData.portfolioLinks]
                                                    updatedLinks[index] = e.target.value
                                                    setFormData((prev) => ({ ...prev, portfolioLinks: updatedLinks }))
                                                }}
                                                className={`flex-1 px-4 py-2 bg-[#0a0a0a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent ${
                                                    errors[`portfolioLink_${index}`] ? 'border-red-500' : 'border-gray-700'
                                                }`}
                                                placeholder="https://portfolio-link.com"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePortfolioLink(index)}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add new link */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="url"
                                        value={newPortfolioLink}
                                        onChange={(e) => setNewPortfolioLink(e.target.value)}
                                        className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent"
                                        placeholder="Add a new portfolio link..."
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                addPortfolioLink()
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={addPortfolioLink}
                                        className="p-2 bg-[#00FF89] text-black rounded-lg hover:bg-[#00FF89]/90 transition-colors"
                                        disabled={!newPortfolioLink.trim()}>
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-800 p-6">
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
                                disabled={isSubmitting}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-3 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
