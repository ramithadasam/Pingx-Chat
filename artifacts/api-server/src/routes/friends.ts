import { Router, type IRouter } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import * as friendController from "../controllers/friendController";

const router: IRouter = Router();

router.use("/friends", requireAuth);

router.post("/friends/requests", asyncHandler(friendController.sendFriendRequest));
router.get("/friends/requests", asyncHandler(friendController.listFriendRequests));
router.patch("/friends/requests/:id", asyncHandler(friendController.respondToFriendRequest));

router.get("/friends", asyncHandler(friendController.listFriends));

router.get("/friends/blocked", asyncHandler(friendController.listBlockedUsers));
router.post("/friends/block/:userId", asyncHandler(friendController.blockUser));
router.delete("/friends/block/:userId", asyncHandler(friendController.unblockUser));

router.delete("/friends/:userId", asyncHandler(friendController.removeFriend));

export default router;
