import { inject, injectable } from "inversify";
import TYPES from "../../../core/container/container.types";
import { IInterviewService } from "../interface/interview.service.interface";
import { grpcWrapper } from "../../../core/utils/grpcWrapper";

@injectable()
export class InterviewGrpcController {
    @inject(TYPES.InterviewService) private interviewService!: IInterviewService;

    public getProcedures() {
        return {
            GetInterviewFromId: this.getInterviewFromId.bind(this),
        }
    }

    private getInterviewFromId = grpcWrapper(async (call: any, callback: any) => {
        let { id } = call.request;
        const interview = await this.interviewService.getInterviewById(id);
        callback(null, { interview })
    })
}