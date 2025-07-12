'use client'

import Container from '@/components/shared/layout/Container'
import Card from '@/components/shared/ui/card'
import Badge from '@/components/shared/ui/badge'
import { Briefcase, Target, TrendingUp, Users, Code, Palette } from 'lucide-react'
import Link from 'next/link'

export default function CuratedUseCases() {
  const useCases = [
    {
      role: 'Recruiters',
      icon: Users,
      description: 'Screen candidates, write job descriptions, and automate outreach',
      promptCount: 87,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      role: 'Marketers',
      icon: Target,
      description: 'Create campaigns, generate content ideas, and analyze metrics',
      promptCount: 156,
      color: 'text-brand-primary',
      bgColor: 'bg-brand-primary/10',
    },
    {
      role: 'Solopreneurs',
      icon: Briefcase,
      description: 'Build products, manage tasks, and scale your business',
      promptCount: 123,
      color: 'text-brand-secondary',
      bgColor: 'bg-brand-secondary/10',
    },
    {
      role: 'Developers',
      icon: Code,
      description: 'Debug code, write documentation, and optimize algorithms',
      promptCount: 98,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      role: 'Designers',
      icon: Palette,
      description: 'Generate concepts, create variations, and get feedback',
      promptCount: 76,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      role: 'Sales Teams',
      icon: TrendingUp,
      description: 'Qualify leads, craft pitches, and close deals faster',
      promptCount: 112,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-brand-dark">
      <Container>
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Target className="h-3 w-3 mr-1" />
            Tailored Solutions
          </Badge>
          <h2 className="font-league-spartan font-bold text-3xl md:text-5xl text-brand-dark dark:text-white mb-4">
            Find Prompts for Your Role
          </h2>
          <p className="font-kumbh-sans text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Curated AI prompts and tools designed specifically for your profession
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase) => {
            const Icon = useCase.icon
            return (
              <Link key={useCase.role} href={`/use-cases/${useCase.role.toLowerCase()}`}>
                <Card className="p-6 h-full group cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${useCase.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 ${useCase.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-league-spartan font-bold text-xl text-brand-dark dark:text-white mb-2">
                        {useCase.role}
                      </h3>
                      <p className="font-kumbh-sans text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {useCase.description}
                      </p>
                      <span className="font-kumbh-sans text-sm text-brand-primary font-medium">
                        {useCase.promptCount} prompts available
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </Container>
    </section>
  )
}