'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Smartphone, AlertTriangle } from 'lucide-react'
import { authAPI } from '@/lib/api/auth'
export default function SecuritySection({ onSuccess, onError }) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const validatePassword = (password) => {
    const errors = {}
    if (!password) errors.required = 'Password is required'
    else if (password.length < 6) errors.length = 'Password must be at least 6 characters long'
    return errors
  }
  const validatePasswordMatch = (newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
      return { match: 'Passwords do not match' }
    }
    return {}
  }
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    const newPasswordErrors = validatePassword(passwordData.newPassword)
    const confirmPasswordErrors = validatePassword(passwordData.confirmPassword)
    const matchErrors = validatePasswordMatch(passwordData.newPassword, passwordData.confirmPassword)
    const allErrors = {
      ...newPasswordErrors,
      ...confirmPasswordErrors,
      ...matchErrors
    }
    if (Object.keys(allErrors).length > 0) {
      setPasswordErrors(allErrors)
      return
    }
    setLoading(true)
    setPasswordErrors({})
    try {
      await authAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      )
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      onSuccess('Password changed successfully!')
    } catch (error) {
      console.error('Password change failed:', error)
      const message = error?.response?.data?.message || error?.data?.message || error?.message || 'Failed to change password'
      onError(message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[#00FF89]/10 rounded-xl flex items-center justify-center border border-[#00FF89]/20">
            <Lock className="w-6 h-6 text-[#00FF89]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#00FF89] font-league-spartan">Change Password</h3>
            <p className="text-gray-300">Update your account password</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Current Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full pl-12 pr-12 py-3 bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordErrors.length && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {passwordErrors.length}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Confirm New Password *
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all"
                placeholder="Confirm new password"
                required
              />
              {passwordErrors.match && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {passwordErrors.match}
                </p>
              )}
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-blue-300 text-sm font-medium mb-2">Password requirements:</p>
            <ul className="text-blue-200/80 text-sm space-y-1">
              <li className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${passwordData.newPassword.length >= 6 ? 'bg-green-400' : 'bg-gray-400'}`} />
                At least 6 characters long
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${passwordData.newPassword !== passwordData.currentPassword && passwordData.newPassword ? 'bg-green-400' : 'bg-gray-400'}`} />
                Different from current password
              </li>
            </ul>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </motion.div>
  )
}