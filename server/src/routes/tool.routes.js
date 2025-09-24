import express from 'express'
import toolController from '../controller/tool.controller.js'
import authenticate from '../middleware/authentication.js'
import authorize from '../middleware/authorization.js'
import { validateRequest } from '../middleware/validateRequest.js'
import {
    createToolSchema,
    updateToolSchema,
    getToolsSchema,
    toolIdParam
} from '../schema/tool.schema.js'

const router = express.Router()

router.get(
    '/',
    validateRequest(getToolsSchema, 'query'),
    toolController.getTools
)

router.get(
    '/active',
    toolController.getActiveTools
)

router.get(
    '/:id',
    validateRequest(toolIdParam, 'params'),
    toolController.getToolById
)

router.post(
    '/',
    authenticate,
    authorize(['admin']),
    validateRequest(createToolSchema, 'body'),
    toolController.createTool
)

router.put(
    '/:id',
    authenticate,
    authorize(['admin']),
    validateRequest(toolIdParam, 'params'),
    validateRequest(updateToolSchema, 'body'),
    toolController.updateTool
)

router.delete(
    '/:id',
    authenticate,
    authorize(['admin']),
    validateRequest(toolIdParam, 'params'),
    toolController.deleteTool
)

router.patch(
    '/:id/toggle-status',
    authenticate,
    authorize(['admin']),
    validateRequest(toolIdParam, 'params'),
    toolController.toggleToolStatus
)

router.get(
    '/admin/analytics',
    authenticate,
    authorize(['admin']),
    toolController.getToolsAnalytics
)

export default router