import responseMessage from "../constant/responseMessage.js"
import httpError from "../util/httpError.js"

export default (roles) => {
    return (req, _res, next) => {
        try {
            const user = req.authenticatedUser

            if (!user) {
                return httpError(next, new Error(responseMessage.AUTH.UNAUTHORIZED), req, 401)
            }

            if (!roles.includes(user.role)) {
                return httpError(next, new Error(responseMessage.AUTH.FORBIDDEN), req, 403)
            }

            next()
        } catch (error) {
            httpError(next, error, req, 500)
        }
    }
}