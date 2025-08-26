    const handleStartReview = async () => {
        if (!seller?._id) return
        
        setActionLoading(true)
        try {
            await adminAPI.sellers.profile.startReview(seller._id)
            
            // Update local state to reflect the change
            onUpdate?.(seller._id, { 
                'verification.status': 'UNDER_REVIEW',
                'verification.reviewStartedAt': new Date().toISOString()
            })
            
            toast.success('Review started successfully!')
        } catch (error) {
            console.error('Failed to start review:', error)
            toast.error(error.message || 'Failed to start review')
        } finally {
            setActionLoading(false)
        }
    }