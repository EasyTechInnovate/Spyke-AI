'use client'
import { motion } from 'framer-motion'
import { Briefcase, Megaphone, User, TrendingUp, Users, Mail } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Link from 'next/link'
import dynamic from 'next/dynamic'
const BackgroundEffectsLight = dynamic(() => import('./hero/BackgroundEffectsLight'), {
  ssr: false,
  loading: () => null
})
const useCases = [
  {
    id: 'recruiters',
    role: 'Recruiters',
    title: 'Streamline Your Hiring Process',
    description: 'Automate candidate screening, follow-ups, and interview scheduling',
    icon: Users,
    benefits: ['Save 10+ hours/week', 'Better candidate experience', '3x faster hiring'],
    link: '/explore?category=hiring&industry=all',
    color: 'bg-blue-500'
  },
  {
    id: 'marketers',
    role: 'Marketers',
    title: 'Scale Your Marketing Efforts',
    description: 'Create content, automate campaigns, and analyze performance',
    icon: Megaphone,
    benefits: ['50% more content', 'Automated workflows', 'Real-time insights'],
    link: '/explore?category=marketing&category=content_creation',
    color: 'bg-purple-500'
  },
  {
    id: 'solopreneurs',
    role: 'Solopreneurs',
    title: 'Build Your Business Faster',
    description: 'All-in-one tools for sales, marketing, and operations',
    icon: User,
    benefits: ['One-person powerhouse', 'Automate repetitive tasks', 'Focus on growth'],
    link: '/explore?industry=local_business&type=bundle',
    color: 'bg-green-500'
  },
  {
    id: 'sales-teams',
    role: 'Sales Teams',
    title: 'Close More Deals',
    description: 'Lead generation, qualification, and automated follow-ups',
    icon: TrendingUp,
    benefits: ['2x conversion rate', 'Never miss a lead', 'Personalized at scale'],
    link: '/explore?category=sales&category=lead_generation',
    color: 'bg-orange-500'
  },
  {
    id: 'consultants',
    role: 'Consultants',
    title: 'Deliver More Value',
    description: 'Professional tools for analysis, reporting, and client management',
    icon: Briefcase,
    benefits: ['Professional reports', 'Client automation', 'Scale your practice'],
    link: '/explore?industry=consulting&category=analysis',
    color: 'bg-indigo-500'
  },
  {
    id: 'customer-success',
    role: 'Customer Success',
    title: 'Delight Your Customers',
    description: 'Automate support, onboarding, and customer engagement',
    icon: Mail,
    benefits: ['24/7 support', 'Instant responses', 'Higher satisfaction'],
    link: '/explore?category=customer_service&category=follow_ups',
    color: 'bg-pink-500'
  }
]
export default function CuratedUseCases() {
  return (
    <section className="relative py-20 lg:py-24 bg-black">
      <BackgroundEffectsLight />
      <Container>
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-title">
              Built for Your Role
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-body">
              Find AI tools and automations specifically designed for your job
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={useCase.link}
                  className="group block h-full"
                >
                  <div className="relative h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/10">
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="text-sm font-medium text-brand-primary">
                            {useCase.role}
                          </span>
                          <h3 className="text-xl font-semibold text-white mt-1 font-title">
                            {useCase.title}
                          </h3>
                        </div>
                        <div className={`w-10 h-10 rounded-lg ${useCase.color} bg-opacity-20 flex items-center justify-center`}>
                          <useCase.icon className={`w-5 h-5 ${useCase.color.replace('bg-', 'text-')}`} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-6 flex-1 font-body">
                        {useCase.description}
                      </p>
                      <div className="space-y-2 mb-6">
                        {useCase.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                            <span className="text-sm text-gray-300 font-body">{benefit}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center text-brand-primary group-hover:text-brand-primary/80 transition-colors">
                        <span className="text-sm font-medium">Browse tools</span>
                        <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}