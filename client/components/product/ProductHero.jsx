'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'

export default function ProductHero({ product, selectedImage, setSelectedImage }) {
    if (!product) return null

    // Combine images and video into one media array
    const mediaItems = []
    
    // Add images first
    if (product.images && product.images.length > 0) {
        product.images.forEach((image, index) => {
            mediaItems.push({
                type: 'image',
                src: image,
                alt: `${product.title} - Image ${index + 1}`
            })
        })
    }
    
    // Add video if available
    if (product.previewVideo) {
        mediaItems.push({
            type: 'video',
            src: product.previewVideo,
            poster: product.images?.[0] || product.thumbnail,
            alt: `${product.title} - Preview Video`
        })
    }
    
    // Fallback to thumbnail if no media
    if (mediaItems.length === 0 && product.thumbnail) {
        mediaItems.push({
            type: 'image',
            src: product.thumbnail,
            alt: product.title
        })
    }

    const selectedMedia = mediaItems[selectedImage] || mediaItems[0]

    return (
        <div className="space-y-3">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}>
                
                {/* Main Media Display */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900/20 mb-3">
                    {selectedMedia?.type === 'video' ? (
                        <video 
                            src={selectedMedia.src}
                            controls
                            className="w-full h-full object-cover"
                            poster={selectedMedia.poster}
                            style={{ minHeight: '280px' }}>
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <img
                            src={selectedMedia?.src || '/images/placeholder-product.jpg'}
                            alt={selectedMedia?.alt || product.title}
                            className="w-full h-full object-cover"
                            style={{ minHeight: '280px' }}
                            onError={(e) => {
                                e.target.src = product.thumbnail || '/images/placeholder-product.jpg'
                            }}
                        />
                    )}
                    
                    {/* Media Counter & Type Indicator */}
                    <div className="absolute top-3 right-3 flex gap-2">
                        <div className="px-2 py-1 bg-black/60 text-white text-xs rounded">
                            {selectedImage + 1} / {mediaItems.length}
                        </div>
                        {selectedMedia?.type === 'video' && (
                            <div className="px-2 py-1 bg-red-600/80 text-white text-xs rounded font-medium">
                                VIDEO
                            </div>
                        )}
                    </div>
                </div>

                {/* Thumbnail Grid - Shows All Media */}
                <div className="grid grid-cols-5 gap-1.5">
                    {mediaItems.slice(0, 5).map((media, index) => (
                        <div
                            key={index}
                            className={`relative aspect-square cursor-pointer transition-all hover:opacity-80 rounded-md overflow-hidden ${
                                selectedImage === index ? 'ring-2 ring-green-400' : 'ring-1 ring-gray-600/50'
                            }`}
                            onClick={() => setSelectedImage(index)}>
                            
                            {media.type === 'video' ? (
                                <>
                                    <img
                                        src={media.poster}
                                        alt="Video thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                                            <div className="w-0 h-0 border-l-[6px] border-l-black border-y-[4px] border-y-transparent ml-0.5"></div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-red-600 text-white text-xs rounded font-bold">
                                        VIDEO
                                    </div>
                                </>
                            ) : (
                                <img
                                    src={media.src}
                                    alt={media.alt}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = product.thumbnail || '/images/placeholder-product.jpg'
                                    }}
                                />
                            )}
                        </div>
                    ))}
                    
                    {/* Show more indicator */}
                    {mediaItems.length > 5 && (
                        <div className="aspect-square bg-gray-800/50 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-700/50 transition-colors">
                            <span className="text-xs text-gray-300 font-medium">
                                +{mediaItems.length - 5}
                            </span>
                        </div>
                    )}
                </div>

                {/* Product Type Badge - Compact */}
                <div className="flex justify-center mt-3">
                    <div className="bg-gray-800/40 px-3 py-1 rounded-md border border-gray-700/30">
                        <span className="text-gray-300 text-xs font-medium uppercase tracking-wide">
                            {product.type?.replace('_', ' ') || 'AI Automation'}
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
