export default {
    SUCCESS: 'The operation has been successful',
    CREATED: 'The resource has been created successfully',
    UPDATED: 'The resource has been updated successfully',
    DELETED: 'The resource has been deleted successfully',

    SERVICE: (service) => `${service} service is running.`,

    ERROR: {
        SOMETHING_WENT_WRONG: 'Something went wrong!',
        INTERNAL_SERVER_ERROR: 'Internal server error',
        NOT_FOUND: (entity) => `${entity} not found`,
        ALREADY_EXISTS: (entity) => `${entity} already exists`,
        TOO_MANY_REQUESTS: 'Too many requests! Please try again after some time',
        BAD_REQUEST: 'Bad request',
        DATABASE_ERROR: 'A database error occurred',
        SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
        DUPLICATE_ENTRY: (field) => `Duplicate entry for ${field}`,
        INVALID_OPERATION: 'Invalid operation requested'
    },
    COMMON: {
        INVALID_PARAMETERS: (param) => (param ? `Invalid parameter: ${param}` : 'Invalid parameters provided'),
        ACTION_NOT_ALLOWED: 'This action is not allowed',
        OPERATION_FAILED: (operation) => `${operation} operation failed`,
        OPERATION_SUCCESS: (operation) => `${operation} operation succeeded`,
        FAILED_TO_SAVE: (entity) => `Failed to save ${entity}`,
        INVALID_ID: 'Invalid ID format provided',
        FAILED_TO_UPDATE: (entity) => `Failed to update ${entity}`,
        PAGINATION_INVALID: 'Invalid pagination parameters',
        SORT_INVALID: 'Invalid sort parameters',
        FILTER_INVALID: 'Invalid filter parameters'
    },
    AUTH: {
        LOGIN_SUCCESS: 'Login successful',
        LOGIN_FAILED: 'Invalid email or password',
        UNAUTHORIZED: 'You are not authorized to access this resource',
        FORBIDDEN: 'You do not have permission to perform this action',
        TOKEN_EXPIRED: 'Authentication token has expired',
        TOKEN_INVALID: 'Authentication token is invalid',
        ALREADY_EXIST: (entity, value) => `${entity} with value ${value} already exists`,
        INVALID_PHONE_NUMBER: 'Invalid phone number provided',
        ACCOUNT_ALREADY_CONFIRMED: 'Account already confirmed',
        ACCOUNT_NOT_CONFIRMED: 'Account not confirmed',
        PASSWORD_NOT_MATCH: 'Password does not match',
        INVALID_PASSWORD: 'Invalid password provided',
        PASSWORD_RESET_SUCCESS: 'Password reset successful',
        PASSWORD_RESET_FAILED: 'Password reset failed',
        PASSWORD_RESET_TOKEN_EXPIRED: 'Password reset token has expired',
        ACCOUNT_CONFIRMED: 'Account confirmed successfully',
        ACCOUNT_DEACTIVATED: 'Account is deactivated'
    },

    customMessage: (message) => message
}
