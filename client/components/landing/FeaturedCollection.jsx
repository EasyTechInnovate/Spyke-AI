import Container from '@/components/layout/Container'
import { DollarSign, UserCheck, Code, Users } from 'lucide-react'
import Link from 'next/link'

export default function FeatureCards() {
    const features = [
        {
            title: 'Sell with 0% Fees',
            description: 'Earn more than ever before',
            icon: DollarSign,
            link: '/sell',
            gradient: 'from-green-500 to-emerald-600',
            image: '/features/sell.png' // Add actual images
        },
        {
            title: 'Hire an AI Creator',
            description: 'Discover world class AI experts',
            icon: UserCheck,
            link: '/creators',
            gradient: 'from-blue-500 to-cyan-600',
            image: '/features/hire.png'
        },
        {
            title: 'Build an AI App',
            description: 'Create AI apps using prompts',
            icon: Code,
            link: '/build',
            gradient: 'from-purple-500 to-pink-600',
            image: '/features/build.png'
        },
        {
            title: 'Join a Community',
            description: 'Chat with other AI creators',
            icon: Users,
            link: '/community',
            gradient: 'from-orange-500 to-red-600',
            image: '/features/community.png'
        }
    ]

    return (
        <section className="py-20 bg-[#0F0F0F]">
            <Container>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <Link
                                key={index}
                                href={feature.link}>
                                <div className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer">
                                    {/* Background with gradient overlay */}
                                    <div className="absolute inset-0 bg-gray-900">
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="relative h-full p-6 flex flex-col justify-between">
                                        <Icon className="h-10 w-10 text-white mb-4" />

                                        <div>
                                            <h3 className="font-league-spartan text-xl font-bold text-white mb-2">{feature.title}</h3>
                                            <p className="font-kumbh-sans text-gray-400">{feature.description}</p>
                                        </div>
                                    </div>

                                    {/* Hover effect */}
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </Container>
        </section>
    )
}
