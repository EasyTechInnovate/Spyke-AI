import responseMessage from "../../constant/responseMessage.js";
import httpError from "../../util/httpError.js";
import httpResponse from "../../util/httpResponse.js";
import quicker from "../../util/quicker.js";

export default {
    self: (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
    
    health: (req, res, next) => {
        try {
            const healthData = {
                application: quicker.getApplicationHealth(),
                system: quicker.getSystemHealth(),
                timestamp: Date.now(),
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, healthData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
};