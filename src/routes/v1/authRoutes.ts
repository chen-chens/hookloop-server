import { Router } from "express";

import { authControllers } from "@/controllers";
import { asyncWrapper, verifyLogInInputMiddleware } from "@/middlewares";

const router = Router();

router.get("/verifyUserToken", asyncWrapper(authControllers.verifyUserToken));
router.post("/login", verifyLogInInputMiddleware, asyncWrapper(authControllers.login));
router.post("/forgetPassword", authControllers.forgetPassword);
router.post("/verifyPassword", authControllers.verifyResetPassword);
router.post("/verifyEmail", asyncWrapper(authControllers.verifyEmail));

export default router;
