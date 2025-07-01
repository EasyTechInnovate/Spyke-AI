import { RateLimiterMongo } from 'rate-limiter-flexible';
import config from './config.js';

export let rateLimiterMongo = null;

export const initRateLimiter = (mongooseConnection) => {
  rateLimiterMongo = new RateLimiterMongo({
    storeClient: mongooseConnection,
    points: config.security.rateLimitMax,
    duration: Math.floor(config.security.rateLimitWindowMs / 60),
  });
};
