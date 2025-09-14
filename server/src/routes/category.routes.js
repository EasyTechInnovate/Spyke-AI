import express from 'express'
import categoryController from '../controller/category.controller.js'
import authenticate from '../middleware/authentication.js'
import authorize from '../middleware/authorization.js'
import { validateRequest } from '../middleware/validateRequest.js'
import {
    createCategorySchema,
    updateCategorySchema,
    getCategoriesSchema,
    categoryIdParam
} from '../schema/category.schema.js'

const router = express.Router()

// Public Routes (accessible to everyone)
router.get(
    '/',
    validateRequest(getCategoriesSchema, 'query'),
    categoryController.getCategories
)

router.get(
    '/active',
    categoryController.getActiveCategories
)

router.get(
    '/:id',
    validateRequest(categoryIdParam, 'params'),
    categoryController.getCategoryById
)

// Admin Only Routes
router.post(
    '/',
    authenticate,
    authorize(['admin']),
    validateRequest(createCategorySchema, 'body'),
    categoryController.createCategory
)

router.put(
    '/:id',
    authenticate,
    authorize(['admin']),
    validateRequest(categoryIdParam, 'params'),
    validateRequest(updateCategorySchema, 'body'),
    categoryController.updateCategory
)

router.delete(
    '/:id',
    authenticate,
    authorize(['admin']),
    validateRequest(categoryIdParam, 'params'),
    categoryController.deleteCategory
)

router.patch(
    '/:id/toggle-status',
    authenticate,
    authorize(['admin']),
    validateRequest(categoryIdParam, 'params'),
    categoryController.toggleCategoryStatus
)

export default router