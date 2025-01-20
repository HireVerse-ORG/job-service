import { MongoBaseRepository } from "@hireverse/service-common/dist/repository";
import { injectable } from "inversify";
import Job, { IJob } from "./job.modal";
import { IJobRepository } from "./interface/job.repository.interface";

@injectable()
export class JobRepository extends MongoBaseRepository<IJob> implements IJobRepository {
    constructor() {
        super(Job)
    }
}