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
    SELLER: {
        PROFILE_CREATED: 'Seller profile created successfully and submitted for review',
        PROFILE_ALREADY_EXISTS: 'You already have a seller profile',
        PROFILE_SUBMITTED: 'Profile submitted for verification successfully',
        PROFILE_ALREADY_SUBMITTED: 'Profile has already been submitted for review',
        PROFILE_NOT_ACTIVE: 'Seller profile is not active or approved',
        INCOMPLETE_PROFILE: 'Please complete your profile before submitting for verification (minimum 80% completion required)',
        CANNOT_UPDATE_APPROVED_PROFILE: 'Cannot update profile once it has been approved. Contact support for changes.',

        COMMISSION_OFFERED: 'Commission offer sent to seller successfully',
        COMMISSION_ACCEPTED: 'Commission offer accepted successfully. Welcome to our seller community!',
        COMMISSION_REJECTED: 'Commission offer rejected',
        COMMISSION_ALREADY_RESPONDED: 'You have already responded to this commission offer',
        NO_COMMISSION_OFFER: 'No pending commission offer found',
        COUNTER_OFFER_SUBMITTED: 'Counter offer submitted successfully',

        CANNOT_OFFER_COMMISSION: 'Can only offer commission to profiles under review or respond to counter offers',
        CANNOT_REJECT_PROFILE: 'Can only reject profiles that are under review or in commission negotiation',
        PROFILE_REJECTED: 'Seller profile has been rejected',
        MAX_NEGOTIATION_ROUNDS_REACHED: 'Maximum negotiation rounds (5) reached. Please contact support for further assistance.',

        PAYOUT_INFO_UPDATED: 'Payout information updated successfully',
        PAYOUT_INFO_INVALID: 'Invalid payout information provided',
        PAYOUT_VERIFICATION_PENDING: 'Payout information is pending verification',
        PAYOUT_VERIFIED: 'Payout information verified successfully',

        STATS_UPDATED: 'Seller statistics updated successfully',
        INVALID_RATING: 'Rating must be between 1 and 5',

        PROFILE_COMPLETION_LOW: 'Profile completion is below required threshold',
        REQUIRED_FIELDS_MISSING: 'Please fill in all required fields',

        NO_SELLERS_FOUND: 'No sellers found matching your criteria',
        SEARCH_RESULTS_FOUND: (count) => `Found ${count} sellers matching your criteria`,
        COUNTER_OFFER_ACCEPTED: 'Counter offer accepted successfully',
        NO_COUNTER_OFFER: 'No pending counter offer found'
    },

    customMessage: (message) => message
}

