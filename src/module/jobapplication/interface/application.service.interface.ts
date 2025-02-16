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

    // statistics
    getCompaniesApplicationsCount(companyId: string): Promise<number>;
    getCompaniesApplicationsTrend(companyId: string, year: number): Promise<Array<{ month: string; count: number }>>
    getUserApplicationsCount(userId: string): Promise<number>
    getUserApplicationsTrend(userId: string, year: number): Promise<Array<{ month: string; count: number }>>
    getUserApplicationsStatusData(userId: string): Promise<Array<{ status: string; count: number }>>
} 