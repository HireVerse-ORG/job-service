import { inject, injectable } from 'inversify';
import TYPES from "../../core/container/container.types";
import { IJobService } from './interface/job.service.interface';
import asyncWrapper from '@hireverse/service-common/dist/utils/asyncWrapper';
import { AuthRequest } from '@hireverse/service-common/dist/token/user/userRequest';
import { Response } from 'express';
import { CreateJobDTO } from './dto/job.dto';
import { JobStatus } from './job.modal';

@injectable()
export class JobController {
  @inject(TYPES.JobService) private jobService!: IJobService;

  /**
  * @route POST /api/jobs
  * @scope Company
  **/
  public createJob = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const {title, categories, companyProfileId, employmentTypes, salaryRange, skills,
      description, niceToHaves, whoYouAre, responsibilities
    } = req.body as CreateJobDTO;
    const userId = req.payload!.userId;
    const job = await this.jobService.createJob({userId, companyProfileId, title, categories, skills, 
      salaryRange, employmentTypes, description, niceToHaves, responsibilities, whoYouAre, status: JobStatus.ACTIVE})
    return res.json(job);
  });
}