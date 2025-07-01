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
    return [
        new transports.File({
            filename: path.join(logDir, `${config.env}.log`), // Use corrected logDir
            level: 'info',
            format: format.combine(format.timestamp(), fileLogFormat)
        })
    ]
}

const mongodbTransport = () => {
    return [
        new transports.MongoDB({
            level: 'info',
            db: config.database.url,
            metaKey: 'meta',
            expireAfterSeconds: 3600 * 24 * 30,
            collection: 'application-logs',
            format: format.combine(format.timestamp(), transformMeta())
        })
    ]
}

export default createLogger({
    defaultMeta: {
        meta: {}
    },
    transports: [...fileTransport(), ...mongodbTransport(), ...consoleTransport()]
})
