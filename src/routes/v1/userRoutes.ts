import { Router } from "express";

import { userControllers } from "@/controllers";
import { asyncWrapper, verifyUserInputMiddleware } from "@/middlewares";

const router = Router();

router.get("", asyncWrapper(userControllers.getAllUsers));
router.get("/me", asyncWrapper(userControllers.getUserById));
router.post("", verifyUserInputMiddleware, asyncWrapper(userControllers.createUser));
router.patch("/me", asyncWrapper(userControllers.updateUser));

router.delete("", asyncWrapper(userControllers.deleteAllUsers));
router.patch("/me/isActive", asyncWrapper(userControllers.deleteUserById));

export default router;
