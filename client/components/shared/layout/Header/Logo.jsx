import Link from 'next/link'
import { SpykeLogo } from '@/components/Logo'

export default function HeaderLogo() {
    return (
        <Link href="/" className="flex items-center z-10 group">
            {/* Desktop Logo - Extra large size, same alignment */}
            <div className="hidden sm:flex items-center">
                <SpykeLogo
                    sizePreset="3xl"
                    showText={false}
                    darkMode={true}
                    priority={true}
                    className="translate-y-[3px] group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            {/* Mobile Logo - Keep compact size */}
            <div className="sm:hidden flex items-center">
                <SpykeLogo
                    sizePreset="3xl"
                    showText={false}
                    darkMode={true}
                    priority={true}
                    className="translate-y-[3px] group-hover:scale-105 transition-transform duration-300"
                />
            </div>
        </Link>
    )
}