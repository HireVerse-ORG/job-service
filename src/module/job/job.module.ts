import { Container } from "inversify";
import TYPES from "../../core/container/container.types";
import { IJobService } from "./interface/job.service.interface";
import { JobService } from "./job.service";
import { JobRepository } from "./job.repository";
import { IJobRepository } from "./interface/job.repository.interface";
import { JobController } from "./job.controller";

function loadJobs(container: Container) {
    container.bind<JobController>(TYPES.JobController).to(JobController);
    container.bind<IJobService>(TYPES.JobService).to(JobService);
    container.bind<IJobRepository>(TYPES.JobRepository).to(JobRepository);
}

export { loadJobs };