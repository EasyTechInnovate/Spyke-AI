'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useNotifications } from '@/components/shared/NotificationProvider'

// Upload queue item structure
class UploadQueueItem {
    constructor(file, type, options = {}) {
        this.id = Math.random().toString(36).substr(2, 9)
        this.file = file
        this.type = type // 'thumbnail', 'additional', 'video'
        this.status = 'pending' // pending, uploading, completed, failed
        this.progress = 0
        this.error = null
        this.result = null
        this.retryCount = 0
        this.maxRetries = options.maxRetries || 3
        this.onSuccess = options.onSuccess
        this.onError = options.onError
        this.onProgress = options.onProgress
        this.category = options.category || 'general'
        this.maxSize = options.maxSize || 10
    }
}

export const useFileUploadQueue = () => {
    const [queue, setQueue] = useState([])
    const [isProcessing, setIsProcessing] = useState(false)
    const processingRef = useRef(false)
    const abortControllersRef = useRef(new Map())
    const { showSuccess, showError } = useNotifications()

    // Add file to upload queue
    const addToQueue = useCallback((file, type, options = {}) => {
        const queueItem = new UploadQueueItem(file, type, options)
        
        // Validate file before adding to queue
        const validationError = validateFile(file, type, options.maxSize)
        if (validationError) {
            showError(validationError)
            return null
        }

        setQueue(prev => [...prev, queueItem])
        return queueItem.id
    }, [showError])

    // Remove item from queue
    const removeFromQueue = useCallback((id) => {
        // Abort upload if in progress
        const controller = abortControllersRef.current.get(id)
        if (controller) {
            controller.abort()
            abortControllersRef.current.delete(id)
        }

        setQueue(prev => prev.filter(item => item.id !== id))
    }, [])

    // Retry failed upload
    const retryUpload = useCallback((id) => {
        setQueue(prev => prev.map(item => 
            item.id === id 
                ? { ...item, status: 'pending', error: null, progress: 0 }
                : item
        ))
    }, [])

    // Clear completed/failed uploads
    const clearCompleted = useCallback(() => {
        setQueue(prev => prev.filter(item => 
            item.status === 'pending' || item.status === 'uploading'
        ))
    }, [])

    // File validation
    const validateFile = useCallback((file, type, maxSize = 10) => {
        if (!file) return 'No file selected'

        // Size validation
        const maxSizeBytes = maxSize * 1024 * 1024
        if (file.size > maxSizeBytes) {
            return `File size must be less than ${maxSize}MB`
        }

        // Type validation
        switch (type) {
            case 'thumbnail':
            case 'additional':
                if (!file.type.startsWith('image/')) {
                    return 'Please select an image file (JPG, PNG, WebP)'
                }
                break
            case 'video':
                if (!file.type.startsWith('video/')) {
                    return 'Please select a video file'
                }
                if (file.size > 150 * 1024 * 1024) { // 150MB for video
                    return 'Video file must be less than 150MB'
                }
                break
            default:
                break
        }

        return null
    }, [])

    // Process upload queue
    const processQueue = useCallback(async () => {
        if (processingRef.current) return
        
        processingRef.current = true
        setIsProcessing(true)

        const pendingUploads = queue.filter(item => item.status === 'pending')
        
        for (const item of pendingUploads) {
            try {
                // Update status to uploading
                setQueue(prev => prev.map(queueItem => 
                    queueItem.id === item.id 
                        ? { ...queueItem, status: 'uploading', progress: 0 }
                        : queueItem
                ))

                // Create abort controller for this upload
                const controller = new AbortController()
                abortControllersRef.current.set(item.id, controller)

                const result = await uploadFile(item, controller.signal)
                
                // Remove abort controller
                abortControllersRef.current.delete(item.id)

                // Update status to completed
                setQueue(prev => prev.map(queueItem => 
                    queueItem.id === item.id 
                        ? { ...queueItem, status: 'completed', progress: 100, result }
                        : queueItem
                ))

                // Call success callback
                if (item.onSuccess) {
                    item.onSuccess(result)
                }

                showSuccess(`${item.type === 'thumbnail' ? 'Thumbnail' : item.type === 'additional' ? 'Image' : 'Video'} uploaded successfully`)

            } catch (error) {
                // Remove abort controller
                abortControllersRef.current.delete(item.id)

                // Check if we should retry
                if (item.retryCount < item.maxRetries && !controller.signal.aborted) {
                    setQueue(prev => prev.map(queueItem => 
                        queueItem.id === item.id 
                            ? { ...queueItem, retryCount: queueItem.retryCount + 1, status: 'pending' }
                            : queueItem
                    ))
                    continue
                }

                // Mark as failed
                setQueue(prev => prev.map(queueItem => 
                    queueItem.id === item.id 
                        ? { ...queueItem, status: 'failed', error: error.message }
                        : queueItem
                ))

                // Call error callback
                if (item.onError) {
                    item.onError(error)
                }

                if (!controller.signal.aborted) {
                    showError(`Failed to upload ${item.type}: ${error.message}`)
                }
            }
        }

        processingRef.current = false
        setIsProcessing(false)
    }, [queue, showSuccess, showError])

    // Mock upload function (replace with actual upload logic)
    const uploadFile = useCallback(async (item, signal) => {
        const formData = new FormData()
        formData.append('file', item.file)
        formData.append('category', item.category)

        // Simulate upload progress
        const progressInterval = setInterval(() => {
            setQueue(prev => prev.map(queueItem => 
                queueItem.id === item.id 
                    ? { ...queueItem, progress: Math.min(queueItem.progress + 10, 90) }
                    : queueItem
            ))
        }, 200)

        try {
            // Replace with actual upload endpoint
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                signal
            })

            clearInterval(progressInterval)

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`)
            }

            const data = await response.json()
            return data.url || URL.createObjectURL(item.file) // Fallback to local URL for demo
        } catch (error) {
            clearInterval(progressInterval)
            throw error
        }
    }, [])

    // Auto-process queue when items are added
    useEffect(() => {
        if (queue.some(item => item.status === 'pending') && !processingRef.current) {
            processQueue()
        }
    }, [queue, processQueue])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Abort all ongoing uploads
            abortControllersRef.current.forEach(controller => controller.abort())
            abortControllersRef.current.clear()
        }
    }, [])

    return {
        queue,
        isProcessing,
        addToQueue,
        removeFromQueue,
        retryUpload,
        clearCompleted,
        processQueue
    }
}