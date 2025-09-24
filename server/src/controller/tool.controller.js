import toolModel from '../model/tool.model.js'
import responseMessage from '../constant/responseMessage.js'
import httpError from '../util/httpError.js'
import httpResponse from '../util/httpResponse.js'

const toolController = {
    createTool: async (req, res, next) => {
        try {
            const { name, description, icon, isActive } = req.body
            const existingTool = await toolModel.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                isDeleted: false
            })

            if (existingTool) {
                return httpError(next, new Error('Tool with this name already exists'), req, 409)
            }

            // Create new tool
            const tool = new toolModel({
                name,
                description,
                icon: icon || 'Wrench',
                isActive: isActive !== undefined ? isActive : true
            })

            await tool.save()

            httpResponse(req, res, 201, responseMessage.SUCCESS, tool)
        } catch (error) {
            console.error('Create tool error:', error)
            
            if (error.code === 11000) {
                return httpError(next, new Error('Tool with this name already exists'), req, 409)
            }
            
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message)
                return httpError(next, new Error(messages.join(', ')), req, 400)
            }

            httpError(next, error, req, 500)
        }
    },

    // Get All Tools (Public)
    getTools: async (req, res, next) => {
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
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
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
            const [tools, total] = await Promise.all([
                toolModel
                    .find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                toolModel.countDocuments(query)
            ])

            // Calculate pagination info
            const totalPages = Math.ceil(total / parseInt(limit))
            const hasNextPage = parseInt(page) < totalPages
            const hasPrevPage = parseInt(page) > 1

            const responseData = {
                tools,
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
            console.error('Get tools error:', error)
            httpError(next, error, req, 500)
        }
    },

    // Get Active Tools (Public)
    getActiveTools: async (req, res, next) => {
        try {
            const tools = await toolModel.findActive()
            httpResponse(req, res, 200, responseMessage.SUCCESS, tools)
        } catch (error) {
            console.error('Get active tools error:', error)
            httpError(next, error, req, 500)
        }
    },

    // Get Tool by ID (Public)
    getToolById: async (req, res, next) => {
        try {
            const { id } = req.params

            const tool = await toolModel.findOne({
                _id: id,
                isDeleted: false
            })

            if (!tool) {
                return httpError(next, new Error('Tool not found'), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, tool)
        } catch (error) {
            console.error('Get tool by ID error:', error)
            httpError(next, error, req, 500)
        }
    },

    // Update Tool (Admin Only)
    updateTool: async (req, res, next) => {
        try {
            const { id } = req.params
            const { name, description, icon, isActive } = req.body

            // Check if tool exists
            const tool = await toolModel.findOne({
                _id: id,
                isDeleted: false
            })

            if (!tool) {
                return httpError(next, new Error('Tool not found'), req, 404)
            }

            // Check for duplicate name (if name is being updated)
            if (name && name !== tool.name) {
                const existingTool = await toolModel.findOne({
                    name: { $regex: new RegExp(`^${name}$`, 'i') },
                    _id: { $ne: id },
                    isDeleted: false
                })

                if (existingTool) {
                    return httpError(next, new Error('Tool with this name already exists'), req, 409)
                }
            }

            // Update fields
            if (name !== undefined) tool.name = name
            if (description !== undefined) tool.description = description
            if (icon !== undefined) tool.icon = icon
            if (isActive !== undefined) tool.isActive = isActive

            await tool.save()
            httpResponse(req, res, 200, responseMessage.SUCCESS, tool)
        } catch (error) {
            console.error('Update tool error:', error)
            
            if (error.code === 11000) {
                return httpError(next, new Error('Tool with this name already exists'), req, 409)
            }
            
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message)
                return httpError(next, new Error(messages.join(', ')), req, 400)
            }

            httpError(next, error, req, 500)
        }
    },

    // Delete Tool (Admin Only)
    deleteTool: async (req, res, next) => {
        try {
            const { id } = req.params

            // Check if tool exists
            const tool = await toolModel.findOne({
                _id: id,
                isDeleted: false
            })

            if (!tool) {
                return httpError(next, new Error('Tool not found'), req, 404)
            }

            // Check if tool has products
            if (tool.productCount > 0) {
                return httpError(
                    next, 
                    new Error('Cannot delete tool that has products. Please reassign or remove products first.'), 
                    req, 
                    400
                )
            }

            // Soft delete the tool
            await tool.softDelete()
            httpResponse(req, res, 200, responseMessage.SUCCESS, null)
        } catch (error) {
            console.error('Delete tool error:', error)
            httpError(next, error, req, 500)
        }
    },

    // Toggle Tool Status (Admin Only)
    toggleToolStatus: async (req, res, next) => {
        try {
            const { id } = req.params

            const tool = await toolModel.findOne({
                _id: id,
                isDeleted: false
            })

            if (!tool) {
                return httpError(next, new Error('Tool not found'), req, 404)
            }

            tool.isActive = !tool.isActive
            await tool.save()

            httpResponse(req, res, 200, responseMessage.SUCCESS, tool)
        } catch (error) {
            console.error('Toggle tool status error:', error)
            httpError(next, error, req, 500)
        }
    },

    // Get Tools Analytics (Admin Only)
    getToolsAnalytics: async (req, res, next) => {
        try {
            const [totalTools, activeTools, inactiveTools, deletedTools] = await Promise.all([
                toolModel.countDocuments({}),
                toolModel.countDocuments({ isActive: true, isDeleted: false }),
                toolModel.countDocuments({ isActive: false, isDeleted: false }),
                toolModel.countDocuments({ isDeleted: true })
            ])

            // Get top tools by product count
            const topToolsByProducts = await toolModel
                .find({ isDeleted: false })
                .sort({ productCount: -1 })
                .limit(10)
                .select('name productCount')
                .lean()

            // Get recent tools
            const recentTools = await toolModel
                .find({ isDeleted: false })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name createdAt isActive')
                .lean()

            const analytics = {
                overview: {
                    totalTools,
                    activeTools,
                    inactiveTools,
                    deletedTools
                },
                topToolsByProducts,
                recentTools
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, analytics)
        } catch (error) {
            console.error('Get tools analytics error:', error)
            httpError(next, error, req, 500)
        }
    }
}

export default toolController