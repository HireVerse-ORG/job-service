import { Container } from "inversify";
import { kafka } from "@hireverse/kafka-communication";
import { EventController } from "./event.controller";
import TYPES from "../../core/container/container.types";
import { KafkaConnect, KafkaConsumer, KafkaProducer } from "@hireverse/kafka-communication/dist/kafka";
import { EventService } from "./event.service";
import { logger } from "../../core/utils/logger";

const kafkaConnect = new KafkaConnect({
    clientId: "job-service",
    brokers: [process.env.KAFKA_SERVER!],
    retry: {
        retries: 10,              
        initialRetryTime: 500,   
        factor: 0.3,              
        multiplier: 2,           
        maxRetryTime: 60_000,    
        restartOnFailure: async (error) => {
            logger.error("Kafka connection failed:", error);
            return true; 
        },
    }
})

export const jobProducer = new kafka.KafkaProducer(kafkaConnect, {allowAutoTopicCreation: process.env.KAFKA_AUTO_CREATE_TOPICS === "true"});
export const jobConsumer = new kafka.KafkaConsumer(kafkaConnect, { groupId: "job-group", allowAutoTopicCreation: process.env.KAFKA_AUTO_CREATE_TOPICS === "true"});

export function loadEventContainer(container: Container) {
    container.bind<KafkaProducer>(TYPES.KafkaProducer).toConstantValue(jobProducer);
    container.bind<KafkaConsumer>(TYPES.KafkaConsumer).toConstantValue(jobConsumer);
    container.bind<EventController>(TYPES.EventController).to(EventController);
    container.bind<EventService>(TYPES.EventService).to(EventService);
}
