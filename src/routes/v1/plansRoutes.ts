import { Router } from "express";

import { planControllers } from "@/controllers";
import { asyncWrapper, verifyTokenMiddleware as verifyToken } from "@/middlewares";

const router = Router();
router.get("/me", verifyToken, asyncWrapper(planControllers.getPlansByUserId));
router.post("/createOrder", verifyToken, asyncWrapper(planControllers.createOrder));
router.post("/paymentNotify", asyncWrapper(planControllers.paymentNotify));
router.post("/paymentReturn", asyncWrapper(planControllers.paymentReturn));

export default router;
