export function getInitials(name, email) {
    const displayName = getDisplayName(name, email)
    if (!displayName) return 'U'
    return displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
}

export function getDisplayName(name, email) {
    if (name && name.trim()) return name

    if (email) {
        const emailName = email.split('@')[0]
        const formattedName = emailName
            .replace(/[\._\-\+\d]/g, ' ')
            .split(' ')
            .filter((part) => part.length > 0)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ')

        return formattedName || emailName
    }

    return null
}

export default function UserAvatar({ user, size = 'md' }) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm',
        lg: 'w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base'
    }

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-brand-primary to-green-400 flex items-center justify-center flex-shrink-0`}>
            {user?.avatar ? (
                <img
                    src={user.avatar}
                    alt={getDisplayName(user.name, user.emailAddress || user.email)}
                    className="w-full h-full rounded-full object-cover"
                />
            ) : (
                <span className="text-black font-semibold">
                    {getInitials(user?.name, user?.emailAddress || user?.email)}
                </span>
            )}
        </div>
    )
}