import industryModel from '../model/industry.model.js'
import responseMessage from '../constant/responseMessage.js'
import httpError from '../util/httpError.js'
import httpResponse from '../util/httpResponse.js'

const industryController = {
    // Create Industry (Admin Only)
    createIndustry: async (req, res, next) => {
        try {
            const { name, icon, isActive } = req.body

            // Check if industry already exists
            const existingIndustry = await industryModel.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                isDeleted: false
            })

            if (existingIndustry) {
                return httpError(next, new Error('Industry with this name already exists'), req, 409)
            }

            // Create new industry
            const industry = new industryModel({
                name,
                icon: icon || 'Building',
                isActive: isActive !== undefined ? isActive : true
            })

            await industry.save()

            httpResponse(req, res, 201, responseMessage.SUCCESS, industry)
        } catch (error) {
            console.error('Create industry error:', error)
            
            if (error.code === 11000) {
                return httpError(next, new Error('Industry with this name already exists'), req, 409)
            }
            
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message)
                return httpError(next, new Error(messages.join(', ')), req, 400)
            }

            httpError(next, error, req, 500)
        }
    },

    // Get All Industries (Public)
    getIndustries: async (req, res, next) => {
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
            const [industries, total] = await Promise.all([
                industryModel
                    .find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                industryModel.countDocuments(query)
            ])

            // Calculate pagination info
            const totalPages = Math.ceil(total / parseInt(limit))
            const hasNextPage = parseInt(page) < totalPages
            const hasPrevPage = parseInt(page) > 1

            const responseData = {
                industries,
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
            console.error('Get industries error:', error)
            httpError(next, error, req, 500)
        }
    },

    // Get Active Industries (Public)
    getActiveIndustries: async (req, res, next) => {
        try {
            const industries = await industryModel.findActive()
            httpResponse(req, res, 200, responseMessage.SUCCESS, industries)
        } catch (error) {
            console.error('Get active industries error:', error)
            httpError(next, error, req, 500)
        }
    },

    // Get Industry by ID (Public)
    getIndustryById: async (req, res, next) => {
        try {
            const { id } = req.params

            const industry = await industryModel.findOne({
                _id: id,
                isDeleted: false
            })

            if (!industry) {
                return httpError(next, new Error('Industry not found'), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, industry)
        } catch (error) {
            console.error('Get industry by ID error:', error)
            httpError(next, error, req, 500)
        }
    },

    // Update Industry (Admin Only)
    updateIndustry: async (req, res, next) => {
        try {
            const { id } = req.params
            const { name, icon, isActive } = req.body

            // Check if industry exists
            const industry = await industryModel.findOne({
                _id: id,
                isDeleted: false
            })

            if (!industry) {
                return httpError(next, new Error('Industry not found'), req, 404)
            }

            // Check for duplicate name (if name is being updated)
            if (name && name !== industry.name) {
                const existingIndustry = await industryModel.findOne({
                    name: { $regex: new RegExp(`^${name}$`, 'i') },
                    _id: { $ne: id },
                    isDeleted: false
                })

                if (existingIndustry) {
                    return httpError(next, new Error('Industry with this name already exists'), req, 409)
                }
            }

            // Update fields
            if (name !== undefined) industry.name = name
            if (icon !== undefined) industry.icon = icon
            if (isActive !== undefined) industry.isActive = isActive

            await industry.save()
            httpResponse(req, res, 200, responseMessage.SUCCESS, industry)
        } catch (error) {
            console.error('Update industry error:', error)
            
            if (error.code === 11000) {
                return httpError(next, new Error('Industry with this name already exists'), req, 409)
            }
            
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message)
                return httpError(next, new Error(messages.join(', ')), req, 400)
            }

            httpError(next, error, req, 500)
        }
    },

    // Delete Industry (Admin Only)
    deleteIndustry: async (req, res, next) => {
        try {
            const { id } = req.params

            // Check if industry exists
            const industry = await industryModel.findOne({
                _id: id,
                isDeleted: false
            })

            if (!industry) {
                return httpError(next, new Error('Industry not found'), req, 404)
            }

            // Check if industry has products
            if (industry.productCount > 0) {
                return httpError(
                    next, 
                    new Error('Cannot delete industry that has products. Please reassign or remove products first.'), 
                    req, 
                    400
                )
            }

            // Soft delete the industry
            await industry.softDelete()
            httpResponse(req, res, 200, responseMessage.SUCCESS, null)
        } catch (error) {
            console.error('Delete industry error:', error)
            httpError(next, error, req, 500)
        }
    },

    // Toggle Industry Status (Admin Only)
    toggleIndustryStatus: async (req, res, next) => {
        try {
            const { id } = req.params

            const industry = await industryModel.findOne({
                _id: id,
                isDeleted: false
            })

            if (!industry) {
                return httpError(next, new Error('Industry not found'), req, 404)
            }

            industry.isActive = !industry.isActive
            await industry.save()

            httpResponse(req, res, 200, responseMessage.SUCCESS, industry)
        } catch (error) {
            console.error('Toggle industry status error:', error)
            httpError(next, error, req, 500)
        }
    }
}

export default industryController