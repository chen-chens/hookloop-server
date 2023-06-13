import { Router } from "express";

import { planControllers } from "@/controllers";
import { asyncWrapper } from "@/middlewares";

const router = Router();

router.post("/createOrder", asyncWrapper(planControllers.createOrder));

export default router;
