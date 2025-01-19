import {IMongoRepository} from "@hireverse/service-common/dist/repository"
import { IJobCategory } from "../category.modal";

export interface IJobCategoryRepository extends IMongoRepository<IJobCategory> {
}
