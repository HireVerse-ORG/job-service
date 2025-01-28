import { inject, injectable } from 'inversify';
import TYPES from "../../core/container/container.types";
import asyncWrapper from '@hireverse/service-common/dist/utils/asyncWrapper';
import { AuthRequest } from '@hireverse/service-common/dist/token/user/userRequest';
import { json, response, Response } from 'express';
import { IProfileService } from '../external/profile/profile.service.interface';
import { IJobApplicationService } from './interface/application.service.interface';
import { CreateJobAppplicationDTO, JobApplicationDTO } from './dto/application.dto';
import { IJobService } from '../job/interface/job.service.interface';
import { JobStatus } from '../job/job.modal';
import { JobApplicationStatus } from './application.modal';
import { IPaymentService } from '../external/payment/payment.service.interface';
import { EventService } from '../../event/event.service';

@injectable()
export class JobApplicationController {
  @inject(TYPES.JobApplicationService) private jobApplicationService!: IJobApplicationService;
  @inject(TYPES.JobService) private jobService!: IJobService;
  @inject(TYPES.ProfileService) private profileService!: IProfileService;
  @inject(TYPES.PaymentService) private paymentService!: IPaymentService;
  @inject(TYPES.EventService) private eventService!: EventService;

  /**
  * @route POST /api/jobs/apply
  * @scope Seeker
  **/
  public createJobApplication = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const { email, fullName, jobId, resume, coverLetter, phone } = req.body as CreateJobAppplicationDTO;
    const userId = req.payload!.userId;
    const job = await this.jobService.getJobById(jobId);
    if (job.status !== JobStatus.LIVE) {
      return res.status(400).json({ message: "Job is not live anymore" })
    }
    const application = await this.jobApplicationService.createJobApplication({
      userId, email, fullName, companyProfileId: job.companyProfileId,
      jobId, jobRole: job.title, resume, coverLetter, phone
    });
    return res.json(application);
  });

  /**
* @route POST /api/jobs/re-apply/:id
* @scope Seeker
**/
  public reApplyJob = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    await this.jobApplicationService.retryJobApplication(id);
    return res.json({ message: "Job application retried successfully" });
  });

  /**
* @route PUT /api/jobs/re-apply/:id
* @scope Seeker
**/
  public withdrawApplication = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    await this.jobApplicationService.withdrawJobApplication(id);
    return res.json({ message: "Job application withdrawed successfully" });
  });

  /**
   * @route GET /api/jobs/my-applications?query=''&status=''&page=1&limit=10
   * @scope Seeker
   */
  public myJobApplications = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const userId = req.payload!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const query = req.query.query as string;
    const status = req.query.status as JobApplicationStatus;

    const applications = await this.jobApplicationService.listUserJobApplications(userId, {
      page,
      limit,
      query,
      status,
    });

    const companyIds = applications.data.map((dt) => dt.companyProfileId);
    const companies = await this.fetchCompanyProfiles(companyIds);
    const applicationsWithProfile = applications.data.map((application) =>
      this.mapApplicationToCompany(application, companies)
    );

    // Return the response
    return res.json({
      ...applications,
      data: applicationsWithProfile,
    });
  });

  /**
 * @route GET /api/jobs/company/application/:id
 * @scope Company
 */
  public getApplicantionDetails = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const userId = req.payload!.userId;

    try {
      const { response } = await this.paymentService.canAccessApplication(userId, id);
      const canAccess = response.canAccess;

      if (canAccess) {
        const application = await this.jobApplicationService.getJobApplicationById(id);
        if (!application) {
          return res.status(400).json({ message: "Application not found" })
        }
        const { response } = await this.profileService.getSeekerProfilesByUserId(application.userId);
        const profile = response.profile;
        const applicationWithProfile = {
          ...application,
          profile
        }

        if ([JobApplicationStatus.APPLIED, JobApplicationStatus.IN_REVIEW,
        JobApplicationStatus.INTERVIEW, JobApplicationStatus.SHORTLISTED].includes(application.status)) {
          await this.eventService.jobApplicationViewed({
            applicant_id: application.userId,
            job_application_id: application.id,
            viewer_user_id: userId
          });
        }

        return res.json(applicationWithProfile);
      } else {
        return res.status(400).json({ message: "Can't acces this application" })
      }
    } catch (error) {
      return res.status(400).json({ message: "Can't acces this application" })
    }
  });

  /**
* @route PUT /api/jobs/company/application/:id/comment
* @scope Company
*/
  public addComment = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const comment = req.body.comment as string;
    await this.jobApplicationService.addComment(id, comment);
    return res.json({message: "Comment added succesfully"})
  });

  /**
* @route PUT /api/jobs/company/application/:id/status
* @scope Company
*/
  public updateStatusForCompany = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const status = req.body.status as JobApplicationStatus;
    const reason = req.body.reason as string;

    if(![JobApplicationStatus.IN_REVIEW, JobApplicationStatus.SHORTLISTED,
      JobApplicationStatus.INTERVIEW, JobApplicationStatus.HIRED, JobApplicationStatus.DECLINED
    ].includes(status)){
      return res.status(400).json("Invalid status");
    }
    await this.jobApplicationService.changeJobApplicationStatus(id, status, reason);
    return res.json({message: "Comment added succesfully"});
  });

  /**
 * @route GET /api/jobs/company/applicants?query=''&status=''&page=1&limit=10
 * @scope Company
 */
  public listCompanyJobApplicants = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const jobId = req.query.jobId as string;
    const companyProfileId = req.query.companyProfileId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const query = req.query.query as string;
    const status = req.query.status as JobApplicationStatus;

    if (!jobId && !companyProfileId) {
      return res.status(400).json({ message: "Either jobId or companyProfileId must be provided." });
    }

    const applications = await this.jobApplicationService.listJobApplicationsForCompany({
      jobId,
      companyProfileId,
      page,
      limit,
      query,
      status,
    });

    return res.json(applications);
  });


  /**
   * Fetches company profiles by a list of company IDs.
   */
  private async fetchCompanyProfiles(companyIds: string[]): Promise<any[]> {
    if (!companyIds.length) return [];
    try {
      const { response } = await this.profileService.getCompanyProfilesByidList(companyIds);
      return response?.profiles || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Maps a job application to its corresponding company profile.
   */
  private mapApplicationToCompany(application: JobApplicationDTO, companies: any[]) {
    const profile = companies.find((company) => company.id === application.companyProfileId);

    return {
      ...application,
      companyProfile: profile
        ? {
          id: profile.id,
          name: profile.name,
          companyId: profile.companyId,
          location: profile.location,
          image: profile.image,
        }
        : null,
    };
  }


}