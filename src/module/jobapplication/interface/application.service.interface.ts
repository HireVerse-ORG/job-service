import { JobApplicationStatus } from "../application.modal";
import { CreateJobAppplicationDTO, JobApplicationDTO, JobApplicationListDTO, JobListFilters, UpdateJobAppplicationDTO } from "../dto/application.dto";

export interface IJobApplicationService {
    createJobApplication(data: CreateJobAppplicationDTO): Promise<JobApplicationDTO>;
    updateJobApplication(id: string, data: UpdateJobAppplicationDTO): Promise<JobApplicationDTO>;
    getJobApplicationById(id: string): Promise<JobApplicationDTO | null>;
    changeJobApplicationStatus(id: string, status: JobApplicationStatus, reason?:string | null): Promise<JobApplicationDTO>;
    retryJobApplication(id: string): Promise<boolean>;
    withdrawJobApplication(id: string): Promise<boolean>;
    listUserJobApplications(userId: string, filter: JobListFilters): Promise<JobApplicationListDTO>;
    listJobApplicationsForCompany(
        filter: { jobId?: string; companyProfileId?: string } & JobListFilters
    ): Promise<JobApplicationListDTO>;
    declineApplicantsOfJob(jobId: string, reason?: string): Promise<boolean>;
    addComment(id: string, comment: string): Promise<JobApplicationDTO>;
} 