import {IMongoRepository} from "@hireverse/service-common/dist/repository"
import { IJobApplication } from "../application.modal";

export interface IJobApplicationRepository extends IMongoRepository<IJobApplication> {
    checkIfApplied(userId: string, jobId: string): Promise<Boolean>
}
