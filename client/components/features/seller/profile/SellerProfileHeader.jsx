'use client'

import { useState } from 'react'
import { 
    MapPin, 
    Star, 
    Users, 
    Package, 
    ExternalLink,
    MessageSquare,
    Shield,
    Clock,
    Globe
} from 'lucide-react'
import SocialLinks from './SocialLinks'
import { formatLocation } from '@/lib/utils/seller'

export default function SellerProfileHeader({ seller, productsCount = 0, reviewsCount = 0 }) {
    const [imageLoaded, setImageLoaded] = useState(false)

    const stats = [
        {
            label: 'Products',
            value: productsCount,
            icon: Package
        },
        {
            label: 'Reviews',
            value: reviewsCount,
            icon: MessageSquare
        },
        {
            label: 'Rating',
            value: seller?.averageRating ? `${seller.averageRating}/5` : 'New',
            icon: Star
        },
        {
            label: 'Response Time',
            value: seller?.responseTime || '< 24h',
            icon: Clock
        }
    ]

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto lg:mx-0">
                        {seller?.profileImage ? (
                            <img
                                src={seller.profileImage}
                                alt={seller.fullName}
                                className={`w-full h-full rounded-2xl object-cover transition-opacity duration-300 ${
                                    imageLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                                onLoad={() => setImageLoaded(true)}
                            />
                        ) : (
                            <div className="w-full h-full rounded-2xl bg-gray-800 flex items-center justify-center">
                                <Users className="w-8 h-8 md:w-12 md:h-12 text-gray-500" />
                            </div>
                        )}
                        
                        {/* Verification Badge */}
                        {seller?.isVerified && (
                            <div className="absolute -bottom-2 -right-2 bg-brand-primary rounded-full p-1.5">
                                <Shield className="w-4 h-4 text-black" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                    <div className="mb-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            {seller?.fullName || 'Seller'}
                        </h1>
                        
                        {seller?.tagline && (
                            <p className="text-lg text-gray-300 mb-3">{seller.tagline}</p>
                        )}

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-400">
                            {formatLocation(seller?.location) && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{formatLocation(seller.location)}</span>
                                </div>
                            )}
                            
                            {seller?.websiteUrl && (
                                <a
                                    href={seller.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-brand-primary transition-colors"
                                >
                                    <Globe className="w-4 h-4" />
                                    <span>Website</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                            
                            {seller?.joinedDate && (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Joined {seller.joinedDate}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    {seller?.bio && (
                        <p className="text-gray-300 leading-relaxed mb-6 max-w-2xl mx-auto lg:mx-0">
                            {seller.bio}
                        </p>
                    )}

                    {/* Specializations */}
                    {seller?.niches && seller.niches.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                Specializations
                            </h3>
                            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                {seller.niches.slice(0, 5).map((niche, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm border border-brand-primary/20"
                                    >
                                        {niche}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Social Links */}
                    {seller?.socialHandles && (
                        <SocialLinks socialHandles={seller.socialHandles} />
                    )}
                </div>

                {/* Stats */}
                <div className="lg:flex-shrink-0">
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
                        {stats.map((stat, index) => (
                            <div 
                                key={index}
                                className="text-center lg:text-left bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
                            >
                                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                                    <stat.icon className="w-4 h-4 text-brand-primary" />
                                    <span className="text-sm text-gray-400">{stat.label}</span>
                                </div>
                                <p className="text-xl font-bold text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}