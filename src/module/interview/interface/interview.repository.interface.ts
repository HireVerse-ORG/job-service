import {IMongoRepository} from "@hireverse/service-common/dist/repository"
import { IInterview } from "../interview.modal";

export interface IInterviewRepository extends IMongoRepository<IInterview> {
    expireInterviews(date: Date): Promise<{modifiedCount: number}>
}
