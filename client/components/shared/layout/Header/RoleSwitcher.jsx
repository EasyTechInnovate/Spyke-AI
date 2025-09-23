import { User, Store } from 'lucide-react'
export default function RoleSwitcher({ currentRole, onSwitch, className = "" }) {
    return (
        <div className={`flex gap-2 ${className}`}>
            <button
                onClick={() => onSwitch('user')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                    currentRole === 'user'
                        ? 'bg-brand-primary text-black font-medium shadow-lg shadow-brand-primary/20'
                        : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
            >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Buy Mode</span>
            </button>
            <button
                onClick={() => onSwitch('seller')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                    currentRole === 'seller'
                        ? 'bg-brand-primary text-black font-medium shadow-lg shadow-brand-primary/20'
                        : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
            >
                <Store className="w-4 h-4" />
                <span className="text-sm font-medium">Sell Mode</span>
            </button>
        </div>
    )
}