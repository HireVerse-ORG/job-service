import { Container } from "inversify";
import { loadSkills } from "../../module/skills/skill.module";
import { loadJobCategorys } from "../../module/category/category.module";
import { loadEventContainer } from "../../event/event.container";
import { loadJobs } from "../../module/job/job.module";

const container = new Container();

loadEventContainer(container)
loadSkills(container);
loadJobCategorys(container)
loadJobs(container)

export { container };

