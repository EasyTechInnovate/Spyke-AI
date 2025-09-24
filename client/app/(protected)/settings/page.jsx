'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Container from '@/components/shared/layout/Container'
import SettingsNavigation from './components/SettingsNavigation'
import MessageAlert from './components/MessageAlert'
import ProfileSection from './components/ProfileSection'
import SecuritySection from './components/SecuritySection'

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('profile')
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('')
                setErrorMessage('')
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [successMessage, errorMessage])
    const handleSuccess = (message) => {
        setSuccessMessage(message)
        setErrorMessage('')
    }
    const handleError = (message) => {
        setErrorMessage(message)
        setSuccessMessage('')
    }
    const renderActiveSection = () => {
        const disabledSections = ['payment'];
        if (disabledSections.includes(activeSection)) {
            return (
                <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-400/10 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🚀</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Coming Soon</h3>
                        <p className="text-gray-400 mb-4">
                            This feature is currently under development and will be available in a future update.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/10 text-yellow-400 rounded-lg text-sm font-medium">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                            Stay tuned for updates
                        </div>
                    </div>
                </div>
            );
        }
        switch (activeSection) {
            case 'profile':
                return (
                    <ProfileSection
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                )
            case 'security':
                return (
                    <SecuritySection
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                )
            default:
                return (
                    <ProfileSection
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                )
        }
    }
    return (
        <div className="min-h-screen bg-[#121212] text-white">
            <Container>
                <div className="max-w-6xl mx-auto py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-league-spartan">Account Settings</h1>
                        <p className="text-gray-300 text-lg">Manage your profile, security, and preferences</p>
                    </motion.div>
                    <MessageAlert
                        successMessage={successMessage}
                        errorMessage={errorMessage}
                    />
                    <div className="grid lg:grid-cols-[280px_1fr] gap-8">
                        <SettingsNavigation
                            activeSection={activeSection}
                            onSectionChange={setActiveSection}
                        />
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6">
                            {renderActiveSection()}
                        </motion.div>
                    </div>
                </div>
            </Container>
        </div>
    )
}