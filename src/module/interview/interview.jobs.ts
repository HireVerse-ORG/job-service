import { inject, injectable } from "inversify";
import TYPES from "../../core/container/container.types";
import { IInterviewRepository } from "./interface/interview.repository.interface";
import cron from "node-cron";
import { logger } from "../../core/utils/logger";

@injectable()
export class InterviewJobs {
    @inject(TYPES.InterviewRepository) private interviewRepo!: IInterviewRepository;

    public startJobs(){
        this.startExpiryCron();
    }

    private startExpiryCron(): void {
        // Run every minute
        cron.schedule("* * * * *", async () => {
            const now = new Date();
            // Define a grace period of 2 minutes (adjust as needed)
            const threshold = new Date(now.getTime() - 2 * 60 * 1000);
            try {
                const result = await this.interviewRepo.expireInterviews(threshold);
                if (result.modifiedCount > 0) {
                    logger.info(`Expired ${result.modifiedCount} interviews at ${now.toISOString()}`);
                }
            } catch (error) {
                logger.error("Error expiring interviews");
            }
        });

        logger.info("Interview expiry cron job started.");
    }
}