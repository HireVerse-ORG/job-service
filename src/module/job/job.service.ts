import { inject, injectable } from "inversify";
import TYPES from "../../core/container/container.types";
import { BadRequestError, NotFoundError } from "@hireverse/service-common/dist/app.errors";
import { querySanitizer } from "@hireverse/service-common/dist/utils";
import { IJobService } from "./interface/job.service.interface";
import { IJobRepository } from "./interface/job.repository.interface";
import { EventService } from "../../event/event.service";
import { CreateJobDTO, JobDTO, UpdateJobDTO } from "./dto/job.dto";
import { IJob, JobStatus } from "./job.modal";
import { isValidObjectId } from "mongoose";

@injectable()
export class JobService implements IJobService {
    @inject(TYPES.JobRepository) private jobRepo!: IJobRepository;
    @inject(TYPES.EventService) private eventService!: EventService;

    async createJob(data: CreateJobDTO): Promise<JobDTO> {
        data.title = this.capitalizeName(data.title);
        const job = await this.jobRepo.create(data);
        await this.eventService.publishJobPosted({ job_id: job.id, user_id: job.userId, 
                company_id: data.companyProfileId, title: job.title});
        return this.toDTO(job);
    }

    async updateJob(id: string, data: UpdateJobDTO): Promise<JobDTO> {
        if(!isValidObjectId(id)){
            throw new BadRequestError("Invalid job id");
        }

        const job = await this.jobRepo.findById(id);
        if (!job) {
            throw new NotFoundError("Job not found");
        }

        if (data.title) {
            data.title = this.capitalizeName(data.title);
        }

        const updatedJob = await this.jobRepo.update(job.id, data);

        if (!updatedJob) {
            throw new BadRequestError("Failed to update job");
        }

        return this.toDTO(updatedJob);
    }


    async changeJobStatus(id: string, status: JobStatus): Promise<JobDTO> {
        const job = await this.jobRepo.findById(id);
        if (!job) {
            throw new NotFoundError("Job not found");
        }
        const updatedJob = await this.jobRepo.update(job.id, {status: status});
        if (!updatedJob) {
            throw new BadRequestError("Failed to update job");
        }

        return this.toDTO(updatedJob);
    }

    async searchJobs(query: string): Promise<JobDTO[]> {
        const sanitizedQuery = querySanitizer(query);
        const jobs = await this.jobRepo.findAll({ title: { $regex: sanitizedQuery, $options: 'i' } });
        return jobs.map(this.toDTO);
    }

    async getJobsByUser(userId: string): Promise<JobDTO[]> {
        const jobs = await this.jobRepo.findAll({ userId });
        return jobs.map(this.toDTO);
    }

    async getJobsByCompany(companyProfileId: string): Promise<JobDTO[]> {
        const jobs = await this.jobRepo.findAll({ companyProfileId });
        return jobs.map(this.toDTO);
    }

    async getJobById(id: string): Promise<JobDTO> {
        if(!isValidObjectId(id)){
            throw new BadRequestError("Invalid job id");
        }
        
        const job = await this.jobRepo.findById(id);
        if (!job) {
            throw new NotFoundError("Job not found");
        }
        return this.toDTO(job);
    }

    async listJobs(page: number, limit: number): Promise<JobDTO[]> {
        const response = await this.jobRepo.paginate({}, page, limit);
        const jobs = response.data.map(this.toDTO);
        return jobs;
    }

    private toDTO(job: IJob): JobDTO {
        return {
            id: job.id,
            title: job.title,
            employmentTypes: job.employmentTypes,
            salaryRange: job.salaryRange,
            categories: job.categories,
            skills: job.skills,
            status: job.status,
            description: job.description,
            responsibilities: job.responsibilities,
            whoYouAre: job.whoYouAre,
            niceToHaves: job.niceToHaves,
            companyProfileId: job.companyProfileId,
            userId: job.userId,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        };
    }

    private capitalizeName(name: string): string {
        return name
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
}
