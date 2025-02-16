import { Router } from "express";
import { container } from "../../core/container";
import TYPES from "../../core/container/container.types";
import { StatisticsController } from "./statistics.controller";
import { allowedRoles } from "@hireverse/service-common/dist/token/user/userMiddleware";

const controlller = container.get<StatisticsController>(TYPES.StatisticsController);

// base: /api/jobs/statistics
const router = Router();

router.get('/company', allowedRoles('company'), controlller.getCompanyJobStatistics);
router.get('/company/applications', allowedRoles('company'), controlller.getCompanyJobApplicationStatistics);

router.get('/seeker/applications', allowedRoles('seeker'), controlller.getSeekerJobApplicationStatistics);
router.get('/seeker/interview', allowedRoles('seeker'), controlller.getSeekerJobInterviewStatistics);

export const statisticsRoutes = router;