import { Router } from "express";
import TYPES from "../../core/container/container.types";
import {allowedRoles, isAuthenticated} from "@hireverse/service-common/dist/token/user/userMiddleware";
import { container } from "../../core/container";
import { SkillController } from "./controllers/skill.controller";

const skillController = container.get<SkillController>(TYPES.SkillController)

//baseurl: /api/jobs
const router = Router();

router.get("/skills/search", skillController.searchSkills);
router.get("/skills/list",allowedRoles('admin'),skillController.listSkills);

router.post("/skills", isAuthenticated, skillController.createSkill);
router.put("/skills", allowedRoles('admin'), skillController.updateSkill);
router.delete("/skills/:id", allowedRoles('admin'), skillController.deactivateSkill);
router.put("/skills/:id", allowedRoles('admin'), skillController.restoreSkill);

export const skillRoutes = router;