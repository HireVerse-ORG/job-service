import Logger from '@hireverse/service-common/dist/logger/logger';
import {createLogger} from '@hireverse/service-common/dist/logger/winston-logger';

export const logger = new Logger(createLogger(process.env.LOG_LEVEL || 'info',
             process.env.ENABLE_LOGSTASH === 'true', 
             {
                host: process.env.LOGSTASH_HOST || 'localhost',
                port: parseInt(process.env.LOGSTASH_PORT || '5044')
            }));