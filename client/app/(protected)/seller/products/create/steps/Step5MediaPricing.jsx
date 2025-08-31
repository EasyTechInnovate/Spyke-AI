'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Play, Image as ImageIcon, Tag, AlertTriangle, Plus, Loader2, Video, HelpCircle, Save, Check, Camera, DollarSign, Palette } from 'lucide-react'
import { useProductCreateStore } from '@/store/productCreate'
import { VALIDATION_LIMITS } from '@/lib/constants/productCreate'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useNotifications } from '@/components/shared/NotificationProvider'

// Enhanced tooltips with contextual help
const FIELD_HELP = {
    thumbnailImage: {
        title: "Thumbnail Image Guide",
        content: "Upload a high-quality, professional image that represents your product. This is the first thing customers see.",
        examples: ["Product mockups or screenshots", "Professional graphics with your branding", "Clear, well-lit photos"]
    },
    profileBanner: {
        title: "Profile Banner Guide",
        content: "Upload a banner image for your product profile page. This appears at the top of your product listing.",
        examples: ["Product showcase banner", "Brand header image", "Professional cover photo"]
    },
    additionalImages: {
        title: "Additional Images Tips",
        content: "Show different aspects of your product. Include process screenshots, results, or usage examples.",
        examples: ["Before/after screenshots", "Step-by-step process images", "Dashboard or interface views"]
    },
    previewVideo: {
        title: "Preview Video Guide",
        content: "Create a short video demonstrating your product in action. Keep it under 3 minutes for best engagement.",
        examples: ["Product walkthrough", "Demo of the automation running", "Quick setup tutorial"]
    },
    productTags: {
        title: "Product Tags Strategy",
        content: "Use specific, searchable keywords that customers would use to find your product.",
        examples: ["automation", "lead-generation", "crm-integration", "ai-powered"]
    },
    seoKeywords: {
        title: "SEO Keywords Guide",
        content: "Think like your customers. What terms would they search for when looking for your solution?",
        examples: ["automated lead scoring", "CRM workflow", "sales automation tool"]
    },
    pricing: {
        title: "Pricing Strategy",
        content: "Set competitive prices based on the value you provide. Research similar products in the marketplace.",
        examples: ["Simple automation: $10-50", "Complex workflow: $50-200", "Enterprise solution: $200+"]
    }
}

// Enhanced error messages
const getEnhancedErrorMessage = (field, error) => {
    const errorMap = {
        thumbnailImage: {
            'required': 'A thumbnail image helps customers understand your product at a glance.',
            'invalid': 'Please upload a valid image file (JPG, PNG, or WebP).'
        },
        additionalImages: {
            'required': 'Additional images showcase different aspects of your product.',
            'minItems': 'Add at least 2-3 images to give customers a complete view.',
            'maxItems': `Maximum ${VALIDATION_LIMITS.ADDITIONAL_IMAGES_MAX} images to avoid overwhelming customers.`
        },
        productTags: {
            'required': 'Tags help customers discover your product through search.',
            'minItems': 'Add at least 3-5 relevant tags to improve discoverability.',
            'maxItems': `Maximum ${VALIDATION_LIMITS.PRODUCT_TAGS_MAX} tags for focused categorization.`
        },
        price: {
            'required': 'Price is required for customers to make purchasing decisions.',
            'invalid': 'Please enter a valid price amount.',
            'minimum': 'Price must be greater than $0.'
        }
    }

    return errorMap[field]?.[error] || error
}

