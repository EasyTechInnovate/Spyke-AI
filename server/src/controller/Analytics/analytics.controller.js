import AnalyticsEvent from '../../model/analytics.event.model.js'
import httpResponse from '../../util/httpResponse.js'
import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import logger from '../../util/logger.js'

export const self= (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SERVICE('Analytics Events'))
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }

export const createAnalyticsEvents = async (req, res, next) => {
  try {
    const { events } = req.body
    const userId = req.user?.userId || null
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress

    // Process and save events
    const processedEvents = events.map(event => ({
      ...event,
      userId,
      metadata: {
        ip: userIp,
        userAgent: req.headers['user-agent']
      }
    }))

    await AnalyticsEvent.insertMany(processedEvents)

    logger.info('Analytics events created', { count: events.length, userId })

    return httpResponse(req, res, 200, responseMessage.SUCCESS, {
      message: 'Events tracked successfully',
      count: events.length
    })
  } catch (error) {
    logger.error('Error creating analytics events', error)
    return next(error)
  }
}

export const getAnalyticsEvents = async (req, res, next) => {
  try {
    const { type, limit, offset, startDate, endDate } = req.query
    
    // Build query
    const query = {}
    
    if (type && type !== 'all') {
      query.type = type
    }
    
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    // Fetch events
    const [events, totalCount] = await Promise.all([
      AnalyticsEvent
        .find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .select('-__v')
        .lean(),
      AnalyticsEvent.countDocuments(query)
    ])

    return httpResponse(req, res, 200, responseMessage.SUCCESS, {
      events,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + parseInt(limit)
      }
    })
  } catch (error) {
    logger.error('Error fetching analytics events', error)
    return next(error)
  }
}

export const getAnalyticsStats = async (req, res, next) => {
  try {
    const { period } = req.query
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setDate(now.getDate() - 30)
        break
      case 'all':
        startDate = new Date(0)
        break
    }

    // Aggregate stats
    const stats = await AnalyticsEvent.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          pageViews: {
            $sum: { $cond: [{ $eq: ['$type', 'pageview'] }, 1, 0] }
          },
          successfulPageViews: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $eq: ['$type', 'pageview'] },
                    { $eq: ['$properties.status', 'success'] }
                  ]
                }, 
                1, 
                0
              ] 
            }
          },
          errorPageViews: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $eq: ['$type', 'pageview'] },
                    { $eq: ['$properties.status', 'error'] }
                  ]
                }, 
                1, 
                0
              ] 
            }
          },
          clicks: {
            $sum: { $cond: [{ $eq: ['$type', 'click'] }, 1, 0] }
          },
          errors: {
            $sum: { $cond: [{ $eq: ['$type', 'error'] }, 1, 0] }
          },
          uniqueSessions: { $addToSet: '$sessionId' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 0,
          totalEvents: 1,
          pageViews: 1,
          successfulPageViews: 1,
          errorPageViews: 1,
          clicks: 1,
          errors: 1,
          uniqueSessions: { $size: '$uniqueSessions' },
          uniqueUsers: { 
            $size: {
              $filter: {
                input: '$uniqueUsers',
                cond: { $ne: ['$$this', null] }
              }
            }
          }
        }
      }
    ])

    const finalStats = stats[0] || {
      totalEvents: 0,
      pageViews: 0,
      successfulPageViews: 0,
      errorPageViews: 0,
      clicks: 0,
      errors: 0,
      uniqueSessions: 0,
      uniqueUsers: 0
    }

    return httpResponse(req, res, 200, responseMessage.SUCCESS, {
      stats: finalStats,
      period,
      dateRange: {
        start: startDate,
        end: now
      }
    })
  } catch (error) {
    logger.error('Error fetching analytics stats', error)
    return next(error)
  }
}

export const clearAnalyticsEvents = async (req, res, next) => {
  try {
    // Only admin can clear events
    if (!req.user?.roles?.includes('admin')) {
      throw httpError(403, responseMessage.AUTH.FORBIDDEN)
    }

    const result = await AnalyticsEvent.deleteMany({})
    
    logger.info('Analytics events cleared', { deletedCount: result.deletedCount })

    return httpResponse(req, res, 200, responseMessage.SUCCESS, {
      message: 'Analytics events cleared successfully',
      deletedCount: result.deletedCount
    })
  } catch (error) {
    logger.error('Error clearing analytics events', error)
    return next(error)
  }
}