import { JobApplicationStatus } from "../application.modal";
import { CreateJobAppplicationDTO, JobApplicationDTO, JobApplicationListDTO, UserJobApplicationFilters } from "../dto/application.dto";

export interface IJobApplicationService {
    createJobApplication(data: CreateJobAppplicationDTO): Promise<JobApplicationDTO>;
    changeJobApplicationStatus(id: string, status: JobApplicationStatus, reason?:string | null): Promise<JobApplicationDTO>;
    retryJobApplication(id: string): Promise<boolean>;
    listUserJobApplications(userId: string, filter: UserJobApplicationFilters): Promise<JobApplicationListDTO>;
    // updateJob(id: string, data: UpdateJobDTO): Promise<JobDTO>;
} 