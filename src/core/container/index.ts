import { Container } from "inversify";
import { loadSkills } from "../../module/skills/skill.module";
import { loadJobCategorys } from "../../module/category/category.module";

const container = new Container();

loadSkills(container);
loadJobCategorys(container)

export { container };

