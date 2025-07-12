import { Search } from 'lucide-react'

export default function SearchButton({ onClick }) {
    return (
        <button
            type="button"
            className="p-2 sm:p-3 text-gray-300 hover:text-brand-primary bg-white/5 hover:bg-brand-primary/10 rounded-lg transition-all duration-300 relative group"
            onClick={onClick}
        >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                ⌘K
            </span>
        </button>
    )
}