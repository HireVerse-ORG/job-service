import {MongoBaseRepository } from "@hireverse/service-common/dist/repository";
import { injectable } from "inversify";
import JobApplication, { IJobApplication } from "./application.modal";
import { IJobApplicationRepository } from "./interface/application.repository.interface";

@injectable()
export class JobApplicationRepository extends MongoBaseRepository<IJobApplication> implements IJobApplicationRepository {
    constructor() {
        super(JobApplication)
    }

    async checkIfApplied(userId: string, jobId: string){
        const application = await this.repository.findOne({userId, jobId});
        return !!application;
    }
}