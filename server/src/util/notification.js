import userModel from '../model/user.model.js'
import mongoose from 'mongoose'

export const notificationService = {
    sendToUser: async (userId, title, message, type = 'info', expiresAt = null) => {
        try {
            const user = await userModel.findById(userId)
            if (user) {
                user.addNotification(title, message, type, expiresAt)
                await user.save()
                return true
            }
            return false
        } catch (error) {
            console.error('Failed to send notification:', error)
            return false
        }
    },

    sendToRole: async (role, title, message, type = 'info', expiresAt = null) => {
        try {
            await userModel.updateMany(
                { roles: role },
                {
                    $push: {
                        notifications: {
                            _id: new mongoose.Types.ObjectId(),
                            title,
                            message,
                            type,
                            isRead: false,
                            readAt: null,
                            createdAt: new Date(),
                            expiresAt
                        }
                    }
                }
            )
            return true
        } catch (error) {
            console.error('Failed to send role notification:', error)
            return false
        }
    },

    sendToAdmins: async (title, message, type = 'info', expiresAt = null) => {
        try {
            await userModel.updateMany(
                { roles: 'admin' },
                {
                    $push: {
                        notifications: {
                            _id: new mongoose.Types.ObjectId(),
                            title,
                            message,
                            type,
                            isRead: false,
                            readAt: null,
                            createdAt: new Date(),
                            expiresAt
                        }
                    }
                }
            )
            return true
        } catch (error) {
            console.error('Failed to send admin notification:', error)
            return false
        }
    },

    sendToAll: async (title, message, type = 'info', expiresAt = null) => {
        try {
            await userModel.updateMany(
                { isActive: true },
                {
                    $push: {
                        notifications: {
                            _id: new mongoose.Types.ObjectId(),
                            title,
                            message,
                            type,
                            isRead: false,
                            readAt: null,
                            createdAt: new Date(),
                            expiresAt
                        }
                    }
                }
            )
            return true
        } catch (error) {
            console.error('Failed to send bulk notification:', error)
            return false
        }
    }
}
