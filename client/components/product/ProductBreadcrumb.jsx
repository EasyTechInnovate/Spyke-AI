'use client'

import React from 'react'
import Link from 'next/link'
import { Home, ChevronRight } from 'lucide-react'

import { DESIGN_TOKENS, DSText, DSContainer } from '@/lib/design-system'

export default function ProductBreadcrumb({ product }) {
    if (!product) return null

    const breadcrumbItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/explore', label: 'Products' },
        { 
            href: `/explore?category=${product.category}`, 
            label: product.category?.replace('_', ' ').charAt(0).toUpperCase() + 
                   product.category?.slice(1).replace('_', ' ') || 'Category'
        },
        { label: product.title, current: true }
    ]

    return (
        <section
            className="pt-20 pb-4 border-b"
            style={{ borderColor: DESIGN_TOKENS.colors.background.elevated }}>
            <DSContainer maxWidth="hero" padding="responsive">
                <nav aria-label="Breadcrumb">
                    <ol className="flex items-center gap-2 text-sm flex-wrap">
                        {breadcrumbItems.map((item, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && (
                                    <ChevronRight
                                        className="w-4 h-4 flex-shrink-0"
                                        style={{ color: DESIGN_TOKENS.colors.text.muted.dark }}
                                        aria-hidden="true"
                                    />
                                )}
                                <li className="flex items-center min-w-0">
                                    {item.current ? (
                                        <DSText
                                            className="font-medium truncate"
                                            style={{ 
                                                color: DESIGN_TOKENS.colors.text.primary.dark,
                                                maxWidth: '200px'
                                            }}
                                            aria-current="page"
                                            title={item.label}>
                                            {item.label}
                                        </DSText>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className="transition-colors hover:underline flex items-center gap-1 min-w-0"
                                            style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                            {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
                                            <span className="truncate">{item.label}</span>
                                        </Link>
                                    )}
                                </li>
                            </React.Fragment>
                        ))}
                    </ol>
                </nav>
            </DSContainer>
        </section>
    )
}