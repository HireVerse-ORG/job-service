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
router.put("/withdraw-application/:id", allowedRoles("seeker"), controller.withdrawApplication);

router.get("/company/applicants", allowedRoles("company"), controller.listCompanyJobApplicants);
router.put("/company/application/:id/comment", allowedRoles("company"), controller.addComment);
router.put("/company/application/:id/status", allowedRoles("company"), controller.updateStatusForCompany);
router.get("/company/application/:id", allowedRoles("company"), controller.getApplicantionDetails);

export const jobApplicationRoutes = router;