import mongoose from 'mongoose'

const analyticsEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['pageview', 'click', 'error'],
      index: true
    },
    name: {
      type: String,
      required: true
    },
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    properties: {
      url: String,
      title: String,
      referrer: String,
      selector: String,
      text: String,
      href: String,
      errorMessage: String,
      errorStack: String,
      status: {
        type: String,
        enum: ['success', 'error']
      },
      userAgent: String,
      screenResolution: String,
      language: String
    },
    metadata: {
      ip: String,
      country: String,
      city: String,
      device: String,
      browser: String,
      os: String
    }
  },
  {
    timestamps: true
  }
)

analyticsEventSchema.index({ createdAt: -1 })
analyticsEventSchema.index({ type: 1, createdAt: -1 })
analyticsEventSchema.index({ userId: 1, createdAt: -1 })
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 })

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema)

export default AnalyticsEvent