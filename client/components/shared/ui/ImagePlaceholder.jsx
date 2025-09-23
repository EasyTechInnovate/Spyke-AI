import { Package } from 'lucide-react'
export default function ImagePlaceholder({ text = 'Product', className = '' }) {
  return (
    <div className={`w-full h-full bg-gray-800 flex flex-col items-center justify-center ${className}`}>
      <Package className="w-12 h-12 text-gray-600 mb-2" />
      <span className="text-gray-500 text-sm">{text}</span>
    </div>
  )
}