import { inject, injectable } from 'inversify';
import TYPES from "../../core/container/container.types";
import { IJobService } from './interface/job.service.interface';
import asyncWrapper from '@hireverse/service-common/dist/utils/asyncWrapper';
import { AuthRequest } from '@hireverse/service-common/dist/token/user/userRequest';
import { Response } from 'express';
import { CreateJobDTO, UpdateJobDTO } from './dto/job.dto';
import { JobStatus } from './job.modal';

@injectable()
export class JobController {
  @inject(TYPES.JobService) private jobService!: IJobService;

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
  * @route PUT /api/jobs/:id
  * @scope Company
  **/
  public updateJob = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const { title, categories, employmentTypes, salaryRange, skills, 
      description, niceToHaves, responsibilities, whoYouAre} = req.body as UpdateJobDTO;
    const id = req.params.id;
    const userId = req.payload!.userId;

    if(userId !== req.body.userId){
      return res.status(403).json({message: "You are not authorized to update this job"});
    }
    const job = await this.jobService.updateJob(id, { title, categories, employmentTypes, salaryRange, skills, 
      description, niceToHaves, responsibilities, whoYouAre});
      
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
    const jobs = await this.jobService.listJobs(page, limit, {userId}, query)
    return res.json(jobs)
  });

  /**
  * @route POST /api/jobs/retry/:id
  * @scope Company
  **/
  public retry = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    await this.jobService.retryJobPost(id);
    return res.json({message: "Job retried successfully"});
  });

  /**
  * @route POST /api/jobs/close/:id
  * @scope Company
  **/
  public closeJob = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    await this.jobService.changeJobStatus(id, JobStatus.CLOSED);
    return res.json({message: "Job retried successfully"});
  });
}