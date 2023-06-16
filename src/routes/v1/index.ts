import { Router } from "express";

import adminRoutes from "./adminRoutes";
import authRoutes from "./authRoutes";
import cardRoutes from "./cardRoutes";
import kanbanRoutes from "./kanbanRoutes";
import listRoutes from "./listRoutes";
import notificationRoutes from "./notificationRoutes";
import plansRoutes from "./plansRoutes";
import userRoutes from "./userRoutes";
import workspacesRoutes from "./workspacesRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/cards", cardRoutes);
router.use("/kanbans", kanbanRoutes);
router.use("/lists", listRoutes);
router.use("/notifications", notificationRoutes);
router.use("/workspaces", workspacesRoutes);
router.use("/plans", plansRoutes);
router.use("/admin", adminRoutes);

export default router;
