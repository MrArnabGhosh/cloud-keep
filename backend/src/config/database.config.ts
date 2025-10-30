import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const connectDatabase = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        logger.info("Database connected successfully to mongodb");

    } catch (error) {
        logger.error("Database connection failed", {error});
        process.exit(1);
    }
}

const disConnectDatabase = async ()=>{
    try {
        await mongoose.disconnect();
        logger.info("Database disconnected successfully to mongodb");

    } catch (error) {
        logger.error("Database disconnection failed", {error});
        process.exit(1);
    }
}

export {connectDatabase, disConnectDatabase};