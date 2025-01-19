import { Request, Response } from 'express';
import asyncWrapper from '@hireverse/service-common/dist/utils/asyncWrapper';
import { AuthRequest } from '@hireverse/service-common/dist/token/user/userRequest';
import { inject, injectable } from 'inversify';
import TYPES from "../../core/container/container.types";
import { IJobCategoryService } from './interface/category.service.interface';

@injectable()
export class JobCategoryController {
  @inject(TYPES.JobCategoryService) private JobCategoryService!: IJobCategoryService;

  /**
  * @route GET /jobs/category/search?query=''
  * @scope Public
  **/
  public searchJobCategorys = asyncWrapper(async (req: Request, res: Response) => {
    const query = req.query.query as string || '';
    const data = await this.JobCategoryService.serachJobCategory(query, true);
    return res.json(data);
  });
  /**
  * @route GET /jobs/category/list?page=1&limit=10&query=''
  * @scope Admin
  **/
  public listJobCategorys = asyncWrapper(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const query = req.query.query as string || '';

    const data = await this.JobCategoryService.getAllJobCategorys(page, limit, query);
    return res.json(data);
  });

  /**
  * @route POST /jobs/category
  * @scope Protected to Admin
  **/
  public createJobCategory = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const { name, isActive } = req.body;
    const JobCategory = await this.JobCategoryService.createJobCategory({ name, isActive });
    return res.status(201).json({ message: "JobCategory created", JobCategory });
  });

  /**
   * @route PUT /jobs/category
   * @scope Protected to Admin
   **/
  public updateJobCategory = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const { id, name, isActive } = req.body;
    const JobCategory = await this.JobCategoryService.updateJobCategory({ id, name, isActive });
    return res.status(200).json({ message: "JobCategory updated", JobCategory });
  });

  /**
   * @route DELETE /jobs/category/:id
   * @scope Protected to Admin
   **/
  public deactivateJobCategory = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const JobCategory = await this.JobCategoryService.deactivateJobCategory(id);
    return res.status(200).json({ message: "JobCategory deactivated", JobCategory });
  });

  /**
   * @route PATCH /jobs/category/:id
   * @scope Protected to Admin
   **/
  public restoreJobCategory = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const JobCategory = await this.JobCategoryService.restoreJobCategory(id);
    return res.status(200).json({ message: "JobCategory restored", JobCategory });
  });

}