'use client'
import { motion } from 'framer-motion'
import { 
  User, 
  CreditCard, 
  ShoppingBag, 
  Shield, 
  Bell, 
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
export default function SettingsNavigation({ activeSection, onSectionChange }) {
  const sections = [
    { id: 'profile', label: 'Profile', icon: User, enabled: true },
    { id: 'security', label: 'Security', icon: Shield, enabled: true },
    { id: 'orders', label: 'Order History', icon: ShoppingBag, enabled: true }, // Now enabled and linked to purchases
    { id: 'communication', label: 'Communication', icon: Bell, enabled: false, comingSoon: true },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:sticky lg:top-24 lg:h-fit"
    >
      <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-6">
        <nav className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon
            const isDisabled = !section.enabled
            return (
              <button
                key={section.id}
                onClick={() => section.enabled && onSectionChange(section.id)}
                disabled={isDisabled}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium relative",
                  activeSection === section.id && section.enabled
                    ? "bg-[#00FF89]/10 text-[#00FF89] border border-[#00FF89]/20"
                    : section.enabled
                    ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
                    : "text-gray-500 cursor-not-allowed bg-gray-900/30 border border-gray-800/50"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  isDisabled ? "opacity-50" : ""
                )} />
                <div className="flex-1">
                  <span className={cn(isDisabled ? "opacity-50" : "")}>{section.label}</span>
                  {section.comingSoon && (
                    <span className="block text-xs text-yellow-400/80 mt-0.5">Coming Soon</span>
                  )}
                </div>
              </button>
            )
          })}
        </nav>
      </div>
    </motion.div>
  )
}