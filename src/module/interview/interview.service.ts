import { inject, injectable } from "inversify";
import { IInterviewService } from "./interface/interview.service.interface";
import TYPES from "../../core/container/container.types";
import { IInterviewRepository } from "./interface/interview.repository.interface";
import { CreateInterviewDto, InterviewDTO, UpdateInterviewDto } from "./dto/interview.dto";
import { BadRequestError, NotFoundError } from "@hireverse/service-common/dist/app.errors";
import { IInterview, InterviewStatus } from "./interview.modal";
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
            status: {$nin: [InterviewStatus.CANCELED, InterviewStatus.REJECTED]},
        });
        if(existingSchedule){
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
        const interviews = await this.interviewRepo.findAll({application, status: {$ne: InterviewStatus.CANCELED}});
        return interviews.map((interview) => this.toDTO(interview));
    }

    async getInterviewsByApplicant(filter: {
        applicantId: string, 
        status?: InterviewStatus
    }, page: number, limit: number): Promise<IPaginationResponse<IInterview>> {
        const query: FilterQuery<IInterview> = { applicantId: filter.applicantId };
        if(filter.status) {
            query.status = filter.status;
        } else {
            query.status = {$ne: InterviewStatus.CANCELED};
        }
        const interviews = await this.interviewRepo.paginate(query, page, limit, {populate: 'application'});
        return interviews;
    }

    async getInterviewsByInterviewer(interviewerId: string): Promise<InterviewDTO[]> {
        const interviews = await this.interviewRepo.findAll({interviewerId});
        return interviews.map((interview) => this.toDTO(interview));
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