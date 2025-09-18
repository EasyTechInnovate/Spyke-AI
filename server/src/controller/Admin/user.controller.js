import userModel from '../../model/user.model.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import responseMessage from '../../constant/responseMessage.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import { notificationService } from '../../util/notification.js'
import { EUserRole } from '../../constant/application.js'

dayjs.extend(utc)

export const self = (req, res, next) => {
    try {
        httpResponse(req, res, 200, responseMessage.SERVICE('Admin User Management'))
    } catch (err) {
        httpError(next, err, req, 500)
    }
}

export const suspendUser = async (req, res, next) => {
    try {
        const { authenticatedUser } = req
        const { userId } = req.params
        const { reason } = req.body

        if (userId === authenticatedUser.id) {
            return httpError(next, new Error('Cannot suspend your own account'), req, 400)
        }

        const user = await userModel.findById(userId)
        if (!user) {
            return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
        }

        if (!user.isActive) {
            return httpError(next, new Error('User is already suspended'), req, 400)
        }

        // Don't allow suspending other admins
        if (user.roles.includes(EUserRole.ADMIN)) {
            return httpError(next, new Error('Cannot suspend administrator accounts'), req, 403)
        }

        user.isActive = false
        user.suspensionInfo = {
            reason: reason || 'Account suspended by administrator',
            suspendedBy: authenticatedUser.id,
            suspendedAt: dayjs().utc().toDate()
        }

        await user.save()

        await notificationService.sendToUser(
            userId,
            'Account Suspended',
            `Your account has been suspended. Reason: ${reason || 'Policy violation'}`,
            'warning'
        )

        const responseData = {
            userId: user._id,
            emailAddress: user.emailAddress,
            name: user.name,
            isActive: user.isActive,
            suspensionInfo: user.suspensionInfo
        }

        httpResponse(req, res, 200, 'User suspended successfully', responseData)
    } catch (err) {
        httpError(next, err, req, 500)
    }
}

export const activateUser = async (req, res, next) => {
    try {
        const { authenticatedUser } = req
        const { userId } = req.params
        const { activationNote } = req.body

        const user = await userModel.findById(userId)
        if (!user) {
            return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
        }

        if (user.isActive) {
            return httpError(next, new Error('User is already active'), req, 400)
        }

        // Update user status
        user.isActive = true
        user.activationInfo = {
            activatedBy: authenticatedUser.id,
            activatedAt: dayjs().utc().toDate(),
            note: activationNote || 'Account reactivated by administrator'
        }

        // Clear suspension info
        user.suspensionInfo = undefined

        await user.save()

        // Send notification to user
        await notificationService.sendToUser(
            userId,
            'Account Activated',
            `Your account has been reactivated. ${activationNote || 'You can now access all platform features.'}`,
            'success'
        )

        const responseData = {
            userId: user._id,
            emailAddress: user.emailAddress,
            name: user.name,
            isActive: user.isActive,
            activationInfo: user.activationInfo
        }

        httpResponse(req, res, 200, 'User activated successfully', responseData)
    } catch (err) {
        httpError(next, err, req, 500)
    }
}

export const getUserManagementAnalytics = async (req, res, next) => {
    try {
        const { period = '30d' } = req.query

        let dateFilter
        switch (period) {
            case '7d':
                dateFilter = dayjs().subtract(7, 'day').toDate()
                break
            case '30d':
                dateFilter = dayjs().subtract(30, 'day').toDate()
                break
            case '90d':
                dateFilter = dayjs().subtract(90, 'day').toDate()
                break
            default:
                dateFilter = dayjs().subtract(30, 'day').toDate()
        }

        // Get total counts
        const totalUsers = await userModel.countDocuments({ isDeleted: false })
        const activeUsers = await userModel.countDocuments({ isActive: true, isDeleted: false })
        const suspendedUsers = await userModel.countDocuments({ isActive: false, isDeleted: false })

        // Get recent suspensions
        const recentSuspensions = await userModel.countDocuments({
            'suspensionInfo.suspendedAt': { $gte: dateFilter },
            isDeleted: false
        })

        // Get recent activations
        const recentActivations = await userModel.countDocuments({
            'activationInfo.activatedAt': { $gte: dateFilter },
            isDeleted: false
        })

        // Get user role distribution
        const roleDistribution = await userModel.aggregate([
            { $match: { isDeleted: false } },
            { $unwind: '$roles' },
            { $group: { _id: '$roles', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ])

        const responseData = {
            overview: {
                totalUsers,
                activeUsers,
                suspendedUsers,
                suspensionRate: totalUsers > 0 ? ((suspendedUsers / totalUsers) * 100).toFixed(2) : 0
            },
            recentActivity: {
                period,
                suspensions: recentSuspensions,
                activations: recentActivations
            },
            roleDistribution
        }

        httpResponse(req, res, 200, responseMessage.SUCCESS, responseData)
    } catch (err) {
        httpError(next, err, req, 500)
    }
}