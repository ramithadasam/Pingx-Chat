import { Router, type IRouter } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { upload } from "../lib/upload";
import * as mediaController from "../controllers/mediaController";

const router: IRouter = Router();

router.post("/media/upload", requireAuth, upload.single("file"), asyncHandler(mediaController.uploadMedia));

export default router;
