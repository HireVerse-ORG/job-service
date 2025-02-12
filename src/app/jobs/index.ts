import { container } from "../../core/container"
import TYPES from "../../core/container/container.types"
import { InterviewJobs } from "../../module/interview/interview.jobs";

const interviewJobs = container.get<InterviewJobs>(TYPES.InterviewJobs);
export const startJobs = () => {
    interviewJobs.startJobs()
}