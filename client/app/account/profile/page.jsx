'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Calendar, Shield, ArrowLeft, Settings, Edit3, Sparkles, Crown, Star } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import Container from '@/components/shared/layout/Container'
import geocodingService from '@/lib/utils/geocoding'
export default function UserProfilePage() {
    const { user } = useAuth()
    const [locationName, setLocationName] = useState('')
    const [loadingLocation, setLoadingLocation] = useState(false)
    console.log('User Data:', user)
    const getPhoneNumberDisplay = (phone) => {
        if (!phone) return 'Not provided'
        if (typeof phone === 'object') {
            if (phone.internationalNumber) return phone.internationalNumber
            return phone.nationalNumber || phone.number || 'Not provided'
        }
        return phone.toString()
    }
    const getLocationDisplay = () => {
        if (user?.userLocation?.lat && user?.userLocation?.long) {
            const lat = user.userLocation.lat
            const lng = user.userLocation.long
            return locationName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        }
        return 'Location not specified'
    }
    useEffect(() => {
        const loadLocationName = async () => {
            if (user?.userLocation?.lat && user?.userLocation?.long && !locationName && !loadingLocation) {
                setLoadingLocation(true)
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
                    setLoadingLocation(false)
                }
            }
        }
        loadLocationName()
    }, [user, locationName, loadingLocation])
    const getJoinDate = () => {
        if (user?.createdAt) {
            return new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }
        return 'Recently joined'
    }
    const getLastLoginDate = () => {
        if (user?.loginInfo?.lastLogin) {
            return new Date(user.loginInfo.lastLogin).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }
        return 'Unknown'
    }
    const getInitials = (name, email) => {
        if (name) {
            return name
                .split(' ')
                .map((word) => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        if (email) {
            return email.charAt(0).toUpperCase()
        }
        return 'U'
    }
    const getUserRole = () => {
        if (user?.roles?.includes('admin')) return { role: 'Admin', color: 'from-[#FFC050] to-yellow-400', icon: Crown }
        if (user?.roles?.includes('seller')) return { role: 'Seller', color: 'from-[#00FF89] to-[#00e67a]', icon: Star }
        return { role: 'User', color: 'from-[#00FF89] to-[#00e67a]', icon: User }
    }
    const getCountryFlag = (isoCode) => {
        const flags = {
            IN: '🇮🇳',
            US: '🇺🇸',
            GB: '🇬🇧',
            CA: '🇨🇦',
            AU: '🇦🇺',
            DE: '🇩🇪',
            FR: '🇫🇷',
            JP: '🇯🇵'
        }
        return flags[isoCode] || '🌍'
    }
    if (!user) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-[#00FF89]/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#00FF89] rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-[#9ca3af] text-lg">Loading your profile...</p>
                </motion.div>
            </div>
        )
    }
    const roleInfo = getUserRole()
    return (
        <div className="min-h-screen bg-[#121212] relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#00FF89]/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#FFC050]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#00FF89]/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>
            <main className="relative z-10 pt-8 pb-16">
                <Container>
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between mb-12">
                            <Link
                                href="/"
                                className="group flex items-center gap-3 text-[#9ca3af] hover:text-white transition-colors">
                                <div className="p-2 rounded-xl bg-[#1f1f1f]/50 group-hover:bg-[#1f1f1f] transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Back to Home</span>
                            </Link>
                        </motion.div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="relative p-8 bg-gradient-to-br from-[#1f1f1f]/90 to-[#1f1f1f]/70 backdrop-blur-xl border border-[#9ca3af]/20 rounded-3xl overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00FF89]/10 to-transparent rounded-full blur-2xl"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#FFC050]/10 to-transparent rounded-full blur-2xl"></div>
                                    <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                                            className="relative">
                                            <div className="relative w-28 h-28 md:w-32 md:h-32">
                                                <div className={`absolute inset-0 bg-gradient-to-r ${roleInfo.color} rounded-full p-1 animate-pulse`}>
                                                    <div className="w-full h-full bg-[#121212] rounded-full flex items-center justify-center overflow-hidden">
                                                        {user.avatar ? (
                                                            <img
                                                                src={user.avatar}
                                                                alt="Profile"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#00FF89] to-[#00e67a] bg-clip-text text-transparent">
                                                                {getInitials(user.name, user.emailAddress)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`absolute -bottom-2 -right-2 p-2 bg-gradient-to-r ${roleInfo.color} rounded-xl shadow-lg`}>
                                                    <roleInfo.icon className="w-4 h-4 text-[#121212]" />
                                                </div>
                                            </div>
                                        </motion.div>
                                        <div className="flex-1 text-center md:text-left">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 }}>
                                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                                    {user.name || user.emailAddress?.split('@')[0] || 'Welcome User'}
                                                </h1>
                                                <div className="flex flex-col md:flex-row items-center md:items-center gap-4 mb-4">
                                                    <span
                                                        className={`px-4 py-2 bg-gradient-to-r ${roleInfo.color} text-[#121212] text-sm font-semibold rounded-full`}>
                                                        {user.roles?.length > 1 ? `${roleInfo.role} • Multi-Role` : `${roleInfo.role} Account`}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-[#9ca3af]">
                                                        <Shield className="w-4 h-4 text-[#00FF89]" />
                                                        <span className="text-sm">{user.isActive ? 'Active Account' : 'Inactive'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-sm text-[#9ca3af]">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>Last login: {getLastLoginDate()}</span>
                                                    </div>
                                                    {user.loginInfo?.loginCount && (
                                                        <>
                                                            <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
                                                            <span className="text-[#00FF89] font-medium">{user.loginInfo.loginCount} logins</span>
                                                        </>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="grid md:grid-cols-2 gap-6">
                                    <div className="group relative p-6 bg-gradient-to-br from-[#1f1f1f]/70 to-[#1f1f1f]/50 backdrop-blur-xl border border-[#9ca3af]/20 rounded-2xl hover:border-[#00FF89]/30 transition-all duration-300">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 rounded-xl border border-[#00FF89]/20">
                                                <Mail className="w-6 h-6 text-[#00FF89]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[#9ca3af] mb-1">Email Address</p>
                                                <p className="text-lg font-semibold text-white break-all">{user.emailAddress || user.email}</p>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#00FF89]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                                    </div>
                                    <div className="group relative p-6 bg-gradient-to-br from-[#1f1f1f]/70 to-[#1f1f1f]/50 backdrop-blur-xl border border-[#9ca3af]/20 rounded-2xl hover:border-[#FFC050]/30 transition-all duration-300">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-gradient-to-br from-[#FFC050]/20 to-[#FFC050]/10 rounded-xl border border-[#FFC050]/20">
                                                <Phone className="w-6 h-6 text-[#FFC050]" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-[#9ca3af] mb-1">Phone Number</p>
                                                <p className="text-lg font-semibold text-white">{getPhoneNumberDisplay(user.phoneNumber)}</p>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#FFC050]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                                    </div>
                                    <div className="group relative p-6 bg-gradient-to-br from-[#1f1f1f]/70 to-[#1f1f1f]/50 backdrop-blur-xl border border-[#9ca3af]/20 rounded-2xl hover:border-[#00FF89]/30 transition-all duration-300 md:col-span-2">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 rounded-xl border border-[#00FF89]/20">
                                                <MapPin className="w-6 h-6 text-[#00FF89]" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-[#9ca3af] mb-1">Location</p>
                                                <p className="text-lg font-semibold text-white">{getLocationDisplay()}</p>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#00FF89]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                                    </div>
                                </motion.div>
                            </div>
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, x: 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="relative p-6 bg-gradient-to-br from-[#00FF89]/10 to-[#00e67a]/5 border border-[#00FF89]/20 rounded-2xl overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#00FF89]/10 rounded-full blur-xl"></div>
                                    <div className="relative">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-[#00FF89]/20 rounded-lg">
                                                <Settings className="w-5 h-5 text-[#00FF89]" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
                                        </div>
                                        <p className="text-[#9ca3af] text-sm mb-4 leading-relaxed">
                                            Want to update your information? Head over to the Settings page to edit your profile details.
                                        </p>
                                        <Link
                                            href="/settings"
                                            className="block w-full text-center py-3 bg-[#00FF89] text-[#121212] rounded-xl font-semibold hover:bg-[#00e67a] transition-colors">
                                            Open Settings
                                        </Link>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, x: 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="p-6 bg-gradient-to-br from-[#1f1f1f]/70 to-[#1f1f1f]/50 backdrop-blur-xl border border-[#9ca3af]/20 rounded-2xl">
                                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <Link
                                            href="/"
                                            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[#1f1f1f]/50 transition-colors">
                                            <User className="w-5 h-5 text-[#00FF89] group-hover:scale-110 transition-transform" />
                                            <span className="text-white font-medium">Home</span>
                                        </Link>
                                        <Link
                                            href="/explore"
                                            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[#1f1f1f]/50 transition-colors">
                                            <Sparkles className="w-5 h-5 text-[#FFC050] group-hover:scale-110 transition-transform" />
                                            <span className="text-white font-medium">Explore</span>
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[#1f1f1f]/50 transition-colors">
                                            <Settings className="w-5 h-5 text-[#00FF89] group-hover:scale-110 transition-transform" />
                                            <span className="text-white font-medium">Settings</span>
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    )
}