import { inject, injectable } from "inversify";
import TYPES from "../../core/container/container.types";
import { IInterviewService } from "./interface/interview.service.interface";
import asyncWrapper from "@hireverse/service-common/dist/utils/asyncWrapper";
import { AuthRequest } from "@hireverse/service-common/dist/token/user/userRequest";
import { Response } from "express";
import { CreateInterviewDto } from "./dto/interview.dto";
import { IJobApplicationService } from "../jobapplication/interface/application.service.interface";
import { JobApplicationStatus } from "../jobapplication/application.modal";
import { InterviewStatus } from "./interview.modal";

@injectable()
export class InterviewController {
    @inject(TYPES.InterviewService) private interviewService!: IInterviewService;
    @inject(TYPES.JobApplicationService) private jobApplicationService!: IJobApplicationService;

    /**
     * @route POST /jobs/interview/schedule
     * @scope Company
     *
     * Schedules a new interview.
     */
    public scheduleInterview = asyncWrapper(async (req: AuthRequest, res: Response) => {
        const interviewerId = req.payload?.userId!;
        const { jobId, applicantId, scheduledTime, type, description, applicationId } = req.body;

        const interviewData: CreateInterviewDto & { interviewerId: string } = {
            job: jobId,
            application: applicationId,
            applicantId,
            interviewerId,
            scheduledTime: new Date(scheduledTime),
            type,
            description,
        };

        const newInterview = await this.interviewService.createInterview(interviewData);
        await this.jobApplicationService.changeJobApplicationStatus(applicationId, JobApplicationStatus.INTERVIEW);
        return res.status(201).json(newInterview);
    });

    /**
     * @route GET /jobs/interview/:id
     * @scope Company|Seeker
     *
     * Retrieves an interview by its ID.
     */
    public getInterview = asyncWrapper(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const interview = await this.interviewService.getInterviewById(id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        return res.json({ data: interview });
    });

    /**
     * @route GET /jobs/interview/application/:applicationId
     * @scope Company|Seeker
     */
    public getApplicationInterviews = asyncWrapper(async (req: AuthRequest, res: Response) => {
        const { applicationId } = req.params;
        const interview = await this.interviewService.getInterviewsByApplication(applicationId);
        return res.json({ data: interview });
    });

    /**
     * @route GET /jobs/interview/applicant/schedules
     * @scope Seeker
     *
     * Retrieves all interviews for a specific applicant.
     */
    public getInterviewsByApplicant = asyncWrapper(async (req: AuthRequest, res: Response) => {
        const applicantId  = req.payload?.userId!;
        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
        const status = req.query.status as InterviewStatus || undefined;

        if(status === InterviewStatus.CANCELED){
            return res.status(400).json({ message: "Invalid Status" });
        }
        const interviews = await this.interviewService.getInterviewsByApplicant({applicantId, status}, page, limit);
        return res.json(interviews);
    });

    /**
     * @route GET /jobs/interview/interviewer/:interviewerId
     * @scope Company
     *
     * Retrieves all interviews for a specific interviewer (company).
     */
    public getInterviewsByInterviewer = asyncWrapper(async (req: AuthRequest, res: Response) => {
        const { interviewerId } = req.params;
        const interviews = await this.interviewService.getInterviewsByInterviewer(interviewerId);
        return res.json({ data: interviews });
    });

    /**
     * @route PUT /jobs/interview/:id/cancel
     * @scope Company
     *
     * Cancels an interview.
     */
    public cancelInterview = asyncWrapper(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const updatedInterview = await this.interviewService.cancelInterview(id);
        return res.json(updatedInterview);
    });

    /**
     * @route PUT /jobs/interview/:id/accept
     * @scope Seeker
     *
     * Accepts an interview.
     */
    public acceptInterview = asyncWrapper(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const updatedInterview = await this.interviewService.acceptInterview(id);
        return res.json(updatedInterview);
    });

    /**
     * @route PUT /jobs/interview/:id/reject
     * @scope Seeker
     *
     * Rejects an interview.
     */
    public rejectInterview = asyncWrapper(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const updatedInterview = await this.interviewService.rejectInterview(id);
        return res.json(updatedInterview);
    });
}