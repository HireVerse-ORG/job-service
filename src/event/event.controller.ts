import { inject, injectable } from "inversify";
import TYPES from "../core/container/container.types";
import { KafkaTopics } from "@hireverse/kafka-communication/dist/events/topics";
import { kafka } from "@hireverse/kafka-communication";
import {JobAppliedMessage, JobApplicationRejectedMessage, JobJobPostAcceptedMessage, JobJobPostRejectedMessage } from "@hireverse/kafka-communication/dist/events";
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
            { topic: KafkaTopics.JOB_POST_ACCEPTED, handler: this.jobPostAcceptedHandler},
            { topic: KafkaTopics.JOB_POST_REJECTED, handler: this.jobPostRejectedHandler},
            { topic: KafkaTopics.JOB_APPLICATION_ACCEPTED, handler: this.jobApplicationSuccessHandler},
            { topic: KafkaTopics.JOB_APPLICATION_REJECTED, handler: this.jobApplicationRejectedHandler},
        ])
    }

    private jobPostAcceptedHandler = async (message: JobJobPostAcceptedMessage) => {
        try {
            await this.jobService.changeJobStatus(message.job_id, JobStatus.LIVE);
        } catch (error) {
            logger.error("Failed to update job accepted status")
        }
    }

    private jobPostRejectedHandler = async (message: JobJobPostRejectedMessage) => {
        try {
            await this.jobService.changeJobStatus(message.job_id, JobStatus.FAILED, message.reason);
        } catch (error) {
            logger.error("Failed to update job rejected status")
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