import { MongoBaseRepository } from "@hireverse/service-common/dist/repository";
import { injectable } from "inversify";
import Interview, { IInterview, InterviewStatus } from "./interview.modal";
import { IInterviewRepository } from "./interface/interview.repository.interface";
import { InternalError } from "@hireverse/service-common/dist/app.errors";

@injectable()
export class InterviewRepository extends MongoBaseRepository<IInterview> implements IInterviewRepository {
    constructor() {
        super(Interview)
    }

    async expireInterviews(date: Date): Promise<{ modifiedCount: number; }> {
        try {
            const updated = await this.repository.updateMany({
                scheduledTime: {$gte: date},
                status: InterviewStatus.SCHEDULED
            }, {
                $set: {status: InterviewStatus.EXPIRED}
            })

            return {
                modifiedCount: updated.modifiedCount,
            }
        } catch (error) {
            throw new InternalError("Failed to expire interviews");
        }
    }
}