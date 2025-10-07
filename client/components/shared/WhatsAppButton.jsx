'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function WhatsAppButton() {
    const [isVisible, setIsVisible] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const buttonRef = useRef(null)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 1000)

        // Set initial position (bottom-right corner)
        const updateInitialPosition = () => {
            const buttonSize = 56 // Reduced button size for better proportions
            const margin = 24
            setPosition({
                x: window.innerWidth - buttonSize - margin,
                y: window.innerHeight - buttonSize - margin - 60
            })
        }

        updateInitialPosition()
        window.addEventListener('resize', updateInitialPosition)

        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', updateInitialPosition)
        }
    }, [])

    const handleClick = () => {
        if (!isDragging) {
            const whatsappUrl = 'https://wa.link/7uwiza'
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
        }
    }

    const constrainPosition = (x, y) => {
        const buttonSize = 56 // Match the reduced button size
        const minX = 0
        const minY = 0
        const maxX = window.innerWidth - buttonSize
        const maxY = window.innerHeight - buttonSize

        return {
            x: Math.max(minX, Math.min(maxX, x)),
            y: Math.max(minY, Math.min(maxY, y))
        }
    }

    const handleDragEnd = (event, info) => {
        const constrainedPosition = constrainPosition(info.point.x - 28, info.point.y - 28) // Adjust for half button size
        setPosition(constrainedPosition)
        setTimeout(() => setIsDragging(false), 100)
    }

    const handleDrag = (event, info) => {
        const constrainedPosition = constrainPosition(info.point.x - 28, info.point.y - 28) // Adjust for half button size
        setPosition(constrainedPosition)
    }

    if (!isVisible) return null

    return (
        <motion.button
            ref={buttonRef}
            onClick={handleClick}
            className="fixed z-40 group animate-fadeIn cursor-grab active:cursor-grabbing w-14 h-14 rounded-full"
            aria-label="Contact us on WhatsApp"
            drag
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }}
            style={{
                left: position.x,
                top: position.y
            }}
            animate={{
                left: position.x,
                top: position.y
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            whileDrag={{
                scale: 1.1,
                zIndex: 50,
                boxShadow: '0 25px 50px -12px rgba(0, 255, 137, 0.25)',
                cursor: 'grabbing'
            }}
            whileHover={{
                scale: isDragging ? 1.1 : 1.05
            }}
            whileTap={{ scale: 0.95 }}
            onDragStart={() => setIsDragging(true)}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-brand-primary to-green-500 bg-[length:200%_100%] animate-gradient-x rounded-full opacity-75 blur-lg group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-green-500 hover:bg-green-600 text-white rounded-full w-full h-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300">
                <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-25" />
                <svg
                    className="w-5 h-5 relative z-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487" />
                </svg>
            </div>
            <motion.div
                className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: isDragging ? 0 : undefined }}>
                {isDragging ? '' : 'Drag me anywhere or click to chat!'}
            </motion.div>
        </motion.button>
    )
}
