import { inject, injectable } from "inversify";
import TYPES from "../../core/container/container.types";
import { EventService } from "../event/event.service";
import { IJobApplicationService } from "./interface/application.service.interface";
import { IJobApplicationRepository } from "./interface/application.repository.interface";
import { CreateJobAppplicationDTO, JobApplicationDTO, JobApplicationListDTO, JobListFilters, UpdateJobAppplicationDTO } from "./dto/application.dto";
import { BadRequestError, NotFoundError } from "@hireverse/service-common/dist/app.errors";
import { IJobApplication, JobApplicationStatus } from "./application.modal";
import { FilterQuery, isValidObjectId } from "mongoose";
import { querySanitizer } from "@hireverse/service-common/dist/utils";

@injectable()
export class JobApplicationService implements IJobApplicationService {
    @inject(TYPES.JobApplicationRepository) private jobApplicationRepo!: IJobApplicationRepository;
    @inject(TYPES.EventService) private eventService!: EventService;

    async createJobApplication(data: CreateJobAppplicationDTO): Promise<JobApplicationDTO> {
        const existingJob = await this.jobApplicationRepo.findOne({
            userId: data.userId,
            jobId: data.jobId,
            status: { $nin: [JobApplicationStatus.WITHDRAWN] },
        });
    
        if (existingJob) {
            throw new BadRequestError("You have already applied for this job.");
        }

        const application = await this.jobApplicationRepo.create(data);
        await this.eventService.jobAppliedEvent({ job_application_id: application.id, user_id: application.userId });
        return this.toDTO(application);
    }

    async updateJobApplication(id: string, data: UpdateJobAppplicationDTO): Promise<JobApplicationDTO> {
        if(!isValidObjectId(id)){
            throw new BadRequestError("Invalid id");
        }

        const updated = await this.jobApplicationRepo.update(id, data);

        if(!updated){
            throw new BadRequestError("Failed to update job application");
        }

        return this.toDTO(updated);
    }

    async getJobApplicationById(id: string): Promise<JobApplicationDTO | null> {
        const appplication = await this.jobApplicationRepo.findById(id);
        return appplication ? this.toDTO(appplication) : null;
    }

    async changeJobApplicationStatus(id: string, status: JobApplicationStatus, reason?: string | null): Promise<JobApplicationDTO> {
        const data: Partial<IJobApplication> = {status};
        if(reason && status === JobApplicationStatus.FAILED){
            data.failedReason = reason;
        }
        if(reason && status === JobApplicationStatus.DECLINED){
            data.declinedReason = reason;
        }
        const updatedJobApplication = await this.jobApplicationRepo.update(id, data);
        if (!updatedJobApplication) {
            throw new BadRequestError("Failed to update jobApplication");
        }

        return this.toDTO(updatedJobApplication);
    }

    async retryJobApplication(id: string): Promise<boolean> {
        if (!isValidObjectId(id)) {
            throw new BadRequestError("Invalid job application ID");
        }
    
        const application = await this.jobApplicationRepo.findById(id);
        if (!application) {
            throw new NotFoundError("Job application not found");
        }
    
        if (application.status !== JobApplicationStatus.FAILED) {
            throw new BadRequestError("Job application cannot be retried unless it is in 'failed' status.");
        }
    
        const updated = await this.jobApplicationRepo.update(application.id, { status: JobApplicationStatus.PENDING });
        if (!updated) {
            throw new Error("Failed to update job application status.");
        }
    
        await this.eventService.jobAppliedEvent({
            job_application_id: application.id,
            user_id: application.userId,
        });
    
        return true;
    }

    async withdrawJobApplication(id: string): Promise<boolean> {
        if (!isValidObjectId(id)) {
            throw new BadRequestError("Invalid job application ID");
        }
    
        const application = await this.jobApplicationRepo.findById(id);
        if (!application) {
            throw new NotFoundError("Job application not found");
        }
    
        if([JobApplicationStatus.HIRED, JobApplicationStatus.WITHDRAWN].includes(application.status)){
            throw new BadRequestError(`Cannot withdraw application that is ${application.status}`);
        }

        const updated = await this.jobApplicationRepo.update(application.id, { status: JobApplicationStatus.WITHDRAWN });
        if (!updated) {
            throw new Error("Failed to update job application status.");
        }

        return true;
    }

