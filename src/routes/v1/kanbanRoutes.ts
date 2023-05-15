import { Router } from "express";

import { kanbanControllers } from "@/controllers";
import { asyncWrapper } from "@/middlewares";

const router = Router();

router.post("/", asyncWrapper(kanbanControllers.createKanban));
router.get("/:key", asyncWrapper(kanbanControllers.getKanbanByKey));
router.patch("/:key/rename", asyncWrapper(kanbanControllers.renameKanban));
router.patch("/:key/archive", asyncWrapper(kanbanControllers.archiveKanban));
router.patch("/:key/pin", asyncWrapper(kanbanControllers.pinKanban));

export default router;
