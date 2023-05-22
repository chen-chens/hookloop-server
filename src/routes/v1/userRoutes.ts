import { Router } from "express";

import { userControllers } from "@/controllers";
import {
  asyncWrapper,
  verifyTokenMiddleware as verifyToken,
  verifyUploadAttachmentMiddleware,
  verifyUserInputMiddleware as verifyUserInput,
} from "@/middlewares";

const router = Router();

router.get("", verifyToken, asyncWrapper(userControllers.getUsers));
router.get("/me", verifyToken, asyncWrapper(userControllers.getUserById));
router.post("", verifyUserInput, asyncWrapper(userControllers.createUser));
router.get("/getMember/:email", asyncWrapper(userControllers.getMember));
router.patch("/me", verifyUploadAttachmentMiddleware.single("file"), asyncWrapper(userControllers.updateUser));
router.patch("/me/password", asyncWrapper(userControllers.updatePassword));

router.delete("", asyncWrapper(userControllers.deleteAllUsers));
router.patch("/me/isActive", asyncWrapper(userControllers.deleteUserById));

export default router;
