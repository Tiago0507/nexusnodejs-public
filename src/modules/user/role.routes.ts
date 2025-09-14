import { Router } from "express";
import { roleController } from "./role.controller.js";
import { authenticate } from "../auth/middlewares/authentication.middleware.js";
import { authorize } from "../auth/middlewares/authorization.middleware.js";

const router = Router();

const adminOnly = [authenticate, authorize(["admin"])];

router.post("/", adminOnly, roleController.createRole.bind(roleController));
router.get("/", adminOnly, roleController.getAllRoles.bind(roleController));
router.get("/:id", adminOnly, roleController.getRoleById.bind(roleController));
router.put("/:id", adminOnly, roleController.updateRole.bind(roleController));
router.delete("/:id", adminOnly, roleController.deleteRole.bind(roleController));

export default router;
