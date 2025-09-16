import { Router } from "express";
import { authController } from "./auth.controller";

// Creates a new router instance to define authentication-related routes.
const router = Router();

/**
 * Route to handle user registration.
 * Binds the 'register' method to the authController instance to maintain the correct 'this' context.
 */
router.post("/register", authController.register.bind(authController));

/**
 * Route to handle user login.
 * Binds the 'login' method to the authController instance.
 */
router.post("/login", authController.login.bind(authController));

/**
 * Route to refresh an access token.
 * Binds the 'refresh' method to the authController instance.
 */
router.post("/refresh", authController.refresh.bind(authController));

/**
 * Route to handle user logout.
 * Binds the 'logout' method to the authController instance.
 */
router.post("/logout", authController.logout.bind(authController));

// Exports the configured router to be used in the main application setup.
export default router;