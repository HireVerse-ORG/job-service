import { injectable, inject } from "inversify";
import TYPES from "../core/container/container.types";
import { kafka } from "@hireverse/kafka-communication"; 
import { JobPostedMessage } from "@hireverse/kafka-communication/dist/events/jobPosted"; 
import { JobPostedEvent } from "@hireverse/kafka-communication/dist/events";

@injectable()
export class EventService {
  @inject(TYPES.KafkaProducer) private jobProducer!: kafka.KafkaProducer; 

  /**
   * Publishes a JobPosted event.
   * @param data - The data to be sent with the event.
   */
  publishJobPosted = async (data: JobPostedMessage) => {
    try {
      const event = JobPostedEvent({ key: "job-1", value: data }); 
      await this.jobProducer.sendEvent(event); 
    } catch (error) {
      throw new Error("Failed to publish Job Posted event");
    } 
  };
}
