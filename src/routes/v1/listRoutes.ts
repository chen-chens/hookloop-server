import { Router } from "express";

import { listControllers } from "@/controllers";
import { asyncWrapper } from "@/middlewares";

const router = Router();

router.post("/", asyncWrapper(listControllers.createList));
router.get("/:id", asyncWrapper(listControllers.getListById));
router.patch("/:id/name", asyncWrapper(listControllers.renameList));
router.patch("/:id/archive", asyncWrapper(listControllers.archiveList));
router.patch("/:id/move", asyncWrapper(listControllers.moveList));

export default router;
