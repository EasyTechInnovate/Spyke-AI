'use client'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Wrench, Loader2 } from 'lucide-react'
import { toolAPI } from '@/lib/api/toolsNiche'
import { useNotifications } from '@/hooks/useNotifications'

export default function ToolsDropdown({
    value,
    onChange,
    placeholder = 'Select Tools & Platforms',
    className = '',
    disabled = false,
    showAllOption = true,
    required = false,
    error = null,
    onDataLoaded = () => {}
}) {
    const [tools, setTools] = useState([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const { addNotification } = useNotifications()
    const fetchedRef = useRef(false)

    useEffect(() => {
        if (fetchedRef.current) return
        fetchedRef.current = true
        
        const fetchTools = async () => {
            try {
                setLoading(true)
                const response = await toolAPI.getTools({ isActive: 'true' })
                let toolsData = response?.data?.tools || response?.tools || response?.data || []
                
                if (!Array.isArray(toolsData)) {
                    toolsData = []
                }
                
                const formattedTools = toolsData
                    .map((tool) => ({
                        id: tool._id || tool.id,
                        name: tool.name || tool.title,
                        icon: tool.icon || 'Wrench',
                        productCount: tool.productCount || 0,
                        isActive: tool.isActive !== false
                    }))
                    .filter((tool) => tool.isActive)
                
                setTools(formattedTools)
                try {
                    onDataLoaded(formattedTools)
                } catch (e) {
                    console.error('Error in onDataLoaded:', e)
                }
            } catch (error) {
                console.error('Error fetching tools:', error)
                addNotification({
                    type: 'error',
                    message: 'Failed to load tools'
                })
            } finally {
                setLoading(false)
            }
        }
        
        fetchTools()
    }, [])

    const handleSelect = (toolId) => {
        onChange(toolId)
        setIsOpen(false)
    }

    const selectedTool = tools.find((tool) => tool.id === value)

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
                    <Wrench className="w-4 h-4 text-[#00FF89]" />
                    <span className={selectedTool ? 'text-[#00FF89] font-medium' : 'text-gray-300'}>
                        {loading ? 'Loading...' : selectedTool?.name || placeholder}
                    </span>
                </div>
                {loading ? (
                    <Loader2 className="w-4 h-4 text-[#00FF89] animate-spin" />
                ) : (
                    <ChevronDown className={`w-4 h-4 text-[#00FF89] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>
            {isOpen && !loading && (
                <div className="absolute z-[9999] w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                    {tools.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-400">No tools available</div>
                    ) : (
                        tools.map((tool) => (
                            <button
                                key={tool.id}
                                type="button"
                                onClick={() => handleSelect(tool.id)}
                                className={`
                                    w-full px-4 py-3 text-left hover:bg-[#00FF89]/20 transition-colors
                                    flex items-center gap-3 border-b border-gray-700/50 last:border-b-0
                                    ${value === tool.id ? 'bg-[#00FF89]/20 text-[#00FF89] font-medium' : 'text-gray-200 hover:text-white'}
                                `}>
                                <Wrench className="w-4 h-4 text-[#00FF89]" />
                                <div className="font-medium">{tool.name}</div>
                            </button>
                        ))
                    )}
                </div>
            )}
            {error && <div className="mt-1 text-sm text-red-400">{error}</div>}
            {required && <span className="absolute -top-1 -right-1 text-red-400 text-xs">*</span>}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    )
}