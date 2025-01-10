import { inject, injectable } from "inversify";
import TYPES from "../../../core/container/container.types";
import { ISkillService } from "../interface/skill.service.interface";
import { grpcWrapper } from "../../../core/utils/grpcWrapper";

@injectable()
export class SkillGrpcController {
    @inject(TYPES.SkillService) private skillService!: ISkillService;

    public getProcedures() {
        return {
            CreateSkill: this.createSkill.bind(this),
            GetSkillsFromIds: this.getSkillFromIds.bind(this),
            GetSkillFromName: this.getSkillFromName.bind(this),
        }
    }

    private getSkillFromIds = grpcWrapper(async (call: any, callback: any) => {        
        let { skill_ids } = call.request;
        const skills = await this.skillService.getSkillsFromIds(skill_ids);
        callback(null, {skills})
    })

    private getSkillFromName = grpcWrapper(async (call: any, callback: any) => {        
        let { name } = call.request;
        const skill = await this.skillService.getSkillFromName(name);
        callback(null, {skill})
    })

    private createSkill = grpcWrapper(async (call: any, callback: any) => {        
        let { name, isActive } = call.request;
        const skill = await this.skillService.createSkill({name, isActive});
        callback(null, {skill})
    })
}