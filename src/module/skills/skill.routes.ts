import { Router } from "express";
import TYPES from "../../core/container/container.types";
import {allowedRoles} from "@hireverse/service-common/dist/token/user/userMiddleware";
import { container } from "../../core/container";
import { SkillController } from "./skill.controller";

const skillController = container.get<SkillController>(TYPES.SkillController)

const router = Router();

router.get("/skills/list", skillController.listSkills);

router.post("/skills", allowedRoles('admin'), skillController.createSkill);
router.put("/skills", allowedRoles('admin'), skillController.updateSkill);
router.delete("/skills/:id", allowedRoles('admin'), skillController.deactivateSkill);
router.put("/skills/:id", allowedRoles('admin'), skillController.restoreSkill);

export const skillRoutes = router;