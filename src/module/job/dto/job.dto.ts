import { IPaginationResponse } from "@hireverse/service-common/dist/repository";
import { IJob, JobStatus } from "../job.modal";
import { ISkill } from "../../skills/skill.modal";
import { IJobCategory } from "../../category/category.modal";

export interface CreateJobDTO {
    title: string;
    employmentTypes: string[];
    salaryRange: number[] | null;
    categories: string[];
    skills: string[];
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
    failedReson: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface PopulatedJobDTO {
    id: string;
    title: string;
    employmentTypes: string[];
    salaryRange: number[] | null;
    categories: IJobCategory[];
    skills: ISkill[];
    status: JobStatus;
    description: string;
    responsibilities: string;
    whoYouAre: string;
    niceToHaves: string;
    companyProfileId: string;
    userId: string;
    failedReson: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface JobListDTO extends IPaginationResponse<JobDTO> {
}

export interface PopulatedJobListDTO extends IPaginationResponse<PopulatedJobDTO> {
}

export interface JobSearchDTO {
    keyword?: string;
    categories?: string[];
    employmentTypes?: string[];
    salaryRange?: {min: number, max: number};
    companyIds?: string[];
    page: number;
    limit: number;
}




