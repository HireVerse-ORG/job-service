import { inject, injectable } from "inversify";
import TYPES from "../../core/container/container.types";
import { BadRequestError, NotFoundError } from "@hireverse/service-common/dist/app.errors";
import { querySanitizer } from "@hireverse/service-common/dist/utils";
import { IJobService } from "./interface/job.service.interface";
import { IJobRepository } from "./interface/job.repository.interface";
import { EventService } from "../../event/event.service";
import { CreateJobDTO, JobDTO, JobListDTO, JobSearchDTO, PopulatedJobDTO, PopulatedJobListDTO, UpdateJobDTO } from "./dto/job.dto";
import { IJob, JobStatus } from "./job.modal";
import { FilterQuery, isValidObjectId } from "mongoose";
import { ISkill } from "../skills/skill.modal";
import { IJobCategory } from "../category/category.modal";

@injectable()
export class JobService implements IJobService {
    @inject(TYPES.JobRepository) private jobRepo!: IJobRepository;
    @inject(TYPES.EventService) private eventService!: EventService;

    async createJob(data: CreateJobDTO): Promise<JobDTO> {
        data.title = this.capitalizeName(data.title);
        const job = await this.jobRepo.create(data);
        await this.eventService.jobValidateRequest({ job_id: job.id, user_id: job.userId, 
                company_id: data.companyProfileId, title: job.title});
        return this.toDTO(job);
    }

    async retryJobPost(id: string): Promise<boolean> {
        if(!isValidObjectId(id)){
            throw new BadRequestError("Invalid job id");
        }
        const job = await this.jobRepo.findById(id);
        if (!job) {
            throw new NotFoundError("Job not found");
        }

        await this.changeJobStatus(job.id, JobStatus.PENDING);
        await this.eventService.jobValidateRequest({ job_id: job.id, user_id: job.userId, 
            company_id: job.companyProfileId, title: job.title});
        return true;
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


    async changeJobStatus(id: string, status: JobStatus, reason?: string | null): Promise<JobDTO> {
        const job = await this.jobRepo.findById(id);
        if (!job) {
            throw new NotFoundError("Job not found");
        }
        const updatedJob = await this.jobRepo.update(job.id, {status: status, failedReson: reason});
        if (!updatedJob) {
            throw new BadRequestError("Failed to update job");
        }

        return this.toDTO(updatedJob);
    }

    async getPaginatedActiveJobs(filter: JobSearchDTO): Promise<PopulatedJobListDTO> {
        const sanitizedFilter = {...filter, 
            keyword: querySanitizer(filter.keyword || ""),
        };
        const response = await this.jobRepo.searchActiveJobs(sanitizedFilter);
        const jobs =  {...response, data: response.data.map(this.toPopulatedDTO)};
        return jobs;
    }

    async getJobsByUser(userId: string): Promise<JobDTO[]> {
        const jobs = await this.jobRepo.findAll({ userId });
        return jobs.map(this.toDTO);
    }

    async getJobsByCompany(companyProfileId: string): Promise<JobDTO[]> {
        const jobs = await this.jobRepo.findAll({ companyProfileId });
        return jobs.map(this.toDTO);
    }

    async getJobById(id: string, status?: JobStatus): Promise<PopulatedJobDTO> {
        if(!isValidObjectId(id)){
            throw new BadRequestError("Invalid job id");
        }
        const filter:FilterQuery<IJob> = {_id: id};
        
        if(status){
            filter.status = status;
        }
        const job = await this.jobRepo.populatedFindOne(filter);
        if (!job) {
            throw new NotFoundError("Job not found");
        }
        return this.toPopulatedDTO(job);
    }

    async listJobs(page: number, limit: number, filter: {userId?: string; companyProfileId?: string; id?: string;} = {}, query?: string): Promise<PopulatedJobListDTO> {
        const sanitizedQuery = querySanitizer(query || "");
        const filterQuery = {...filter, title: { $regex: sanitizedQuery, $options: 'i' }};
        const response = await this.jobRepo.populatedPaginate(page, limit, filterQuery, {isActive: true}, {}, {sort: {createdAt: -1}});
        const jobs =  {...response, data: response.data.map(this.toPopulatedDTO)};
        return jobs;
    }

    async listJobsCategoryByKeyword(keyword: string): Promise<string[]> {
        const categories = await this.jobRepo.getCategoriesForKeyword(keyword);
        return categories;
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
            failedReson: job.failedReson,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        };
    }

    private toPopulatedDTO(job: IJob): PopulatedJobDTO {
        return {
            id: job.id,
            title: job.title,
            employmentTypes: job.employmentTypes,
            salaryRange: job.salaryRange,
            categories: Array.isArray(job.categories) 
                ? job.categories.map((category) => (typeof category === "string" ? { id: category, name: "Unknown" } : category)) as IJobCategory[]
                : [],
            skills: Array.isArray(job.skills)
                ? job.skills.map((skill) => (typeof skill === "string" ? { id: skill, name: "Unknown" } : skill)) as ISkill[]
                : [],
            status: job.status,
            description: job.description,
            responsibilities: job.responsibilities,
            whoYouAre: job.whoYouAre,
            niceToHaves: job.niceToHaves,
            companyProfileId: job.companyProfileId,
            userId: job.userId,
            failedReson: job.failedReson,
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
