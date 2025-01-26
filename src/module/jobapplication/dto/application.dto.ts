import { IPaginationResponse } from "@hireverse/service-common/dist/repository";
import { JobApplicationStatus } from "../application.modal";

export interface CreateJobAppplicationDTO {
    userId: string;
    companyProfileId: string;
    jobId: string;
    jobRole: string;
    fullName: string;
    email: string;
    phone?: string;
    coverLetter?: string;
    resume: string;
}

export interface UpdateJobAppplicationDTO {
    fullName?: string;
    email?: string;
    phone?: string;
    coverLetter?: string;
    resume?: string;
}

export interface JobApplicationDTO {
    id: string;
    userId: string;
    companyProfileId: string;
    jobId: string;
    jobRole: string;
    fullName: string;
    email: string;
    phone?: string;
    coverLetter?: string;
    resume: string;
    status: JobApplicationStatus;
    failedReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface JobApplicationListDTO extends IPaginationResponse<JobApplicationDTO> {
}

export interface JobListFilters {
    page: number,
    limit: number,
    query?: string,
    status?: JobApplicationStatus
}





