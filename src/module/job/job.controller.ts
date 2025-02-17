import { inject, injectable } from 'inversify';
import TYPES from "../../core/container/container.types";
import { IJobService } from './interface/job.service.interface';
import asyncWrapper from '@hireverse/service-common/dist/utils/asyncWrapper';
import { AuthRequest } from '@hireverse/service-common/dist/token/user/userRequest';
import { Response } from 'express';
import { CreateJobDTO, JobSearchDTO, PopulatedJobDTO, UpdateJobDTO } from './dto/job.dto';
import { JobStatus } from './job.modal';
import { IProfileService } from '../external/profile/profile.service.interface';
import { IJobApplicationService } from '../jobapplication/interface/application.service.interface';
import { IInterviewService } from '../interview/interface/interview.service.interface';

@injectable()
export class JobController {
  @inject(TYPES.JobService) private jobService!: IJobService;
  @inject(TYPES.JobApplicationService) private applicantService!: IJobApplicationService;
  @inject(TYPES.InterviewService) private interviewService!: IInterviewService;
  @inject(TYPES.ProfileService) private profileService!: IProfileService;

  /**
  * @route POST /api/jobs
  * @scope Company
  **/
  public createJob = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const { title, categories, companyProfileId, employmentTypes, salaryRange, skills,
      description, niceToHaves, whoYouAre, responsibilities
    } = req.body as CreateJobDTO;
    const userId = req.payload!.userId;
    const job = await this.jobService.createJob({
      userId, companyProfileId, title, categories, skills,
      salaryRange, employmentTypes, description, niceToHaves, responsibilities, whoYouAre
    })
    return res.json(job);
  });

  /**
   * @route GET /api/jobs/:id
   * @scope Public
   **/
  public getJob = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const job = await this.jobService.getJobById(id, JobStatus.LIVE);

    const jobWithProfile: typeof job & {
      companyProfile: {
        id: string;
        name: string;
        companyId: string;
        location: { city: string; country: string };
        image: string;
      } | null;
    } = {
      ...job,
      companyProfile: null,
    };

    try {
      const { response } = await this.profileService.getCompanyProfilesByidList([job.companyProfileId]);
      const profile = response?.profiles[0] || null;

      if (profile) {
        jobWithProfile.companyProfile = {
          id: profile.id,
          name: profile.name,
          companyId: profile.companyId,
          location: profile.location,
          image: profile.image,
        };
      }
    } catch (profileError) {
      jobWithProfile.companyProfile = null;
    }

    return res.status(200).json(jobWithProfile);
  });

  /**
   * @route GET /api/jobs/company/:id
   * @scope Company
   **/
  public getJobForCompany = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const job = await this.jobService.getJobById(id);
    return res.status(200).json(job);
  });


  /**
  * @route PUT /api/jobs/:id
  * @scope Company
  **/
  public updateJob = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const { title, categories, employmentTypes, salaryRange, skills,
      description, niceToHaves, responsibilities, whoYouAre } = req.body as UpdateJobDTO;
    const id = req.params.id;
    const userId = req.payload!.userId;

    if (userId !== req.body.userId) {
      return res.status(403).json({ message: "You are not authorized to update this job" });
    }
    const job = await this.jobService.updateJob(id, {
      title, categories, employmentTypes, salaryRange, skills,
      description, niceToHaves, responsibilities, whoYouAre
    });

    return res.json(job)
  });

  /**
  * @route GET /api/jobs/my-jobs?page-1&limit=10&query=""
  * @scope Company
  **/
  public myJobs = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const userId = req.payload!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const query = req.query.query as string;
    const jobs = await this.jobService.listJobs(page, limit, { userId }, query)
    return res.json(jobs)
  });

  /**
   * @route GET /api/jobs/keyword-categories?keyword=""
   * @scope Public
   **/
  public listJobKeyWordCategories = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const keyWord = req.query.keyword?.toString() || "";
    if (!keyWord) {
      return res.json([]);
    }
    const categories = await this.jobService.listJobsCategoryByKeyword(keyWord);
    return res.json(categories)
  });

  /**
   * @route GET /api/jobs/search?keyword=""&location="&country="&city="&categories="&salaryRange=&employmentType&page=1&limit=10
   * @scope Public
   **/
  public searchJobs = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const {
      keyword, location, country, city,
      categories, salaryRange, employmentTypes
    } = req.query as {
      keyword: string, location: string, country: string, city: string, categories: string,
      salaryRange: string, employmentTypes: string
    };
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filter: JobSearchDTO = { page, limit };
    // Build filters
    if (keyword) filter.keyword = keyword;
    if (categories) filter.categories = categories.split(",");
    if (employmentTypes) filter.employmentTypes = employmentTypes.split(",");
    if (salaryRange) {
      const [min, max] = salaryRange.split("-");
      if (min && max && !isNaN(parseInt(min)) && !isNaN(parseInt(max))) {
        filter.salaryRange = { min: parseInt(min), max: parseInt(max) };
      }
    }

    let companies = [];
    let appliedJobIds: Set<string> = new Set();

    const applicantId = req.payload?.userId!;
    if (applicantId && req.payload?.role === "seeker") {
      appliedJobIds = await this.applicantService.getAppliedJobIdsOfApplicant(applicantId);
    }
  

    if (!location && !country && !city) {
      const jobs = await this.jobService.getPaginatedActiveJobs(filter);
      const companyIds = jobs.data.map((job) => job.companyProfileId);
      try {
        const { response } = await this.profileService.getCompanyProfilesByidList(companyIds);
        companies = response?.profiles || [];
      } catch (error) {
        companies = [];
      }
      const jobsWithProfiles = this.mapJobsWithProfiles(jobs.data, companies, appliedJobIds);
      return res.json({
        ...jobs,
        data: jobsWithProfiles,
      });
    }

    try {
      const { response } = await this.profileService.getCompanyProfilesByLocation({ country, city }, location);
      companies = response?.profiles || [];

      if (companies.length > 0) {
        filter.companyIds = companies.map((company: { id: string }) => company.id);
        const jobs = await this.jobService.getPaginatedActiveJobs(filter);

        const jobsWithProfiles = this.mapJobsWithProfiles(jobs.data, companies, appliedJobIds);

        return res.json({
          ...jobs,
          data: jobsWithProfiles,
        });
      }
      return this.sendEmptyPaginationResponse(res);
    } catch (error) {
      return this.sendEmptyPaginationResponse(res);
    }
  });

  private mapJobsWithProfiles(jobs: PopulatedJobDTO[], companies: any[], appliedJobIds: Set<string>) {
    return jobs.map((job) => {
      const profile = companies.find((company) => company.id === job.companyProfileId);
      
      return {
        ...job,
        companyProfile: profile
          ? {
            id: profile.id,
            name: profile.name,
            companyId: profile.companyId,
            location: profile.location,
            image: profile.image,
          }
          : null,
          applied: appliedJobIds.has(job.id.toString()),
      };
    });
  }

  private sendEmptyPaginationResponse(res: Response) {
    return res.json({
      currentPage: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      data: []
    });
  }


  /**
  * @route POST /api/jobs/retry/:id
  * @scope Company
  **/
  public retry = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    await this.jobService.retryJobPost(id);
    return res.json({ message: "Job retried successfully" });
  });

  /**
  * @route POST /api/jobs/close/:id
  * @scope Company
  **/
  public closeJob = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    await this.jobService.changeJobStatus(id, JobStatus.CLOSED);
    await this.applicantService.declineApplicantsOfJob(id, "Job is closed");
    await this.interviewService.cancelAllJobInterview(id);
    return res.json({ message: "Job closed successfully" });
  });
}