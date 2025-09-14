import { Router } from "express";
import { roleController } from "./role.controller.js";

const router = Router();

router.post("/", roleController.createRole.bind(roleController));
router.get("/", roleController.getAllRoles.bind(roleController));
router.get("/:id", roleController.getRoleById.bind(roleController));
router.put("/:id", roleController.updateRole.bind(roleController));
router.delete("/:id", roleController.deleteRole.bind(roleController));

export default router;
