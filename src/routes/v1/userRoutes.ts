import { Router } from "express";
import fileupload from "express-fileupload";

import { userControllers } from "@/controllers";
import {
  asyncWrapper,
  verifyTokenMiddleware as verifyToken,
  verifyUserInputMiddleware as verifyUserInput,
} from "@/middlewares";

const router = Router();
router.use(fileupload());

router.get("", verifyToken, asyncWrapper(userControllers.getUsers));
router.get("/me", verifyToken, asyncWrapper(userControllers.getUserById));
router.post("", verifyUserInput, asyncWrapper(userControllers.createUser));
router.patch("/me", asyncWrapper(userControllers.updateUser));
router.patch("/me/password", asyncWrapper(userControllers.updatePassword));

router.delete("", asyncWrapper(userControllers.deleteAllUsers));
router.patch("/me/isActive", asyncWrapper(userControllers.deleteUserById));

export default router;
