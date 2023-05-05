import { Router } from "express";

import { authControllers } from "@/controllers";
import { verifyLogInInputMiddleware } from "@/middlewares";

const router = Router();

router.post("/login", verifyLogInInputMiddleware, authControllers.login);
router.post("/forgetPassword", authControllers.forgetPassword);
router.post("/verifyPassword", authControllers.verifyPassword);
router.post("/verifyEmail", authControllers.verifyEmail);

export default router;
