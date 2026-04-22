import { Router, type IRouter } from "express";
import healthRouter from "./health";
import instagramRouter from "./instagram";

const router: IRouter = Router();

router.use(healthRouter);
router.use(instagramRouter);

export default router;
