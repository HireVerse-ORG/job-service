import { Container } from "inversify";
import TYPES from "../../core/container/container.types";
import { InterviewController } from "./interview.controller";
import { IInterviewService } from "./interface/interview.service.interface";
import { InterviewService } from "./interview.service";
import { IInterviewRepository } from "./interface/interview.repository.interface";
import { InterviewRepository } from "./interview.repository";

const loadInterviewContainer = (container: Container) => {
    container.bind<InterviewController>(TYPES.InterviewController).to(InterviewController);
    container.bind<IInterviewService>(TYPES.InterviewService).to(InterviewService);
    container.bind<IInterviewRepository>(TYPES.InterviewRepository).to(InterviewRepository);
}

export { loadInterviewContainer };