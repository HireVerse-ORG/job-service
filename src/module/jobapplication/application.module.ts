import { Container } from "inversify";
import TYPES from "../../core/container/container.types";
import { IJobApplicationService } from "./interface/application.service.interface";
import { JobApplicationService } from "./application.service";
import { JobApplicationRepository } from "./application.repository";
import { IJobApplicationRepository } from "./interface/application.repository.interface";
import { JobApplicationController } from "./application.controller";

function loadJobApplicationContainer(container: Container) {
    container.bind<JobApplicationController>(TYPES.JobApplicationController).to(JobApplicationController);
    container.bind<IJobApplicationService>(TYPES.JobApplicationService).to(JobApplicationService);
    container.bind<IJobApplicationRepository>(TYPES.JobApplicationRepository).to(JobApplicationRepository);
}

export { loadJobApplicationContainer };