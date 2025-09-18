import PlatformSettings from '../../model/platform.settings.model.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import responseMessage from '../../constant/responseMessage.js'

export const self = (req, res, next) => {
    try {
        httpResponse(req, res, 200, responseMessage.SERVICE('Platform Settings'))
    } catch (err) {
        httpError(next, err, req, 500)
    }
}

export const getPlatformSettings = async (req, res, next) => {
    try {
        const { authenticatedUser } = req
        const settings = await PlatformSettings.getCurrentSettings(authenticatedUser.id)
        
        return httpResponse(req, res, 200, responseMessage.SUCCESS, settings)
    } catch (error) {
        console.error('Error in getPlatformSettings:', error)
        httpError(next, error, req, 500)
    }
}

export const updatePlatformSettings = async (req, res, next) => {
    try {
        const {
            platformFeePercentage,
            minimumPayoutThreshold,
            payoutProcessingTime,
            paymentProcessingFee,
            holdPeriodNewSellers,
            autoPayoutEnabled,
            maxPayoutAmount,
            currency
        } = req.body

        const adminId = req.authenticatedUser.id
        
        let settings = await PlatformSettings.getCurrentSettings(adminId)
        
        if (settings) {
            if (platformFeePercentage !== undefined) settings.platformFeePercentage = platformFeePercentage
            if (minimumPayoutThreshold !== undefined) settings.minimumPayoutThreshold = minimumPayoutThreshold
            if (payoutProcessingTime !== undefined) settings.payoutProcessingTime = payoutProcessingTime
            if (paymentProcessingFee !== undefined) settings.paymentProcessingFee = paymentProcessingFee
            if (holdPeriodNewSellers !== undefined) settings.holdPeriodNewSellers = holdPeriodNewSellers
            if (autoPayoutEnabled !== undefined) settings.autoPayoutEnabled = autoPayoutEnabled
            if (maxPayoutAmount !== undefined) settings.maxPayoutAmount = maxPayoutAmount
            if (currency !== undefined) settings.currency = currency
            
            settings.lastUpdatedBy = adminId
            await settings.save()
        } else {
            settings = new PlatformSettings({
                platformFeePercentage: platformFeePercentage || 10,
                minimumPayoutThreshold: minimumPayoutThreshold || 50,
                payoutProcessingTime: payoutProcessingTime || 7,
                paymentProcessingFee: paymentProcessingFee || 0,
                holdPeriodNewSellers: holdPeriodNewSellers || 14,
                autoPayoutEnabled: autoPayoutEnabled || false,
                maxPayoutAmount: maxPayoutAmount || 10000,
                currency: currency || 'USD',
                lastUpdatedBy: adminId
            })
            await settings.save()
        }

        await settings.populate('lastUpdatedBy', 'firstName lastName email')
        
        return httpResponse(req, res, 200, 'Platform settings updated successfully', settings)
    } catch (error) {
        console.error('Error in updatePlatformSettings:', error)
        httpError(next, error, req, 500)
    }
}

export const resetPlatformSettings = async (req, res, next) => {
    try {
        const adminId = req.authenticatedUser.id
        
        await PlatformSettings.findOneAndUpdate(
            { isActive: true },
            { isActive: false }
        )
        
        const defaultSettings = new PlatformSettings({
            lastUpdatedBy: adminId
        })
        await defaultSettings.save()
        await defaultSettings.populate('lastUpdatedBy', 'firstName lastName email')
        
        return httpResponse(req, res, 200, 'Platform settings reset to defaults successfully', defaultSettings)
    } catch (error) {
        console.error('Error in resetPlatformSettings:', error)
        httpError(next, error, req, 500)
    }
}