import {IMongoRepository} from "@hireverse/service-common/dist/repository"
import { ISkill } from "../skill.modal";

export interface ISkillRepository extends IMongoRepository<ISkill> {
}
