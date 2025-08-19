import { Search } from 'lucide-react'

export default function SearchButton({ onClick }) {
    return (
        <button
            type="button"
            className="p-2 sm:p-3 text-gray-300 hover:text-brand-primary bg-white/5 hover:bg-brand-primary/10 rounded-lg transition-all duration-300 relative group"
            onClick={onClick}
        >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            
        </button>
    )
}