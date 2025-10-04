import { useState, useCallback } from 'react'
import { sellerAPI } from '@/lib/api/seller'
import apiClient from '@/lib/api/client'

export const useSellerSettings = () => {
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const updateProfile = useCallback(async (data) => {
        setLoading(true)
        try {
            const result = await sellerAPI.updateProfile(data)
            return { success: true, data: result }
        } catch (error) {
            console.error('Profile update error:', error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    // Upload file function - using your existing upload endpoint
    const uploadFile = useCallback(async (file, options = {}) => {
        setUploading(true)
        setUploadProgress(0)
        try {
            const formData = new FormData()
            formData.append('file', file)
            if (options.category) formData.append('category', options.category)

            // Use backend upload endpoint via apiClient (consistent with rest of app)
            const result = await apiClient.upload('v1/upload/file', formData)
            setUploadProgress(100)
            return { success: true, data: result }
        } catch (error) {
            console.error('File upload error:', error)
            return {
                success: false,
                error: error.message || 'Failed to upload file'
            }
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }, [])

    // Upload profile image and update profile
    const updateProfileImage = useCallback(async (file) => {
        const uploadResult = await uploadFile(file, { category: 'seller-profile' })
        if (!uploadResult.success) {
            return uploadResult
        }

        const profileResult = await updateProfile({
            profileImage: uploadResult.data.url || uploadResult.data.fileUrl || uploadResult.data.data?.url
        })
        return profileResult
    }, [uploadFile, updateProfile])

    // Upload banner and update profile
    const updateBanner = useCallback(async (file) => {
        const uploadResult = await uploadFile(file, { category: 'seller-banners' })
        if (!uploadResult.success) {
            return uploadResult
        }

        const profileResult = await updateProfile({
            sellerBanner: uploadResult.data.url || uploadResult.data.fileUrl || uploadResult.data.data?.url
        })
        return profileResult
    }, [uploadFile, updateProfile])

    // Update payout information
    const updatePayoutInfo = useCallback(async (payoutData) => {
        setLoading(true)
        try {
            const result = await sellerAPI.updatePayoutInfo({ payoutInfo: payoutData })
            return { success: true, data: result }
        } catch (error) {
            console.error('Payout update error:', error)
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to update payout information'
            }
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        loading,
        uploading,
        uploadProgress,
        updateProfile,
        uploadFile,
        updateProfileImage,
        updateBanner,
        updatePayoutInfo
    }
}

export default useSellerSettings