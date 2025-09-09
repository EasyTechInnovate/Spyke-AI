import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import quicker from '../../util/quicker.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import config from '../../config/config.js'
import userModel from '../../model/user.model.js'
import refreshTokenModel from '../../model/refresh.token.model.js'
import { notificationService } from '../../util/notification.js'
import emailService from '../../service/email.service.js'
import emailTemplates from '../../util/email.formatter.js'

dayjs.extend(utc)

export default {
    self: (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SERVICE('Authentication'))
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    register: async (req, res, next) => {
        try {
            const { emailAddress, password, phoneNumber, userLocation, consent, role, googleAuth, avatar } = req.body

            const existingUser = await userModel.findOne({ emailAddress })
            if (existingUser) {
                return httpError(next, new Error(responseMessage.AUTH.ALREADY_EXIST('User', emailAddress)), req, 400)
            }

            const { countryCode, isoCode, internationalNumber } = quicker.parsePhoneNumber(`+${phoneNumber}`)
            if (!countryCode || !isoCode || !internationalNumber) {
                return httpError(next, new Error(responseMessage.AUTH.INVALID_PHONE_NUMBER), req, 422)
            }

            const timezones = quicker.countryTimezone(isoCode)
            if (!timezones || Object.keys(timezones).length === 0) {
                return httpError(next, new Error(responseMessage.AUTH.INVALID_PHONE_NUMBER), req, 422)
            }

            const timezone = Object.keys(timezones)[0]
            const token = quicker.generateRandomId()
            const code = quicker.generateOtp(6)

            const userData = {
                name: null,
                emailAddress,
                phoneNumber: {
                    countryCode,
                    isoCode,
                    internationalNumber
                },
                timezone,
                password,
                userLocation,
                consent,
                roles: role ? [role] : ['USER'],
                accountConfirmation: {
                    status: false,
                    token,
                    code,
                    timestamp: null
                },
                passwordReset: {
                    token: null,
                    expiry: null,
                    lastResetAt: null
                },
                loginInfo: {
                    lastLogin: null,
                    loginCount: 0,
                    lastLoginIP: null,
                    registrationIP: req.ip || req.connection.remoteAddress
                }
            }

            if (googleAuth) {
                userData.googleAuth = googleAuth
                userData.password = undefined
            }

            if (avatar) {
                userData.avatar = avatar
            }

            const newUser = new userModel(userData)
            const savedUser = await newUser.save()

            const confirmationUrl = `${config.client.url}/auth/confirm/${token}?code=${code}`
            
            const registrationEmail = emailTemplates.registration({
                emailAddress: savedUser.emailAddress,
                confirmationUrl
            })

            try {
                await emailService.sendEmail(
                    savedUser.emailAddress,
                    registrationEmail.subject,
                    registrationEmail.text,
                    registrationEmail.html
                )
            } catch (emailError) {
                console.error('Failed to send registration email:', emailError)
            }

            await notificationService.sendToUser(
                savedUser._id,
                'Welcome to Our Platform!',
                'Your account has been created successfully. Please confirm your email to get started.',
                'success'
            )

            const userResponse = {
                id: savedUser._id,
                emailAddress: savedUser.emailAddress,
                accountConfirmation: {
                    status: savedUser.accountConfirmation.status
                }
            }

            httpResponse(req, res, 201, responseMessage.CREATED, userResponse)
        } catch (err) {
            if (err.code === 11000) {
                const field = Object.keys(err.keyPattern)[0]
                return httpError(next, new Error(responseMessage.ERROR.DUPLICATE_ENTRY(field)), req, 400)
            }

            if (err.name === 'ValidationError') {
                const firstError = Object.values(err.errors)[0]
                return httpError(next, new Error(firstError.message), req, 422)
            }

            httpError(next, err, req, 500)
        }
    },
    confirmation: async (req, res, next) => {
        try {
            const { params, query } = req
            const { token } = params
            const { code } = query

            const user = await userModel.findOne({
                'accountConfirmation.token': token,
                'accountConfirmation.code': code
            })

            if (!user) {
                return httpError(next, new Error(responseMessage.AUTH.TOKEN_INVALID), req, 400)
            }

            if (user.accountConfirmation.status) {
                return httpError(next, new Error(responseMessage.AUTH.ACCOUNT_ALREADY_CONFIRMED), req, 409)
            }

            user.accountConfirmation.status = true
            user.accountConfirmation.timestamp = dayjs().utc().toDate()
            user.isActive = true

            await user.save()

            const dashboardUrl = `${config.client.url}/dashboard`
            
            const confirmationEmail = emailTemplates.confirmation({
                emailAddress: user.emailAddress,
                dashboardUrl
            })

            try {
                await emailService.sendEmail(
                    user.emailAddress,
                    confirmationEmail.subject,
                    confirmationEmail.text,
                    confirmationEmail.html
                )
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError)
            }

            await notificationService.sendToUser(
                user._id,
                'Account Confirmed Successfully!',
                'Your account has been verified. You now have full access to all platform features.',
                'success'
            )

            const userResponse = {
                id: user._id,
                emailAddress: user.emailAddress,
                accountConfirmation: {
                    status: user.accountConfirmation.status,
                    confirmedAt: user.accountConfirmation.timestamp
                }
            }

            httpResponse(req, res, 200, responseMessage.AUTH.ACCOUNT_CONFIRMED, userResponse)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    login: async (req, res, next) => {
        try {
            const { emailAddress, password } = req.body

            const user = await userModel.findOne({ emailAddress })

            if (!user) {
                return httpError(next, new Error(responseMessage.AUTH.LOGIN_FAILED), req, 401)
            }

            if (!user.accountConfirmation.status) {
                return httpError(next, new Error(responseMessage.AUTH.ACCOUNT_NOT_CONFIRMED), req, 401)
            }

            const isPasswordValid = await user.comparePassword(password)
            if (!isPasswordValid) {
                return httpError(next, new Error(responseMessage.AUTH.LOGIN_FAILED), req, 401)
            }

            const accessTokenPayload = {
                userId: user._id,
                emailAddress: user.emailAddress,
                roles: user.roles
            }

            const refreshTokenPayload = {
                userId: user._id
            }

            const accessToken = quicker.generateToken(accessTokenPayload, config.jwt.accessToken.secret, config.jwt.accessToken.expiresIn)
            const refreshToken = quicker.generateToken(refreshTokenPayload, config.jwt.refreshToken.secret, config.jwt.refreshToken.expiresIn)

            user.updateLoginInfo(req.ip || req.connection.remoteAddress)
            await user.save()

            await refreshTokenModel.create({
                token: refreshToken
            })

            await notificationService.sendToUser(
                user._id,
                'Login Successful',
                `Welcome back! You logged in from ${req.ip || 'unknown location'} at ${dayjs().format('MMM DD, YYYY HH:mm')}`,
                'info'
            )

            const domain = quicker.getDomainFromUrl(req.get('origin') || req.get('host'))

            res.cookie('accessToken', accessToken, {
                path: config.env === 'development' ? '/v1' : '/api/v1',
                domain: domain,
                sameSite: 'strict',
                maxAge: 1000 * config.jwt.accessToken.expiresIn,
                httpOnly: true,
                secure: !(config.env === 'development')
            }).cookie('refreshToken', refreshToken, {
                path: config.env === 'development' ? '/v1' : '/api/v1',
                domain: domain,
                sameSite: 'strict',
                maxAge: 1000 * config.jwt.refreshToken.expiresIn,
                httpOnly: true,
                secure: !(config.env === 'development')
            })

            const userResponse = {
                id: user._id,
                emailAddress: user.emailAddress,
                name: user.name,
                avatar: user.avatar,
                roles: user.roles,
                isActive: user.isActive,
                phoneNumber: user.phoneNumber,
                timezone: user.timezone,
                userLocation: user.userLocation,
                loginInfo: {
                    lastLogin: user.loginInfo.lastLogin,
                    loginCount: user.loginInfo.loginCount
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            }

            httpResponse(req, res, 200, responseMessage.AUTH.LOGIN_SUCCESS, userResponse)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    me: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            httpResponse(req, res, 200, responseMessage.SUCCESS, authenticatedUser)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    logout: async (req, res, next) => {
        try {
            const refreshToken = req.cookies.refreshToken || req.headers.authorization?.replace('Bearer ', '')

            if (refreshToken) {
                await refreshTokenModel.deleteOne({ token: refreshToken })
            }

            res.clearCookie('accessToken', {
                path: config.env === 'development' ? '/v1' : '/api/v1'
            }).clearCookie('refreshToken', {
                path: config.env === 'development' ? '/v1' : '/api/v1'
            })

            httpResponse(req, res, 200, responseMessage.SUCCESS)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    refreshToken: async (req, res, next) => {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken || req.headers.authorization?.replace('Bearer ', '')

            if (!refreshToken) {
                return httpError(next, new Error(responseMessage.AUTH.TOKEN_INVALID), req, 401)
            }

            const tokenExists = await refreshTokenModel.findOne({ token: refreshToken })
            if (!tokenExists) {
                return httpError(next, new Error(responseMessage.AUTH.TOKEN_INVALID), req, 401)
            }

            const decoded = quicker.verifyToken(refreshToken, config.jwt.refreshToken.secret)

            const user = await userModel.findById(decoded.userId)
            if (!user || !user.isActive) {
                return httpError(next, new Error(responseMessage.AUTH.TOKEN_INVALID), req, 401)
            }

            const accessTokenPayload = {
                userId: user._id,
                emailAddress: user.emailAddress,
                roles: user.roles
            }

            const newAccessToken = quicker.generateToken(accessTokenPayload, config.jwt.accessToken.secret, config.jwt.accessToken.expiresIn)

            const domain = quicker.getDomainFromUrl(req.get('origin') || req.get('host'))

            res.cookie('accessToken', newAccessToken, {
                path: config.env === 'development' ? '/v1' : '/api/v1',
                domain: domain,
                sameSite: 'strict',
                maxAge: 1000 * config.jwt.accessToken.expiresIn,
                httpOnly: true,
                secure: !(config.env === 'development')
            })

            const responseData = {
                accessToken: newAccessToken
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData)
        } catch (err) {
            if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
                return httpError(next, new Error(responseMessage.AUTH.TOKEN_INVALID), req, 401)
            }
            httpError(next, err, req, 500)
        }
    },
    forgotPassword: async (req, res, next) => {
        try {
            const { emailAddress } = req.body

            const user = await userModel.findOne({ emailAddress })
            if (!user) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            const resetToken = quicker.generateRandomId()
            const resetExpiry = dayjs().add(1, 'hour').unix()

            user.passwordReset.token = resetToken
            user.passwordReset.expiry = resetExpiry
            await user.save()

            const resetUrl = `${config.client.url}/auth/reset-password?token=${resetToken}`
            
            const forgotPasswordEmail = emailTemplates.forgotPassword({
                emailAddress: user.emailAddress,
                resetUrl,
                resetToken
            })

            try {
                await emailService.sendEmail(
                    user.emailAddress,
                    forgotPasswordEmail.subject,
                    forgotPasswordEmail.text,
                    forgotPasswordEmail.html
                )
            } catch (emailError) {
                console.error('Failed to send forgot password email:', emailError)
            }

            await notificationService.sendToUser(
                user._id,
                'Password Reset Requested',
                'A password reset request has been initiated for your account. If this was not you, please contact support.',
                'warning',
                dayjs().add(1, 'hour').toDate()
            )

            httpResponse(req, res, 200, responseMessage.SUCCESS)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    resetPassword: async (req, res, next) => {
        try {
            const { token, newPassword } = req.body

            const user = await userModel.findOne({
                'passwordReset.token': token,
                'passwordReset.expiry': { $gt: dayjs().unix() }
            })

            if (!user) {
                return httpError(next, new Error(responseMessage.AUTH.PASSWORD_RESET_TOKEN_EXPIRED), req, 400)
            }

            user.password = newPassword
            user.passwordReset.token = null
            user.passwordReset.expiry = null
            user.passwordReset.lastResetAt = dayjs().utc().toDate()

            await user.save()

            const loginUrl = `${config.client.url}/auth/login`
            
            const resetPasswordEmail = emailTemplates.resetPassword({
                emailAddress: user.emailAddress,
                loginUrl
            })

            try {
                await emailService.sendEmail(
                    user.emailAddress,
                    resetPasswordEmail.subject,
                    resetPasswordEmail.text,
                    resetPasswordEmail.html
                )
            } catch (emailError) {
                console.error('Failed to send reset password email:', emailError)
            }

            await notificationService.sendToUser(
                user._id,
                'Password Reset Successful',
                'Your password has been successfully reset. If this was not you, please contact support immediately.',
                'success'
            )

            httpResponse(req, res, 200, responseMessage.AUTH.PASSWORD_RESET_SUCCESS)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    changePassword: async (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body
            const { authenticatedUser } = req

            const user = await userModel.findById(authenticatedUser.id)
            if (!user) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            const isCurrentPasswordValid = await user.comparePassword(currentPassword)
            if (!isCurrentPasswordValid) {
                return httpError(next, new Error(responseMessage.AUTH.INVALID_PASSWORD), req, 400)
            }

            user.password = newPassword
            await user.save()

            await notificationService.sendToUser(
                user._id,
                'Password Changed Successfully',
                'Your account password has been updated. If this was not you, please contact support immediately.',
                'success'
            )

            httpResponse(req, res, 200, responseMessage.SUCCESS)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    updateProfile: async (req, res, next) => {
        try {
            const { name, phoneNumber, avatar, userLocation } = req.body
            const { authenticatedUser } = req

            const user = await userModel.findById(authenticatedUser.id)
            if (!user) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            if (name) user.name = name
            if (avatar) user.avatar = avatar
            if (userLocation) user.userLocation = userLocation

            if (phoneNumber) {
                const { countryCode, isoCode, internationalNumber } = quicker.parsePhoneNumber(`+${phoneNumber}`)
                if (!countryCode || !isoCode || !internationalNumber) {
                    return httpError(next, new Error(responseMessage.AUTH.INVALID_PHONE_NUMBER), req, 422)
                }
                user.phoneNumber = { countryCode, isoCode, internationalNumber }
            }

            await user.save()

            await notificationService.sendToUser(
                user._id,
                'Profile Updated',
                'Your profile information has been successfully updated.',
                'info'
            )

            const userResponse = {
                id: user._id,
                emailAddress: user.emailAddress,
                name: user.name,
                avatar: user.avatar,
                phoneNumber: user.phoneNumber,
                userLocation: user.userLocation
            }

            httpResponse(req, res, 200, responseMessage.UPDATED, userResponse)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    checkEmailAvailability: async (req, res, next) => {
        try {
            const { emailAddress } = req.body

            const existingUser = await userModel.findOne({ emailAddress })

            const suggestions = []
            if (existingUser) {
                const username = emailAddress.split('@')[0]
                const domain = emailAddress.split('@')[1]

                suggestions.push(`${username}${Math.floor(Math.random() * 1000)}@${domain}`)
                suggestions.push(`${username}.${Math.floor(Math.random() * 100)}@${domain}`)
                suggestions.push(`${username}_${new Date().getFullYear()}@${domain}`)
            }

            const responseData = {
                available: !existingUser,
                emailAddress,
                suggestions: existingUser ? suggestions : []
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    getNotifications: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { page = 1, limit = 10, type } = req.query

            const user = await userModel.findById(authenticatedUser.id)
            if (!user) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            let notifications = user.notifications

            if (type) {
                notifications = notifications.filter((n) => n.type === type)
            }

            notifications = notifications.filter((n) => !n.expiresAt || n.expiresAt > new Date())

            const startIndex = (page - 1) * limit
            const endIndex = startIndex + parseInt(limit)
            const paginatedNotifications = notifications.sort((a, b) => b.createdAt - a.createdAt).slice(startIndex, endIndex)

            const responseData = {
                notifications: paginatedNotifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: notifications.length,
                    totalPages: Math.ceil(notifications.length / limit)
                },
                unreadCount: notifications.filter((n) => !n.isRead).length
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    markNotificationRead: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { notificationId } = req.body

            const user = await userModel.findById(authenticatedUser.id)
            if (!user) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            user.markNotificationAsRead(notificationId)
            await user.save()

            const notification = user.notifications.id(notificationId)

            httpResponse(req, res, 200, responseMessage.UPDATED, {
                notificationId,
                isRead: notification?.isRead || false,
                readAt: notification?.readAt || null
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    markAllNotificationsRead: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const user = await userModel.findById(authenticatedUser.id)
            if (!user) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            const unreadCount = user.notifications.filter(n => !n.isRead).length
            
            user.markAllNotificationsAsRead()
            await user.save()

            httpResponse(req, res, 200, responseMessage.UPDATED, {
                markedAsRead: unreadCount,
                totalNotifications: user.notifications.length,
                unreadCount: 0
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    sendNotification: async (req, res, next) => {
        try {
            const { userId, title, message, type = 'info', expiresAt } = req.body

            const success = await notificationService.sendToUser(userId, title, message, type, expiresAt)

            if (!success) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            httpResponse(req, res, 201, responseMessage.CREATED)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    sendBulkNotification: async (req, res, next) => {
        try {
            const { userIds, title, message, type = 'info', expiresAt } = req.body

            const success = await notificationService.sendToUser(userIds[0], title, message, type, expiresAt)

            if (userIds.length === 1) {
                if (!success) {
                    return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
                }
            } else {
                await userModel.updateMany(
                    { _id: { $in: userIds.slice(1) } },
                    {
                        $push: {
                            notifications: {
                                title,
                                message,
                                type,
                                expiresAt,
                                createdAt: new Date()
                            }
                        }
                    }
                )
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    resendVerification: async (req, res, next) => {
        try {
            const { emailAddress } = req.body

            const user = await userModel.findOne({ emailAddress: emailAddress.toLowerCase() })
            if (!user) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            if (user.accountConfirmation.status) {
                return httpError(next, new Error('Account is already verified'), req, 400)
            }

            const token = quicker.generateRandomId()
            const code = quicker.generateOtp(6)

            user.accountConfirmation.token = token
            user.accountConfirmation.code = code
            user.accountConfirmation.timestamp = dayjs().utc().toDate()
            await user.save()

            const confirmationUrl = `${config.client.url}/auth/confirm/${token}?code=${code}`
            
            const registrationEmail = emailTemplates.registration({
                emailAddress: user.emailAddress,
                confirmationUrl
            })

            try {
                await emailService.sendEmail(
                    user.emailAddress,
                    registrationEmail.subject,
                    registrationEmail.text,
                    registrationEmail.html
                )
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError)
                return httpError(next, new Error('Failed to send verification email'), req, 500)
            }

            await notificationService.sendToUser(
                user._id,
                'Verification Email Sent',
                'A new verification email has been sent to your email address. Please check your inbox.',
                'info'
            )

            httpResponse(req, res, 200, 'Verification email sent successfully')
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}