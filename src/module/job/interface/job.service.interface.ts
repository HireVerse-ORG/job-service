import { CreateJobDTO, JobDTO, JobSearchDTO, PopulatedJobDTO, PopulatedJobListDTO, UpdateJobDTO } from "../dto/job.dto";
import { JobStatus } from "../job.modal";

export interface IJobService {
    createJob(data: CreateJobDTO): Promise<JobDTO>;
    retryJobPost(id: string): Promise<boolean>;
    updateJob(id: string, data: UpdateJobDTO): Promise<JobDTO>;
    changeJobStatus(id: string, status: JobStatus, reason?:string | null): Promise<JobDTO>;
    getPaginatedActiveJobs(filter: JobSearchDTO): Promise<PopulatedJobListDTO>;
    getJobsByUser(userId: string): Promise<JobDTO[]>;
    getJobsByCompany(companyProfileId: string): Promise<JobDTO[]>;
    getJobById(id: string, status?: JobStatus): Promise<PopulatedJobDTO>;
    listJobs(page: number, limit: number, filter: {userId?: string; companyProfileId?: string; id?: string;}, query?:string): Promise<PopulatedJobListDTO>;
    listJobsCategoryByKeyword(keyword: string): Promise<string[]>;
    getMyjobsCount(userId: string): Promise<number>;
    getMyjobPostTrend(userId: string, year: number): Promise<Array<{ month: string; count: number }>>
} 