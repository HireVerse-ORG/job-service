import { container } from "../core/container";
import TYPES from "../core/container/container.types";
import { EventController } from "./event.controller";
import { jobConsumer, jobProducer } from "./event.container";
import { logger } from "../core/utils/logger";

const eventController = container.get<EventController>(TYPES.EventController);

export async function startEventService() {
    try {
        await jobConsumer.connect();
        await eventController.initializeSubscriptions();
        await jobProducer.connect();
        logger.info("Event service started successfully.");
    } catch (error) {
        logger.error("Error starting the event service:", error);
    }
}

export async function stopEventService() {
    try {
        await jobProducer.connect();
        await jobConsumer.disconnect();
        logger.info("Event service stopped successfully.");
    } catch (error) {
        logger.error("Error stopping the event service:", error);
    }
}
