import {IMongoRepository} from "@hireverse/service-common/dist/repository"
import { IJob } from "../job.modal";

export interface IJobRepository extends IMongoRepository<IJob> {
}
