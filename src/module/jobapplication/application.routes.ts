import { Router } from "express";
import TYPES from "../../core/container/container.types";
import {allowedRoles} from "@hireverse/service-common/dist/token/user/userMiddleware";
import { container } from "../../core/container";
import { JobApplicationController } from "./application.controller";

const controller = container.get<JobApplicationController>(TYPES.JobApplicationController)

//baseurl: /api/jobs
const router = Router();

router.post("/apply", allowedRoles("seeker"), controller.createJobApplication);
router.get("/my-applications", allowedRoles("seeker"), controller.myJobApplications);
router.post("/re-apply/:id", allowedRoles("seeker"), controller.reApplyJob);

export const jobApplicationRoutes = router;