import { injectable, inject } from "inversify";
import TYPES from "../core/container/container.types";
import { kafka } from "@hireverse/kafka-communication";
import { logger } from "../core/utils/logger";
import { JobValidationMessage, JobValidationRequestEvent } from "@hireverse/kafka-communication/dist/events";

@injectable()
export class EventService {
  @inject(TYPES.KafkaProducer) private producer!: kafka.KafkaProducer;

  async jobValidateRequest(message: JobValidationMessage) {
    try {
      const event = JobValidationRequestEvent({key: message.job_id, value: message});
      await this.producer.sendEvent(event);
    } catch (error) {
      logger.error("Failed to publish job validation event")
    }
  }
}

