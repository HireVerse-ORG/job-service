import { injectable, inject } from "inversify";
import TYPES from "../core/container/container.types";
import { kafka } from "@hireverse/kafka-communication";
import { logger } from "../core/utils/logger";
import { JobApplicationViewedEvent, JobApplicationViewedMessage, JobAppliedEvent, JobAppliedMessage, JobValidationMessage, JobValidationRequestEvent } from "@hireverse/kafka-communication/dist/events";

@injectable()
export class EventService {
  @inject(TYPES.KafkaProducer) private producer!: kafka.KafkaProducer;

  async jobValidateRequest(message: JobValidationMessage) {
    try {
      const event = JobValidationRequestEvent({ key: message.job_id, value: message });
      await this.producer.sendEvent(event);
    } catch (error: any) {
      logger.error(
        `Failed to publish job validation event for job ID: ${message.job_id}. Error: ${error.message || "Unknown error"}`,
        {
          context: "JobValidationRequestEvent",
          jobId: message.job_id,
          errorStack: error.stack || "No stack trace",
        }
      );

    }
  }

  async jobAppliedEvent(message: JobAppliedMessage) {
    try {
      const event = JobAppliedEvent({ key: message.job_application_id, value: message });
      await this.producer.sendEvent(event);
    } catch (error: any) {
      logger.error(
        `Failed to publish job applied event for application ID: ${message.job_application_id}. Error: ${error.message || "Unknown error"}`,
        {
          context: "JobAppliedEvent",
          applicationId: message.job_application_id,
          errorStack: error.stack || "No stack trace",
        }
      );
    }
  }

  async jobApplicationViewed(message: JobApplicationViewedMessage) {
    try {
      const event = JobApplicationViewedEvent({ key: message.job_application_id, value: message });
      await this.producer.sendEvent(event);
    } catch (error: any) {
      logger.error(
        `Failed to publish job viewed event for application ID: ${message.job_application_id}. Error: ${error.message || "Unknown error"}`,
        {
          context: "JobApplicationVuewedEvent",
          applicationId: message.job_application_id,
          errorStack: error.stack || "No stack trace",
        }
      );
    }
  }
}

