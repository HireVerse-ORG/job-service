import { inject, injectable } from "inversify";
import TYPES from "../../core/container/container.types";
import { EventService } from "../../event/event.service";
import { IJobApplicationService } from "./interface/application.service.interface";
import { IJobApplicationRepository } from "./interface/application.repository.interface";
import { CreateJobAppplicationDTO, JobApplicationDTO, JobApplicationListDTO, UserJobApplicationFilters } from "./dto/application.dto";
import { BadRequestError, NotFoundError } from "@hireverse/service-common/dist/app.errors";
import { IJobApplication, JobApplicationStatus } from "./application.modal";
import { FilterQuery, isValidObjectId } from "mongoose";
import { querySanitizer } from "@hireverse/service-common/dist/utils";

@injectable()
export class JobApplicationService implements IJobApplicationService {
    @inject(TYPES.JobApplicationRepository) private jobApplicationRepo!: IJobApplicationRepository;
    @inject(TYPES.EventService) private eventService!: EventService;

    async createJobApplication(data: CreateJobAppplicationDTO): Promise<JobApplicationDTO> {
        if (await this.jobApplicationRepo.checkIfApplied(data.userId, data.jobId)) {
            throw new BadRequestError("Already applied for this job");
        }
        const application = await this.jobApplicationRepo.create(data);
        await this.eventService.jobAppliedEvent({ job_application_id: application.id, user_id: application.userId });
        return this.toDTO(application);
    }

    async changeJobApplicationStatus(id: string, status: JobApplicationStatus, reason?: string | null): Promise<JobApplicationDTO> {
        const jobApplication = await this.jobApplicationRepo.findById(id);
        if (!jobApplication) {
            throw new NotFoundError("Job application not found");
        }
        const updatedJobApplication = await this.jobApplicationRepo.update(jobApplication.id, { status: status, failedReason: reason });
        if (!updatedJobApplication) {
            throw new BadRequestError("Failed to update jobApplication");
        }

        return this.toDTO(updatedJobApplication);
    }

    async retryJobApplication(id: string): Promise<boolean> {
        if(!isValidObjectId(id)){
            throw new BadRequestError("Invalid job application id");
        }
        const application = await this.jobApplicationRepo.findById(id);
        if (!application) {
            throw new NotFoundError("Job appliication not found");
        }

        if(application.status !== JobApplicationStatus.FAILED){
            throw new BadRequestError("Job cant be repplied.")
        }

        const updated = await this.jobApplicationRepo.update(application.id, {status: JobApplicationStatus.PENDING});
        await this.eventService.jobAppliedEvent({ job_application_id: application.id, user_id: application.userId });
        return updated ? true : false;
    }

    async listUserJobApplications(userId: string, filter: UserJobApplicationFilters): Promise<JobApplicationListDTO> {
        const { page, limit, query, status } = filter;

        const filterQuery: FilterQuery<IJobApplication> = { userId };
        if (query) {
            const sanitizedQuery = querySanitizer(query.trim());
            filterQuery.jobRole = { $regex: sanitizedQuery, $options: "i" };
        }

        if (status) {
            filterQuery.status = status;
        }

        const appplications = await this.jobApplicationRepo.paginate({ ...filterQuery }, page, limit);
        return { ...appplications, data: appplications.data.map(this.toDTO) };
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
            status: application.status,
            failedReason: application.failedReason,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt,
        }
    }
}
