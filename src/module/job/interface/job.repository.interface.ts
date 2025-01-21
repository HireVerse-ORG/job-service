import {IMongoRepository, IPaginationResponse} from "@hireverse/service-common/dist/repository"
import { IJob } from "../job.modal";
import { FilterQuery } from "mongoose";
import { ISkill } from "../../skills/skill.modal";
import { IJobCategory } from "../../category/category.modal";

export interface IJobRepository extends IMongoRepository<IJob> {
    populatedPaginate(
            page: number,
            limit: number,
            filter: FilterQuery<IJob>,
            skillFilter: FilterQuery<ISkill>,
            categoryFilter: FilterQuery<IJobCategory>
        ): Promise<IPaginationResponse<IJob>>;
        
    populatedFind(filter: FilterQuery<IJob>, skillFilter: FilterQuery<ISkill>, categoryFilter: FilterQuery<IJobCategory>): Promise<IJob[]>
}
