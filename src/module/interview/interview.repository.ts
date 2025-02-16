import { MongoBaseRepository } from "@hireverse/service-common/dist/repository";
import { injectable } from "inversify";
import Interview, { IInterview, InterviewStatus } from "./interview.modal";
import { IInterviewRepository } from "./interface/interview.repository.interface";
import { InternalError } from "@hireverse/service-common/dist/app.errors";
import { RootFilterQuery } from "mongoose";

@injectable()
export class InterviewRepository extends MongoBaseRepository<IInterview> implements IInterviewRepository {
    constructor() {
        super(Interview)
    }

    async expireInterviews(date: Date): Promise<{ modifiedCount: number; }> {
        try {
            const updated = await this.repository.updateMany({
                scheduledTime: {$lte: date},
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

    async updateMany(data: Partial<IInterview>, filter?: RootFilterQuery<IInterview>) {
        try {
            const updated = await this.repository.updateMany(filter, {$set: data});
            return {
                modifiedCount: updated.modifiedCount
            }
        } catch (error) {
            throw new InternalError("Failed to perform update many");
        }
    }

    async countInterviews(filter?: RootFilterQuery<IInterview>): Promise<number> {
        try {
            return await this.repository.countDocuments(filter);
        } catch (error) {
            throw new InternalError("Failed to complete count operation")
        }
    }
}