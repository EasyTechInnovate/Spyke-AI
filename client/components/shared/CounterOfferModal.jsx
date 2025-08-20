import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, Calculator, AlertCircle, CheckCircle } from 'lucide-react'

export default function CounterOfferModal({ isOpen, onClose, onSubmit, currentOffer, sellerData, productData }) {
    const [counterOffer, setCounterOffer] = useState('')
    const [reasoning, setReasoning] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showCalculator, setShowCalculator] = useState(false)
    const [errors, setErrors] = useState({})
    const modalRef = useRef(null)

    const validateForm = () => {
        const newErrors = {}

        if (!counterOffer || parseFloat(counterOffer) <= 0) {
            newErrors.counterOffer = 'Please enter a valid commission rate'
        } else if (parseFloat(counterOffer) > 50) {
            newErrors.counterOffer = 'Commission rate cannot exceed 50%'
        } else if (parseFloat(counterOffer) < 1) {
            newErrors.counterOffer = 'Commission rate must be at least 1%'
        }

        if (!reasoning.trim()) {
            newErrors.reasoning = 'Please provide reasoning for your counter offer'
        } else if (reasoning.trim().length < 10) {
            newErrors.reasoning = 'Please provide more detailed reasoning (at least 10 characters)'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            await onSubmit({
                counterOffer: parseFloat(counterOffer),
                reasoning: reasoning.trim(),
                originalOffer: currentOffer
            })

            // Reset form
            setCounterOffer('')
            setReasoning('')
            setErrors({})
            onClose()
        } catch (error) {
            setErrors({ submit: 'Failed to submit counter offer. Please try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        onClose()
    }

    const calculatePotentialEarnings = () => {
        if (!counterOffer || !productData?.price) return 0
        return (parseFloat(counterOffer) / 100) * productData.price
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={(e) => e.target === e.currentTarget && handleClose()}>
                <motion.div
                    ref={modalRef}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Counter Offer</h3>
                                <p className="text-sm text-gray-500">Current offer: {currentOffer}%</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="p-6 space-y-6">
                        {/* Counter Offer Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Counter Offer (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    max="50"
                                    value={counterOffer}
                                    onChange={(e) => setCounterOffer(e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.counterOffer ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter commission rate"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <span className="text-gray-500">%</span>
                                </div>
                            </div>
                            {errors.counterOffer && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.counterOffer}
                                </p>
                            )}
                        </div>

                        {/* Potential Earnings Calculator */}
                        {counterOffer && productData?.price && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calculator className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-800">Potential Earnings</span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">${calculatePotentialEarnings().toFixed(2)}</p>
                                <p className="text-xs text-green-600 mt-1">Per sale at {counterOffer}% commission</p>
                            </motion.div>
                        )}

                        {/* Reasoning */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reasoning for Counter Offer</label>
                            <textarea
                                value={reasoning}
                                onChange={(e) => setReasoning(e.target.value)}
                                rows={4}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                                    errors.reasoning ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Explain why you believe this commission rate is justified..."
                            />
                            <div className="flex justify-between items-center mt-1">
                                {errors.reasoning ? (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.reasoning}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-500">Minimum 10 characters required</p>
                                )}
                                <span className="text-sm text-gray-400">{reasoning.length}/500</span>
                            </div>
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-600 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.submit}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Submit Counter Offer
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
