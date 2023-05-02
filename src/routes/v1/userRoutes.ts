import { Router } from "express";

import userControllers from "../../controllers/userControllers";

const router = Router();

router.get("", userControllers.getAllUsers);
router.get("/:id", userControllers.getUserById);
router.post("", userControllers.createUser);
router.patch("/:id", userControllers.updateUser);

// router.delete("", userControllers.deleteAllUsers);
// router.delete("/:id", userControllers.deleteUserById);

export default router;
