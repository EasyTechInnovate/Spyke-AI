'use client'
import { motion } from 'framer-motion'
import { 
    ArrowRight, 
    Shield, 
    Globe, 
    Users, 
    Sparkles,
    Brain,
    Target,
    Lock,
    Award,
    Code,
    Bot,
    Workflow,
    Settings,
    Heart,
    Zap
} from 'lucide-react'
import Link from 'next/link'
import Container from '@/components/shared/layout/Container'
import { Button } from '@/lib/design-system'
const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
}
const team = [
    { name: "Alex Chen", role: "CEO", focus: "AI Strategy" },
    { name: "Sarah Kim", role: "CTO", focus: "Platform" },
    { name: "Marcus Johnson", role: "Product", focus: "Experience" },
    { name: "Elena Rodriguez", role: "Design", focus: "Interface" }
]
const services = [
    { icon: Brain, title: "AI Models", desc: "Ready-to-use AI models and APIs" },
    { icon: Sparkles, title: "AI Prompts", desc: "Optimized prompts for all LLMs" },
    { icon: Workflow, title: "Automation", desc: "Complete workflow solutions" },
    { icon: Code, title: "Custom AI", desc: "Bespoke AI development" }
]
export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <section className="pt-32 pb-20">
                <Container>
                    <div className="max-w-3xl">
                        <motion.div {...fadeIn}>
                            <div className="mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm mb-6">
                                    <div className="w-2 h-2 bg-[#00FF89] rounded-full"></div>
                                    About SpykeAI
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
                                We're building the
                                <span className="block text-[#00FF89] font-normal">
                                    AI marketplace
                                </span>
                                <span className="block">
                                    of tomorrow
                                </span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-2xl">
                                Where AI creators meet businesses. Where innovation finds its audience. 
                                Where the future gets built, one tool at a time.
                            </p>
                        </motion.div>
                    </div>
                </Container>
            </section>
            <section className="py-20 border-t border-white/10">
                <Container>
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div {...fadeIn}>
                            <h2 className="text-3xl font-light mb-6">The story</h2>
                            <div className="space-y-4 text-gray-300">
                                <p>
                                    In early 2025, we noticed something. AI creators were building incredible tools, 
                                    but had nowhere to share them properly.
                                </p>
                                <p>
                                    Businesses needed AI solutions, but couldn't find quality, trustworthy options 
                                    in one place.
                                </p>
                                <p>
                                    So we built SpykeAI. A simple, secure marketplace where AI innovation flows freely.
                                </p>
                            </div>
                        </motion.div>
                        <motion.div {...fadeIn} className="relative">
                            <div className="aspect-square bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                                <div className="text-center">
                                    <Bot className="w-16 h-16 text-[#00FF89] mx-auto mb-4" />
                                    <div className="text-sm text-gray-400">Founded 2025</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </section>
            <section className="py-20 border-t border-white/10">
                <Container>
                    <motion.div {...fadeIn} className="mb-16">
                        <h2 className="text-3xl font-light mb-4">What we offer</h2>
                        <p className="text-gray-400 max-w-2xl">
                            Four main categories that cover everything you need in AI.
                        </p>
                    </motion.div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, i) => (
                            <motion.div 
                                key={service.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors">
                                <service.icon className="w-8 h-8 text-[#00FF89] mb-4" />
                                <h3 className="text-lg font-medium mb-2">{service.title}</h3>
                                <p className="text-sm text-gray-400">{service.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>
            <section className="py-20 border-t border-white/10">
                <Container>
                    <div className="grid md:grid-cols-2 gap-16">
                        <motion.div {...fadeIn}>
                            <h2 className="text-3xl font-light mb-8">Why SpykeAI</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <Shield className="w-6 h-6 text-[#00FF89] mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium mb-1">Verified sellers</h3>
                                        <p className="text-sm text-gray-400">Every creator is reviewed for quality</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Lock className="w-6 h-6 text-[#00FF89] mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium mb-1">Secure payments</h3>
                                        <p className="text-sm text-gray-400">Safe transactions, always</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Globe className="w-6 h-6 text-[#00FF89] mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium mb-1">Global reach</h3>
                                        <p className="text-sm text-gray-400">Connect worldwide</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Award className="w-6 h-6 text-[#00FF89] mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium mb-1">Clear licensing</h3>
                                        <p className="text-sm text-gray-400">Know exactly what you're getting</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div {...fadeIn}>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                                <h3 className="text-xl font-light mb-6">Our mission</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    Make AI innovation accessible, secure, and profitable for creators 
                                    while empowering businesses with the tools they need to succeed.
                                </p>
                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-light text-[#00FF89]">10M+</div>
                                            <div className="text-xs text-gray-400">Users by 2027</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-light text-[#00FF89]">1M+</div>
                                            <div className="text-xs text-gray-400">AI Tools</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-light text-[#00FF89]">150+</div>
                                            <div className="text-xs text-gray-400">Countries</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </section>
            <section className="py-20 border-t border-white/10">
                <Container>
                    <motion.div {...fadeIn} className="mb-16">
                        <h2 className="text-3xl font-light mb-4">The team</h2>
                        <p className="text-gray-400">Four people obsessed with making AI accessible.</p>
                    </motion.div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, i) => (
                            <motion.div 
                                key={member.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center">
                                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-[#00FF89] rounded-full"></div>
                                </div>
                                <h3 className="font-medium mb-1">{member.name}</h3>
                                <p className="text-sm text-[#00FF89] mb-1">{member.role}</p>
                                <p className="text-xs text-gray-400">{member.focus}</p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>
            <section className="py-20 border-t border-white/10">
                <Container>
                    <motion.div {...fadeIn} className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl font-light mb-6">Ready to start?</h2>
                        <p className="text-gray-400 mb-8">
                            Join thousands of creators and businesses already using SpykeAI.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/explore">
                                <Button variant="primary" size="lg">
                                    Explore marketplace
                                </Button>
                            </Link>
                            <Link href="/become-seller">
                                <Button variant="secondary" size="lg">
                                    Become a seller
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </Container>
            </section>
        </div>
    )
}