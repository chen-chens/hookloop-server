import { Router } from "express";

import { userControllers } from "@/controllers";
import { verifyUserInputMiddleware } from "@/middlewares";

const router = Router();

router.get("", userControllers.getAllUsers);
router.get("/:id", userControllers.getUserById);
router.post("", verifyUserInputMiddleware, userControllers.createUser);
router.patch("/:id", userControllers.updateUser);

router.delete("", userControllers.deleteAllUsers);
router.delete("/:id", userControllers.deleteUserById);

export default router;
