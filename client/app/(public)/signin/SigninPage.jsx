'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { authAPI } from '@/lib/api/auth'
import Header from '@/components/layout/Header'
import Container from '@/components/layout/Container'

export default function SignInPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [touched, setTouched] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        emailAddress: '',
        password: ''
    })
    
    // Prevent duplicate toasts
    const toastShown = useRef(false)

    const handleBlur = (e) => {
        const { name } = e.target
        setTouched((prev) => ({ ...prev, [name]: true }))
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (loading) return;
        
        setLoading(true);
        toastShown.current = false;
        toast.dismiss();
        
        try {
            const response = await authAPI.login(formData);
            
            // Show success toast
            if (!toastShown.current) {
                toastShown.current = true;
                toast.success('Login successful! Redirecting...', {
                    id: 'login-success',
                    duration: 2000
                });
            }

            setTimeout(() => {
                window.location.href = '/';
            }, 500);
            
        } catch (err) {
            console.error('Login error:', err);
            
            const errorMessage = err?.response?.data?.message || 
                               err?.data?.message || 
                               err?.message || 
                               'Login failed';
            
            if (!toastShown.current) {
                toastShown.current = true;
                toast.error(errorMessage, {
                    id: 'login-error',
                    duration: 5000
                });
            }
            
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FF89]/5 via-transparent to-[#00FF89]/5 pointer-events-none" />
            <div className="absolute top-20 right-20 w-96 h-96 bg-[#00FF89]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#00FF89]/5 rounded-full blur-3xl pointer-events-none" />

            <Header />

            <main className="relative pt-24 pb-16">
                <Container>
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold font-league-spartan mb-3">
                                <span className="bg-gradient-to-r from-white to-[#00FF89] bg-clip-text text-transparent">Welcome back</span>
                            </h1>
                            <p className="text-gray-400">Log in to your SpykeAI account</p>
                        </div>

                        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 md:p-8 shadow-2xl">
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="emailAddress"
                                        value={formData.emailAddress}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
                                        placeholder="you@example.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Enter your password"
                                            className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 pr-12 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
                                            required
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            disabled={loading}>
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                                        loading 
                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                                            : 'bg-[#00FF89] text-black hover:bg-[#00FF89]/90 transform hover:scale-[1.02] active:scale-[0.98]'
                                    }`}>
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            Signing in...
                                        </span>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-800" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-gray-900/50 text-gray-500">or continue with</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => !loading && authAPI.googleAuth()}
                                    disabled={loading}
                                    className={`w-full py-3 px-6 bg-white text-black rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
                                        loading 
                                            ? 'opacity-50 cursor-not-allowed' 
                                            : 'hover:bg-gray-100'
                                    }`}>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </button>
                            </form>

                            <p className="mt-6 text-center text-gray-400 text-sm">
                                Don't have an account?{' '}
                                <Link 
                                    href="/signup" 
                                    className={`text-[#00FF89] font-semibold ${
                                        loading ? 'pointer-events-none opacity-50' : 'hover:underline'
                                    }`}>
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    )
}