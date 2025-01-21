import { IPaginationResponse, MongoBaseRepository } from "@hireverse/service-common/dist/repository";
import { injectable } from "inversify";
import Job, { IJob } from "./job.modal";
import { IJobRepository } from "./interface/job.repository.interface";
import { FilterQuery } from "mongoose";
import { ISkill } from "../skills/skill.modal";
import { IJobCategory } from "../category/category.modal";
import { InternalError } from "@hireverse/service-common/dist/app.errors";

@injectable()
export class JobRepository extends MongoBaseRepository<IJob> implements IJobRepository {
    constructor() {
        super(Job)
    }

    async populatedFind(filter: FilterQuery<IJob>, skillFilter: FilterQuery<ISkill>, categoryFilter: FilterQuery<IJobCategory>): Promise<IJob[]> {
        try {
            const jobs = await this.repository.find(filter).populate({
                path: "skills",
                match: skillFilter, 
            })
            .populate({
                path: "categories",
                match: categoryFilter, 
            });

            return jobs;
        } catch (error) {
            throw new InternalError("Failed to fetch job list");
        }
    }

    async populatedPaginate(
        page: number,
        limit: number,
        filter: FilterQuery<IJob> = {},
        skillFilter: FilterQuery<ISkill> = {},
        categoryFilter: FilterQuery<IJobCategory> = {}
    ): Promise<IPaginationResponse<IJob>> {
        try {
            const skip = (page - 1) * limit;

            const query = this.repository.find(filter)
                .populate({
                    path: "skills",
                    match: skillFilter, 
                })
                .populate({
                    path: "categories",
                    match: categoryFilter, 
                })
                .skip(skip)
                .limit(limit);

            const [jobs, count] = await Promise.all([
                query.exec(), 
                this.repository.countDocuments(filter),
            ]);

            return {
                currentPage: page,
                data: jobs,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
                hasNextPage: page < Math.ceil(count / limit),
                hasPreviousPage: page > 1,
            };
        } catch (error) {
            throw new InternalError("Failed to fetch job list");
        }
    }

}