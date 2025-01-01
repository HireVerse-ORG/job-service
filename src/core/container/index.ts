import { Container } from "inversify";
import { loadSkills } from "../../module/skills/skill.module";

const container = new Container();

loadSkills(container);

export { container };

