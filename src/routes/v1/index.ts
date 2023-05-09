import { Router } from "express";

import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import workspacesRoutes from "./workspacesRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/workspaces", workspacesRoutes);

export default router;
