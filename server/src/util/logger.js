import util from 'util'
import 'winston-mongodb'
import { createLogger, format, transports } from 'winston'
import config from '../config/config.js'
import { EApplicationEnvironment } from '../constant/application.js'
import path from 'path'
import { red, blue, yellow, green, magenta } from 'colorette'
import * as sourceMapSupport from 'source-map-support'
import fs from 'fs'

sourceMapSupport.install()

const __filename = new URL(import.meta.url).pathname
const __dirname = process.platform === 'win32' ? path.dirname(__filename).replace(/^\/([a-zA-Z]:)/, '$1') : path.dirname(__filename)

// Ensure logs directory exists
const logDir = path.join(__dirname, '../', '../', 'logs')
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
}

const colorizeLevel = (level) => {
    switch (level) {
        case 'ERROR':
            return red(level)
        case 'INFO':
            return blue(level)
        case 'WARN':
            return yellow(level)
        default:
            return level
    }
}

const consoleLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info

    const customLevel = colorizeLevel(level.toUpperCase())
    const customTimestamp = green(timestamp)
    const customMessage = message
    const customMeta = util.inspect(meta, {
        showHidden: false,
        depth: null,
        colors: true
    })

    return `${customLevel} [${customTimestamp}] ${customMessage}\n${magenta('META')} ${customMeta}\n`
})

const transformMeta = format((info) => {
    const { meta = {} } = info
    const sanitizedMeta = {}

    for (const [key, value] of Object.entries(meta)) {
        if (value instanceof Error) {
            sanitizedMeta[key] = {
                name: value.name,
                message: value.message,
                stack: value.stack || ''
            }
        } else if (typeof value === 'object' && value !== null) {
            // Recursively sanitize nested objects
            sanitizedMeta[key] = JSON.parse(
                JSON.stringify(value, (k, v) => (v instanceof Error ? { name: v.name, message: v.message, stack: v.stack } : v))
            )
        } else {
            sanitizedMeta[key] = value
        }
    }

    info.meta = sanitizedMeta
    return info
})

const consoleTransport = () => {
    if (config.env === EApplicationEnvironment.DEVELOPMENT) {
        return [
            new transports.Console({
                level: 'info',
                format: format.combine(format.timestamp(), consoleLogFormat)
            })
        ]
    }
    return []
}

const fileLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info
    const logMeta = {}

    for (const [key, value] of Object.entries(meta)) {
        if (value instanceof Error) {
            logMeta[key] = {
                name: value.name,
                message: value.message,
                trace: value.stack || ''
            }
        } else {
            logMeta[key] = value
        }
    }

    const logData = {
        level: level.toUpperCase(),
        message,
        timestamp,
        meta: logMeta
    }

    return JSON.stringify(logData, null, 4)
})

const fileTransport = () => {
    // Only log to files in development environment
    if (config.env === EApplicationEnvironment.DEVELOPMENT) {
        return [
            new transports.File({
                filename: path.join(logDir, `${config.env}.log`),
                level: 'info',
                format: format.combine(format.timestamp(), fileLogFormat)
            })
        ]
    }
    
    // In production and QA, only log errors to files
    if (config.env === EApplicationEnvironment.PRODUCTION || config.env === EApplicationEnvironment.QA) {
        return [
            new transports.File({
                filename: path.join(logDir, `${config.env}-errors.log`),
                level: 'error',
                format: format.combine(format.timestamp(), fileLogFormat),
                maxsize: 10485760, // 10MB
                maxFiles: 5,
                tailable: true
            })
        ]
    }
    
    return []
}

const mongodbTransport = () => {
    // Development: log all levels with shorter retention
    if (config.env === EApplicationEnvironment.DEVELOPMENT) {
        return [
            new transports.MongoDB({
                level: 'info',
                db: config.database.url,
                metaKey: 'meta',
                expireAfterSeconds: 3600 * 24 * 7, // 7 days in development
                collection: 'application-logs',
                format: format.combine(format.timestamp(), transformMeta())
            })
        ]
    }
    
    // QA: log warnings and errors with moderate retention
    if (config.env === EApplicationEnvironment.QA) {
        return [
            new transports.MongoDB({
                level: 'warn',
                db: config.database.url,
                metaKey: 'meta',
                expireAfterSeconds: 3600 * 24 * 14, // 14 days in QA
                collection: 'application-logs',
                format: format.combine(format.timestamp(), transformMeta())
            })
        ]
    }
    
    // Production: only log errors with longer retention
    if (config.env === EApplicationEnvironment.PRODUCTION) {
        return [
            new transports.MongoDB({
                level: 'error',
                db: config.database.url,
                metaKey: 'meta',
                expireAfterSeconds: 3600 * 24 * 90, // 90 days in production for compliance
                collection: 'application-logs',
                format: format.combine(format.timestamp(), transformMeta())
            })
        ]
    }
    
    return []
}

export default createLogger({
    defaultMeta: {
        meta: {}
    },
    transports: [...fileTransport(), ...mongodbTransport(), ...consoleTransport()]
})
