import { container } from "../core/container";
import TYPES from "../core/container/container.types";
import { EventController } from "./event.controller";
import { jobConsumer, jobProducer } from "./event.container";
import { logger } from "../core/utils/logger";
import { EventService } from "./event.service";

const eventController = container.get<EventController>(TYPES.EventController);
const eventService = container.get<EventService>(TYPES.EventService);

export async function startEventService() {
    try {
        await jobConsumer.connect();
        await eventController.initializeSubscriptions();
        await jobProducer.connect();
        logger.info("Event service started successfully.");

        console.log("publishing event");
        await eventService.publishJobPosted({ job_id: "test-1", user_id: "test-user-1" });
        await eventService.publishJobPosted({ job_id: "test-2", user_id: "test-user-2" });
        await eventService.publishJobPosted({ job_id: "test-3", user_id: "test-user-3" });
        console.log("published event");
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
