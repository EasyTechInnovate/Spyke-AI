import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import quicker from '../../util/quicker.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import config from '../../config/config.js'
import userModel from '../../model/user.model.js'
import refreshTokenModel from '../../model/refresh.token.model.js'

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
            console.log('timezones', timezones)

            if (!timezones || Object.keys(timezones).length === 0) {
                return httpError(next, new Error(responseMessage.AUTH.INVALID_PHONE_NUMBER), req, 422)
            }

            const timezone = timezones[0].name

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

            // TODO: Send email

            httpResponse(req, res, 201, responseMessage.CREATED)
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

            await user.save()

            // TODO: Send confirmation email

            httpResponse(req, res, 200, responseMessage.AUTH.ACCOUNT_CONFIRMED)
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
                userId: user._id
            }

            const refreshTokenPayload = {
                userId: user._id
            }

            const accessToken = quicker.generateToken(accessTokenPayload, config.jwt.accessToken.secret, config.jwt.accessToken.expiresIn)

            const refreshToken = quicker.generateToken(refreshTokenPayload, config.jwt.refreshToken.secret, config.jwt.refreshToken.expiresIn)

            user.updateLoginInfo(req.ip || req.connection.remoteAddress)
            user.isActive = true
            await user.save()

            await refreshTokenModel.create({
                token: refreshToken
            })
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

            httpResponse(req, res, 200, responseMessage.AUTH.LOGIN_SUCCESS)
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
    logout: async (req, res, next) => {},
    refreshToken: async (req, res, next) => {},
    forgotPassword: async (req, res, next) => {},
    resetPassword: async (req, res, next) => {},
    changePassword: async (req, res, next) => {},
    updateProfile: async (req, res, next) => {}
}

