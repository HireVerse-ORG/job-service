import { CreateJobDTO, JobDTO, JobListDTO, UpdateJobDTO } from "../dto/job.dto";
import { JobStatus } from "../job.modal";

export interface IJobService {
    createJob(data: CreateJobDTO): Promise<JobDTO>;
    updateJob(id: string, data: UpdateJobDTO): Promise<JobDTO>;
    changeJobStatus(id: string, status: JobStatus): Promise<JobDTO>;
    searchJobs(query: string): Promise<JobDTO[]>;
    getJobsByUser(userId: string): Promise<JobDTO[]>;
    getJobsByCompany(companyProfileId: string): Promise<JobDTO[]>;
    getJobById(id: string): Promise<JobDTO>;
    listJobs(page: number, limit: number): Promise<JobDTO[]>;
}