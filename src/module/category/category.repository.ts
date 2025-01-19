import { MongoBaseRepository } from "@hireverse/service-common/dist/repository";
import { injectable } from "inversify";
import JobCategory, { IJobCategory } from "./category.modal";
import { IJobCategoryRepository } from "./interface/category.repository.interface";

@injectable()
export class JobCategoryRepository extends MongoBaseRepository<IJobCategory> implements IJobCategoryRepository {
    constructor() {
        super(JobCategory)
    }
}