import responseMessage from '../constant/responseMessage.js';
import config from '../config/config.js';
import { EApplicationEnvironment } from '../constant/application.js';
// import logger from './logger';

export default (err, req, errorStatusCode = 500) => {
    const errorObj = {
        success: false,
        statusCode: errorStatusCode,
        request: {
            ip: req.ip || null,
            method: req.method,
            url: req.originalUrl,
        },
        message: err instanceof Error ? err.message || responseMessage.ERROR.SOMETHING_WENT_WRONG : responseMessage.ERROR.SOMETHING_WENT_WRONG,
        data: null,
        trace: err instanceof Error ? { error: err.stack } : null,
    };

    // Production Env check
    if (config.env === EApplicationEnvironment.PRODUCTION) {
        delete errorObj.request.ip;
        delete errorObj.trace;
    }

    return errorObj;
};
