import config from "../config/config.js";
import { EApplicationEnvironment } from "../constant/application.js";
import responseMessage from "../constant/responseMessage.js";
import { rateLimiterMongo } from '../config/rateLimiter.js';


export default (req, _, next) => {
    if (config.env === EApplicationEnvironment.DEVELOPMENT) {
        return next();
    }

    if (rateLimiterMongo) {
        rateLimiterMongo
            .consume(req.ip, 1)
            .then(() => next())
            .catch(() => {
                httpError(next, new Error(responseMessage.TOO_MANY_REQUESTS), req, 429);
            });
    }
};