import Link from 'next/link'
import { Users, TrendingUp } from 'lucide-react'

const NAVIGATION_ITEMS = [
    { name: 'Explore', href: '/explore' },
    { name: 'Categories', href: '/categories' },
    { name: 'Top Creators', href: '/creators' },
    { name: 'Hire', href: '/hire', icon: Users }
]

export default function Navigation({ showBecomeSeller, searchOpen }) {
    return (
        <nav className={`hidden lg:flex items-center space-x-4 xl:space-x-6 2xl:space-x-8 transition-all duration-300 ${
            searchOpen ? 'opacity-0 invisible' : 'opacity-100 visible'
        }`}>
            {NAVIGATION_ITEMS.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center gap-2 font-kumbh-sans font-medium text-base xl:text-lg text-gray-300 hover:text-brand-primary transition-all duration-300"
                >
                    {item.icon && <item.icon className="h-4 w-4 xl:h-5 xl:w-5 opacity-70 group-hover:opacity-100" />}
                    <span>{item.name}</span>
                </Link>
            ))}
            {showBecomeSeller && (
                <Link
                    href="/become-seller"
                    className="group flex items-center gap-2 font-kumbh-sans font-medium text-base xl:text-lg text-brand-primary hover:text-white transition-all duration-300"
                >
                    <TrendingUp className="h-4 w-4 xl:h-5 xl:w-5 opacity-70 group-hover:opacity-100" />
                    <span>Become a seller</span>
                </Link>
            )}
        </nav>
    )
}