    async declineApplicantsOfJob(jobId: string, reason?: string): Promise<boolean> {
        const excludeStatus = [JobApplicationStatus.HIRED, JobApplicationStatus.WITHDRAWN, JobApplicationStatus.FAILED];
        const updated = await this.jobApplicationRepo.updateMany(
            { jobId, status: { $nin: excludeStatus } }, 
            { $set: { status: JobApplicationStatus.DECLINED, declinedReason: reason || null } } 
        );
        return updated
    }

    async listUserJobApplications(userId: string, filter: JobListFilters): Promise<JobApplicationListDTO> {
        const { page, limit, query, status } = filter;

        const filterQuery: FilterQuery<IJobApplication> = { userId };
        if (query) {
            const sanitizedQuery = querySanitizer(query.trim());
            filterQuery.jobRole = { $regex: sanitizedQuery, $options: "i" };
        }

        if(status) {
            filterQuery.status = status;
        }

        if(!status) {
            filterQuery.status = {$ne: JobApplicationStatus.WITHDRAWN};
        }

        const appplications = await this.jobApplicationRepo.paginate({ ...filterQuery }, page, limit, {sort: {createdAt : -1}});
        return { ...appplications, data: appplications.data.map(this.toDTO) };
    }

    async listJobApplicationsForCompany(
        filter: { jobId?: string; companyProfileId?: string } & JobListFilters
    ): Promise<JobApplicationListDTO> {
        const { jobId, companyProfileId, page, limit, query, status } = filter;
    
        const excludeStatus = [JobApplicationStatus.WITHDRAWN, JobApplicationStatus.PENDING, JobApplicationStatus.FAILED];
    
        const filterQuery: FilterQuery<IJobApplication> = {};
        if (jobId) {
            filterQuery.jobId = jobId;
        }
        if (companyProfileId) {
            filterQuery.companyProfileId = companyProfileId;
        }
    
        if (query) {
            const sanitizedQuery = querySanitizer(query.trim());
            filterQuery.$or = [
                { fullName: { $regex: sanitizedQuery, $options: "i" } },
                { email: { $regex: sanitizedQuery, $options: "i" } },
            ];
        }
    
        if (status && !excludeStatus.includes(status)) {
            filterQuery.status = status;
        } else if (!status) {
            filterQuery.status = { $nin: excludeStatus };
        }
    
        const applications = await this.jobApplicationRepo.paginate(
            { ...filterQuery },
            page,
            limit,
            { sort: { createdAt: -1 } }
        );
        return { ...applications, data: applications.data.map(this.toDTO) };
    }

    async addComment(id: string, comment: string): Promise<JobApplicationDTO> {
        if (!isValidObjectId(id)) {
            throw new BadRequestError("Invalid job application ID");
        }
    
        const application = await this.jobApplicationRepo.findById(id);
        if (!application) {
            throw new NotFoundError("Job application not found");
        }

        const updated = await this.jobApplicationRepo.update(id, {comment: {text: comment, date: new Date()}});

        if (!updated) {
            throw new Error("Failed to add comment.");
        }

        return this.toDTO(updated);
    }
    

    private toDTO(application: IJobApplication): JobApplicationDTO {
        return {
            id: application.id,
            userId: application.userId,
            companyProfileId: application.companyProfileId,
            jobId: application.jobId,
            jobRole: application.jobRole,
            fullName: application.fullName,
            email: application.email,
            phone: application.phone,
            coverLetter: application.coverLetter,
            resume: application.resume,
            offerLetter: application.offerLetter,
            status: application.status,
            failedReason: application.failedReason,
            declinedReason: application.declinedReason,
            comment: application.comment,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt,
        }
    }
}
