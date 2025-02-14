import { Router } from "express";
import TYPES from "../../core/container/container.types";
import {allowedRoles, isAuthenticated} from "@hireverse/service-common/dist/token/user/userMiddleware";
import { container } from "../../core/container";
import { InterviewController } from "./controllers/interview.controller";

const interviewController = container.get<InterviewController>(TYPES.InterviewController)

//baseurl: /api/jobs/interview
const router = Router();

router.post("/schedule", allowedRoles("company"), interviewController.scheduleInterview);
router.get("/my-schedules", allowedRoles("seeker", "company"), interviewController.getMyInterviewsSchedules);
router.get("/application/:applicationId", allowedRoles("company", "seeker"), interviewController.getApplicationInterviews);

router.put("/:id/cancel", allowedRoles("company"), interviewController.cancelInterview);
router.put("/:id/complete", allowedRoles("company"), interviewController.completeInterview);
router.put("/:id/accept", allowedRoles("seeker"), interviewController.acceptInterview);
router.put("/:id/reject", allowedRoles("seeker"), interviewController.rejectInterview);
router.get("/:id", allowedRoles("company", "seeker"), interviewController.getInterview);

export const interviewRoutes = router;
