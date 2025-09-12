import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import { EUserRole } from '../constant/application.js'

dayjs.extend(utc)

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: null,
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long'],
            maxlength: [100, 'Name cannot exceed 100 characters']
        },

        avatar: {
            type: String,
            default: null
        },

        emailAddress: {
            type: String,
            required: [true, 'Email address is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
        },

        phoneNumber: {
            _id: false,
            isoCode: {
                type: String,
                // required: [true, 'ISO code is required']
            },
            countryCode: {
                type: String,
                // required: [true, 'Country code is required']
            },
            internationalNumber: {
                type: String,
                // required: [true, 'Phone number is required']
            }
        },

        timezone: {
            type: String,
            trim: true,
            // required: [true, 'Timezone is required']
        },

        password: {
            type: String,
            required: function () {
                return !this.googleAuth?.googleId
            },
            minlength: [6, 'Password must be at least 6 characters long']
        },

        googleAuth: {
            _id: false,
            googleId: {
                type: String,
                default: null,
                sparse: true
            },
            profile: {
                _id: false,
                name: {
                    type: String,
                    default: null
                },
                picture: {
                    type: String,
                    default: null
                },
                email: {
                    type: String,
                    default: null
                }
            }
        },

        accountConfirmation: {
            _id: false,
            status: {
                type: Boolean,
                default: false,
                required: true
            },
            token: {
                type: String,
                required: [true, 'Confirmation token is required']
            },
            code: {
                type: String,
                required: [true, 'Confirmation code is required']
            },
            timestamp: {
                type: Date,
                default: null
            }
        },

        passwordReset: {
            _id: false,
            token: {
                type: String,
                default: null
            },
            expiry: {
                type: Number,
                default: null
            },
            lastResetAt: {
                type: Date,
                default: null
            }
        },

        consent: {
            type: Boolean,
            required: [true, 'Consent is required to proceed']
        },

        roles: {
            type: [String],
            enum: Object.values(EUserRole),
            default: [EUserRole.USER]
        },

        isActive: {
            type: Boolean,
            default: false
        },

        userLocation: {
            _id: false,
            lat: {
                type: Number,
                default: null,
                // required: [true, 'Latitude is required']
            },
            long: {
                type: Number,
                default: null,
                // required: [true, 'Longitude is required']
            }
        },

        loginInfo: {
            _id: false,
            lastLogin: {
                type: Date,
                default: null
            },
            loginCount: {
                type: Number,
                default: 0
            },
            lastLoginIP: {
                type: String,
                default: null
            },
            registrationIP: {
                type: String,
                default: null
            }
        },

        notifications: [{
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                default: () => new mongoose.Types.ObjectId()
            },
            title: {
                type: String,
                required: [true, 'Notification title is required']
            },
            message: {
                type: String,
                required: [true, 'Notification message is required']
            },
            type: {
                type: String,
                enum: ['info', 'warning', 'error', 'success'],
                default: 'info'
            },
            isRead: {
                type: Boolean,
                default: false
            },
            readAt: {
                type: Date,
                default: null
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            expiresAt: {
                type: Date,
                default: null
            }
        }]
    },
    {
        timestamps: true,
    }
)

userSchema.index({ roles: 1 })
userSchema.index({ isActive: 1 })
userSchema.index({ 'loginInfo.lastLogin': -1 })
userSchema.index({ createdAt: -1 })
userSchema.index({ 'phoneNumber.internationalNumber': 1 })

userSchema.index({ roles: 1, isActive: 1 })

userSchema.virtual('isSeller').get(function () {
    return this.roles.includes(EUserRole.SELLER)
})

userSchema.virtual('unreadNotificationsCount').get(function () {
    return this.notifications?.filter(n => !n.isRead).length || 0
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next()

    try {
        const salt = await bcrypt.genSalt(12)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error) {
        next(error)
    }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false
    return await bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.hasRole = function (role) {
    return this.roles.includes(role)
}

userSchema.methods.addRole = function (role) {
    if (!this.roles.includes(role)) {
        this.roles.push(role)
    }
}

userSchema.methods.removeRole = function (role) {
    this.roles = this.roles.filter(r => r !== role)
}

userSchema.methods.addNotification = function (title, message, type = 'info', expiresAt = null) {
    this.notifications.push({
        title,
        message,
        type,
        expiresAt
    })
}

userSchema.methods.markNotificationAsRead = function (notificationId) {
    const notification = this.notifications.id(notificationId)
    if (notification) {
        notification.isRead = true
        notification.readAt = new Date()
    }
}

// Mark all notifications as read
userSchema.methods.markAllNotificationsAsRead = function () {
    const now = new Date()
    this.notifications.forEach(notification => {
        if (!notification.isRead) {
            notification.isRead = true
            notification.readAt = now
        }
    })
}

userSchema.methods.updateLoginInfo = function (ip) {
    this.loginInfo.lastLogin = dayjs().utc().toDate()
    this.loginInfo.loginCount += 1
    this.loginInfo.lastLoginIP = ip
}

userSchema.statics.findByRole = function (role) {
    return this.find({
        roles: role,
        isActive: true
    })
}

userSchema.statics.findSellers = function () {
    return this.find({
        roles: EUserRole.SELLER,
        isActive: true
    })
}

export default mongoose.model('User', userSchema)