'use client'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Link from 'next/link'
import dynamic from 'next/dynamic'
const BackgroundEffectsLight = dynamic(() => import('./hero/BackgroundEffectsLight'), {
    ssr: false,
    loading: () => null
})

export default function BlogHighlights() {
    return (
        <section className="relative py-20 lg:py-24 bg-black">
            <BackgroundEffectsLight />
            <Container>
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-title">Explore our Blog</h2>
                        <p className="text-lg text-gray-400 mb-8 font-body">
                            Deep-dives, tutorials, and industry insights — all in one place. Discover the latest articles on AI, automation, product
                            building, and more.
                        </p>
                        <div className="flex justify-center">
                            <Link
                                href="/blog"
                                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00FF89] to-[#00e67a] text-black font-bold rounded-2xl hover:from-[#00e67a] hover:to-[#00FF89] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#00FF89]/25 text-lg"
                                aria-label="Read our blog - Explore articles on AI, automation, and business insights"
                            >
                                <span>Read Our Blog</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Decorative preview panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="mt-12">
                        <div className="relative mx-auto max-w-5xl rounded-2xl border border-gray-800/60 bg-gradient-to-b from-gray-900/60 to-gray-950/60 backdrop-blur-sm p-6 sm:p-8">
                            <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
                                <div className="rounded-xl border border-gray-800/60 bg-black/30 p-5">
                                    <p className="text-sm text-gray-400">Guides</p>
                                    <p className="mt-2 font-semibold text-white">Step-by-step tutorials to build faster</p>
                                </div>
                                <div className="rounded-xl border border-gray-800/60 bg-black/30 p-5">
                                    <p className="text-sm text-gray-400">Insights</p>
                                    <p className="mt-2 font-semibold text-white">Best practices and trends in AI & automation</p>
                                </div>
                                <div className="rounded-xl border border-gray-800/60 bg-black/30 p-5">
                                    <p className="text-sm text-gray-400">Case Studies</p>
                                    <p className="mt-2 font-semibold text-white">Real-world implementations and results</p>
                                </div>
                            </div>
                            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
                        </div>
                    </motion.div>
                </div>
            </Container>
        </section>
    )
}
