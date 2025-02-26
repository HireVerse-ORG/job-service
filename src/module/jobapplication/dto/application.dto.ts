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
    offerLetter?: string; 
    status?: JobApplicationStatus;
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
    offerLetter?: string; 
    status: JobApplicationStatus;
    failedReason: string | null;
    declinedReason: string | null;
    comment: {
      text: string,
      date: Date,
    }, 
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





