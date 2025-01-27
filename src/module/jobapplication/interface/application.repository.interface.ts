import {IMongoRepository} from "@hireverse/service-common/dist/repository"
import { IJobApplication } from "../application.modal";
import { RootFilterQuery, UpdateQuery } from "mongoose";

export interface IJobApplicationRepository extends IMongoRepository<IJobApplication> {
    checkIfApplied(userId: string, jobId: string): Promise<Boolean>;
    updateMany(filter?: RootFilterQuery<IJobApplication>, updateQuery?: UpdateQuery<IJobApplication>): Promise<boolean>
}
