import { Router } from "express";
import TYPES from "../../core/container/container.types";
import {allowedRoles, isAuthenticated} from "@hireverse/service-common/dist/token/user/userMiddleware";
import { container } from "../../core/container";
import { JobCategoryController } from "./category.controller";

const categoryController = container.get<JobCategoryController>(TYPES.JobCategoryController)

//baseurl: /api/jobs
const router = Router();

router.get("/category/search", categoryController.searchJobCategorys);
router.get("/category/public", categoryController.publicJobCategorys);
router.get("/category/list",allowedRoles('admin'),categoryController.listJobCategorys);

router.post("/category", isAuthenticated, categoryController.createJobCategory);
router.put("/category", allowedRoles('admin'), categoryController.updateJobCategory);
router.delete("/category/:id", allowedRoles('admin'), categoryController.deactivateJobCategory);
router.put("/category/:id", allowedRoles('admin'), categoryController.restoreJobCategory);

export const jobCategoryRoutes = router;