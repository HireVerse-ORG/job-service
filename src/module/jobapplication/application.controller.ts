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
import { EventService } from '../event/event.service';
import { IInterviewService } from '../interview/interface/interview.service.interface';

@injectable()
export class JobApplicationController {
  @inject(TYPES.JobApplicationService) private jobApplicationService!: IJobApplicationService;
  @inject(TYPES.JobService) private jobService!: IJobService;
  @inject(TYPES.InterviewService) private interviewService!: IInterviewService;
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
 * @route GET /api/jobs/application/:id
 * @scope Seeker
 */
  public getApplicationForSeeker = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;

    const application = await this.jobApplicationService.getJobApplicationById(id);
    if (!application) {
      return res.status(400).json({ message: "Application not found" })
    }

    return res.json(application);
  });

  /**
 * @route PUT /application/:id/accept-offer
 * @scope Seeker
 */
  public acceptOffer = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;

    const application = await this.jobApplicationService.getJobApplicationById(id);
    if (!application) {
      return res.status(400).json({ message: "Application not found" })
    }

    if(application.status === JobApplicationStatus.DECLINED){
      return res.status(400).json({ message: "Application is declined" })
    }

    await this.jobApplicationService.changeJobApplicationStatus(id, JobApplicationStatus.HIRED);
    return res.json(application);
  });

  /**
 * @route PUT /application/:id/reject-offer
 * @scope Seeker
 */
  public declineOffer = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;

    const application = await this.jobApplicationService.getJobApplicationById(id);
    if (!application) {
      return res.status(400).json({ message: "Application not found" })
    }

    if(application.status === JobApplicationStatus.DECLINED){
      return res.status(400).json({ message: "Application is declined" })
    }

    await this.jobApplicationService.changeJobApplicationStatus(id, JobApplicationStatus.DECLINED, "Canditate rejected Offer letter");
    return res.json(application);
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
  public getApplicantionDetailsForCompany = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const userId = req.payload!.userId;

    const application = await this.jobApplicationService.getJobApplicationById(id);

    if (!application) {
      return res.status(400).json({ message: "Application not found" })
    }

    try {
      const { response } = await this.profileService.getSeekerProfilesByUserId(application.userId);
      const profile = response.profile;

      const applicationWithProfile = {
        ...application,
        profile
      }

      if (application.status === JobApplicationStatus.DECLINED) {
        return res.json(applicationWithProfile);
      }

      const { response: paymentResponse } = await this.paymentService.canAccessApplication(userId, id);
      const canAccess = paymentResponse.canAccess;

      if (!canAccess) {
        return res.status(400).json({ message: "Can't access this application" });
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
    } catch (error) {
      return res.status(400).json({ message: "Can't acces this application" })
    }
  });

  /**
* @route PUT /api/jobs/company/application/:id/comment
* @scope Company
*/
  public addComment = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const userId = req.payload?.userId!;
    const id = req.params.id;
    const comment = req.body.comment as string;
    const application = await this.jobApplicationService.addComment(id, comment);
    await this.eventService.resumeCommented({
      commenter_user_id: userId,
      applicant_user_id: application.userId,
      job_application_id: application.id,
      comment: comment,
      title: application.jobRole,
    })
    return res.json({ message: "Comment added succesfully" })
  });

  /**
* @route PUT /api/jobs/company/application/:id/status
* @scope Company
*/
  public updateStatusForCompany = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const status = req.body.status as JobApplicationStatus;
    const reason = req.body.reason as string;

    if (![JobApplicationStatus.IN_REVIEW, JobApplicationStatus.SHORTLISTED,
      JobApplicationStatus.INTERVIEW, JobApplicationStatus.OFFERED,
      JobApplicationStatus.DECLINED
    ].includes(status)) {
      return res.status(400).json("Invalid status");
    }
    await this.jobApplicationService.changeJobApplicationStatus(id, status, reason);
    return res.json({ message: "Comment added succesfully" });
  });

  /**
* @route POST /api/jobs/company/application/offer-job
* @scope Company
*/
  public offerJob = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const {applicationId} = req.body;

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file provided." });
    }

    const application = await this.jobApplicationService.getJobApplicationById(applicationId);

    if(!application){
      return res.status(404).json({message: "Job Application not found"})
    }
    
    const updatedApplication = await this.jobApplicationService.updateJobApplication(applicationId, {
      offerLetter: req.file?.path,
      status: JobApplicationStatus.OFFERED
    });

    await this.interviewService.cancelAllJobInterview(application.jobId);
    await this.eventService.jobOffered({
      job_application_id: application.id,
      applicantId: application.userId,
      job_id: application.jobId,
      compnayId: req.payload?.userId!,
      timestamp: new Date()
    })

    return res.json(updatedApplication);
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