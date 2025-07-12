import { useState, useRef } from 'react'
import { 
    Upload, 
    FileText, 
    CheckCircle, 
    AlertCircle, 
    X, 
    Loader2,
    Shield,
    Building,
    Receipt
} from 'lucide-react'
import { toast } from 'sonner'
import sellerAPI from '@/lib/api/seller'

const DocumentUploadModal = ({ isOpen, onClose, onSuccess }) => {
    const [documents, setDocuments] = useState({
        identityProof: null,
        businessProof: null,
        taxDocument: null
    })
    const [uploadProgress, setUploadProgress] = useState({
        identityProof: 0,
        businessProof: 0,
        taxDocument: 0
    })
    const [uploading, setUploading] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const fileInputRefs = {
        identityProof: useRef(null),
        businessProof: useRef(null),
        taxDocument: useRef(null)
    }

    const handleClose = () => {
        if (!submitting) {
            setDocuments({
                identityProof: null,
                businessProof: null,
                taxDocument: null
            })
            setUploadProgress({
                identityProof: 0,
                businessProof: 0,
                taxDocument: 0
            })
            setUploading({})
            
            Object.values(fileInputRefs).forEach(ref => {
                if (ref.current) {
                    ref.current.value = ''
                }
            })
            
            onClose()
        }
    }

    const documentConfig = {
        identityProof: {
            title: 'Identity Proof',
            description: 'Government-issued ID, Passport, or Driver\'s License',
            icon: Shield,
            acceptedFormats: '.pdf,.jpg,.jpeg,.png',
            maxSize: 5
        },
        businessProof: {
            title: 'Business Proof',
            description: 'Business registration, license, or incorporation certificate',
            icon: Building,
            acceptedFormats: '.pdf,.jpg,.jpeg,.png',
            maxSize: 5
        },
        taxDocument: {
            title: 'Tax Document',
            description: 'Tax registration, GST certificate, or VAT document',
            icon: Receipt,
            acceptedFormats: '.pdf,.jpg,.jpeg,.png',
            maxSize: 5
        }
    }

    const uploadFile = async (file, documentType) => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('category', documentType)

            const token = typeof window !== 'undefined' 
                ? (localStorage.getItem('sellerAccessToken') || localStorage.getItem('accessToken'))
                : null

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/v1/upload/file`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Upload failed')
            }

            const result = await response.json()
            
            if (result.success && result.data) {
                return result.data
            } else {
                throw new Error('No URL returned from upload')
            }
        } catch (error) {
            console.error('Upload error:', error)
            throw error
        }
    }

    const handleFileSelect = async (e, documentType) => {
        const file = e.target.files[0]
        if (!file) return

        const config = documentConfig[documentType]
        
        if (file.size > config.maxSize * 1024 * 1024) {
            toast.error(`File size must be less than ${config.maxSize}MB`)
            return
        }

        const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`
        if (!config.acceptedFormats.includes(fileExtension)) {
            toast.error('Invalid file format. Please upload PDF, JPG, or PNG files.')
            return
        }

        try {
            setUploading(prev => ({ ...prev, [documentType]: true }))
            setUploadProgress(prev => ({ ...prev, [documentType]: 0 }))
            
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const currentProgress = prev[documentType]
                    if (currentProgress >= 90) {
                        clearInterval(progressInterval)
                        return prev
                    }
                    return { ...prev, [documentType]: currentProgress + 10 }
                })
            }, 200)
            
            const url = await uploadFile(file, documentType)
            
            clearInterval(progressInterval)
            setUploadProgress(prev => ({ ...prev, [documentType]: 100 }))
            
            await new Promise(resolve => setTimeout(resolve, 500))
            
            setDocuments(prev => ({
                ...prev,
                [documentType]: {
                    name: file.name,
                    size: file.size,
                    url: url
                }
            }))
            
            toast.success(`${config.title} uploaded successfully`)
        } catch (error) {
            toast.error(`Failed to upload ${config.title}: ${error.message}`)
            console.error(error)
        } finally {
            setUploading(prev => ({ ...prev, [documentType]: false }))
            setUploadProgress(prev => ({ ...prev, [documentType]: 0 }))
        }
    }

    const removeDocument = (documentType) => {
        setDocuments(prev => ({ ...prev, [documentType]: null }))
        if (fileInputRefs[documentType].current) {
            fileInputRefs[documentType].current.value = ''
        }
    }

    const handleSubmit = async () => {
        if (!documents.identityProof || !documents.businessProof || !documents.taxDocument) {
            toast.error('Please upload all required documents')
            return
        }

        try {
            setSubmitting(true)
            
            const payload = {
                identityProof: documents.identityProof.url,
                businessProof: documents.businessProof.url,
                taxDocument: documents.taxDocument.url
            }
            
            const minimumLoaderTime = new Promise(resolve => setTimeout(resolve, 2000))
            const apiCall = sellerAPI.submitVerification(payload)
            
            const [response] = await Promise.all([apiCall, minimumLoaderTime])
            
            if (response && (response.success === true || response.verificationStatus === 'under_review')) {
                const message = response.message || 'Profile submitted for verification successfully'
                toast.success(message)
                
                setDocuments({
                    identityProof: null,
                    businessProof: null,
                    taxDocument: null
                })
                
                if (onSuccess) {
                    onSuccess()
                }
                
                handleClose()
            } else if (response && response.success === false) {
                throw new Error(response.message || 'Submission failed')
            } else {
                toast.success('Profile submitted for verification successfully')
                
                setDocuments({
                    identityProof: null,
                    businessProof: null,
                    taxDocument: null
                })
                
                if (onSuccess) {
                    onSuccess()
                }
                
                handleClose()
            }
        } catch (error) {
            toast.error(error.message || 'Failed to submit documents. Please try again.')
            console.error('Submission error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Submit Verification Documents</h2>
                            <p className="text-sm text-gray-400 mt-1">Upload the required documents to complete your verification</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors group"
                            disabled={submitting}
                        >
                            <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {Object.entries(documentConfig).map(([documentType, config]) => {
                            const Icon = config.icon
                            const document = documents[documentType]
                            const isUploading = uploading[documentType]
                            const progress = uploadProgress[documentType]
                            
                            return (
                                <div key={documentType} className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            document ? 'bg-[#00FF89]/20' : 'bg-gray-800'
                                        }`}>
                                            <Icon className={`w-6 h-6 ${document ? 'text-[#00FF89]' : 'text-gray-500'}`} />
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-white">{config.title}</h3>
                                                {document && (
                                                    <CheckCircle className="w-5 h-5 text-[#00FF89]" />
                                                )}
                                            </div>
                                            
                                            <p className="text-sm text-gray-400 mb-4">{config.description}</p>
                                            
                                            {!document && !isUploading && (
                                                <div>
                                                    <input
                                                        ref={fileInputRefs[documentType]}
                                                        type="file"
                                                        accept={config.acceptedFormats}
                                                        onChange={(e) => handleFileSelect(e, documentType)}
                                                        className="hidden"
                                                        id={`file-${documentType}`}
                                                    />
                                                    <label
                                                        htmlFor={`file-${documentType}`}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:border-gray-600 cursor-pointer transition-all"
                                                    >
                                                        <Upload className="w-4 h-4" />
                                                        Choose File
                                                    </label>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Max size: {config.maxSize}MB | Formats: PDF, JPG, PNG
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {isUploading && (
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Loader2 className="w-4 h-4 text-[#00FF89] animate-spin" />
                                                        <span className="text-sm text-gray-300">Uploading...</span>
                                                    </div>
                                                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                                        <div 
                                                            className="h-full bg-[#00FF89] transition-all duration-300"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {document && !isUploading && (
                                                <div className="flex items-center justify-between p-3 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-5 h-5 text-[#00FF89]" />
                                                        <div>
                                                            <p className="text-sm font-medium text-white">{document.name}</p>
                                                            <p className="text-xs text-gray-400">{formatFileSize(document.size)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeDocument(documentType)}
                                                        className="p-1 hover:bg-[#00FF89]/20 rounded transition-colors"
                                                    >
                                                        <X className="w-4 h-4 text-gray-400 hover:text-white" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-300">
                                <p className="font-medium text-blue-400 mb-1">Important:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• Ensure all documents are clear and readable</li>
                                    <li>• Documents should be valid and not expired</li>
                                    <li>• Business name should match across all documents</li>
                                    <li>• Verification typically takes 1-2 business days</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-800">
                    <div className="flex gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !documents.identityProof || !documents.businessProof || !documents.taxDocument}
                            className="flex-1 px-6 py-3 bg-[#00FF89] text-[#121212] rounded-lg font-semibold hover:bg-[#00FF89]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Submitting Documents...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Submit for Verification</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleClose}
                            disabled={submitting}
                            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all border border-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DocumentUploadModal