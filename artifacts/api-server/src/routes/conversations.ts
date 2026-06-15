import { Router, type IRouter } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import * as conversationController from "../controllers/conversationController";

const router: IRouter = Router();

router.use("/conversations", requireAuth);

router.get("/conversations", asyncHandler(conversationController.listConversations));
router.post("/conversations", asyncHandler(conversationController.createConversation));

router.delete("/conversations/:id", asyncHandler(conversationController.deleteConversation));
router.post("/conversations/:id/clear", asyncHandler(conversationController.clearConversation));

router.get("/conversations/:id/messages", asyncHandler(conversationController.listMessages));
router.post("/conversations/:id/messages", asyncHandler(conversationController.sendMessage));

export default router;
