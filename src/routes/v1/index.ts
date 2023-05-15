import { Router } from "express";

import authRoutes from "./authRoutes";
import cardRoutes from "./cardRoutes";
import kanbanRoutes from "./kanbanRoutes";
import listRoutes from "./listRoutes";
import userRoutes from "./userRoutes";
import workspacesRoutes from "./workspacesRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/cards", cardRoutes);
router.use("/kanbans", kanbanRoutes);
router.use("/lists", listRoutes);
router.use("/workspaces", workspacesRoutes);

export default router;
