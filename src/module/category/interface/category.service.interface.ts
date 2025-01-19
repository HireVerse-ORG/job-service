import { CreateJobCategoryDTO, JobCategoryDTO, JobCategoryListDTO, UpdateJobCategoryDTO } from "../dto/category.dto";

export interface IJobCategoryService {
    skilExist(name: string): Promise<boolean>
    createJobCategory(data: CreateJobCategoryDTO): Promise<JobCategoryDTO>;
    getAllJobCategorys(page: number, limit: number, query?: string): Promise<JobCategoryListDTO>;
    getJobCategoryFromName(id: string): Promise<JobCategoryDTO | null>;
    getJobCategoryById(id: string): Promise<JobCategoryDTO>;
    getJobCategorysFromIds(ids: string[]): Promise<JobCategoryDTO[]>;
    updateJobCategory(data: UpdateJobCategoryDTO): Promise<JobCategoryDTO | null>;
    deactivateJobCategory(id: string): Promise<JobCategoryDTO>;
    restoreJobCategory(id: string): Promise<JobCategoryDTO>;
    serachJobCategory(query: string, isActive?:boolean): Promise<JobCategoryDTO[]>;
}