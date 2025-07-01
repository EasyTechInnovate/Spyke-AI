import mongoose from 'mongoose';
import config from '../config/config.js';

export default {
    connect: async () => {
        try {
            await mongoose.connect(config.database.url);
            return mongoose.connection;
        } catch (err) {
            throw err;
        }
    },
};
