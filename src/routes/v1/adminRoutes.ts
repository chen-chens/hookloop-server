import { Router } from "express";

import { adminControllers } from "@/controllers";
import { asyncWrapper } from "@/middlewares";

const router = Router();

router.get("/users", asyncWrapper(adminControllers.getUsers));
router.get("/users/:id", asyncWrapper(adminControllers.getUserById));
router.patch("/users/:id", asyncWrapper(adminControllers.updateUserById));
router.post("/users", asyncWrapper(adminControllers.register));
router.post("/login", asyncWrapper(adminControllers.login));
router.get("/plans/:userId", asyncWrapper(adminControllers.getPlansByUserId));

export default router;
