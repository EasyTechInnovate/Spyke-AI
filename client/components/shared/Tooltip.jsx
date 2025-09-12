import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'

export const Tooltip = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div 
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}>
            {children}
            
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full right-0 mb-2 z-[50000]"
                        style={{ width: '280px' }}>
                        <div className="bg-gray-900 text-white text-sm rounded-lg p-4 shadow-xl border border-gray-700 relative">
                            {typeof content === 'string' ? (
                                <p className="font-league-spartan leading-relaxed">{content}</p>
                            ) : (
                                <div className="space-y-2">
                                    <h4 className="font-bold text-emerald-400 font-league-spartan">
                                        {content.title}
                                    </h4>
                                    <p className="text-gray-200 text-xs leading-relaxed font-league-spartan">
                                        {content.description}
                                    </p>
                                    <div className="pt-2 border-t border-gray-700">
                                        <p className="text-gray-400 text-xs font-medium font-league-spartan mb-1">
                                            Calculation:
                                        </p>
                                        <p className="text-gray-300 text-xs font-league-spartan">
                                            {content.calculation}
                                        </p>
                                    </div>
                                    {content.note && (
                                        <div className="bg-blue-500/10 rounded p-2 border border-blue-500/20 mt-2">
                                            <p className="text-blue-300 text-xs font-league-spartan">
                                                💡 {content.note}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Simple arrow */}
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}