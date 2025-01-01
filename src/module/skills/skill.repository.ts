import { MongoBaseRepository } from "@hireverse/service-common/dist/repository";
import Skill, { ISkill } from "./skill.modal";
import { injectable } from "inversify";
import { ISkillRepository } from "./interface/skills.repository.interface";

@injectable()
export class SkillRepository extends MongoBaseRepository<ISkill> implements ISkillRepository {
    constructor() {
        super(Skill)
    }
}