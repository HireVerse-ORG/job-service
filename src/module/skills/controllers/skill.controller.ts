import { Request, Response } from 'express';
import asyncWrapper from '@hireverse/service-common/dist/utils/asyncWrapper';
import { AuthRequest } from '@hireverse/service-common/dist/token/user/userRequest';
import { inject, injectable } from 'inversify';
import TYPES from "../../../core/container/container.types";
import { ISkillService } from '../interface/skill.service.interface';

@injectable()
export class SkillController {
  @inject(TYPES.SkillService) private skillService!: ISkillService;

  /**
* @route GET /jobs/skills/list?page=1&limit=10&query=''
* @scope Admin
**/
  public listSkills = asyncWrapper(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const query = req.query.query as string || '';

    const data = await this.skillService.getAllSkills(page, limit, query);
    return res.json(data);
  });
  /**
* @route GET /jobs/skills/search?query=''
* @scope Public
**/
  public searchSkills = asyncWrapper(async (req: Request, res: Response) => {
    const query = req.query.query as string || '';
    const data = await this.skillService.serachSkill(query, true);
    return res.json(data);
  });
  /**
* @route POST /jobs/skills
* @scope Protected to Admin
**/
  public createSkill = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const { name, isActive } = req.body;
    const skill = await this.skillService.createSkill({ name, isActive });
    return res.status(201).json({ message: "Skill created", skill });
  });

  /**
   * @route PUT /jobs/skills
   * @scope Protected to Admin
   **/
  public updateSkill = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const { id, name, isActive } = req.body;
    const skill = await this.skillService.updateSkill({ id, name, isActive });
    return res.status(200).json({ message: "Skill updated", skill });
  });

  /**
   * @route DELETE /jobs/skills/:id
   * @scope Protected to Admin
   **/
  public deactivateSkill = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const skill = await this.skillService.deactivateSkill(id);
    return res.status(200).json({ message: "Skill deactivated", skill });
  });

  /**
   * @route PATCH /jobs/skills/:id
   * @scope Protected to Admin
   **/
  public restoreSkill = asyncWrapper(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const skill = await this.skillService.restoreSkill(id);
    return res.status(200).json({ message: "Skill restored", skill });
  });
  
}