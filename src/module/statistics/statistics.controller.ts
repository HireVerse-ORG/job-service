import { inject, injectable } from "inversify";
import TYPES from "../../core/container/container.types";
import asyncWrapper from "@hireverse/service-common/dist/utils/asyncWrapper";
import { AuthRequest } from "@hireverse/service-common/dist/token/user/userRequest";
import { Response } from "express";
import { IJobService } from "../job/interface/job.service.interface";
import { IJobApplicationService } from "../jobapplication/interface/application.service.interface";
import { IProfileService } from "../external/profile/profile.service.interface";
import { IInterviewService } from "../interview/interface/interview.service.interface";

@injectable()
export class StatisticsController {
    @inject(TYPES.JobService) private jobService!: IJobService;
    @inject(TYPES.JobApplicationService) private jobApplicationService!: IJobApplicationService;
    @inject(TYPES.InterviewService) private interviewService!: IInterviewService;
    @inject(TYPES.ProfileService) private profileService!: IProfileService;

    /**
   * @route GET /api/jobs/statistics/company
   * @scope Company
   **/
    public getCompanyJobStatistics = asyncWrapper(async (req: AuthRequest, res: Response) => {
        const userId = req.payload?.userId!;
        const currentYear = new Date().getFullYear();

        const jobPosted = await this.jobService.getMyjobsCount(userId);
        const jobPostTrend = await this.jobService.getMyjobPostTrend(userId, currentYear)

        return res.json({
            jobPosted,
            jobPostTrend
        })
    });

    /**
   * @route GET /api/jobs/statistics/company/applications
   * @scope Company
   **/
    public getCompanyJobApplicationStatistics = asyncWrapper(async (req: AuthRequest, res: Response) => {
        const userId = req.payload?.userId!;
        const currentYear = new Date().getFullYear();

        try {
            const { response } = await this.profileService.getCompanyProfileByUserId(userId);
            if(response.profile){
                const profileId = response.profile.id;

                const joApplications = await this.jobApplicationService.getCompaniesApplicationsCount(profileId);
                const jobApplicationTrend = await this.jobApplicationService.getCompaniesApplicationsTrend(profileId, currentYear)
                
                return res.json({
                    joApplications,
                    jobApplicationTrend
                })
            } else {
                res.status(400).json({message: "Failed to fetch job application statistics"})
            }

        } catch (error: any) {
            return res.status(error.status || 500).json({message: error.message || "Failed to fetch job application statistics"})
        }
    });

    /**
   * @route GET /api/jobs/statistics/seeker/applications
   * @scope Seeker
   **/
    public getSeekerJobApplicationStatistics = asyncWrapper(async (req: AuthRequest, res: Response) => {
        const userId = req.payload?.userId!;
        const currentYear = new Date().getFullYear();

        const totalApplications = await this.jobApplicationService.getUserApplicationsCount(userId);
        const jobApplicationTrend = await this.jobApplicationService.getUserApplicationsTrend(userId, currentYear);
        const jobApplicationStatus = await this.jobApplicationService.getUserApplicationsStatusData(userId);

        return res.json({
            totalApplications,
            jobApplicationTrend,
            jobApplicationStatus
        })
    });
    
    /**
   * @route GET /api/jobs/statistics/seeker/interview
   * @scope Seeker
   **/
    public getSeekerJobInterviewStatistics = asyncWrapper(async (req: AuthRequest, res: Response) => {
        const userId = req.payload?.userId!;

        const upcomingInterviewCount = await this.interviewService.countUpcomingInterviews(userId); 

        return res.json({
            upcomingInterviewCount
        })
    });

}