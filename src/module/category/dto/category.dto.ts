import { IPaginationResponse } from "@hireverse/service-common/dist/repository";

export interface CreateJobCategoryDTO {
    name: string;
    isActive: boolean;
}

export interface UpdateJobCategoryDTO {
    id: string;
    name?: string;
    isActive?: boolean;
}

export interface JobCategoryDTO {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface JobCategoryListDTO extends IPaginationResponse<JobCategoryDTO> {
}





