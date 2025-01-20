import { Router } from "express";
import TYPES from "../../core/container/container.types";
import {allowedRoles, isAuthenticated} from "@hireverse/service-common/dist/token/user/userMiddleware";
import { container } from "../../core/container";
import { JobController } from "./job.controller";

const controller = container.get<JobController>(TYPES.JobController)

//baseurl: /api/jobs
const router = Router();

router.post('/', allowedRoles("company"), controller.createJob);

export const jobRoutes = router;