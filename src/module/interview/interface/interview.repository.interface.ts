import {IMongoRepository} from "@hireverse/service-common/dist/repository"
import { IInterview } from "../interview.modal";
import { RootFilterQuery } from "mongoose";

export interface IInterviewRepository extends IMongoRepository<IInterview> {
    expireInterviews(date: Date): Promise<{modifiedCount: number}>;
    updateMany(data: Partial<IInterview>, filter?: RootFilterQuery<IInterview>): Promise<{
        modifiedCount: number;
    }>;
    countInterviews(filter?: RootFilterQuery<IInterview>): Promise<number>;
}
