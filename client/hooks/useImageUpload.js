import { useState } from 'react'
import apiClient from '@/lib/api/client'

/**
 * Generic image upload hook
 * @param {Object} options - Configuration options
 * @param {string} options.category - Upload category for organization (e.g., 'seller-banners', 'profile-images')
 * @param {number} options.maxSize - Max file size in MB (default: 5)
 * @param {string[]} options.acceptedFormats - Accepted file formats (default: image formats)
 * @param {function} options.onSuccess - Success callback with URL
 * @param {function} options.onError - Error callback
 * @returns {Object} Upload state and functions
 */
export const useImageUpload = (options = {}) => {
    const {
        category = 'images',
        maxSize = 5,
        acceptedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        onSuccess,
        onError
    } = options

    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [uploadedUrl, setUploadedUrl] = useState(null)
    const [error, setError] = useState(null)

    const validateFile = (file) => {
        if (!file) {
            throw new Error('No file selected')
        }

        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            throw new Error(`File size must be less than ${maxSize}MB`)
        }

        // Check file format
        const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`
        if (!acceptedFormats.includes(fileExtension)) {
            throw new Error(`Invalid file format. Accepted formats: ${acceptedFormats.join(', ')}`)
        }

        return true
    }

    const uploadImage = async (file) => {
        try {
            setUploading(true)
            setProgress(0)
            setError(null)

            // Validate file
            validateFile(file)

            // Create progress simulation
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return prev
                    }
                    return prev + 10
                })
            }, 200)

            // Prepare form data
            const formData = new FormData()
            formData.append('file', file)
            formData.append('category', category)

            // Upload file using existing API
            const result = await apiClient.upload('v1/upload/file', formData)

            clearInterval(progressInterval)
            setProgress(100)

            if (result?.success && result?.data) {
                setUploadedUrl(result.data)
                
                // Call success callback if provided
                if (onSuccess) {
                    onSuccess(result.data, file)
                }
                
                return result.data
            } else {
                throw new Error(result?.message || 'Upload failed')
            }
        } catch (err) {
            const errorMessage = err.message || 'Failed to upload image'
            setError(errorMessage)
            
            // Call error callback if provided
            if (onError) {
                onError(errorMessage, err)
            }
            
            throw err
        } finally {
            setUploading(false)
            // Reset progress after a delay
            setTimeout(() => setProgress(0), 1000)
        }
    }

    const reset = () => {
        setUploading(false)
        setProgress(0)
        setUploadedUrl(null)
        setError(null)
    }

    return {
        uploading,
        progress,
        uploadedUrl,
        error,
        uploadImage,
        reset,
        // Utility functions
        validateFile: (file) => {
            try {
                validateFile(file)
                return true
            } catch (err) {
                return false
            }
        }
    }
}