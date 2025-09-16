import { Router } from "express";
import { roleController } from "./role.controller";
import { authenticate } from "../auth/middlewares/authentication.middleware";
import { authorize } from "../auth/middlewares/authorization.middleware";

// Creates a new router instance to define role-related routes.
const router = Router();

/**
 * Middleware chain to protect routes.
 * It first ensures the user is authenticated, then authorizes only users with the 'admin' role.
 */
const adminOnly = [authenticate, authorize(["admin"])];

/**
 * Route to create a new role.
 * Protected, requires admin privileges.
 * Binds the 'createRole' method to the roleController instance to maintain the correct 'this' context.
 */
router.post("/", adminOnly, roleController.createRole.bind(roleController));

/**
 * Route to get all roles.
 * Protected, requires admin privileges.
 */
router.get("/", adminOnly, roleController.getAllRoles.bind(roleController));

/**
 * Route to get a specific role by its ID.
 * Protected, requires admin privileges.
 */
router.get("/:id", adminOnly, roleController.getRoleById.bind(roleController));

/**
 * Route to update a specific role by its ID.
 * Protected, requires admin privileges.
 */
router.put("/:id", adminOnly, roleController.updateRole.bind(roleController));

/**
 * Route to delete a specific role by its ID.
 * Protected, requires admin privileges.
 */
router.delete("/:id", adminOnly, roleController.deleteRole.bind(roleController));

// Exports the configured router to be used in the main application setup.
export default router;