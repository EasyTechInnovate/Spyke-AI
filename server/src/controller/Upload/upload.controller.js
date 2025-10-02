import responseMessage from "../../constant/responseMessage.js";
import { uploadOnImageKit } from "../../service/file.upload.service.js";
import httpError from "../../util/httpError.js";
import httpResponse from "../../util/httpResponse.js";

export default {
    self: (req, res, next) => {
            try {
                httpResponse(req, res, 200, responseMessage.customMessage('file Upload service is working'))
            } catch (err) {
                httpError(next, err, req, 500)
            }
        },
    uploadFile: async (req, res, next) => {
        try {
            const { body } = req
            if (req.multerError) {
                if (req.multerError.code === 'LIMIT_FILE_SIZE') {
                    return httpError(next, new Error('File size exceeds 5MB limit'), req, 400)
                }
                if (req.multerError.code === 'LIMIT_UNEXPECTED_FILE') {
                    return httpError(next, new Error('Unexpected file field'), req, 400)
                }
                return httpError(next, new Error(req.multerError.message), req, 400)
            }

            if (!req.file) {
                return httpError(next, new Error(responseMessage.customMessage('No file uploaded')), req, 400)
            }

            if (!body.category) {
                return httpError(next, new Error(responseMessage.customMessage('Category is required')), req, 400)
            }

            const uploadedFile = await uploadOnImageKit(req.file.path, body.category)

            if (!uploadedFile) {
                return httpError(next, new Error(responseMessage.customMessage('File upload failed')), req, 500)
            }

            return httpResponse(req, res, 200, responseMessage.SUCCESS, uploadedFile.url)
        } catch (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return httpError(next, new Error('File size exceeds 5MB limit'), req, 400)
            }
            return httpError(next, err, req, 500)
        }
    },
};