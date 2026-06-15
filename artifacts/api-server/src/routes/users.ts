import { Router, type IRouter } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { upload } from "../lib/upload";
import * as userController from "../controllers/userController";

const router: IRouter = Router();

router.use("/users", requireAuth);

router.get("/users/search", asyncHandler(userController.searchUsers));
router.get("/users/:id", asyncHandler(userController.getUserById));
router.patch("/users/me", asyncHandler(userController.updateMe));
router.post("/users/me/avatar", upload.single("file"), asyncHandler(userController.updateAvatar));
router.patch("/users/me/settings", asyncHandler(userController.updateSettings));
router.patch("/users/me/status", asyncHandler(userController.updateStatus));

export default router;
