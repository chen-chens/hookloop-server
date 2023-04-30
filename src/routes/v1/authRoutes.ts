import { Router } from "express";

import authControllers from "../../controllers/authControllers";

const router = Router();

router.post("/login", authControllers.login);
router.post("/forgetPassword", authControllers.forgetPassword);
router.post("/verifyPassword", authControllers.verifyPassword);
router.post("/verifyEmail", authControllers.verifyEmail);

export default router;
