import { Container } from "inversify";
import { SkillController } from "./skill.controller";
import TYPES from "../../core/container/container.types";
import { ISkillService } from "./interface/skill.service.interface";
import { SkillService } from "./skill.service";
import { SkillRepository } from "./skill.repository";
import { ISkillRepository } from "./interface/skills.repository.interface";

function loadSkills(container: Container) {
    container.bind<SkillController>(TYPES.SkillController).to(SkillController);
    container.bind<ISkillService>(TYPES.SkillService).to(SkillService);
    container.bind<ISkillRepository>(TYPES.SkillRepository).to(SkillRepository);
}

export { loadSkills };