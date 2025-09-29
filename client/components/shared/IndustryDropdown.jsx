'use client'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Building2, Loader2 } from 'lucide-react'
import { industryAPI } from '@/lib/api/toolsNiche'
import { useNotifications } from '@/hooks/useNotifications'
export default function IndustryDropdown({
    value,
    onChange,
    placeholder = 'Select Industry',
    className = '',
    disabled = false,
    showAllOption = true,
    required = false,
    error = null,
    onDataLoaded = () => {}
}) {
    const [industries, setIndustries] = useState([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const { addNotification } = useNotifications()
    const fetchedRef = useRef(false)
    useEffect(() => {
        if (fetchedRef.current) return
        fetchedRef.current = true
        const fetchIndustries = async () => {
            try {
                setLoading(true)
                const response = await industryAPI.getIndustries()
                const industriesDataRaw = response?.data?.industries || response?.industries || response?.data || []
                const industriesData = Array.isArray(industriesDataRaw) ? industriesDataRaw : []
                const formattedIndustries = industriesData.map(ind => ({
                    id: ind._id || ind.id,
                    name: ind.name || ind.title,
                    description: ind.description,
                    isActive: ind.isActive !== false
                })).filter(ind => ind.isActive)
                setIndustries(formattedIndustries)
                try { onDataLoaded(formattedIndustries) } catch (e) {
                    console.error('Error in onDataLoaded:', e)
                }
            } catch (error) {
                console.error('Error fetching industries:', error)
                addNotification({
                    type: 'error',
                    message: 'Failed to load industries'
                })
            } finally {
                setLoading(false)
            }
        }
        fetchIndustries()
    }, [])
    const handleSelect = (industryId) => {
        onChange(industryId)
        setIsOpen(false)
    }
    const selectedIndustry = industries.find(ind => ind.id === value)
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
                    <Building2 className="w-4 h-4 text-[#00FF89]" />
                    <span className={selectedIndustry ? 'text-[#00FF89] font-medium' : 'text-gray-300'}>
                        {loading ? 'Loading...' : selectedIndustry?.name || placeholder}
                    </span>
                </div>
                {loading ? (
                    <Loader2 className="w-4 h-4 text-[#00FF89] animate-spin" />
                ) : (
                    <ChevronDown className={`w-4 h-4 text-[#00FF89] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>
            {isOpen && !loading && (
                <div className="absolute z-[999] w-full mt-1 bg-gray-900/95 border border-gray-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto backdrop-blur-md">
                    {industries.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-400">No industries available</div>
                    ) : (
                        industries.map(industry => (
                            <button
                                key={industry.id}
                                type="button"
                                onClick={() => handleSelect(industry.id)}
                                className={`
                                    w-full px-4 py-3 text-left hover:bg-[#00FF89]/20 transition-colors
                                    flex items-center gap-3 border-b border-gray-700/50 last:border-b-0
                                    ${value === industry.id ? 'bg-[#00FF89]/20 text-[#00FF89] font-medium' : 'text-gray-200 hover:text-white'}
                                `}>
                                <Building2 className="w-4 h-4 text-[#00FF89]" />
                                <div>
                                    <div className="font-medium">{industry.name}</div>
                                    {industry.description && (
                                        <div className="text-sm text-gray-400 truncate">{industry.description}</div>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
            {error && <div className="mt-1 text-sm text-red-400">{error}</div>}
            {required && <span className="absolute -top-1 -right-1 text-red-400 text-xs">*</span>}
            {isOpen && <div className="fixed inset-0 z-[998]" onClick={() => setIsOpen(false)} />}
        </div>
    )
}