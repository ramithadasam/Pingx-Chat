import { Router, type IRouter } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import * as authController from "../controllers/authController";

const router: IRouter = Router();

router.post("/auth/register", asyncHandler(authController.register));
router.post("/auth/login", asyncHandler(authController.login));
router.get("/auth/me", requireAuth, asyncHandler(authController.getMe));

export default router;
