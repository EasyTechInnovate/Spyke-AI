'use client'

import { Clock, Award, Users, Briefcase, Star, CheckCircle } from 'lucide-react'

export default function SellerAbout({ seller }) {
    const achievements = [
        {
            icon: Star,
            title: 'Top Rated Seller',
            description: 'Consistently rated 4.5+ stars by customers',
            earned: seller?.averageRating >= 4.5
        },
        {
            icon: Users,
            title: 'Customer Favorite',
            description: 'Over 100 satisfied customers',
            earned: seller?.totalCustomers >= 100
        },
        {
            icon: Clock,
            title: 'Fast Responder',
            description: 'Responds to messages within 24 hours',
            earned: seller?.responseTime === '< 24h'
        },
        {
            icon: Briefcase,
            title: 'Professional Seller',
            description: 'Verified business profile',
            earned: seller?.isVerified
        }
    ]

    const skillsList = [
        ...(seller?.niches || []),
        ...(seller?.toolsSpecialization || [])
    ]

    return (
        <div className="space-y-8">
            {/* About Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">About {seller?.fullName}</h2>
                
                {seller?.bio ? (
                    <div className="prose prose-gray max-w-none">
                        <p className="text-gray-300 leading-relaxed text-base">
                            {seller.bio}
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-400 italic">No bio available.</p>
                )}

                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-800">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-brand-primary">
                            {seller?.totalSales || 0}
                        </p>
                        <p className="text-sm text-gray-400">Total Sales</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-brand-primary">
                            {seller?.averageRating || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-400">Avg Rating</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-brand-primary">
                            {seller?.responseTime || '< 24h'}
                        </p>
                        <p className="text-sm text-gray-400">Response Time</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-brand-primary">
                            {seller?.memberSince || new Date().getFullYear()}
                        </p>
                        <p className="text-sm text-gray-400">Member Since</p>
                    </div>
                </div>
            </div>

            {/* Skills & Expertise */}
            {skillsList.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Skills & Expertise</h2>
                    
                    <div className="grid gap-6">
                        {seller?.niches && seller.niches.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                    Specializations
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {seller.niches.map((niche, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-2 bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-medium border border-brand-primary/20"
                                        >
                                            {niche}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {seller?.toolsSpecialization && seller.toolsSpecialization.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                    Tools & Technologies
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {seller.toolsSpecialization.map((tool, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700"
                                        >
                                            {tool}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Achievements */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Achievements & Badges</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border transition-all duration-200 ${
                                achievement.earned
                                    ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                                    : 'bg-gray-800/50 border-gray-700 text-gray-400'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${
                                    achievement.earned ? 'bg-brand-primary/20' : 'bg-gray-700'
                                }`}>
                                    <achievement.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold">{achievement.title}</h3>
                                        {achievement.earned && (
                                            <CheckCircle className="w-4 h-4 text-brand-primary" />
                                        )}
                                    </div>
                                    <p className="text-sm opacity-80">{achievement.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Portfolio Links */}
            {seller?.portfolioLinks && seller.portfolioLinks.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Portfolio</h2>
                    
                    <div className="space-y-3">
                        {seller.portfolioLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-brand-primary/50 transition-all duration-200 group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300 group-hover:text-brand-primary transition-colors">
                                        {new URL(link).hostname}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        External Link →
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Services */}
            {seller?.customAutomationServices && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Custom Services</h2>
                    <div className="flex items-center gap-3 p-4 bg-brand-primary/10 border border-brand-primary/30 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-brand-primary flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-brand-primary mb-1">Custom Automation Services</h3>
                            <p className="text-sm text-gray-300">
                                This seller offers custom automation solutions beyond their pre-built products. 
                                Contact them for personalized development work.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}