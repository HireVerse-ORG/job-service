import { inject, injectable } from "inversify";
import { ISkillService } from "./interface/skill.service.interface";
import TYPES from "../../core/container/container.types";
import { ISkillRepository } from "./interface/skills.repository.interface";
import { CreateSkillDTO, SkillDTO, SkillListDTO, UpdateSkillDTO } from "./dto/skill.dto";
import { BadRequestError } from "@hireverse/service-common/dist/app.errors";
import { ISkill } from "./skill.modal";
import { FilterQuery, isValidObjectId } from "mongoose";
import { querySanitizer } from "@hireverse/service-common/dist/utils";

@injectable()
export class SkillService implements ISkillService {
    @inject(TYPES.SkillRepository) private skillrepo!: ISkillRepository;

    async skilExist(name: string): Promise<boolean> {
        return !!await this.skillrepo.findOne({name: { $regex:  `^${name}$`, $options: "i" }})
    }

    async createSkill(data: CreateSkillDTO): Promise<SkillDTO> {
        if(await this.skilExist(data.name)){
            throw new BadRequestError("Skill already exist");
        }
        data.name = this.capitalizeName(data.name);
        const skill = await this.skillrepo.create(data);
        return skill;
    }

    async updateSkill(data: UpdateSkillDTO): Promise<SkillDTO | null> {
        if(!isValidObjectId(data.id)){
            throw new BadRequestError("Invalid id");
        }
        if(data.name){
            data.name = this.capitalizeName(data.name);
            if(await this.skillrepo.findOne({_id: {$ne: data.id}, name: { $regex:  `^${data.name}$`, $options: "i" }})){
                throw new BadRequestError("Skill already exist");
            }
        }
        const skill = await this.skillrepo.update(data.id, data);
        return skill
    }

    async getAllSkills(page: number, limit: number, query?: string): Promise<SkillListDTO> {
        const filter: FilterQuery<ISkill> = {};
        if (query) {
            query = querySanitizer(query);
            filter.name = { $regex: query, $options: "i" }; 
        }

        const skills = await this.skillrepo.paginate(filter, page, limit, {sort: {createdAt: -1}});
        return skills
    }

    async getSkillFromName(query: string): Promise<SkillDTO | null> {
        query = querySanitizer(query);
        const skill = await this.skillrepo.findOne({name: { $regex: `^${query}$`, $options: "i" }});
        return skill;
    }

    async getSkillById(id: string): Promise<SkillDTO> {
        if(!isValidObjectId(id)){
            throw new BadRequestError("Invalid id");
        }
        const skill = await this.skillrepo.findById(id);
        if(!skill){
            throw new BadRequestError("Skill not found");
        }

        return skill;
    }

    async getSkillsFromIds(ids: string[]): Promise<SkillDTO[]> {
        const skills = await this.skillrepo.findAll({ _id: { $in: ids } });
        return skills.map(skill => this.handleSkillData(skill));
    }

    async serachSkill(query: string, isActive?:boolean): Promise<SkillDTO[]> {
        const filter: FilterQuery<ISkill> = {};
        query = querySanitizer(query);
        filter.name = { $regex: query, $options: "i" }; 
        if (isActive) {
            filter.isActive = isActive;
        }
        const skills = await this.skillrepo.findAll(filter);
        return skills;
    }

    async deactivateSkill(id: string): Promise<SkillDTO> {
        const skill = await this.getSkillById(id);
        skill.isActive = false;
        await this.skillrepo.update(id, skill);
        return skill;
    }

    async restoreSkill(id: string): Promise<SkillDTO> {
        const skill = await this.getSkillById(id);
        skill.isActive = true;
        await this.skillrepo.update(id, skill);
        return skill;
    }

    private handleSkillData(skill: ISkill): SkillDTO {
        return {
            id: skill.id,
            name: skill.name,
            isActive: skill.isActive,
            createdAt: skill.createdAt,
            updatedAt: skill.updatedAt
        }
    }

    private capitalizeName(name: string): string {
        return name
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
}