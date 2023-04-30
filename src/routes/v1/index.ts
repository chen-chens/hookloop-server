import { Router } from "express";

import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);

export default router;
