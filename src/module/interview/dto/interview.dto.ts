import { InterviewStatus, InterviewType } from "../interview.modal";

export interface InterviewDTO {
  id: string;
  job: string;
  application: string;
  applicantId: string;
  interviewerId: string;
  scheduledTime: Date;
  type: InterviewType;
  status: InterviewStatus;
  description?: string;
}

export interface CreateInterviewDto {
  job: string;
  application: string;
  applicantId: string;
  interviewerId: string;
  scheduledTime: Date;
  type: InterviewType;
  description?: string;
}

export interface UpdateInterviewDto {
  scheduledTime?: Date;
  type?: InterviewType;
  status?: InterviewStatus;
  description?: string;
}
