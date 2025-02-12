import { container } from "../../core/container";
import TYPES from "../../core/container/container.types";
import { EventController } from "../../module/event/event.controller";
import { logger } from "../../core/utils/logger";
import { KafkaConsumer, KafkaProducer } from "@hireverse/kafka-communication/dist/kafka";

const eventController = container.get<EventController>(TYPES.EventController);
const eventProducer = container.get<KafkaProducer>(TYPES.KafkaProducer);
const eventConsumer = container.get<KafkaConsumer>(TYPES.KafkaConsumer);

export async function startEventService() {
    try {
        await eventProducer.connect();
        await eventConsumer.connect();
        await eventController.initializeSubscriptions();
        logger.info("Event service started successfully.");
    } catch (error) {
        logger.error("Error starting the event service:", error);
    }
}

export async function stopEventService() {
    try {
        await eventProducer.disconnect();
        await eventConsumer.disconnect();
        logger.info("Event service stopped successfully.");
    } catch (error) {
        logger.error("Error stopping the event service:", error);
    }
}
