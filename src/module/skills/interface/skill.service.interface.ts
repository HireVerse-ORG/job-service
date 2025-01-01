import { CreateSkillDTO, SkillDTO, SkillListDTO, UpdateSkillDTO } from "../dto/skill.dto";

export interface ISkillService {
    skilExist(name: string): Promise<boolean>
    createSkill(data: CreateSkillDTO): Promise<SkillDTO>;
    getAllSkills(page: number, limit: number, query?: string): Promise<SkillListDTO>;
    getSkillById(id: string): Promise<SkillDTO>;
    updateSkill(data: UpdateSkillDTO): Promise<SkillDTO | null>;
    deactivateSkill(id: string): Promise<SkillDTO>;
    restoreSkill(id: string): Promise<SkillDTO>;
}