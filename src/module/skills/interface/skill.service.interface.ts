import { CreateSkillDTO, SkillDTO, SkillListDTO, UpdateSkillDTO } from "../dto/skill.dto";

export interface ISkillService {
    skilExist(name: string): Promise<boolean>
    createSkill(data: CreateSkillDTO): Promise<SkillDTO>;
    getAllSkills(page: number, limit: number, query?: string): Promise<SkillListDTO>;
    getSkillFromName(id: string): Promise<SkillDTO | null>;
    getSkillById(id: string): Promise<SkillDTO>;
    getSkillsFromIds(ids: string[]): Promise<SkillDTO[]>;
    updateSkill(data: UpdateSkillDTO): Promise<SkillDTO | null>;
    deactivateSkill(id: string): Promise<SkillDTO>;
    restoreSkill(id: string): Promise<SkillDTO>;
    serachSkill(query: string, isActive?:boolean): Promise<SkillDTO[]>;
}