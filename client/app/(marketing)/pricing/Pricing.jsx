'use client'
import React from 'react'
import { Check } from 'lucide-react'
import Header from '@/components/shared/layout/Header'
import Container from '@/components/shared/layout/Container'
const plans = [
    {
        name: 'Basic',
        price: '$9',
        period: '/month',
        description: 'Perfect for getting started',
        features: [
            'Up to 3 projects',
            'Basic analytics',
            'Email support',
            '1GB storage'
        ],
        popular: false
    },
    {
        name: 'Pro',
        price: '$29',
        period: '/month',
        description: 'Most popular for growing businesses',
        features: [
            'Unlimited projects',
            'Advanced analytics',
            'Priority support',
            '10GB storage',
            'Team collaboration'
        ],
        popular: true
    },
    {
        name: 'Enterprise',
        price: '$99',
        period: '/month',
        description: 'For large scale operations',
        features: [
            'Everything in Pro',
            'Custom integrations',
            'Dedicated support',
            'Unlimited storage',
            'Advanced security',
            'SLA guarantee'
        ],
        popular: false
    }
]
export default function PricingPage() {
    return (
        <>
            <Container className="py-20">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Choose the perfect plan for your needs. Always know what you'll pay.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-2xl border ${
                                plan.popular
                                    ? 'border-blue-500 shadow-lg scale-105'
                                    : 'border-gray-200'
                            } bg-white p-8`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {plan.name}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline justify-center">
                                    <span className="text-5xl font-bold text-gray-900">
                                        {plan.price}
                                    </span>
                                    <span className="text-xl text-gray-600 ml-1">
                                        {plan.period}
                                    </span>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-center">
                                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                                    plan.popular
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}
                            >
                                Get Started
                            </button>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-16">
                    <p className="text-gray-600 mb-4">
                        Need a custom plan? We're here to help.
                    </p>
                    <button className="text-blue-500 hover:text-blue-600 font-medium">
                        Contact Sales
                    </button>
                </div>
            </Container>
        </>
    )
}