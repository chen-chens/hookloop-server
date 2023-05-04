import authControllers from "controllers/authControllers";
import { Router } from "express";
import verifyLogInInputMiddleware from "middlewares/verifyLogInInputMiddleware";

const router = Router();

router.post("/login", verifyLogInInputMiddleware, authControllers.login);
router.post("/forgetPassword", authControllers.forgetPassword);
router.post("/verifyPassword", authControllers.verifyPassword);
router.post("/verifyEmail", authControllers.verifyEmail);

export default router;
