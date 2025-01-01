import express, { Application } from 'express';
import { registerRoutes } from './appRoutes';
import { registerMiddlewares } from './appMiddlewares';
import { logger } from '../../core/utils/logger';


class Server {
    public app: Application;
    private server: any;

    constructor(private dbUrl: string) {
        this.app = express();
        this.initialize();
    }

    async initialize() {
        try {
            registerMiddlewares(this.app);
            registerRoutes(this.app);
        } catch (error) {
            logger.error("Error during initialization:", error);
            process.exit(1);
        }
    }

    start(PORT: string) {
        this.server = this.app.listen(PORT, () => {
            logger.info(`User server running at PORT:${PORT}`);
        });
    }

    stop() {
        logger.info("Shutting down User Server...");
        try {
            this.server?.close(() => {
                logger.info("User Server shut down gracefully.");
            });

            process.exit(0);
        } catch (error) {
            logger.error("Error during shutdown:", error);
            process.exit(1);
        }
    }
}

export default Server;