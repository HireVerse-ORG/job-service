import { inject, injectable } from "inversify";
import TYPES from "../core/container/container.types";
import { KafkaTopics } from "@hireverse/kafka-communication/dist/events/topics";
import { JobPostedMessage } from "@hireverse/kafka-communication/dist/events/jobPosted";
import { kafka } from "@hireverse/kafka-communication";

@injectable()
export class EventController {
    @inject(TYPES.KafkaConsumer) private jobConsumer!: kafka.KafkaConsumer;

    async initializeSubscriptions() {
        await this.subscribeToJobPostedEvent();
    }

    private subscribeToJobPostedEvent = async () => {
        await this.jobConsumer.subscribeToTopic<JobPostedMessage>(KafkaTopics.JOB_POSTED, (message) => {
            console.log("subscribed event: ", message);
        })
    }
}