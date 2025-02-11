import { MongoBaseRepository } from "@hireverse/service-common/dist/repository";
import { injectable } from "inversify";
import Interview, { IInterview } from "./interview.modal";
import { IInterviewRepository } from "./interface/interview.repository.interface";

@injectable()
export class InterviewRepository extends MongoBaseRepository<IInterview> implements IInterviewRepository {
    constructor() {
        super(Interview)
    }
}