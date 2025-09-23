export default function LoadingSpinner({ message = "Loading...", size = "default" }) {
    const sizeClasses = {
        small: "h-6 w-6",
        default: "h-12 w-12", 
        large: "h-16 w-16"
    }
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className={`animate-spin rounded-full border-b-2 border-brand-primary mx-auto mb-4 ${sizeClasses[size]}`}></div>
                <p className="text-gray-400">{message}</p>
            </div>
        </div>
    )
}