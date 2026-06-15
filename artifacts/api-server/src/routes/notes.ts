import { Router, type IRouter } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import * as noteController from "../controllers/noteController";

const router: IRouter = Router();

router.use("/notes", requireAuth);

router.get("/notes", asyncHandler(noteController.listNotes));
router.post("/notes", asyncHandler(noteController.createNote));
router.patch("/notes/:id", asyncHandler(noteController.updateNote));
router.delete("/notes/:id", asyncHandler(noteController.deleteNote));

export default router;
