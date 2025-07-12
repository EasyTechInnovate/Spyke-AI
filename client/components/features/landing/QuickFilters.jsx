'use client'

import { useState } from 'react'
import Container from '@/components/shared/layout/Container'
import Select from '@/components/shared/ui/select'
import Badge from '@/components/shared/ui/badge'
import { Filter, Search } from 'lucide-react'

export default function QuickFilters() {
    const [filters, setFilters] = useState({
        type: '',
        tool: '',
        price: '',
        industry: ''
    })

    const filterOptions = {
        type: ['All Types', 'Prompt', 'Template', 'Automation', 'Guide'],
        tool: ['All Tools', 'ChatGPT', 'Midjourney', 'Claude', 'Stable Diffusion', 'DALL-E'],
        price: ['All Prices', 'Free', 'Under $10', '$10-$50', 'Over $50'],
        industry: ['All Industries', 'Marketing', 'Sales', 'Development', 'Design', 'Writing', 'Business']
    }

    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => ({ ...prev, [filterType]: value }))
    }

    return (
        <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
            <Container>
                <div className="text-center mb-12">
                    <Badge
                        variant="primary"
                        className="mb-4">
                        <Filter className="h-3 w-3 mr-1" />
                        Smart Filters
                    </Badge>
                    <h2 className="font-league-spartan font-bold text-3xl md:text-5xl text-brand-dark dark:text-white mb-4">
                        Find Exactly What You Need
                    </h2>
                    <p className="font-kumbh-sans text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Use our advanced filters to discover the perfect AI prompts and tools
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {Object.entries(filterOptions).map(([key, options]) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">{key}</label>
                                <Select
                                    value={filters[key]}
                                    onChange={(e) => handleFilterChange(key, e.target.value)}>
                                    {options.map((option) => (
                                        <option
                                            key={option}
                                            value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <button className="inline-flex items-center px-8 py-3 bg-brand-primary text-brand-dark font-kumbh-sans font-semibold rounded-lg hover:bg-brand-primary/90 transition-all duration-200 shadow-lg shadow-brand-primary/25">
                            <Search className="h-5 w-5 mr-2" />
                            Search with Filters
                        </button>
                    </div>
                </div>
            </Container>
        </section>
    )
}
