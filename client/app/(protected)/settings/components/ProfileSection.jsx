'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Camera, MapPin, Upload, Loader2, X, Navigation, Search, Globe, Edit2, Save, XCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { authAPI } from '@/lib/api/auth'
import { useImageUpload } from '@/hooks/useImageUpload'
import { getUserLocation } from '@/lib/utils/getUserLocation'
import geocodingService from '@/lib/utils/geocoding'

export default function ProfileSection({ onSuccess, onError }) {
    const { user, updateProfile, checkAuthStatus } = useAuth()
    const [loading, setLoading] = useState(false)
    const [locationLoading, setLocationLoading] = useState(false)
    const [citySearch, setCitySearch] = useState('')
    const [citySearchResults, setCitySearchResults] = useState([])
    const [showCitySearch, setShowCitySearch] = useState(false)
    const [validationErrors, setValidationErrors] = useState({})
    const [isEditMode, setIsEditMode] = useState(false)
    const [locationName, setLocationName] = useState('')
    const [loadingLocationName, setLoadingLocationName] = useState(false)
    const [avatarJustUploaded, setAvatarJustUploaded] = useState(false)

    // Phone number utility functions (defined first)
    const formatPhoneNumber = (phone) => {
        if (!phone) return null

        if (typeof phone === 'object') {
            return phone.internationalNumber || phone.nationalNumber || phone.number || phone.phoneNumber || phone.phone || 'Invalid format'
        }

        if (typeof phone === 'string') {
            return phone.trim()
        }

        return phone.toString()
    }

    const getPhoneNumberForEditing = (phone) => {
        if (!phone) return ''

        if (typeof phone === 'object') {
            if (phone.internationalNumber) {
                return phone.internationalNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '')
            }
            const phoneValue = phone.nationalNumber || phone.number || phone.phoneNumber || phone.phone || ''
            return phoneValue
                .toString()
                .replace(/\s+/g, '')
                .replace(/[^\d+]/g, '')
        }

        if (typeof phone === 'string') {
            return phone.replace(/\s+/g, '').replace(/[^\d+]/g, '')
        }

        return phone.toString()
    }

    // Profile data initialization (now can use the phone functions)
    const initializeProfileData = (userData) => ({
        name: userData?.name || '',
        email: userData?.emailAddress || userData?.email || '',
        phoneNumber: getPhoneNumberForEditing(userData?.phoneNumber || userData?.phone) || '',
        avatar: userData?.avatar || userData?.profilePhoto || '',
        userLocation: {
            lat: userData?.userLocation?.lat || '',
            long: userData?.userLocation?.long || '',
            address: userData?.userLocation?.address || ''
        }
    })

    const [profileData, setProfileData] = useState(() => initializeProfileData(user))

    useEffect(() => {
        if (user) {
            setProfileData(initializeProfileData(user))
            setAvatarJustUploaded(false)
        }
    }, [user])

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
            setAvatarJustUploaded(true)
            onSuccess('Avatar uploaded successfully!')
        },
        onError: (error) => {
            setAvatarJustUploaded(false)
            onError(`Avatar upload failed: ${error}`)
        }
    })

    const getCurrentValues = () => {
        const getLocationDisplay = () => {
            if (user?.userLocation?.lat && user?.userLocation?.long) {
                // Show loader while loading location name
                if (loadingLocationName) {
                    return 'Loading location...'
                }
                // Show location name or coordinates as fallback
                return locationName || `${user.userLocation.lat.toFixed(4)}, ${user.userLocation.long.toFixed(4)}`
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

    useEffect(() => {
        const loadLocationName = async () => {
            if (user?.userLocation?.lat && user?.userLocation?.long && !locationName && !loadingLocationName) {
                setLoadingLocationName(true)
                try {
                    const lat = user.userLocation.lat
                    const lng = user.userLocation.long
                    const address = await geocodingService.getLocationName(lat, lng)
                    if (address) {
                        setLocationName(address)
                    }
                } catch (error) {
                    console.error('Failed to get location name:', error)
                } finally {
                    setLoadingLocationName(false)
                }
            }
        }
        loadLocationName()
    }, [user, locationName, loadingLocationName])

    const currentValues = getCurrentValues()

    const handleEditToggle = () => {
        if (isEditMode) {
            setProfileData(initializeProfileData(user))
            setValidationErrors({})
            setCitySearch('')
            setCitySearchResults([])
            setShowCitySearch(false)
            setAvatarJustUploaded(false)
        }
        setIsEditMode(!isEditMode)
    }

    const handleGetCurrentLocation = async () => {
        setLocationLoading(true)
        try {
            const location = await getUserLocation(
                (status) => console.log('Location status:', status),
                (type, message) => (type === 'error' ? onError(message) : onSuccess(message))
            )
            if (location) {
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

    const reverseGeocode = async (lat, lng) => {
        try {
            return await geocodingService.getLocationName(lat, lng)
        } catch (error) {
            console.error('Reverse geocoding failed:', error)
            return null
        }
    }

    const searchCities = async (query) => {
        if (!query || query.length < 3) {
            setCitySearchResults([])
            return
        }
        try {
            const results = await geocodingService.searchPlaces(query, 5)
            setCitySearchResults(results)
        } catch (error) {
            console.error('City search failed:', error)
            setCitySearchResults([])
        }
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchCities(citySearch)
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [citySearch])

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

        if (Object.keys(validationErrors).length > 0) {
            onError('Please fix validation errors before saving')
            return
        }

        setLoading(true)
        try {
            const updateData = {}

            if (profileData.name && profileData.name.trim() && profileData.name.trim() !== user?.name) {
                updateData.name = profileData.name.trim()
            }

            if (profileData.phoneNumber && profileData.phoneNumber.trim()) {
                const cleanPhone = profileData.phoneNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '')
                const currentPhone = getPhoneNumberForEditing(user?.phoneNumber || user?.phone)

                if (cleanPhone !== currentPhone) {
                    updateData.phoneNumber = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone
                }
            }

            if (profileData.avatar && profileData.avatar.trim() && profileData.avatar.trim() !== (user?.avatar || user?.profilePhoto)) {
                updateData.avatar = profileData.avatar.trim()
            }

            if (profileData.userLocation.lat && profileData.userLocation.long) {
                const lat = parseFloat(profileData.userLocation.lat)
                const lng = parseFloat(profileData.userLocation.long)

                const currentLat = user?.userLocation?.lat
                const currentLng = user?.userLocation?.long

                if (lat !== currentLat || lng !== currentLng) {
                    updateData.userLocation = {
                        lat: lat,
                        long: lng,
                        address: profileData.userLocation.address || ''
                    }
                }
            }

            if (Object.keys(updateData).length === 0) {
                setIsEditMode(false)
                onSuccess('No changes to save')
                return
            }

            const response = await authAPI.updateProfile(updateData)

            if (checkAuthStatus) {
                await checkAuthStatus()
            }

            if (updateProfile && response) {
                updateProfile(response)
            }

            setIsEditMode(false)
            setAvatarJustUploaded(false)
            onSuccess('Profile updated successfully!')
        } catch (error) {
            console.error('Profile update failed:', error)

            let message = 'Failed to update profile'

            if (error?.response?.data?.message) {
                message = error.response.data.message
            } else if (error?.data?.message) {
                message = error.data.message
            } else if (error?.message) {
                message = error.message
            } else if (typeof error === 'string') {
                message = error
            }

            onError(message)
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarFileSelect = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setAvatarJustUploaded(false)
        try {
            await uploadImage(file)
        } catch (error) {}
        e.target.value = ''
    }

    const removeAvatar = () => {
        setProfileData((prev) => ({ ...prev, avatar: '' }))
        setAvatarJustUploaded(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-8">
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
            {!isEditMode ? (
                <div className="space-y-6">
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
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 bg-[#121212] rounded-xl border border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <User className="w-5 h-5 text-[#00FF89]" />
                                <h3 className="font-semibold text-gray-300">Full Name</h3>
                            </div>
                            <p className={`text-lg font-medium ${currentValues.name === 'Not set' ? 'text-orange-400' : 'text-white'}`}>
                                {currentValues.name}
                            </p>
                        </div>
                        <div className="p-4 bg-[#121212] rounded-xl border border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Mail className="w-5 h-5 text-[#00FF89]" />
                                <h3 className="font-semibold text-gray-300">Email Address</h3>
                            </div>
                            <p className="text-lg font-medium text-white">{currentValues.email}</p>
                        </div>
                        <div className="p-4 bg-[#121212] rounded-xl border border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Phone className="w-5 h-5 text-[#00FF89]" />
                                <h3 className="font-semibold text-gray-300">Phone Number</h3>
                            </div>
                            <p className={`text-lg font-medium ${currentValues.phone === 'Not set' ? 'text-orange-400' : 'text-white'}`}>
                                {currentValues.phone}
                            </p>
                        </div>
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
                <form
                    onSubmit={handleProfileUpdate}
                    className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Profile Photo</h3>
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
                                    {avatarUploading && (
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className="h-full bg-[#00FF89] transition-all duration-300 rounded-full"
                                                style={{ width: `${avatarProgress}%` }}
                                            />
                                        </div>
                                    )}
                                    {uploadError && (
                                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                            <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            <p className="text-sm text-red-400">{uploadError}</p>
                                        </div>
                                    )}
                                    {profileData.avatar && !avatarUploading && avatarJustUploaded && (
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
                            disabled={loading || avatarUploading || Object.keys(validationErrors).length > 0}
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

