import { inject, injectable } from "inversify";
import TYPES from "../core/container/container.types";
import { KafkaTopics } from "@hireverse/kafka-communication/dist/events/topics";
import { kafka } from "@hireverse/kafka-communication";
import { JobStatusMessage, JobAppliedMessage, JobApplicationRejectedMessage } from "@hireverse/kafka-communication/dist/events";
import { IJobService } from "../module/job/interface/job.service.interface";
import { JobStatus } from "../module/job/job.modal";
import { logger } from "../core/utils/logger";
import { IJobApplicationService } from "../module/jobapplication/interface/application.service.interface";
import { JobApplicationStatus } from "../module/jobapplication/application.modal";

@injectable()
export class EventController {
    @inject(TYPES.KafkaConsumer) private jobConsumer!: kafka.KafkaConsumer;
    @inject(TYPES.JobService) private jobService!: IJobService;
    @inject(TYPES.JobApplicationService) private jobApplicationService!: IJobApplicationService;


    async initializeSubscriptions() {
        await this.jobConsumer.subscribeToTopics([
            { topic: KafkaTopics.JOB_STATUS_UPDATED, handler: this.jobStatusHandler},
            { topic: KafkaTopics.JOB_APPLICATION_ACCEPTED, handler: this.jobApplicationSuccessHandler},
            { topic: KafkaTopics.JOB_APPLICATION_REJECTED, handler: this.jobApplicationRejectedHandler},
        ])
    }

    private jobStatusHandler = async (message: JobStatusMessage) => {
        try {
            let status = JobStatus.PENDING;
            if (message.status === "success") {
                status = JobStatus.LIVE;
            } else if (message.status === "failed") {
                status = JobStatus.FAILED;
            }
            await this.jobService.changeJobStatus(message.job_id, status, message.reason)
        } catch (error) {
            logger.error("Failed to update job status")
        }
    }

    private jobApplicationSuccessHandler = async (message: JobAppliedMessage) => {
        try {
            const application = await this.jobApplicationService.getJobApplicationById(message.job_application_id);
            if(application && application.status !== JobApplicationStatus.WITHDRAWN){
                await this.jobApplicationService.changeJobApplicationStatus(message.job_application_id, JobApplicationStatus.APPLIED);
            }
        } catch (error) {
            logger.error("Failed to update job application status")
        }
    }

    private jobApplicationRejectedHandler = async (message: JobApplicationRejectedMessage) => {
        try {
            const application = await this.jobApplicationService.getJobApplicationById(message.job_application_id);
            if(application && application.status !== JobApplicationStatus.WITHDRAWN){
                await this.jobApplicationService.changeJobApplicationStatus(message.job_application_id, JobApplicationStatus.FAILED, message.reason);
            }
        } catch (error) {
            logger.error("Failed to update job application status")
        }
    }
}