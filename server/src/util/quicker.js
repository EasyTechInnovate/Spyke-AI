import os from 'os';
import config from '../config/config.js';
import jwt from 'jsonwebtoken'
import { v4 } from 'uuid'
import { randomInt } from 'crypto'
import parsePhoneNumber from 'libphonenumber-js'
import { getTimezonesForCountry } from 'countries-and-timezones'

export default {
    getSystemHealth: () => {
        return {
            cpuUsage: os.loadavg(),
            totalMemory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
            freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`,
        };
    },
    getApplicationHealth: () => {
        return {
            environment: config.env,
            uptime: `${process.uptime().toFixed(2)} Seconds`,
            memoryUsage: {
                heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
            },
        };
    },
    generateToken: (payload, secret, expiry) => {
        return jwt.sign(payload, secret, {
            expiresIn: expiry
        })
    },
    verifyToken: (token, secret) => {
        return jwt.verify(token, secret)
    },
    getDomainFromUrl: (url) => {
        try {
            const parsedUrl = new URL(url)
            return parsedUrl.hostname
        } catch (err) {
            throw err
        }
    },
    generateRandomId: () => v4(),
    generateOtp: (length) => {
        const min = Math.pow(10, length - 1)
        const max = Math.pow(10, length) - 1

        return randomInt(min, max + 1).toString()
    },
    parsePhoneNumber: (phoneNumber) => {
        try {
            const parsedContactNumber = parsePhoneNumber(phoneNumber)
            if (parsedContactNumber) {
                return {
                    countryCode: parsedContactNumber.countryCallingCode,
                    isoCode: parsedContactNumber.country || null,
                    internationalNumber: parsedContactNumber.formatInternational()
                }
            }

            return {
                countryCode: null,
                isoCode: null,
                internationalNumber: null
            }
        } catch (err) {
            return {
                countryCode: null,
                isoCode: null,
                internationalNumber: null
            }
        }
    },
    countryTimezone: (isoCode) => {
        return getTimezonesForCountry(isoCode)
    },
};
