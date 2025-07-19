'use client'

import { Twitter, Linkedin, Instagram, Youtube, Github, Globe } from 'lucide-react'

const socialPlatforms = {
    twitter: { icon: Twitter, label: 'Twitter', color: 'hover:text-blue-400' },
    linkedin: { icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-600' },
    instagram: { icon: Instagram, label: 'Instagram', color: 'hover:text-pink-400' },
    youtube: { icon: Youtube, label: 'YouTube', color: 'hover:text-red-500' },
    github: { icon: Github, label: 'GitHub', color: 'hover:text-gray-300' },
    website: { icon: Globe, label: 'Website', color: 'hover:text-brand-primary' }
}

export default function SocialLinks({ socialHandles }) {
    if (!socialHandles || Object.keys(socialHandles).length === 0) {
        return null
    }

    const validLinks = Object.entries(socialHandles).filter(([_, url]) => url && url.trim())

    if (validLinks.length === 0) {
        return null
    }

    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Connect</h3>
            <div className="flex gap-3 justify-center lg:justify-start">
                {validLinks.map(([platform, url]) => {
                    const platformConfig = socialPlatforms[platform]
                    if (!platformConfig) return null

                    const Icon = platformConfig.icon

                    return (
                        <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 bg-gray-800 text-gray-400 rounded-lg transition-all duration-200 ${platformConfig.color} hover:bg-gray-700`}
                            title={`${platformConfig.label} Profile`}>
                            <Icon className="w-5 h-5" />
                        </a>
                    )
                })}
            </div>
        </div>
    )
}
