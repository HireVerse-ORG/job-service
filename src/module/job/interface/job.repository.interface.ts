import {IMongoRepository, IPaginationResponse} from "@hireverse/service-common/dist/repository"
import { IJob } from "../job.modal";
import { FilterQuery, QueryOptions, RootFilterQuery } from "mongoose";
import { ISkill } from "../../skills/skill.modal";
import { IJobCategory } from "../../category/category.modal";
import { JobSearchDTO } from "../dto/job.dto";

export interface IJobRepository extends IMongoRepository<IJob> {
    populatedPaginate(
            page: number,
            limit: number,
            filter: FilterQuery<IJob>,
            skillFilter: FilterQuery<ISkill>,
            categoryFilter: FilterQuery<IJobCategory>,
            options?: QueryOptions<IJob>
        ): Promise<IPaginationResponse<IJob>>;
        
    populatedFind(filter: FilterQuery<IJob>, 
        skillFilter: FilterQuery<ISkill>, 
        categoryFilter: FilterQuery<IJobCategory>,
        options?: QueryOptions<IJob> 
    ): Promise<IJob[]>

    populatedFindOne(filter: FilterQuery<IJob>, 
        skillFilter?: FilterQuery<ISkill>, 
        categoryFilter?: FilterQuery<IJobCategory>,
        options?: QueryOptions<IJob> 
    ): Promise<IJob | null>

    searchActiveJobs(searchFilter: JobSearchDTO): Promise<IPaginationResponse<IJob>>;
    getCategoriesForKeyword(keyword: string): Promise<string[]>;
    countJobs(filter?: RootFilterQuery<IJob>): Promise<number>
    getJobPostTrend(companyId: string, year: number): Promise<Array<{ month: string; count: number }>>
}
