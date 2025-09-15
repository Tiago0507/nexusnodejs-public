import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../auth/middlewares/authentication.middleware";
import { authorize } from "../auth/middlewares/authorization.middleware";

const router = Router();

router.get(
  "/me",
  authenticate,
  userController.getCurrentUser.bind(userController)
);

router.put(
  "/me",
  authenticate,
  userController.updateCurrentUser.bind(userController)
);

router.get(
  "/",
  [authenticate, authorize(["admin"])],
  userController.getAllUsers.bind(userController)
);

router.get(
  "/:id",
  [authenticate, authorize(["admin"])],
  userController.getUserById.bind(userController)
);

router.put(
  "/:id",
  [authenticate, authorize(["admin"])],
  userController.updateUser.bind(userController)
);

router.delete(
  "/:id",
  [authenticate, authorize(["admin"])],
  userController.deleteUser.bind(userController)
);

export default router;
