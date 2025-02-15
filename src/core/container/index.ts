import { Container } from "inversify";
import { loadSkills } from "../../module/skills/skill.module";
import { loadJobCategorys } from "../../module/category/category.module";
import { loadEventContainer } from "../../module/event/event.module";
import { loadJobs } from "../../module/job/job.module";
import { loadExternalContainer } from "../../module/external/external.module";
import { loadJobApplicationContainer } from "../../module/jobapplication/application.module";
import { loadInterviewContainer } from "../../module/interview/interview.module";
import { loadStatisticsContainer } from "../../module/statistics/statistics.module";

const container = new Container();

loadExternalContainer(container);
loadEventContainer(container);
loadSkills(container);
loadJobCategorys(container);
loadJobs(container);
loadJobApplicationContainer(container);
loadInterviewContainer(container);
loadStatisticsContainer(container);

export { container };

