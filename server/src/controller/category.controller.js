import categoryModel from '../model/category.model.js'
import responseMessage from '../constant/responseMessage.js'
import httpError from '../util/httpError.js'
import httpResponse from '../util/httpResponse.js'

const categoryController = {
    createCategory: async (req, res, next) => {
        try {
            const { name, icon, isActive } = req.body
            const existingCategory = await categoryModel.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                isDeleted: false
            })

            if (existingCategory) {
                return httpError(next, new Error('Category with this name already exists'), req, 409)
            }

            // Create new category
            const category = new categoryModel({
                name,
                icon: icon || 'Package',
                isActive: isActive !== undefined ? isActive : true
            })

            await category.save()

            httpResponse(req, res, 201, responseMessage.SUCCESS, category)
        } catch (error) {
            console.error('Create category error:', error)
            
            if (error.code === 11000) {
                return httpError(next, new Error('Category with this name already exists'), req, 409)
            }
            
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message)
                return httpError(next, new Error(messages.join(', ')), req, 400)
            }

            httpError(next, error, req, 500)
        }
    },

    // Get All Categories (Public)
    getCategories: async (req, res, next) => {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'name',
                sortOrder = 'asc',
                search = '',
                isActive
            } = req.query

            // Build query
            const query = { isDeleted: false }
            
            if (search) {
                query.name = { $regex: search, $options: 'i' }
            }
            
            if (isActive !== undefined) {
                query.isActive = isActive === 'true'
            }

            // Build sort object
            const sort = {}
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit)

            // Execute queries
            const [categories, total] = await Promise.all([
                categoryModel
                    .find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                categoryModel.countDocuments(query)
            ])

            // Calculate pagination info
            const totalPages = Math.ceil(total / parseInt(limit))
            const hasNextPage = parseInt(page) < totalPages
            const hasPrevPage = parseInt(page) > 1

            const responseData = {
                categories,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                    hasNextPage,
                    hasPrevPage
                }
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData)
        } catch (error) {
            console.error('Get categories error:', error)
            httpError(next, error, req, 500)
        }
    },

    // Get Active Categories (Public)
    getActiveCategories: async (req, res, next) => {
        try {
            const categories = await categoryModel.findActive()
            httpResponse(req, res, 200, responseMessage.SUCCESS, categories)
        } catch (error) {
            console.error('Get active categories error:', error)
            httpError(next, error, req, 500)
        }
    },

    // Get Category by ID (Public)
    getCategoryById: async (req, res, next) => {
        try {
            const { id } = req.params

            const category = await categoryModel.findOne({
                _id: id,
                isDeleted: false
            })

            if (!category) {
                return httpError(next, new Error('Category not found'), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, category)
        } catch (error) {
            console.error('Get category by ID error:', error)
            httpError(next, error, req, 500)
        }
    },

    // Update Category (Admin Only)
    updateCategory: async (req, res, next) => {
        try {
            const { id } = req.params
            const { name, icon, isActive } = req.body

            // Check if category exists
            const category = await categoryModel.findOne({
                _id: id,
                isDeleted: false
            })

            if (!category) {
                return httpError(next, new Error('Category not found'), req, 404)
            }

            // Check for duplicate name (if name is being updated)
            if (name && name !== category.name) {
                const existingCategory = await categoryModel.findOne({
                    name: { $regex: new RegExp(`^${name}$`, 'i') },
                    _id: { $ne: id },
                    isDeleted: false
                })

                if (existingCategory) {
                    return httpError(next, new Error('Category with this name already exists'), req, 409)
                }
            }

            // Update fields
            if (name !== undefined) category.name = name
            if (icon !== undefined) category.icon = icon
            if (isActive !== undefined) category.isActive = isActive

            await category.save()
            httpResponse(req, res, 200, responseMessage.SUCCESS, category)
        } catch (error) {
            console.error('Update category error:', error)
            
            if (error.code === 11000) {
                return httpError(next, new Error('Category with this name already exists'), req, 409)
            }
            
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message)
                return httpError(next, new Error(messages.join(', ')), req, 400)
            }

            httpError(next, error, req, 500)
        }
    },

    // Delete Category (Admin Only)
    deleteCategory: async (req, res, next) => {
        try {
            const { id } = req.params

            // Check if category exists
            const category = await categoryModel.findOne({
                _id: id,
                isDeleted: false
            })

            if (!category) {
                return httpError(next, new Error('Category not found'), req, 404)
            }

            // Check if category has products
            if (category.productCount > 0) {
                return httpError(
                    next, 
                    new Error('Cannot delete category that has products. Please reassign or remove products first.'), 
                    req, 
                    400
                )
            }

            // Soft delete the category
            await category.softDelete()
            httpResponse(req, res, 200, responseMessage.SUCCESS, null)
        } catch (error) {
            console.error('Delete category error:', error)
            httpError(next, error, req, 500)
        }
    },

    // Toggle Category Status (Admin Only)
    toggleCategoryStatus: async (req, res, next) => {
        try {
            const { id } = req.params

            const category = await categoryModel.findOne({
                _id: id,
                isDeleted: false
            })

            if (!category) {
                return httpError(next, new Error('Category not found'), req, 404)
            }

            category.isActive = !category.isActive
            await category.save()

            httpResponse(req, res, 200, responseMessage.SUCCESS, category)
        } catch (error) {
            console.error('Toggle category status error:', error)
            httpError(next, error, req, 500)
        }
    }
}

export default categoryController