'use client'

import Container from '@/components/layout/Container'
import { Star } from 'lucide-react'
import Link from 'next/link'

export default function FeaturedPrompts() {
    const prompts = [
        {
            id: 1,
            title: '3D Neon Icons',
            category: 'ChatGPT Image',
            price: 2.99,
            image: '/prompts/neon-icons.jpg'
        },
        {
            id: 2,
            title: 'Ultrarealistic Clothing Mockups',
            category: 'Midjourney Video',
            price: 6.99,
            rating: 5.0,
            image: '/prompts/clothing.jpg'
        },
        {
            id: 3,
            title: 'Epic Food Explosions For Commercial Photography',
            category: 'Midjourney Video',
            price: 4.99,
            image: '/prompts/food.jpg'
        },
        {
            id: 4,
            title: 'Minimalist Single Line Animations',
            category: 'Midjourney Video',
            price: 4.99,
            rating: 5.0,
            image: '/prompts/animations.jpg'
        },
        {
            id: 5,
            title: 'Stained Glass Sparklecore',
            category: 'Midjourney',
            price: 2.99,
            image: '/prompts/stained-glass.jpg'
        }
    ]

    return (
        <section className="py-16 bg-[#1a1a2e]">
            <Container>
                <h2 className="font-league-spartan font-bold text-2xl md:text-3xl text-white mb-8">
                    Featured Prompts
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {prompts.map((prompt) => (
                        <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
                            <div className="group relative bg-[#252547] rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                                {/* Category Badge */}
                                <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
                                    <span className="text-green-400">✓</span>
                                    <span>{prompt.category}</span>
                                </div>

                                {/* Rating Badge */}
                                {prompt.rating && (
                                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded">
                                        <span className="text-white text-xs font-bold">{prompt.rating}</span>
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    </div>
                                )}

                                {/* Image */}
                                <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                                    {/* Add actual images here */}
                                </div>

                                {/* Content */}
                                <div className="p-3">
                                    <h3 className="font-kumbh-sans text-white text-sm font-medium line-clamp-2 mb-2">
                                        {prompt.title}
                                    </h3>
                                    <p className="text-white font-bold">
                                        ${prompt.price}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </Container>
        </section>
    )
}