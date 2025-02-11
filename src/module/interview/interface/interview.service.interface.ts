import { IPaginationResponse } from "@hireverse/service-common/dist/repository";
import { CreateInterviewDto, InterviewDTO, UpdateInterviewDto } from "../dto/interview.dto";
import { IInterview, InterviewStatus } from "../interview.modal";

export interface IInterviewService {
    createInterview(dto: CreateInterviewDto): Promise<InterviewDTO>;
    updateInterview(interviewId: string, dto: UpdateInterviewDto): Promise<InterviewDTO>;
    getInterviewById(interviewId: string): Promise<InterviewDTO | null>;
    getInterviewsByApplication(application: string): Promise<InterviewDTO[]>;
    getInterviewsByApplicant(filter: {
            applicantId: string, 
            status?: InterviewStatus
        }, page: number, limit: number): Promise<IPaginationResponse<IInterview>>;
    getInterviewsByInterviewer(interviewerId: string): Promise<InterviewDTO[]>;
    cancelInterview(interviewId: string): Promise<InterviewDTO>;
    acceptInterview(interviewId: string): Promise<InterviewDTO>;
    rejectInterview(interviewId: string): Promise<InterviewDTO>;
}
