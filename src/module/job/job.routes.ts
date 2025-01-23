import { Router } from "express";
import TYPES from "../../core/container/container.types";
import {allowedRoles, isAuthenticated} from "@hireverse/service-common/dist/token/user/userMiddleware";
import { container } from "../../core/container";
import { JobController } from "./job.controller";

const controller = container.get<JobController>(TYPES.JobController)

//baseurl: /api/jobs
const router = Router();

router.post('/', allowedRoles("company"), controller.createJob);
router.get('/my-jobs', allowedRoles("company"), controller.myJobs);
router.get('/search', controller.searchJobs);
router.get('/keyword-categories', controller.listJobKeyWordCategories);
router.post('/retry/:id', allowedRoles("company"), controller.retry);
router.post('/close/:id', allowedRoles("company"), controller.closeJob);
router.put('/:id', allowedRoles("company"), controller.updateJob);

export const jobRoutes = router;