import { Router, type IRouter } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import * as thoughtController from "../controllers/thoughtController";

const router: IRouter = Router();

router.use("/thoughts", requireAuth);

router.get("/thoughts", asyncHandler(thoughtController.listThoughts));
router.post("/thoughts", asyncHandler(thoughtController.createThought));
router.delete("/thoughts/:id", asyncHandler(thoughtController.deleteThought));

export default router;
