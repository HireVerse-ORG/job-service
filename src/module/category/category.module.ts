import { Container } from "inversify";
import TYPES from "../../core/container/container.types";
import { IJobCategoryService } from "./interface/category.service.interface";
import { JobCategoryService } from "./category.service";
import { JobCategoryRepository } from "./category.repository";
import { IJobCategoryRepository } from "./interface/category.repository.interface";
import { JobCategoryController } from "./category.controller";

function loadJobCategorys(container: Container) {
    container.bind<JobCategoryController>(TYPES.JobCategoryController).to(JobCategoryController);
    container.bind<IJobCategoryService>(TYPES.JobCategoryService).to(JobCategoryService);
    container.bind<IJobCategoryRepository>(TYPES.JobCategoryRepository).to(JobCategoryRepository);
}

export { loadJobCategorys };