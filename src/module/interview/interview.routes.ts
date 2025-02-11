import { Router } from "express";
import TYPES from "../../core/container/container.types";
import {allowedRoles, isAuthenticated} from "@hireverse/service-common/dist/token/user/userMiddleware";
import { container } from "../../core/container";
import { InterviewController } from "./interview.controller";

const interviewController = container.get<InterviewController>(TYPES.InterviewController)

//baseurl: /api/jobs/interview
const router = Router();

router.post("/schedule", allowedRoles("company"), interviewController.scheduleInterview);
router.get("/:id", allowedRoles("company", "seeker"), interviewController.getInterview);
router.get("/application/:applicationId", allowedRoles("company", "seeker"), interviewController.getApplicationInterviews);
router.get("/applicant/schedules", allowedRoles("seeker"), interviewController.getInterviewsByApplicant);
router.get("/interviewer/:interviewerId", allowedRoles("company"), interviewController.getInterviewsByInterviewer);
router.put("/:id/cancel", allowedRoles("company"), interviewController.cancelInterview);
router.put("/:id/accept", allowedRoles("seeker"), interviewController.acceptInterview);
router.put("/:id/reject", allowedRoles("seeker"), interviewController.rejectInterview);

export const interviewRoutes = router;
