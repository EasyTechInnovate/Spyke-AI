import responseMessage from "../constant/responseMessage.js"
import httpError from "../util/httpError.js"

export default (requiredRoles) => {
    return (req, _res, next) => {
        try {
            const user = req.authenticatedUser

            if (!user) {
                return httpError(next, new Error(responseMessage.AUTH.UNAUTHORIZED), req, 401)
            }

            console.log('User roles:', user.roles)  // Changed from user.role to user.roles
            console.log('Required roles:', requiredRoles)
            console.log('User roles type:', typeof user.roles)

            // Check if user.roles exists and is an array
            if (!user.roles || !Array.isArray(user.roles)) {
                console.log('User roles is not an array or is undefined')
                return httpError(next, new Error(responseMessage.AUTH.FORBIDDEN), req, 403)
            }

            // Check if user has at least one of the required roles
            const hasRequiredRole = requiredRoles.some(requiredRole => 
                user.roles.includes(requiredRole)
            )

            console.log('Has required role:', hasRequiredRole)

            if (!hasRequiredRole) {
                return httpError(next, new Error(responseMessage.AUTH.FORBIDDEN), req, 403)
            }

            next()
        } catch (error) {
            console.log('Authorization middleware error:', error)
            httpError(next, error, req, 500)
        }
    }
}