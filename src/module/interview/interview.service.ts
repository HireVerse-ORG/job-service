import { inject, injectable } from "inversify";
import { IInterviewService } from "./interface/interview.service.interface";
import TYPES from "../../core/container/container.types";
import { IInterviewRepository } from "./interface/interview.repository.interface";
import { CreateInterviewDto, InterviewDTO, UpdateInterviewDto } from "./dto/interview.dto";
import { BadRequestError, NotFoundError } from "@hireverse/service-common/dist/app.errors";
import { IInterview, InterviewStatus, InterviewType } from "./interview.modal";
import { IPaginationResponse } from "@hireverse/service-common/dist/repository";
import { FilterQuery } from "mongoose";

@injectable()
export class InterviewService implements IInterviewService {
    @inject(TYPES.InterviewRepository) private interviewRepo!: IInterviewRepository;

    async createInterview(dto: CreateInterviewDto): Promise<InterviewDTO> {
        const existingSchedule = await this.interviewRepo.findOne({
            job: dto.job,
            application: dto.application,
            applicantId: dto.applicantId,
            interviewerId: dto.interviewerId,
            scheduledTime: dto.scheduledTime,
            status: { $nin: [InterviewStatus.CANCELED, InterviewStatus.REJECTED] },
        });
        if (existingSchedule) {
            throw new BadRequestError("Interview schedule already exists");
        }
        const interview = await this.interviewRepo.create(dto);
        return this.toDTO(interview);
    }

    async updateInterview(interviewId: string, dto: UpdateInterviewDto): Promise<InterviewDTO> {
        const updatedInterview = await this.interviewRepo.update(interviewId, dto);
        if (!updatedInterview) {
            throw new NotFoundError("Interview not found");
        }
        return this.toDTO(updatedInterview);
    }

    async getInterviewById(interviewId: string): Promise<InterviewDTO | null> {
        const interview = await this.interviewRepo.findById(interviewId);
        return interview ? this.toDTO(interview) : null;
    }

    async getInterviewsByApplication(application: string): Promise<InterviewDTO[]> {
        const interviews = await this.interviewRepo.findAll({ application, status: { $nin: [InterviewStatus.CANCELED] } });
        return interviews.map((interview) => this.toDTO(interview));
    }

    async getInterviewsByApplicant(filter: {
        applicantId: string,
        statuses?: InterviewStatus[],
        types?: InterviewType[],
        upcoming?: boolean,
    }, page: number, limit: number): Promise<IPaginationResponse<IInterview>> {
        const query: FilterQuery<IInterview> = { applicantId: filter.applicantId };
        if (filter.statuses) {
            query.status = { $in: filter.statuses };
        } else {
            query.status = { $nin: [InterviewStatus.CANCELED, InterviewStatus.EXPIRED, InterviewStatus.COMPLETED] };
        }
    
        if (filter.types) {
            query.type = { $in: filter.types };
        }
    
        if (filter.upcoming) {
            query.scheduledTime = { $gte: new Date() };
        }

        const interviews = await this.interviewRepo.paginate(query, page, limit, { populate: 'application', sort: {scheduledTime: -1} });
        return interviews;
    }

    async getInterviewsByInterviewer(filter: {
        interviewerId: string, 
        statuses?: InterviewStatus[],
        types?: InterviewType[],
        upcoming?: boolean,
    }, page: number, limit: number): Promise<IPaginationResponse<IInterview>> {
        const query: FilterQuery<IInterview> = { interviewerId: filter.interviewerId };
        if (filter.statuses) {
            query.status = { $in: filter.statuses };
        } else {
            query.status = { $nin: [InterviewStatus.CANCELED] };
        }
    
        if (filter.types) {
            query.type = { $in: filter.types };
        }
    
        if (filter.upcoming) {
            query.scheduledTime = { $gte: new Date() };
        }

        const interviews = await this.interviewRepo.paginate(query, page, limit, { populate: 'application', sort: {scheduledTime: -1} });
        return interviews;
    }

    async cancelInterview(interviewId: string): Promise<InterviewDTO> {
        const updatedInterview = await this.interviewRepo.update(interviewId, { status: InterviewStatus.CANCELED });
        if (!updatedInterview) {
            throw new NotFoundError("Interview not found");
        }
        return this.toDTO(updatedInterview);
    }

    async acceptInterview(interviewId: string): Promise<InterviewDTO> {
        const updatedInterview = await this.interviewRepo.update(interviewId, { status: InterviewStatus.ACCEPTED });
        if (!updatedInterview) {
            throw new NotFoundError("Interview not found");
        }
        return this.toDTO(updatedInterview);
    }

    async rejectInterview(interviewId: string): Promise<InterviewDTO> {
        const updatedInterview = await this.interviewRepo.update(interviewId, { status: InterviewStatus.REJECTED });
        if (!updatedInterview) {
            throw new NotFoundError("Interview not found");
        }
        return this.toDTO(updatedInterview);
    }

    async completeInterview(interviewId: string): Promise<InterviewDTO> {
        const updatedInterview = await this.interviewRepo.update(interviewId, { status: InterviewStatus.COMPLETED });
        if (!updatedInterview) {
            throw new NotFoundError("Interview not found");
        }
        return this.toDTO(updatedInterview);
    }

    async cancelAllJobInterview(jobId: string): Promise<boolean> {
        const result = await this.interviewRepo.updateMany({
            status: InterviewStatus.CANCELED,
        }, {
            job: jobId,
            status: {$nin: [InterviewStatus.EXPIRED, InterviewStatus.REJECTED, InterviewStatus.COMPLETED]}
        })
        return result.modifiedCount > 0;
    }

    private toDTO(interview: IInterview): InterviewDTO {
        return {
            id: interview.id,
            job: interview.job.toString(),
            application: interview.application.toString(),
            applicantId: interview.applicantId,
            interviewerId: interview.interviewerId,
            scheduledTime: interview.scheduledTime,
            type: interview.type,
            status: interview.status,
            description: interview.description,
        };
    }
}