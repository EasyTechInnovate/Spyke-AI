import React, { useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { useImageUpload } from '@/hooks/useImageUpload'
const ImageUpload = ({
    label,
    value,
    onChange,
    category = 'images',
    maxSize = 5,
    acceptedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    required = false,
    error,
    placeholder = 'Click to upload image or enter URL',
    helperText,
    className = '',
    showPreview = true,
    onUploadStart,
    onUploadEnd
}) => {
    const fileInputRef = useRef(null)
    const { uploading, progress, uploadImage, error: uploadError } = useImageUpload({
        category,
        maxSize,
        acceptedFormats,
        onSuccess: (url) => {
            if (onChange) {
                onChange({ target: { value: url } })
            }
            onUploadEnd?.()
        },
        onError: (errorMessage) => {
            console.error('Image upload failed:', errorMessage)
            onUploadEnd?.()
        }
    })

    const handleFileSelect = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        
        onUploadStart?.()
        try {
            await uploadImage(file)
        } catch (err) {
            // onUploadEnd is already called in the onError callback
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleUrlChange = (e) => {
        if (onChange) {
            onChange(e)
        }
    }
    const handleRemoveImage = () => {
        if (onChange) {
            onChange({ target: { value: '' } })
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }
    const displayError = error || uploadError
    return (
        <div className={`space-y-3 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-white">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            {showPreview && value && (
                <div className="relative inline-block">
                    <img
                        src={value}
                        alt="Preview"
                        className="w-32 h-20 object-cover rounded-lg border border-gray-700"
                        onError={(e) => {
                            e.target.style.display = 'none'
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                        disabled={uploading}
                    >
                        <X className="w-3 h-3 text-white" />
                    </button>
                </div>
            )}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptedFormats.join(',')}
                        onChange={handleFileSelect}
                        className="hidden"
                        id={`image-upload-${category}`}
                        disabled={uploading}
                    />
                    <label
                        htmlFor={`image-upload-${category}`}
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:border-gray-600 cursor-pointer transition-all ${
                            uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4" />
                        )}
                        {uploading ? 'Uploading...' : 'Upload Image'}
                    </label>
                    {uploading && progress > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>{progress}%</span>
                            <div className="w-20 bg-gray-800 rounded-full h-2">
                                <div
                                    className="h-full bg-brand-primary transition-all duration-300 rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="relative">
                    <input
                        type="url"
                        value={value || ''}
                        onChange={handleUrlChange}
                        placeholder={placeholder}
                        disabled={uploading}
                        className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all ${
                            displayError 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 hover:border-gray-600'
                        } ${uploading ? 'opacity-50' : ''}`}
                    />
                    {value && !uploading && (
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                    )}
                </div>
            </div>
            {helperText && !displayError && (
                <p className="text-xs text-gray-400">{helperText}</p>
            )}
            <p className="text-xs text-gray-500">
                Max size: {maxSize}MB | Formats: {acceptedFormats.map(f => f.replace('.', '').toUpperCase()).join(', ')}
            </p>
            {displayError && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{displayError}</p>
                </div>
            )}
        </div>
    )
}
export default ImageUpload