import app from './app.js';
import config from './config/config.js';
import { initRateLimiter } from './config/rateLimiter.js';
import databaseService from './service/database.service.js';
import './service/email.service.js';
import logger from './util/logger.js';

const server = app.listen(config.server.port);

(async () => {
    try {
        const connection = await databaseService.connect();
        logger.info('DATABASE_CONNECTION', {
            meta: {
                CONNECTION_NAME: connection.name,
            },
        });

        initRateLimiter(connection);
        logger.info('RATE_LIMITER_INITIATED');

        logger.info('APPLICATION_STARTED', {
            meta: {
                PORT: config.server.port,
                SERVER_URL: config.server.url,
            },
        });
    } catch (err) {
        logger.error('APPLICATION_ERROR', { meta: err });

        server.close((error) => {
            if (error) {
                logger.error('APPLICATION_ERROR', { meta: error });
            }

            process.exit(1);
        });
    }
})();
