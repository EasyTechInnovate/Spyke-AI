'use client'

import { useState } from 'react'
import toastUtils from '@/lib/utils/toast'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
import { 
    CheckCircle, 
    AlertCircle, 
    Info, 
    AlertTriangle,
    Loader2,
    Sparkles
} from 'lucide-react'

export default function ToastDemoPage() {
    const [isLoading, setIsLoading] = useState(null)

    const showSuccessToast = () => {
        toastUtils.success('🎉 Successfully completed!', {
            description: 'Your action was executed perfectly.'
        })
    }

    const showErrorToast = () => {
        toastUtils.error('Something went wrong!', {
            description: 'Please try again or contact support.'
        })
    }

    const showInfoToast = () => {
        toastUtils.info('Did you know?', {
            description: 'This is a helpful piece of information.'
        })
    }

    const showWarningToast = () => {
        toastUtils.warning('Attention required', {
            description: 'Please review this important notice.'
        })
    }

    const showLoadingToast = () => {
        const id = toastUtils.loading('Processing your request...')
        setIsLoading(id)
        
        setTimeout(() => {
            toastUtils.dismiss(id)
            toastUtils.success('Request completed!')
            setIsLoading(null)
        }, 3000)
    }

    const showPromiseToast = () => {
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() > 0.5 ? resolve('Success!') : reject('Failed!')
            }, 2000)
        })

        toastUtils.promise(promise, {
            loading: 'Working on it...',
            success: 'Operation completed successfully!',
            error: 'Operation failed, please try again.'
        })
    }

    const showMultipleToasts = () => {
        toastUtils.success('First notification')
        setTimeout(() => toastUtils.info('Second notification'), 500)
        setTimeout(() => toastUtils.warning('Third notification'), 1000)
        setTimeout(() => toastUtils.error('Fourth notification'), 1500)
    }

    return (
        <div className="min-h-screen bg-[#121212]">
            <Header />
            
            <main className="pt-24 pb-16">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                                <Sparkles className="w-8 h-8 text-[#00FF89]" />
                                Toast Notification Demo
                            </h1>
                            <p className="text-gray-400 text-lg">
                                Click the buttons below to see the new toast design in action
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Success Toast */}
                            <button
                                onClick={showSuccessToast}
                                className="group relative overflow-hidden bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 hover:border-[#00FF89]/50 transition-all duration-300"
                            >
                                <div className="relative z-10">
                                    <CheckCircle className="w-8 h-8 text-[#00FF89] mb-3" />
                                    <h3 className="text-lg font-semibold text-white mb-2">Success Toast</h3>
                                    <p className="text-sm text-gray-400">Shows a success notification</p>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00FF89]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>

                            {/* Error Toast */}
                            <button
                                onClick={showErrorToast}
                                className="group relative overflow-hidden bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 hover:border-red-500/50 transition-all duration-300"
                            >
                                <div className="relative z-10">
                                    <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
                                    <h3 className="text-lg font-semibold text-white mb-2">Error Toast</h3>
                                    <p className="text-sm text-gray-400">Shows an error notification</p>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>

                            {/* Info Toast */}
                            <button
                                onClick={showInfoToast}
                                className="group relative overflow-hidden bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300"
                            >
                                <div className="relative z-10">
                                    <Info className="w-8 h-8 text-blue-500 mb-3" />
                                    <h3 className="text-lg font-semibold text-white mb-2">Info Toast</h3>
                                    <p className="text-sm text-gray-400">Shows an informational notification</p>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>

                            {/* Warning Toast */}
                            <button
                                onClick={showWarningToast}
                                className="group relative overflow-hidden bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300"
                            >
                                <div className="relative z-10">
                                    <AlertTriangle className="w-8 h-8 text-yellow-500 mb-3" />
                                    <h3 className="text-lg font-semibold text-white mb-2">Warning Toast</h3>
                                    <p className="text-sm text-gray-400">Shows a warning notification</p>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>

                            {/* Loading Toast */}
                            <button
                                onClick={showLoadingToast}
                                disabled={isLoading !== null}
                                className="group relative overflow-hidden bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 hover:border-[#00FF89]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="relative z-10">
                                    <Loader2 className={`w-8 h-8 text-[#00FF89] mb-3 ${isLoading !== null ? 'animate-spin' : ''}`} />
                                    <h3 className="text-lg font-semibold text-white mb-2">Loading Toast</h3>
                                    <p className="text-sm text-gray-400">Shows a loading state</p>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00FF89]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>

                            {/* Promise Toast */}
                            <button
                                onClick={showPromiseToast}
                                className="group relative overflow-hidden bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
                            >
                                <div className="relative z-10">
                                    <Sparkles className="w-8 h-8 text-purple-500 mb-3" />
                                    <h3 className="text-lg font-semibold text-white mb-2">Promise Toast</h3>
                                    <p className="text-sm text-gray-400">Shows async operation (50/50 chance)</p>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>
                        </div>

                        {/* Multiple Toasts */}
                        <button
                            onClick={showMultipleToasts}
                            className="w-full mt-8 bg-gradient-to-r from-[#00FF89]/20 to-[#FFC050]/20 border border-[#00FF89]/30 rounded-xl p-6 hover:from-[#00FF89]/30 hover:to-[#FFC050]/30 transition-all duration-300"
                        >
                            <h3 className="text-lg font-semibold text-white mb-2">Show Multiple Toasts</h3>
                            <p className="text-sm text-gray-400">Demonstrates stacking behavior</p>
                        </button>

                        {/* Custom Examples */}
                        <div className="mt-12 p-6 bg-[#1f1f1f] border border-gray-800 rounded-xl">
                            <h3 className="text-lg font-semibold text-white mb-4">Other Examples</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => toastUtils.auth.loginSuccess('John Doe')}
                                    className="text-sm text-[#00FF89] hover:underline"
                                >
                                    Login Success Toast
                                </button>
                                <button
                                    onClick={() => toastUtils.seller.profileCreated()}
                                    className="text-sm text-[#00FF89] hover:underline"
                                >
                                    Seller Profile Created
                                </button>
                                <button
                                    onClick={() => toastUtils.operation.copied()}
                                    className="text-sm text-[#00FF89] hover:underline"
                                >
                                    Copied to Clipboard
                                </button>
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    )
}