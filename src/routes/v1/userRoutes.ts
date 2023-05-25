import { Router } from "express";

import { userControllers } from "@/controllers";
import {
  asyncWrapper,
  verifyTokenMiddleware as verifyToken,
  verifyUploadMiddleware,
  verifyUserInputMiddleware as verifyUserInput,
} from "@/middlewares";

const router = Router();

router.get("", verifyToken, asyncWrapper(userControllers.getUsers));
router.get("/me", verifyToken, asyncWrapper(userControllers.getUserById));
router.post("", verifyUserInput, asyncWrapper(userControllers.createUser));
router.get("/getMember/:email", asyncWrapper(userControllers.getMember));
// single("") file.fieldName must be the same as the one in the form : avatar
router.patch("/me", verifyUploadMiddleware.image.single("avatar"), asyncWrapper(userControllers.updateUser));
router.patch("/me/password", asyncWrapper(userControllers.updatePassword));
router.delete("", asyncWrapper(userControllers.deleteAllUsers));
router.patch("/me/isActive", asyncWrapper(userControllers.deleteUserById));

export default router;
