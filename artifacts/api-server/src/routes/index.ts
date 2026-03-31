import { Router, type IRouter } from "express";
import healthRouter from "./health";
import openaiRouter from "./openai/index";
import usersRouter from "./users";
import documentsRouter from "./documents";
import formsRouter from "./forms";
import healthcareRouter from "./healthcare";
import paymentsRouter from "./payments";
import schemesRouter from "./schemes";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import aiRouterHandler from "./ai-router";
import adminRouter from "./admin";
import securityRouter from "./security";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/openai", openaiRouter);
router.use("/users", usersRouter);
router.use("/documents", documentsRouter);
router.use("/forms", formsRouter);
router.use("/health", healthcareRouter);
router.use("/payments", paymentsRouter);
router.use("/schemes", schemesRouter);
router.use("/notifications", notificationsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/ai-router", aiRouterHandler);
router.use("/admin", adminRouter);
router.use("/security", securityRouter);

export default router;
