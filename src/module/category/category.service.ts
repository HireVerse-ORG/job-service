import { inject, injectable } from "inversify";
import TYPES from "../../core/container/container.types";
import { BadRequestError } from "@hireverse/service-common/dist/app.errors";
import { FilterQuery, isValidObjectId } from "mongoose";
import { querySanitizer } from "@hireverse/service-common/dist/utils";
import { IJobCategoryService } from "./interface/category.service.interface";
import { IJobCategoryRepository } from "./interface/category.repository.interface";
import { CreateJobCategoryDTO, JobCategoryDTO, JobCategoryListDTO, UpdateJobCategoryDTO } from "./dto/category.dto";
import { IJobCategory } from "./category.modal";

@injectable()
export class JobCategoryService implements IJobCategoryService {
    @inject(TYPES.JobCategoryRepository) private JobCategoryrepo!: IJobCategoryRepository;

    async skilExist(name: string): Promise<boolean> {
        return !!await this.JobCategoryrepo.findOne({name: { $regex:  `^${name}$`, $options: "i" }})
    }

    async createJobCategory(data: CreateJobCategoryDTO): Promise<JobCategoryDTO> {
        if(await this.skilExist(data.name)){
            throw new BadRequestError("Job category already exist");
        }
        data.name = this.capitalizeName(data.name);
        const JobCategory = await this.JobCategoryrepo.create(data);
        return JobCategory;
    }

    async updateJobCategory(data: UpdateJobCategoryDTO): Promise<JobCategoryDTO | null> {
        if(!isValidObjectId(data.id)){
            throw new BadRequestError("Invalid id");
        }
        if(data.name){
            data.name = this.capitalizeName(data.name);
            if(await this.JobCategoryrepo.findOne({_id: {$ne: data.id}, name: { $regex:  `^${data.name}$`, $options: "i" }})){
                throw new BadRequestError("Job category already exist");
            }
        }
        const JobCategory = await this.JobCategoryrepo.update(data.id, data);
        return JobCategory
    }

    async getAllJobCategorys(page: number, limit: number, query?: string): Promise<JobCategoryListDTO> {
        const filter: FilterQuery<IJobCategory> = {};
        if (query) {
            query = querySanitizer(query);
            filter.name = { $regex: query, $options: "i" }; 
        }

        const JobCategorys = await this.JobCategoryrepo.paginate(filter, page, limit, {sort: {createdAt: -1}});
        return JobCategorys
    }

    async getJobCategoryFromName(query: string): Promise<JobCategoryDTO | null> {
        query = querySanitizer(query);
        const JobCategory = await this.JobCategoryrepo.findOne({name: { $regex: `^${query}$`, $options: "i" }});
        return JobCategory;
    }

    async getJobCategoryById(id: string): Promise<JobCategoryDTO> {
        if(!isValidObjectId(id)){
            throw new BadRequestError("Invalid id");
        }
        const JobCategory = await this.JobCategoryrepo.findById(id);
        if(!JobCategory){
            throw new BadRequestError("Job category not found");
        }

        return JobCategory;
    }

    async getJobCategorysFromIds(ids: string[]): Promise<JobCategoryDTO[]> {
        const JobCategorys = await this.JobCategoryrepo.findAll({ _id: { $in: ids } });
        return JobCategorys.map(JobCategory => this.toDTO(JobCategory));
    }

    async serachJobCategory(query: string, isActive?:boolean): Promise<JobCategoryDTO[]> {
        const filter: FilterQuery<IJobCategory> = {};
        query = querySanitizer(query);
        filter.name = { $regex: query, $options: "i" }; 
        if (isActive) {
            filter.isActive = isActive;
        }
        const JobCategorys = await this.JobCategoryrepo.findAll(filter);
        return JobCategorys;
    }

    async deactivateJobCategory(id: string): Promise<JobCategoryDTO> {
        const JobCategory = await this.getJobCategoryById(id);
        JobCategory.isActive = false;
        await this.JobCategoryrepo.update(id, JobCategory);
        return JobCategory;
    }

    async restoreJobCategory(id: string): Promise<JobCategoryDTO> {
        const JobCategory = await this.getJobCategoryById(id);
        JobCategory.isActive = true;
        await this.JobCategoryrepo.update(id, JobCategory);
        return JobCategory;
    }

    private toDTO(JobCategory: IJobCategory): JobCategoryDTO {
        return {
            id: JobCategory.id,
            name: JobCategory.name,
            isActive: JobCategory.isActive,
            createdAt: JobCategory.createdAt,
            updatedAt: JobCategory.updatedAt
        }
    }

    private capitalizeName(name: string): string {
        return name
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
}