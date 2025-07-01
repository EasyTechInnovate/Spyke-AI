import config from '../config/config.js'
import responseMessage from '../constant/responseMessage.js'
import userModel from '../model/user.model.js'
import httpError from '../util/httpError.js'
import quicker from '../util/quicker.js'

export default async (request, _res, next) => {
    try {
        const req = request

        console.log('Authentication middleware called')

        let accessToken

        const cookies = req.cookies
        if (cookies?.accessToken) {
            accessToken = cookies.accessToken
        }

        console.log('Access token from cookies:', accessToken)

        if (!accessToken) {
            const authHeader = req.headers.authorization
            if (authHeader?.startsWith('Bearer ')) {
                accessToken = authHeader.substring(7)
            }
        }

        if (!accessToken) {
            return httpError(next, new Error(responseMessage.AUTH.UNAUTHORIZED), req, 401)
        }

        try {
            const { userId } = quicker.verifyToken(accessToken, config.jwt.accessToken.secret)

            const user = await userModel.findOne({ _id: userId }).select('-password')

            if (!user) {
                return httpError(next, new Error(responseMessage.AUTH.UNAUTHORIZED), req, 401)
            }

            req.authenticatedUser = user
            return next()
        } catch (tokenError) {
            return httpError(next, new Error(responseMessage.AUTH.UNAUTHORIZED), req, 401)
        }
    } catch (err) {
        httpError(next, err, request, 500)
    }
}