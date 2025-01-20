import { Container } from "inversify";
import { kafka } from "@hireverse/kafka-communication";
import { EventController } from "./event.controller";
import TYPES from "../core/container/container.types";
import { KafkaConnect, KafkaConsumer, KafkaProducer } from "@hireverse/kafka-communication/dist/kafka";
import { EventService } from "./event.service";

const kafkaConnect = new KafkaConnect({
    clientId: "job-service",
    brokers: [process.env.KAFKA_SERVER!],
    retry: {
        retries: 5, 
        factor: 0.2,
    }
})

export const jobProducer = new kafka.KafkaProducer(kafkaConnect, {allowAutoTopicCreation: process.env.NODE_ENV === "development"});
export const jobConsumer = new kafka.KafkaConsumer(kafkaConnect, { groupId: "job-group"});

export function loadEventContainer(container: Container) {
    container.bind<KafkaProducer>(TYPES.KafkaProducer).toConstantValue(jobProducer);
    container.bind<KafkaConsumer>(TYPES.KafkaConsumer).toConstantValue(jobConsumer);
    container.bind<EventController>(TYPES.EventController).to(EventController);
    container.bind<EventService>(TYPES.EventService).to(EventService);
}
