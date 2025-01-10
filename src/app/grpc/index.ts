import * as grpc from '@grpc/grpc-js';
import registerServices from './registerServices';
import { logger } from '../../core/utils/logger';

class Server {
    public app: grpc.Server;

    constructor() {
        this.app = new grpc.Server();
        this.initialize()
    }

    private initialize() {
        registerServices(this.app)
    }

    start(PORT:string) {
        this.app.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
            if(error){
                logger.error(`Error starting Prodile gRPC server: ${error}`);
                process.exit(1);
            }
            logger.info(`Prodile gRPC service running at 0.0.0.0:${port}`);
        });
    }

    close() {
        logger.info('Shutting down gRPC server...');
        this.app.tryShutdown(err => {
            if (err) {
                logger.error('Error during shutdown:', err);
            }
            process.exit(0);
        });
    }
}


export default Server