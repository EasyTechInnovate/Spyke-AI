'use client'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Package, Loader2 } from 'lucide-react'
import { categoryAPI } from '@/lib/api/toolsNiche'
import { useNotifications } from '@/hooks/useNotifications'
export default function CategoryDropdown({ 
    value, 
    onChange, 
    placeholder = "Select Category",
    className = "",
    disabled = false,
    showAllOption = true,
    required = false,
    error = null,
    onDataLoaded = () => {}
}) {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const { addNotification } = useNotifications()
    const fetchedRef = useRef(false)
    useEffect(() => {
        if (fetchedRef.current) return
        fetchedRef.current = true
        const fetchCategories = async () => {
            try {
                setLoading(true)
                const response = await categoryAPI.getCategories()
                let categoriesData = response?.data?.categories || response?.categories || response?.data || []
                if (!Array.isArray(categoriesData)) {
                    categoriesData = []
                }
                const formattedCategories = categoriesData.map(cat => ({
                    id: cat._id || cat.id,
                    name: cat.name || cat.title,
                    icon: cat.icon || 'Package',
                    productCount: cat.productCount || 0,
                    isActive: cat.isActive !== false
                })).filter(cat => cat.isActive)
                setCategories(formattedCategories)
                try { onDataLoaded(formattedCategories) } catch (e) {
                    console.error('Error in onDataLoaded:', e)
                }
            } catch (error) {
                console.error('Error fetching categories:', error)
                addNotification({
                    type: 'error',
                    message: 'Failed to load categories'
                })
            } finally {
                setLoading(false)
            }
        }
        fetchCategories()
    }, [])
    const handleSelect = (categoryId) => {
        onChange(categoryId)
        setIsOpen(false)
    }
    const selectedCategory = categories.find(cat => cat.id === value)
    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled || loading}
                className={`
                    w-full px-4 py-3 bg-black/90 border rounded-lg text-left flex items-center justify-between
                    transition-colors duration-200 min-h-[48px] backdrop-blur-sm
                    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/95 cursor-pointer'}
                    ${error ? 'border-red-500' : 'border-gray-600 focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/30'}
                    ${isOpen ? 'border-[#00FF89] ring-2 ring-[#00FF89]/30' : ''}
                `}>
                <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-[#00FF89]" />
                    <span className={selectedCategory ? 'text-[#00FF89] font-medium' : 'text-gray-300'}>
                        {loading ? 'Loading...' : selectedCategory?.name || placeholder}
                    </span>
                </div>
                {loading ? (
                    <Loader2 className="w-4 h-4 text-[#00FF89] animate-spin" />
                ) : (
                    <ChevronDown className={`w-4 h-4 text-[#00FF89] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>
            {isOpen && !loading && (
                <div className="absolute z-50 w-full mt-1 bg-black/95 border border-gray-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto backdrop-blur-sm">
                    {categories.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-400">
                            No categories available
                        </div>
                    ) : (
                        categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleSelect(category.id)}
                                className={`
                                    w-full px-4 py-3 text-left hover:bg-[#00FF89]/20 transition-colors
                                    flex items-center gap-3
                                    ${value === category.id ? 'bg-[#00FF89]/20 text-[#00FF89] font-medium' : 'text-gray-200'}
                                `}>
                                <Package className="w-4 h-4 text-[#00FF89]" />
                                <div className="font-medium">{category.name}</div>
                            </button>
                        ))
                    )}
                </div>
            )}
            {error && (
                <div className="mt-1 text-sm text-red-400">
                    {error}
                </div>
            )}
            {required && (
                <span className="absolute -top-1 -right-1 text-red-400 text-xs">*</span>
            )}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    )
}