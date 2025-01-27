import {MongoBaseRepository } from "@hireverse/service-common/dist/repository";
import { injectable } from "inversify";
import JobApplication, { IJobApplication } from "./application.modal";
import { IJobApplicationRepository } from "./interface/application.repository.interface";
import { RootFilterQuery, UpdateQuery } from "mongoose";
import { InternalError } from "@hireverse/service-common/dist/app.errors";

@injectable()
export class JobApplicationRepository extends MongoBaseRepository<IJobApplication> implements IJobApplicationRepository {
    constructor() {
        super(JobApplication)
    }

    async checkIfApplied(userId: string, jobId: string){
        const application = await this.repository.findOne({userId, jobId});
        return !!application;
    }

    async updateMany(filter?: RootFilterQuery<IJobApplication>, updateQuery?: UpdateQuery<IJobApplication>): Promise<boolean>{
        try {
            const updated = await this.repository.updateMany(filter, updateQuery)
            return updated.acknowledged
        } catch (error) {
            throw new InternalError("Failed to perofrm update many operation")
        }
    }
}