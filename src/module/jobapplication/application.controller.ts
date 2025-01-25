import { inject, injectable } from 'inversify';
import TYPES from "../../core/container/container.types";
import asyncWrapper from '@hireverse/service-common/dist/utils/asyncWrapper';
import { AuthRequest } from '@hireverse/service-common/dist/token/user/userRequest';
import { Response } from 'express';
import { IProfileService } from '../external/profile/profile.service.interface';
import { IJobApplicationService } from './interface/application.service.interface';
import { CreateJobAppplicationDTO, JobApplicationDTO } from './dto/application.dto';
import { IJobService } from '../job/interface/job.service.interface';
import { JobStatus } from '../job/job.modal';
import { JobApplicationStatus } from './application.modal';

@injectable()
export class JobApplicationController {
  @inject(TYPES.JobApplicationService) private jobApplicationService!: IJobApplicationService;
  @inject(TYPES.JobService) private jobService!: IJobService;
  @inject(TYPES.ProfileService) private profileService!: IProfileService;

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