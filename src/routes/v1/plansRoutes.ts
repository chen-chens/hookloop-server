import { Router } from "express";

import { planControllers } from "@/controllers";
import {
  asyncWrapper,
  verifyDecrypedPaymentMiddleware as verifyDecrypedPayment,
  verifyTokenMiddleware as verifyToken,
} from "@/middlewares";

const router = Router();
router.post("/createOrder", verifyToken, asyncWrapper(planControllers.createOrderForPayment));
router.post("/paymentNotify", verifyDecrypedPayment, asyncWrapper(planControllers.paymentNotify));
router.post("/paymentReturn", verifyDecrypedPayment, asyncWrapper(planControllers.paymentReturn));

export default router;
