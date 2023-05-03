import userControllers from "controllers/userControllers";
import { Router } from "express";
import verifyUserInputMiddleware from "middlewares/verifyUserInputMiddleware";

const router = Router();

router.get("", userControllers.getAllUsers);
router.get("/:id", userControllers.getUserById);
router.post("", verifyUserInputMiddleware, userControllers.createUser);
router.patch("/:id", userControllers.updateUser);

router.delete("", userControllers.deleteAllUsers);
router.delete("/:id", userControllers.deleteUserById);

export default router;
