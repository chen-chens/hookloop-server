import { Router } from "express";

import { listControllers } from "@/controllers";
import { asyncWrapper, verifyTokenMiddleware } from "@/middlewares";

const router = Router();
router.use(verifyTokenMiddleware);
router.post("/", asyncWrapper(listControllers.createList));
router.get("/:id", asyncWrapper(listControllers.getListById));
router.patch("/:id/name", asyncWrapper(listControllers.renameList));
router.patch("/:id/archive", asyncWrapper(listControllers.archiveList));
router.patch("/move", asyncWrapper(listControllers.moveList));

export default router;
