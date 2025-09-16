import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../auth/middlewares/authentication.middleware";
import { authorize } from "../auth/middlewares/authorization.middleware";

// Creates a new router instance to define user-related endpoints.
const router = Router();

/**
 * Route to get the profile of the currently authenticated user.
 * Protected by authentication middleware.
 */
router.get(
  "/me",
  authenticate,
  userController.getCurrentUser.bind(userController)
);

/**
 * Route to update the profile of the currently authenticated user.
 * Protected by authentication middleware.
 */
router.put(
  "/me",
  authenticate,
  userController.updateCurrentUser.bind(userController)
);

/**
 * Route to get a list of all users.
 * Protected, requires admin privileges.
 */
router.get(
  "/",
  [authenticate, authorize(["admin"])],
  userController.getAllUsers.bind(userController)
);

/**
 * Route to get a specific user by their ID.
 * Protected, requires admin privileges.
 */
router.get(
  "/:id",
  [authenticate, authorize(["admin"])],
  userController.getUserById.bind(userController)
);

/**
 * Route to update a specific user by their ID.
 * Protected, requires admin privileges.
 */
router.put(
  "/:id",
  [authenticate, authorize(["admin"])],
  userController.updateUser.bind(userController)
);

/**
 * Route to delete a specific user by their ID.
 * Protected, requires admin privileges.
 */
router.delete(
  "/:id",
  [authenticate, authorize(["admin"])],
  userController.deleteUser.bind(userController)
);

// Exports the configured router for use in the main application.
export default router;