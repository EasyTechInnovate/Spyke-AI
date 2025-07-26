import Link from 'next/link'
import { SpykeLogo } from '@/components/Logo'

export default function HeaderLogo() {
    return (
        <Link href="/" className="flex items-center z-10 group">
            {/* Desktop Logo */}
            <div className="hidden sm:block">
                <SpykeLogo
                    sizePreset="lg"
                    showText={true}
                    textSize="text-3xl"
                    darkMode={true}
                    priority={true}
                    className="[&_span]:!text-white [&_div]:!text-gray-400 group-hover:[&_span]:!text-brand-primary transition-all duration-300"
                />
            </div>
            {/* Mobile Logo */}
            <div className="sm:hidden">
                <SpykeLogo
                    sizePreset="md"
                    showText={false}
                    darkMode={true}
                    priority={true}
                    className="group-hover:scale-105 transition-transform duration-300"
                />
            </div>
        </Link>
    )
}