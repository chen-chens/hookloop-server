import { Router } from "express";

import { listControllers } from "@/controllers";
import { asyncWrapper, verifyTokenMiddleware } from "@/middlewares";

const router = Router();

router.post("/", verifyTokenMiddleware, asyncWrapper(listControllers.createList));
router.get("/:id", verifyTokenMiddleware, asyncWrapper(listControllers.getListById));
router.patch("/:id/name", verifyTokenMiddleware, asyncWrapper(listControllers.renameList));
router.patch("/:id/archive", verifyTokenMiddleware, asyncWrapper(listControllers.archiveList));
router.patch("/move", verifyTokenMiddleware, asyncWrapper(listControllers.moveList));

export default router;
