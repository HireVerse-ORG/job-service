import { IPaginationResponse } from "@hireverse/service-common/dist/repository";
import { JobStatus } from "../job.modal";

export interface CreateJobDTO {
    title: string;
    employmentTypes: string[];
    salaryRange: number[] | null;
    categories: string[];
    skills: string[];
    status: JobStatus;
    description: string;
    responsibilities?: string;
    whoYouAre?: string;
    niceToHaves?: string;
    companyProfileId: string;
    userId: string;
}

export interface UpdateJobDTO {
    title?: string;
    employmentTypes?: string[];
    salaryRange?: number[] | null;
    categories?: string[];
    skills?: string[];
    status?: JobStatus;
    description?: string;
    responsibilities?: string;
    whoYouAre?: string;
    niceToHaves?: string;
}

export interface JobDTO {
    id: string;
    title: string;
    employmentTypes: string[];
    salaryRange: number[] | null;
    categories: string[];
    skills: string[];
    status: JobStatus;
    description: string;
    responsibilities: string;
    whoYouAre: string;
    niceToHaves: string;
    companyProfileId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface JobListDTO extends IPaginationResponse<JobDTO> {
}





