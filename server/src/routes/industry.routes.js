import express from 'express'
import industryController from '../controller/industry.controller.js'
import authenticate from '../middleware/authentication.js'
import authorize from '../middleware/authorization.js'
import { validateRequest } from '../middleware/validateRequest.js'
import {
    createIndustrySchema,
    updateIndustrySchema,
    getIndustriesSchema,
    industryIdParam
} from '../schema/industry.schema.js'

const router = express.Router()

// Public Routes (accessible to everyone)
router.get(
    '/',
    validateRequest(getIndustriesSchema, 'query'),
    industryController.getIndustries
)

router.get(
    '/active',
    industryController.getActiveIndustries
)

router.get(
    '/:id',
    validateRequest(industryIdParam, 'params'),
    industryController.getIndustryById
)

// Admin Only Routes
router.post(
    '/',
    authenticate,
    authorize(['admin']),
    validateRequest(createIndustrySchema, 'body'),
    industryController.createIndustry
)

router.put(
    '/:id',
    authenticate,
    authorize(['admin']),
    validateRequest(industryIdParam, 'params'),
    validateRequest(updateIndustrySchema, 'body'),
    industryController.updateIndustry
)

router.delete(
    '/:id',
    authenticate,
    authorize(['admin']),
    validateRequest(industryIdParam, 'params'),
    industryController.deleteIndustry
)

router.patch(
    '/:id/toggle-status',
    authenticate,
    authorize(['admin']),
    validateRequest(industryIdParam, 'params'),
    industryController.toggleIndustryStatus
)

export default router