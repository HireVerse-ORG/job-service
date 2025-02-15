import { injectable, inject } from "inversify";
import TYPES from "../../core/container/container.types";
import { kafka } from "@hireverse/kafka-communication";
import { logger } from "../../core/utils/logger";
import { JobApplicationViewedEvent, JobApplicationViewedMessage, 
  JobAppliedEvent, JobAppliedMessage, JobValidationMessage, 
  JobValidationRequestEvent, ResumeCommentEvent, ResumeCommentMessage,
  InterviewScheduledEvent, InterviewScheduledMessage, 
  InterviewScheduleAcceptedEvent, InterviewScheduleAcceptedMessage,
  InterviewScheduleRejectedEvent, InterviewScheduleRejectedMessage,
  JobOfferedMessage, JobOfferAcceptedMessage, JobOfferRejectedMessage,
  JobOfferedEvent, JobOfferAcceptedEvent, JobOfferRejectedEvent,
} from "@hireverse/kafka-communication/dist/events";

@injectable()
export class EventService {
  @inject(TYPES.KafkaProducer) private producer!: kafka.KafkaProducer;
  
  async jobOffered(message: JobOfferedMessage) {
    try {
      const event = JobOfferedEvent({ key: message.job_application_id, value: message });
      await this.producer.sendEvent(event);
    } catch (error: any) {
      logger.error(
        `Failed to publish Job Offered Event: ${message.job_application_id}. Error: ${error.message || "Unknown error"}`,
        {
          context: "JobOfferedEvent",
          job_application_id: message.job_application_id,
          errorStack: error.stack || "No stack trace",
        }
      );

    }
  }

  async jobOfferAccepted(message: JobOfferAcceptedMessage) {
    try {
      const event = JobOfferAcceptedEvent({ key: message.job_application_id, value: message });
      await this.producer.sendEvent(event);
    } catch (error: any) {
      logger.error(
        `Failed to publish Job Offered Event: ${message.job_application_id}. Error: ${error.message || "Unknown error"}`,
        {
          context: "JobOfferAcceptedEvent",
          job_application_id: message.job_application_id,
          errorStack: error.stack || "No stack trace",
        }
      );

    }
  }

  async jobOfferRejected(message: JobOfferRejectedMessage) {
    try {
      const event = JobOfferRejectedEvent({ key: message.job_application_id, value: message });
      await this.producer.sendEvent(event);
    } catch (error: any) {
      logger.error(
        `Failed to publish Job Offered Event: ${message.job_application_id}. Error: ${error.message || "Unknown error"}`,
        {
          context: "JobOfferRejectedEvent",
          job_application_id: message.job_application_id,
          errorStack: error.stack || "No stack trace",
        }
      );

    }
  }

  async interviewScheduled(message: InterviewScheduledMessage) {
    try {
      const event = InterviewScheduledEvent({ key: message.id, value: message });
      await this.producer.sendEvent(event);
    } catch (error: any) {
      logger.error(
        `Failed to publish Interview Scheduled Event: ${message.id}. Error: ${error.message || "Unknown error"}`,
        {
          context: "InterviewScheduledEvent",
          id: message.id,
          errorStack: error.stack || "No stack trace",
        }
      );

    }
  }

  async interviewRejected(message: InterviewScheduleRejectedMessage) {
    try {
      const event = InterviewScheduleRejectedEvent({ key: message.id, value: message });
      await this.producer.sendEvent(event);
    } catch (error: any) {
      logger.error(
        `Failed to publish Interview Schedule Rejected Event: ${message.id}. Error: ${error.message || "Unknown error"}`,
        {
          context: "InterviewScheduleRejectedEvent",
          id: message.id,
          errorStack: error.stack || "No stack trace",
        }
      );

    }
  }

  async interviewAccepted(message: InterviewScheduleAcceptedMessage) {
    try {
      const event = InterviewScheduleAcceptedEvent({ key: message.id, value: message });
      await this.producer.sendEvent(event);
    } catch (error: any) {
      logger.error(
        `Failed to publish Interview Schedule Accepted Event: ${message.id}. Error: ${error.message || "Unknown error"}`,
        {
          context: "InterviewScheduleAcceptedEvent",
          id: message.id,
          errorStack: error.stack || "No stack trace",
        }
      );

    }
  }

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

  async resumeCommented(message: ResumeCommentMessage) {
    try {
      const event = ResumeCommentEvent({ key: message.job_application_id, value: message });
      await this.producer.sendEvent(event);
    } catch (error: any) {
      logger.error(
        `Failed to publish resume application ID: ${message.job_application_id}. Error: ${error.message || "Unknown error"}`,
        {
          context: "JobApplicationVuewedEvent",
          applicationId: message.job_application_id,
          errorStack: error.stack || "No stack trace",
        }
      );
    }
  }
}

