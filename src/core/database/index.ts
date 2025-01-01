import mongoose from "mongoose";
import { logger } from "../utils/logger";

class Database {
    private dbUrl: string;

    constructor(dbUrl: string) {
        this.dbUrl = dbUrl;
    }

    async connect(): Promise<void> {
        try {
            await mongoose.connect(this.dbUrl);
            logger.info(`Database connected to: ${this.dbUrl}`);
        } catch (error) {
            logger.error(`Error connecting to database: ${error}`);
            process.exit(1); 
        }
    }

    async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            logger.warn('Database connection closed');
        } catch (error) {
            logger.error(`Error disconnecting from database: ${error}`);
        }
    }
}

export default Database;