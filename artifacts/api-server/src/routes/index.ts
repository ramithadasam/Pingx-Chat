import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import conversationRouter from "./conversations";
import friendRouter from "./friends";
import userRouter from "./users";
import noteRouter from "./notes";
import thoughtRouter from "./thoughts";
import mediaRouter from "./media";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(conversationRouter);
router.use(friendRouter);
router.use(userRouter);
router.use(noteRouter);
router.use(thoughtRouter);
router.use(mediaRouter);

export default router;
