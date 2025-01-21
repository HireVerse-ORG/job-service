import { inject, injectable } from "inversify";
import TYPES from "../core/container/container.types";
import { KafkaTopics } from "@hireverse/kafka-communication/dist/events/topics";
import { kafka } from "@hireverse/kafka-communication";
import { JobStatusMessage } from "@hireverse/kafka-communication/dist/events";
import { IJobService } from "../module/job/interface/job.service.interface";
import { JobStatus } from "../module/job/job.modal";
import { logger } from "../core/utils/logger";

@injectable()
export class EventController {
    @inject(TYPES.KafkaConsumer) private jobConsumer!: kafka.KafkaConsumer;
    @inject(TYPES.JobService) private jobService!: IJobService;

    async initializeSubscriptions() {
        await this.subscribeToStatusEvent();
    }

    private subscribeToStatusEvent = async () => {
        await this.jobConsumer.subscribeToTopic<JobStatusMessage>(KafkaTopics.JOB_STATUS_UPDATED,
            async (message) => {
                try {
                    let status = JobStatus.PENDING;
                    if(message.status === "success"){
                        status = JobStatus.LIVE;
                    } else if(message.status === "failed"){
                        status = JobStatus.FAILED;
                    }
                    await this.jobService.changeJobStatus(message.job_id, status, message.reason)
                } catch (error) {
                    logger.error("Failed to update job status")
                }
            })
    }
}