'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Camera, MapPin, Upload, Loader2, X, Navigation, Search, Globe, Edit2, Save, XCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { authAPI } from '@/lib/api/auth'
import { useImageUpload } from '@/hooks/useImageUpload'
import { getUserLocation } from '@/lib/utils/getUserLocation'

export default function ProfileSection({ onSuccess, onError }) {
    const { user, updateProfile, checkAuthStatus } = useAuth()
    const [loading, setLoading] = useState(false)
    const [locationLoading, setLocationLoading] = useState(false)
    const [citySearch, setCitySearch] = useState('')
    const [citySearchResults, setCitySearchResults] = useState([])
    const [showCitySearch, setShowCitySearch] = useState(false)
    const [validationErrors, setValidationErrors] = useState({})
    const [isEditMode, setIsEditMode] = useState(false)

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.emailAddress || user?.email || '',
        phoneNumber: user?.phoneNumber || user?.phone || '',
        avatar: user?.avatar || user?.profilePhoto || '',
        userLocation: {
            lat: user?.userLocation?.lat || '',
            long: user?.userLocation?.long || '',
            address: user?.userLocation?.address || ''
        }
    })

    // Update profileData when user data changes
    useEffect(() => {
        setProfileData({
            name: user?.name || '',
            email: user?.emailAddress || user?.email || '',
            phoneNumber: getPhoneNumberForEditing(user?.phoneNumber || user?.phone) || '',
            avatar: user?.avatar || user?.profilePhoto || '',
            userLocation: {
                lat: user?.userLocation?.lat || '',
                long: user?.userLocation?.long || '',
                address: user?.userLocation?.address || ''
            }
        })
    }, [user])

    // Real-time validation
    const validateField = (field, value) => {
        const errors = { ...validationErrors }

        switch (field) {
            case 'name':
                if (value && value.trim().length < 2) {
                    errors.name = 'Name must be at least 2 characters'
                } else {
                    delete errors.name
                }
                break
            case 'phoneNumber':
                if (value && !/^[+]?[\d\s\-()]+$/.test(value)) {
                    errors.phoneNumber = 'Please enter a valid phone number'
                } else {
                    delete errors.phoneNumber
                }
                break
        }

        setValidationErrors(errors)
    }

    // Use the image upload hook for avatar uploads
    const {
        uploading: avatarUploading,
        progress: avatarProgress,
        uploadImage,
        error: uploadError
    } = useImageUpload({
        category: 'profile-avatars',
        maxSize: 5,
        acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
        onSuccess: (url) => {
            setProfileData((prev) => ({ ...prev, avatar: url }))
            onSuccess('Avatar uploaded successfully!')
        },
        onError: (error) => {
            onError(`Avatar upload failed: ${error}`)
        }
    })

    // Helper function to format phone number for display
    const formatPhoneNumber = (phone) => {
        if (!phone) return null

        // If it's an object with phone number properties
        if (typeof phone === 'object') {
            // Try different possible properties
            return phone.internationalNumber || phone.nationalNumber || phone.number || phone.phoneNumber || phone.phone || JSON.stringify(phone) // fallback to show the object structure for debugging
        }

        // If it's a string or number, return as is
        return phone.toString()
    }

    // Helper function to format phone number for editing
    const getPhoneNumberForEditing = (phone) => {
        if (!phone) return ''

        // If it's an object with phone number properties
        if (typeof phone === 'object') {
            return phone.internationalNumber || phone.nationalNumber || phone.number || phone.phoneNumber || phone.phone || ''
        }

        return phone.toString()
    }

    // Helper function to get current values for display
    const getCurrentValues = () => {
        // Function to get readable location from user data
        const getLocationDisplay = () => {
            // If we have coordinates, show them
            if (user?.userLocation?.lat && user?.userLocation?.long) {
                const lat = user.userLocation.lat
                const long = user.userLocation.long
                return `${lat.toFixed(4)}, ${long.toFixed(4)}`
            }
            return 'Not set'
        }

        return {
            name: user?.name || 'Not set',
            email: user?.emailAddress || user?.email || 'Not set',
            phone: formatPhoneNumber(user?.phoneNumber || user?.phone) || 'Not set',
            location: getLocationDisplay()
        }
    }

    const currentValues = getCurrentValues()

    const handleEditToggle = () => {
        if (isEditMode) {
            // Reset form data to current user values when canceling edit
            setProfileData({
                name: user?.name || '',
                email: user?.emailAddress || user?.email || '',
                phoneNumber: user?.phoneNumber || user?.phone || '',
                avatar: user?.avatar || user?.profilePhoto || '',
                userLocation: {
                    lat: user?.userLocation?.lat || '',
                    long: user?.userLocation?.long || '',
                    address: user?.userLocation?.address || ''
                }
            })
            setValidationErrors({})
            setCitySearch('')
            setCitySearchResults([])
            setShowCitySearch(false)
        }
        setIsEditMode(!isEditMode)
    }

    // Get current location using browser geolocation
    const handleGetCurrentLocation = async () => {
        setLocationLoading(true)
        try {
            const location = await getUserLocation(
                (status) => console.log('Location status:', status),
                (type, message) => (type === 'error' ? onError(message) : onSuccess(message))
            )

            if (location) {
                // Reverse geocode to get address
                const address = await reverseGeocode(location.lat, location.long)
                setProfileData((prev) => ({
                    ...prev,
                    userLocation: {
                        lat: location.lat,
                        long: location.long,
                        address: address || `${location.lat}, ${location.long}`
                    }
                }))
                onSuccess('Current location detected successfully!')
            }
        } catch (error) {
            onError('Failed to get current location. Please try searching for your city instead.')
        } finally {
            setLocationLoading(false)
        }
    }

    // Reverse geocoding to get address from lat/long
    const reverseGeocode = async (lat, lng) => {
        try {
            // Using a free geocoding service (you might want to use Google Maps API with your key)
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
            )
            const data = await response.json()
            return `${data.city || data.locality || ''}, ${data.countryName || ''}`.trim().replace(/^,|,$/, '')
        } catch (error) {
            console.error('Reverse geocoding failed:', error)
            return null
        }
    }

    // Search for cities using geocoding
    const searchCities = async (query) => {
        if (!query || query.length < 3) {
            setCitySearchResults([])
            return
        }

        try {
            // Using OpenStreetMap Nominatim API (free)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
            )
            const data = await response.json()

            const results = data.map((item) => ({
                display_name: item.display_name,
                lat: parseFloat(item.lat),
                long: parseFloat(item.lon),
                address: item.display_name
            }))

            setCitySearchResults(results)
        } catch (error) {
            console.error('City search failed:', error)
            setCitySearchResults([])
        }
    }

    // Handle city search input
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchCities(citySearch)
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [citySearch])

    // Select a city from search results
    const handleCitySelect = (city) => {
        setProfileData((prev) => ({
            ...prev,
            userLocation: {
                lat: city.lat,
                long: city.long,
                address: city.address
            }
        }))
        setCitySearch('')
        setCitySearchResults([])
        setShowCitySearch(false)
        onSuccess(`Location set to: ${city.address}`)
    }

    // Clear location
    const handleClearLocation = () => {
        setProfileData((prev) => ({
            ...prev,
            userLocation: {
                lat: '',
                long: '',
                address: ''
            }
        }))
        onSuccess('Location cleared')
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const updateData = {}

            if (profileData.name && profileData.name.trim()) {
                updateData.name = profileData.name.trim()
            }

            if (profileData.phoneNumber && profileData.phoneNumber.trim()) {
                updateData.phoneNumber = profileData.phoneNumber.trim()
            }

            if (profileData.avatar && profileData.avatar.trim()) {
                updateData.avatar = profileData.avatar.trim()
            }

            if (profileData.userLocation.lat && profileData.userLocation.long) {
                updateData.userLocation = {
                    lat: parseFloat(profileData.userLocation.lat),
                    long: parseFloat(profileData.userLocation.long),
                    address: profileData.userLocation.address
                }
            }

            const response = await authAPI.updateProfile(updateData)

            // Update the local user context if available
            if (updateProfile) {
                updateProfile(response)
            }

            // Refresh user data to get the latest from server
            if (checkAuthStatus) {
                checkAuthStatus()
            }

            setIsEditMode(false) // Exit edit mode after successful update
            onSuccess('Profile updated successfully!')
        } catch (error) {
            console.error('Profile update failed:', error)
            const message = error?.response?.data?.message || error?.data?.message || error?.message || 'Failed to update profile'
            onError(message)
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarFileSelect = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            await uploadImage(file)
        } catch (error) {
            // Error is already handled by the hook
        }

        // Clear the file input
        e.target.value = ''
    }

    const removeAvatar = () => {
        setProfileData((prev) => ({ ...prev, avatar: '' }))
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#00FF89]/10 rounded-xl flex items-center justify-center border border-[#00FF89]/20">
                        <User className="w-6 h-6 text-[#00FF89]" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#00FF89] font-league-spartan">Profile Information</h2>
                        <p className="text-gray-300 text-sm">
                            {isEditMode ? 'Update your personal details' : 'View your current profile information'}
                        </p>
                    </div>
                </div>

                {/* Edit Toggle Button */}
                <div className="flex items-center gap-2">
                    {isEditMode && (
                        <button
                            type="button"
                            onClick={handleEditToggle}
                            className="px-4 py-2 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Cancel
                        </button>
                    )}
                    {!isEditMode && (
                        <button
                            onClick={handleEditToggle}
                            className="px-4 py-2 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors flex items-center gap-2">
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Content */}
            {!isEditMode ? (
                /* Read-Only View */
                <div className="space-y-6">
                    {/* Profile Photo Display */}
                    <div className="flex items-center gap-6 p-4 bg-[#121212] rounded-xl border border-gray-700">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 rounded-2xl flex items-center justify-center text-2xl font-bold border border-[#00FF89]/20 overflow-hidden">
                            {user?.avatar || user?.profilePhoto ? (
                                <img
                                    src={user?.avatar || user?.profilePhoto}
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            ) : (
                                <span className="text-[#00FF89]">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">Profile Photo</h3>
                            <p className="text-sm text-gray-400">
                                {user?.avatar || user?.profilePhoto ? 'Profile picture set' : 'No profile picture set'}
                            </p>
                        </div>
                    </div>

                    {/* Profile Information Display */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="p-4 bg-[#121212] rounded-xl border border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <User className="w-5 h-5 text-[#00FF89]" />
                                <h3 className="font-semibold text-gray-300">Full Name</h3>
                            </div>
                            <p className={`text-lg font-medium ${currentValues.name === 'Not set' ? 'text-orange-400' : 'text-white'}`}>
                                {currentValues.name}
                            </p>
                        </div>

                        {/* Email */}
                        <div className="p-4 bg-[#121212] rounded-xl border border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Mail className="w-5 h-5 text-[#00FF89]" />
                                <h3 className="font-semibold text-gray-300">Email Address</h3>
                            </div>
                            <p className="text-lg font-medium text-white">{currentValues.email}</p>
                        </div>

                        {/* Phone */}
                        <div className="p-4 bg-[#121212] rounded-xl border border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Phone className="w-5 h-5 text-[#00FF89]" />
                                <h3 className="font-semibold text-gray-300">Phone Number</h3>
                            </div>
                            <p className={`text-lg font-medium ${currentValues.phone === 'Not set' ? 'text-orange-400' : 'text-white'}`}>
                                {currentValues.phone}
                            </p>
                        </div>

                        {/* Location */}
                        <div className="p-4 bg-[#121212] rounded-xl border border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <MapPin className="w-5 h-5 text-[#00FF89]" />
                                <h3 className="font-semibold text-gray-300">Location</h3>
                            </div>
                            <p
                                className={`text-lg font-medium ${currentValues.location === 'Not set' ? 'text-orange-400' : 'text-white'}`}
                                title={currentValues.location}>
                                {currentValues.location}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* Edit Mode - Form */
                <form
                    onSubmit={handleProfileUpdate}
                    className="space-y-6">
                    {/* Profile Photo Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Profile Photo</h3>

                        {/* Avatar Preview */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 rounded-2xl flex items-center justify-center text-2xl font-bold border border-[#00FF89]/20 overflow-hidden">
                                    {profileData.avatar ? (
                                        <img
                                            src={profileData.avatar}
                                            alt="Profile"
                                            className="w-full h-full object-cover rounded-2xl"
                                            onError={(e) => {
                                                e.target.style.display = 'none'
                                                e.target.nextSibling.style.display = 'flex'
                                            }}
                                        />
                                    ) : (
                                        <span className="text-[#00FF89]">{profileData.name.charAt(0).toUpperCase() || 'U'}</span>
                                    )}
                                </div>

                                {/* Upload Button */}
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={handleAvatarFileSelect}
                                    className="hidden"
                                    id="avatar-upload"
                                    disabled={avatarUploading}
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className={`absolute -bottom-2 -right-2 w-8 h-8 bg-[#00FF89] rounded-xl flex items-center justify-center text-black hover:bg-[#00FF89]/90 transition-colors cursor-pointer ${
                                        avatarUploading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    title="Upload profile picture">
                                    {avatarUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                </label>
                            </div>
                            <div className="flex-1">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-white">Upload Profile Picture</h4>
                                        {avatarUploading && <span className="text-sm text-[#00FF89]">Uploading {avatarProgress}%...</span>}
                                    </div>
                                    <p className="text-sm text-gray-400">Click the camera icon to upload a new profile picture from your computer</p>

                                    {/* Progress Bar */}
                                    {avatarUploading && (
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className="h-full bg-[#00FF89] transition-all duration-300 rounded-full"
                                                style={{ width: `${avatarProgress}%` }}
                                            />
                                        </div>
                                    )}

                                    {/* Upload Error */}
                                    {uploadError && (
                                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                            <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            <p className="text-sm text-red-400">{uploadError}</p>
                                        </div>
                                    )}

                                    {/* Success Message */}
                                    {profileData.avatar && !avatarUploading && (
                                        <div className="flex items-center justify-between p-3 bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Camera className="w-4 h-4 text-[#00FF89]" />
                                                <p className="text-sm text-[#00FF89]">Profile picture uploaded successfully</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeAvatar}
                                                className="p-1 hover:bg-[#00FF89]/10 rounded transition-colors"
                                                title="Remove profile picture">
                                                <X className="w-4 h-4 text-gray-400 hover:text-white" />
                                            </button>
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500">Max size: 5MB | Formats: JPG, PNG, WEBP</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name *</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => {
                                        setProfileData({ ...profileData, name: e.target.value })
                                        validateField('name', e.target.value)
                                    }}
                                    className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all"
                                    placeholder="Enter your full name"
                                />
                                {validationErrors.name && <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={profileData.email}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-400 cursor-not-allowed"
                                    placeholder="Email cannot be changed"
                                    disabled
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={profileData.phoneNumber}
                                    onChange={(e) => {
                                        setProfileData({ ...profileData, phoneNumber: e.target.value })
                                        validateField('phoneNumber', e.target.value)
                                    }}
                                    className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all"
                                    placeholder="Enter your phone number"
                                />
                                {validationErrors.phoneNumber && <p className="text-xs text-red-500 mt-1">{validationErrors.phoneNumber}</p>}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Include country code (e.g., 919876543210)</p>
                        </div>

                        {/* Location Section */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Location
                                <span className="text-xs font-normal text-gray-500 ml-2">(Optional)</span>
                            </label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={citySearch || profileData.userLocation.address}
                                        onChange={(e) => {
                                            setCitySearch(e.target.value)
                                            setProfileData((prev) => ({
                                                ...prev,
                                                userLocation: { ...prev.userLocation, address: e.target.value }
                                            }))
                                        }}
                                        onFocus={() => setShowCitySearch(true)}
                                        onBlur={() => setTimeout(() => setShowCitySearch(false), 200)}
                                        className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all"
                                        placeholder="Search for your city or enter address"
                                        aria-describedby="location-help"
                                    />
                                    {showCitySearch && citySearchResults.length > 0 && (
                                        <div
                                            className="absolute z-50 bg-[#121212] border border-gray-700 rounded-xl mt-1 w-full max-h-48 overflow-y-auto shadow-lg"
                                            role="listbox"
                                            aria-label="Location suggestions">
                                            {citySearchResults.map((result, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleCitySelect(result)}
                                                    className="p-3 hover:bg-[#00FF89]/10 cursor-pointer text-white border-b border-gray-700 last:border-b-0 transition-colors"
                                                    role="option"
                                                    tabIndex={0}>
                                                    <div className="font-medium">{result.display_name.split(',')[0]}</div>
                                                    <div className="text-xs text-gray-400">{result.display_name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={handleGetCurrentLocation}
                                        disabled={locationLoading}
                                        className="flex-1 sm:flex-none px-4 py-2.5 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        aria-describedby="location-help">
                                        {locationLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Detecting...
                                            </>
                                        ) : (
                                            <>
                                                <Navigation className="w-4 h-4" />
                                                Use Current Location
                                            </>
                                        )}
                                    </button>
                                    {profileData.userLocation.address && (
                                        <button
                                            type="button"
                                            onClick={handleClearLocation}
                                            className="px-4 py-2.5 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                                            <X className="w-4 h-4" />
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p
                                id="location-help"
                                className="text-xs text-gray-500 mt-2">
                                Used for location-based features and local recommendations
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || avatarUploading}
                            className="px-6 py-3 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </motion.div>
    )
}

