import Link from 'next/link'
import { SpykeLogo } from '@/components/Logo'

export default function HeaderLogo() {
    return (
        <Link href="/" className="flex items-center z-10 group">
            {/* Desktop Logo - Icon only, no text */}
            <div className="hidden md:flex items-center">
                <SpykeLogo
                    sizePreset="lg"
                    showText={false}
                    darkMode={true}
                    priority={true}
                    className="group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            {/* Mobile Logo - Icon only */}
            <div className="md:hidden flex items-center">
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