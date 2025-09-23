import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2, Shield, Building, Receipt, Clock, Eye, DollarSign, Mail, Bell } from 'lucide-react'
import sellerAPI from '@/lib/api/seller'
import apiClient from '@/lib/api/client'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
const VerificationSuccessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-lg">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Documents Submitted Successfully!</h2>
                        <p className="text-gray-400">Your verification is now in progress</p>
                    </div>
                    <div className="space-y-4 mb-6">
                        <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
                            <h3 className="font-semibold text-white mb-3">What happens next?</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Eye className="w-3 h-3 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Document Review</p>
                                        <p className="text-xs text-gray-400">Our team will verify your documents within 1-2 business days</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <DollarSign className="w-3 h-3 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Commission Offer</p>
                                        <p className="text-xs text-gray-400">You'll receive a personalized commission rate offer</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle className="w-3 h-3 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Start Selling</p>
                                        <p className="text-xs text-gray-400">Accept the offer and begin creating products</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-400 mb-1">Stay Updated</p>
                                    <p className="text-xs text-gray-300">
                                        We'll send you email notifications at each step. You can also check your
                                        <span className="text-blue-400 font-medium"> seller dashboard</span> for real-time updates.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-400 mb-1">Expected Timeline</p>
                                    <p className="text-xs text-gray-300">
                                        Most applications are processed within <span className="font-medium">24-48 hours</span>. Complex cases may
                                        take up to 5 business days.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-[#00FF89] text-[#121212] rounded-lg font-semibold hover:bg-[#00FF89]/90 transition-colors">
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    )
}
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
    const [notification, setNotification] = useState(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const fileInputRefs = {
        identityProof: useRef(null),
        businessProof: useRef(null),
        taxDocument: useRef(null)
    }
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
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
            Object.values(fileInputRefs).forEach((ref) => {
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
            description: "Government-issued ID, Passport, or Driver's License",
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
            const result = await apiClient.upload('v1/upload/file', formData)
            if (result?.success && result?.data) {
                return result.data
            }
            throw new Error(result?.message || 'Upload failed')
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
            showMessage(`File size must be less than ${config.maxSize}MB`, 'error')
            return
        }
        const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`
        if (!config.acceptedFormats.includes(fileExtension)) {
            showMessage('Invalid file format. Please upload PDF, JPG, or PNG files.', 'error')
            return
        }
        try {
            setUploading((prev) => ({ ...prev, [documentType]: true }))
            setUploadProgress((prev) => ({ ...prev, [documentType]: 0 }))
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
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
            setUploadProgress((prev) => ({ ...prev, [documentType]: 100 }))
            await new Promise((resolve) => setTimeout(resolve, 500))
            setDocuments((prev) => ({
                ...prev,
                [documentType]: {
                    name: file.name,
                    size: file.size,
                    url: url
                }
            }))
            showMessage(`${config.title} uploaded successfully`, 'success')
        } catch (error) {
            showMessage(`Failed to upload ${config.title}: ${error.message}`, 'error')
            console.error(error)
        } finally {
            setUploading((prev) => ({ ...prev, [documentType]: false }))
            setUploadProgress((prev) => ({ ...prev, [documentType]: 0 }))
        }
    }
    const removeDocument = (documentType) => {
        setDocuments((prev) => ({ ...prev, [documentType]: null }))
        if (fileInputRefs[documentType].current) {
            fileInputRefs[documentType].current.value = ''
        }
    }
    const handleSubmit = async () => {
        if (!documents.identityProof) {
            showMessage('Please upload your identity proof (required)', 'error')
            return
        }
        try {
            setSubmitting(true)
            const payload = {
                identityProof: documents.identityProof.url,
                ...(documents.businessProof && { businessProof: documents.businessProof.url }),
                ...(documents.taxDocument && { taxDocument: documents.taxDocument.url })
            }
            const minimumLoaderTime = new Promise((resolve) => setTimeout(resolve, 2000))
            const apiCall = sellerAPI.submitVerification(payload)
            const [response] = await Promise.all([apiCall, minimumLoaderTime])
            if (response && (response.success === true || response.verificationStatus === 'under_review')) {
                setDocuments({
                    identityProof: null,
                    businessProof: null,
                    taxDocument: null
                })
                if (onSuccess) {
                    onSuccess()
                }
                handleClose()
                setShowSuccessModal(true)
            } else if (response && response.success === false) {
                throw new Error(response.message || 'Submission failed')
            } else {
                setDocuments({
                    identityProof: null,
                    businessProof: null,
                    taxDocument: null
                })
                if (onSuccess) {
                    onSuccess()
                }
                handleClose()
                setShowSuccessModal(true)
            }
        } catch (error) {
            showMessage(error.message || 'Failed to submit documents. Please try again.', 'error')
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
    return (
        <>
            {isOpen && (
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
                                    disabled={submitting}>
                                    <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-6">
                                {Object.entries(documentConfig).map(([documentType, config]) => {
                                    const optional = documentType !== 'identityProof'
                                    const Icon = config.icon
                                    const document = documents[documentType]
                                    const isUploading = uploading[documentType]
                                    const progress = uploadProgress[documentType]
                                    return (
                                        <div
                                            key={documentType}
                                            className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                        document ? 'bg-[#00FF89]/20' : 'bg-gray-800'
                                                    }`}>
                                                    <Icon className={`w-6 h-6 ${document ? 'text-[#00FF89]' : 'text-gray-500'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-lg font-semibold text-white">
                                                            {config.title}{' '}
                                                            {optional && <span className="text-xs font-normal text-gray-400 ml-1">(Optional)</span>}
                                                        </h3>
                                                        {document && <CheckCircle className="w-5 h-5 text-[#00FF89]" />}
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
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:border-gray-600 cursor-pointer transition-all">
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
                                                                className="p-1 hover:bg-[#00FF89]/20 rounded transition-colors">
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
                                            <li>• Identity Proof is required. Business & Tax documents are optional but help speed approval</li>
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
                                    disabled={submitting || !documents.identityProof}
                                    className="flex-1 px-6 py-3 bg-[#00FF89] text-[#121212] rounded-lg font-semibold hover:bg-[#00FF89]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
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
                                    className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all border border-gray-700">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <VerificationSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
            />
        </>
    )
}
export default DocumentUploadModal