import { Router } from "express";
import fileupload from "express-fileupload";

import { userControllers } from "@/controllers";
import { asyncWrapper, verifyTokenMiddleware, verifyUserInputMiddleware } from "@/middlewares";

const router = Router();
router.use(fileupload());

router.get("", asyncWrapper(userControllers.getAllUsers));
router.get("/me", verifyTokenMiddleware, asyncWrapper(userControllers.getUserById));
router.post("", verifyUserInputMiddleware, asyncWrapper(userControllers.createUser));
router.patch("/me", asyncWrapper(userControllers.updateUser));
router.options("", function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,PATCH,DELETE");
  res.send({ status: "success" });
});
router.patch("/me/password", asyncWrapper(userControllers.updatePassword));

router.delete("", asyncWrapper(userControllers.deleteAllUsers));
router.patch("/me/isActive", asyncWrapper(userControllers.deleteUserById));

export default router;