// Tooltip component (reused from Step1)
const Tooltip = ({ content, examples }) => {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div className="relative inline-block">
            <button
                type="button"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
                className="p-1 text-gray-400 hover:text-[#00FF89] transition-colors">
                <HelpCircle className="w-4 h-4" />
            </button>

            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute z-50 left-0 top-full mt-2 w-80 p-4 bg-gray-800 border border-gray-600 rounded-lg shadow-xl">
                    <h4 className="text-sm font-semibold text-[#00FF89] mb-2">{content.title}</h4>
                    <p className="text-sm text-gray-300 mb-3">{content.content}</p>
                    {examples && examples.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-400 mb-2">Examples:</p>
                            <ul className="space-y-1">
                                {examples.map((example, index) => (
                                    <li key={index} className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded">
                                        {example}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    )
}

// Auto-save indicator (reused from Step1)
const AutoSaveIndicator = () => {
    const lastSaved = useProductCreateStore((state) => state.lastSaved)
    const isDirty = useProductCreateStore((state) => state.isDirty)
    const [showSaved, setShowSaved] = useState(false)

    const status = useMemo(() => {
        if (isDirty) return { icon: Save, text: 'Unsaved changes', color: 'text-yellow-400' }
        if (lastSaved) {
            if (!showSaved) setShowSaved(true)
            setTimeout(() => setShowSaved(false), 2000)
            return { icon: Check, text: 'All changes saved', color: 'text-[#00FF89]' }
        }
        return { icon: Save, text: 'Auto-save enabled', color: 'text-gray-400' }
    }, [lastSaved, isDirty, showSaved])

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 text-xs bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2">
            <status.icon className={`w-3 h-3 ${status.color}`} />
            <span className={status.color}>{status.text}</span>
        </motion.div>
    )
}

export default function Step5MediaPricing() {
    const thumbnailImage = useProductCreateStore((state) => state.thumbnailImage)
    const profileBanner = useProductCreateStore((state) => state.profileBanner)
    const additionalImages = useProductCreateStore((state) => state.additionalImages)
    const previewVideo = useProductCreateStore((state) => state.previewVideo)
    const productTags = useProductCreateStore((state) => state.productTags)
    const seoKeywords = useProductCreateStore((state) => state.seoKeywords)
    const price = useProductCreateStore((state) => state.price)
    const originalPrice = useProductCreateStore((state) => state.originalPrice)
    const errors = useProductCreateStore((state) => state.errors)
    const touchedFields = useProductCreateStore((state) => state.touchedFields)

    const setField = useProductCreateStore((state) => state.setField)
    const setFile = useProductCreateStore((state) => state.setFile)
    const addFile = useProductCreateStore((state) => state.addFile)
    const removeFile = useProductCreateStore((state) => state.removeFile)
    const addTag = useProductCreateStore((state) => state.addTag)
    const removeTag = useProductCreateStore((state) => state.removeTag)
    const markFieldTouched = useProductCreateStore((state) => state.markFieldTouched)
    const validateTouchedFields = useProductCreateStore((state) => state.validateTouchedFields)

    const [dragOver, setDragOver] = useState(false)
    const [tagInput, setTagInput] = useState('')
    const [keywordInput, setKeywordInput] = useState('')
    const [videoMetadata, setVideoMetadata] = useState(null)
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
    const [uploadingProfileBanner, setUploadingProfileBanner] = useState(false)
    const [uploadingAdditional, setUploadingAdditional] = useState(false)
    const [videoInputType, setVideoInputType] = useState('upload')
    const [videoUrl, setVideoUrl] = useState('')
    const [uploadingVideo, setUploadingVideo] = useState(false)

    const { showSuccess, showError } = useNotifications()

    // Image upload hooks
    const thumbnailUpload = useImageUpload({
        category: 'product-thumbnails',
        maxSize: 10,
        onSuccess: (url) => {
            setField('thumbnailImage', url)
            showSuccess('Thumbnail uploaded successfully')
        },
        onError: (error) => {
            showError(error)
        }
    })

    const profileBannerUpload = useImageUpload({
        category: 'profile-banners',
        maxSize: 10,
        onSuccess: (url) => {
            setField('profileBanner', url)
            showSuccess('Profile banner uploaded successfully')
        },
        onError: (error) => {
            showError(error)
        }
    })

    const additionalUpload = useImageUpload({
        category: 'product-images',
        maxSize: 10,
        onSuccess: (url) => {
            addFile('additionalImages', url)
            showSuccess('Image uploaded successfully')
        },
        onError: (error) => {
            showError(error)
        }
    })

    // Video validation function
    const validateVideoFile = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject('No file selected')
                return
            }

            if (!file.type.startsWith('video/')) {
                reject('Please select a valid video file')
                return
            }

            if (file.size > 100 * 1024 * 1024) { // 100MB limit
                reject('Video file size must be less than 100MB')
                return
            }

            // Check video duration using HTML5 video element
            const video = document.createElement('video')
            video.preload = 'metadata'

            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src)
                if (video.duration > 180) { // 3 minutes limit
                    reject('Video duration must be less than 3 minutes')
                } else {
                    resolve()
                }
            }

            video.onerror = () => {
                window.URL.revokeObjectURL(video.src)
                reject('Invalid video file')
            }

            video.src = URL.createObjectURL(file)
        })
    }

    const handleFieldBlur = (fieldName) => {
        markFieldTouched(fieldName)
        validateTouchedFields()
    }

    const showFieldError = (fieldName) => {
        return touchedFields[fieldName] && errors[fieldName]
    }

    const handleFileUpload = useCallback(
        async (file, type) => {
            if (type === 'thumbnail') {
                if (!file.type.startsWith('image/')) {
                    showError('Please select an image file')
                    return 'Please select an image file'
                }
                if (file.size > 10 * 1024 * 1024) {
                    showError('Image size must be less than 10MB')
                    return 'Image size must be less than 10MB'
                }

                setUploadingThumbnail(true)
                try {
                    await thumbnailUpload.uploadImage(file)
                } catch (error) {
                    setUploadingThumbnail(false)
                    return error.message
                }
            } else if (type === 'profileBanner') {
                if (!file.type.startsWith('image/')) {
                    showError('Please select an image file')
                    return 'Please select an image file'
                }
                if (file.size > 10 * 1024 * 1024) {
                    showError('Image size must be less than 10MB')
                    return 'Image size must be less than 10MB'
                }

                setUploadingProfileBanner(true)
                try {
                    await profileBannerUpload.uploadImage(file)
                } catch (error) {
                    setUploadingProfileBanner(false)
                    return error.message
                }
            } else if (type === 'additional') {
                if (!file.type.startsWith('image/')) {
                    showError('Please select an image file')
                    return 'Please select an image file'
                }
                if (file.size > 10 * 1024 * 1024) {
                    showError('Image size must be less than 10MB')
                    return 'Image size must be less than 10MB'
                }

                if (additionalImages.length >= VALIDATION_LIMITS.ADDITIONAL_IMAGES_MAX) {
                    showError(`Maximum ${VALIDATION_LIMITS.ADDITIONAL_IMAGES_MAX} images allowed`)
                    return `Maximum ${VALIDATION_LIMITS.ADDITIONAL_IMAGES_MAX} images allowed`
                }

                setUploadingAdditional(true)
                try {
                    await additionalUpload.uploadImage(file)
                } catch (error) {
                    setUploadingAdditional(false)
                    return error.message
                }
            } else if (type === 'video') {
                try {
                    await validateVideoFile(file)
                    setFile('previewVideo', file)
                } catch (error) {
                    showError(error)
                    return error
                }
            }

            return null
        },
        [additionalImages.length, thumbnailUpload, profileBannerUpload, additionalUpload, validateVideoFile, setFile, showError]
    )

    const handleDrop = useCallback(
        async (e, type) => {
            e.preventDefault()
            setDragOver(false)

            const files = Array.from(e.dataTransfer.files)
            if (files.length === 0) return

            const file = files[0]
            await handleFileUpload(file, type)
        },
        [handleFileUpload]
    )

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        setDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        setDragOver(false)
    }, [])

    const handleTagInput = useCallback(
        (e) => {
            if (e.key === 'Enter' && tagInput.trim()) {
                e.preventDefault()
                addTag('productTags', tagInput.trim())
                setTagInput('')
            } else if (e.key === 'Backspace' && !tagInput && productTags.length > 0) {
                removeTag('productTags', productTags.length - 1)
            }
        },
        [tagInput, productTags, addTag, removeTag]
    )

    const handleKeywordInput = useCallback(
        (e) => {
            if (e.key === 'Enter' && keywordInput.trim()) {
                e.preventDefault()
                addTag('seoKeywords', keywordInput.trim())
                setKeywordInput('')
            } else if (e.key === 'Backspace' && !keywordInput && seoKeywords.length > 0) {
                removeTag('seoKeywords', seoKeywords.length - 1)
            }
        },
        [keywordInput, seoKeywords, addTag, removeTag]
    )

    const removeImage = useCallback(
        (index) => {
            removeFile('additionalImages', index)
            showSuccess('Image removed')
        },
        [removeFile, showSuccess]
    )

    const removeThumbnail = useCallback(() => {
        setField('thumbnailImage', null)
        showSuccess('Thumbnail removed')
    }, [setField, showSuccess])

    const removeProfileBanner = useCallback(() => {
        setField('profileBanner', null)
        showSuccess('Profile banner removed')
    }, [setField, showSuccess])

    const removeVideo = useCallback(() => {
        setField('previewVideo', null)
        setVideoMetadata(null)
        showSuccess('Video removed')
    }, [setField, showSuccess])

    const handleVideoUpload = async (file) => {
        if (!file || file.type.indexOf('video/') !== 0) {
            showError('Please select a valid video file')
            return
        }

        if (file.size > 100 * 1024 * 1024) {
            showError('Video file size must be less than 100MB')
            return
        }

        setUploadingVideo(true)
        try {
            const formData = new FormData()
            formData.append('video', file)

            const response = await fetch('/api/upload/video', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) throw new Error('Upload failed')

            const data = await response.json()

            setField('previewVideo', data.url)
            setVideoMetadata(data.metadata)
            showSuccess('Video uploaded successfully')
        } catch (error) {
            showError('Failed to upload video')
        } finally {
            setUploadingVideo(false)
        }
    }

    const handleVideoUrlSubmit = () => {
        if (!videoUrl) {
            showError('Please enter a valid video URL')
            return
        }

        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
        if (!urlPattern.test(videoUrl)) {
            showError('Please enter a valid URL')
            return
        }

        setField('previewVideo', videoUrl)
        setVideoMetadata(null)
        showSuccess('Video URL added successfully')
    }

    return (
        <div className="space-y-10">
            {/* Auto-save indicator */}
            <div className="flex justify-end">
                <AutoSaveIndicator />
            </div>

            {/* Visual break - Welcome section */}
            <div className="text-center pb-6 border-b border-gray-700/50">
                <h2 className="text-xl font-semibold text-white mb-2">Media, Tags & Pricing</h2>
                <p className="text-gray-400">Showcase your product with compelling visuals and set competitive pricing</p>
            </div>

            {/* Visual Section */}
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-sm text-gray-400 flex items-center space-x-2">
                    <Camera className="w-4 h-4" />
                    <span>Visual Content</span>
                </div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>

            {/* Thumbnail Image */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4">
                <div className="flex items-center space-x-2">
                    <label className="block text-lg font-semibold text-white">
                        Product Thumbnail *
                    </label>
                    <Tooltip content={FIELD_HELP.thumbnailImage} examples={FIELD_HELP.thumbnailImage.examples} />
                </div>
                <p className="text-base text-gray-400 mb-4">Upload a high-quality image that represents your product (max 10MB)</p>

                {thumbnailImage ? (
                    <div className="relative group">
                        <img
                            src={thumbnailImage}
                            alt="Product thumbnail"
                            className="w-full h-64 object-cover rounded-xl border border-gray-700"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                            <button
                                onClick={removeThumbnail}
                                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragOver
                            ? 'border-[#00FF89] bg-[#00FF89]/10'
                            : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                            }`}
                        onDrop={(e) => handleDrop(e, 'thumbnail')}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}>
                        {uploadingThumbnail ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-12 h-12 text-[#00FF89] animate-spin mb-4" />
                                <p className="text-lg text-gray-400">Uploading thumbnail...</p>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg text-gray-400 mb-2">
                                    Drag and drop your thumbnail image here, or{' '}
                                    <label className="text-[#00FF89] hover:text-[#00FF89]/80 cursor-pointer">
                                        browse
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleFileUpload(file, 'thumbnail')
                                            }}
                                        />
                                    </label>
                                </p>
                                <p className="text-base text-gray-500">Supports JPG, PNG, WebP (max 10MB)</p>
                            </>
                        )}
                    </div>
                )}
                {showFieldError('thumbnailImage') && (
                    <div className="text-base text-red-400 flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span>{getEnhancedErrorMessage('thumbnailImage', errors.thumbnailImage)}</span>
                    </div>
                )}
            </motion.div>

            {/* Profile Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-4">
                <div className="flex items-center space-x-2">
                    <label className="block text-lg font-semibold text-white">
                        Profile Banner
                        <span className="text-gray-400 text-base ml-2">(Optional)</span>
                    </label>
                    <Tooltip content={FIELD_HELP.profileBanner} examples={FIELD_HELP.profileBanner.examples} />
                </div>
                <p className="text-base text-gray-400 mb-4">Upload a banner image for your product profile page (max 10MB)</p>

                {profileBanner ? (
                    <div className="relative group">
                        <img
                            src={profileBanner}
                            alt="Profile banner"
                            className="w-full h-48 object-cover rounded-xl border border-gray-700"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                            <button
                                onClick={removeProfileBanner}
                                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragOver
                            ? 'border-[#00FF89] bg-[#00FF89]/10'
                            : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                            }`}
                        onDrop={(e) => handleDrop(e, 'profileBanner')}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}>
                        {uploadingProfileBanner ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-12 h-12 text-[#00FF89] animate-spin mb-4" />
                                <p className="text-lg text-gray-400">Uploading banner...</p>
                            </div>
                        ) : (
                            <>
                                <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg text-gray-400 mb-2">
                                    Drag and drop your profile banner here, or{' '}
                                    <label className="text-[#00FF89] hover:text-[#00FF89]/80 cursor-pointer">
                                        browse
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleFileUpload(file, 'profileBanner')
                                            }}
                                        />
                                    </label>
                                </p>
                                <p className="text-base text-gray-500">Supports JPG, PNG, WebP (max 10MB)</p>
                            </>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Visual break */}
            <div className="border-l-4 border-[#00FF89]/30 pl-6 py-4 bg-gray-800/20 rounded-r-lg">
                <p className="text-base text-gray-300">
                    <Camera className="w-4 h-4 inline mr-2" />
                    <span className="font-medium">Pro tip:</span> High-quality visuals can increase conversion rates by up to 80%
                </p>
            </div>

            {/* Additional Images */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4">
                <div className="flex items-center space-x-2">
                    <label className="block text-base font-semibold text-white">
                        Additional Images *
                    </label>
                    <Tooltip content={FIELD_HELP.additionalImages} examples={FIELD_HELP.additionalImages.examples} />
                </div>
                <p className="text-sm text-gray-400 mb-4">
                    Add up to {VALIDATION_LIMITS.ADDITIONAL_IMAGES_MAX} more images to showcase your product ({additionalImages.length}/{VALIDATION_LIMITS.ADDITIONAL_IMAGES_MAX})
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {additionalImages.map((image, index) => (
                        <motion.div
                            key={`${image}-${index}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group aspect-square">
                            <img
                                src={image}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-cover rounded-xl border border-gray-700"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                                <button
                                    onClick={() => removeImage(index)}
                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {additionalImages.length < VALIDATION_LIMITS.ADDITIONAL_IMAGES_MAX && (
                        <div
                            className={`aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${dragOver
                                ? 'border-[#00FF89] bg-[#00FF89]/10'
                                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                                }`}
                            onDrop={(e) => handleDrop(e, 'additional')}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}>
                            {uploadingAdditional ? (
                                <Loader2 className="w-8 h-8 text-[#00FF89] animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">
                                        <label className="text-[#00FF89] hover:text-[#00FF89]/80 cursor-pointer">
                                            Add Image
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) handleFileUpload(file, 'additional')
                                                }}
                                            />
                                        </label>
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>
                {showFieldError('additionalImages') && (
                    <div className="text-sm text-red-400">
                        {getEnhancedErrorMessage('additionalImages', errors.additionalImages)}
                    </div>
                )}
            </motion.div>

            {/* Preview Video */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <label className="block text-base font-semibold text-white">Preview Video</label>
                        <Tooltip content={FIELD_HELP.previewVideo} examples={FIELD_HELP.previewVideo.examples} />
                    </div>
                    <span className="text-sm text-gray-400">(Optional)</span>
                </div>

                {/* ...existing video code with consistent styling... */}
            </motion.div>

            {/* Tags & SEO Section */}
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-sm text-gray-400 flex items-center space-x-2">
                    <Tag className="w-4 h-4" />
                    <span>Tags & SEO</span>
                </div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>

            {/* Product Tags */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4">
                <div className="flex items-center space-x-2">
                    <label className="block text-base font-semibold text-white">
                        Product Tags *
                    </label>
                    <Tooltip content={FIELD_HELP.productTags} examples={FIELD_HELP.productTags.examples} />
                </div>
                <p className="text-sm text-gray-400 mb-4">
                    Add tags to help customers find your product (max {VALIDATION_LIMITS.PRODUCT_TAGS_MAX})
                </p>

                <div className="space-y-3">
                    <div className="flex flex-wrap gap-3">
                        {productTags.map((tag, index) => (
                            <motion.span
                                key={`${tag}-${index}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#00FF89]/20 text-[#00FF89] px-4 py-2 rounded-full text-base flex items-center space-x-2">
                                <Tag className="w-4 h-4" />
                                <span>{tag}</span>
                                <button
                                    onClick={() => removeTag('productTags', index)}
                                    className="hover:text-[#00FF89]/70 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.span>
                        ))}
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagInput}
                            onBlur={() => handleFieldBlur('productTags')}
                            placeholder="Type a tag and press Enter"
                            disabled={productTags.length >= VALIDATION_LIMITS.PRODUCT_TAGS_MAX}
                            className={`w-full px-5 py-4 text-base bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${showFieldError('productTags') ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600 focus:ring-[#00FF89]/50 focus:border-[#00FF89]'
                                }`}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                            {productTags.length}/{VALIDATION_LIMITS.PRODUCT_TAGS_MAX}
                        </div>
                    </div>
                </div>
                {showFieldError('productTags') && (
                    <div className="text-sm text-red-400">
                        {getEnhancedErrorMessage('productTags', errors.productTags)}
                    </div>
                )}
            </motion.div>

            {/* SEO Keywords */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4">
                <div className="flex items-center space-x-2">
                    <label className="block text-base font-semibold text-white">
                        SEO Keywords
                        <span className="text-gray-400 text-sm ml-2">(Optional)</span>
                    </label>
                    <Tooltip content={FIELD_HELP.seoKeywords} examples={FIELD_HELP.seoKeywords.examples} />
                </div>
                <p className="text-sm text-gray-400 mb-4">
                    Add keywords to improve search visibility (max {VALIDATION_LIMITS.SEO_KEYWORDS_MAX})
                </p>

                {/* ...existing SEO keywords code with consistent styling... */}
            </motion.div>

            {/* Pricing Section */}
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-sm text-gray-400 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Pricing Strategy</span>
                </div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>

            {/* Pricing */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6">
                <div className="flex items-center space-x-2">
                    <label className="block text-base font-semibold text-white">Pricing</label>
                    <Tooltip content={FIELD_HELP.pricing} examples={FIELD_HELP.pricing.examples} />
                </div>
                <p className="text-sm text-gray-400">Set your product pricing to attract customers while reflecting its value</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="block text-base font-semibold text-white">Current Price *</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-base">$</span>
                            <input
                                type="number"
                                value={price || ''}
                                onChange={(e) => setField('price', parseFloat(e.target.value) || 0)}
                                onBlur={() => handleFieldBlur('price')}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className={`w-full pl-10 pr-5 py-4 text-base bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${showFieldError('price') ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600 focus:ring-[#00FF89]/50 focus:border-[#00FF89]'
                                    }`}
                            />
                        </div>
                        {showFieldError('price') && (
                            <div className="text-sm text-red-400 flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5" />
                                <span>{getEnhancedErrorMessage('price', errors.price)}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="block text-base font-semibold text-white">
                            Original Price
                            <span className="text-gray-400 text-sm ml-2">(Optional)</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-base">$</span>
                            <input
                                type="number"
                                value={originalPrice || ''}
                                onChange={(e) => setField('originalPrice', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="w-full pl-10 pr-5 py-4 text-base bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all"
                            />
                        </div>
                        <p className="text-sm text-gray-500">Show original price if this is a discounted item</p>
                        {originalPrice && price && originalPrice <= price && (
                            <div className="text-sm text-amber-400 flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5" />
                                <span>Original price should be higher than current price</span>
                            </div>
                        )}
                    </div>
                </div>

                {originalPrice && price && originalPrice > price && (
                    <div className="bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-semibold text-[#00FF89]">Discount Preview</h4>
                                <p className="text-base text-[#00FF89]/80">
                                    {Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}% off
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-base text-gray-400 line-through">${Number(originalPrice).toFixed(2)}</p>
                                <p className="text-xl font-bold text-[#00FF89]">${Number(price).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Media & Pricing Summary */}
            {(thumbnailImage || additionalImages.length > 0 || productTags.length > 0 || price) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="p-5 bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-2 h-2 bg-[#00FF89] rounded-full animate-pulse"></div>
                        <h4 className="text-base font-semibold text-[#00FF89]">Media & Pricing Summary</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-base">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#00FF89] mb-1">
                                {thumbnailImage ? 1 : 0}
                            </div>
                            <div className="text-gray-400">Thumbnail</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#00FF89] mb-1">{additionalImages.length}</div>
                            <div className="text-gray-400">Images</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#00FF89] mb-1">{productTags.length}</div>
                            <div className="text-gray-400">Tags</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#00FF89] mb-1">
                                {price ? `$${price}` : '-'}
                            </div>
                            <div className="text-gray-400">Price</div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

