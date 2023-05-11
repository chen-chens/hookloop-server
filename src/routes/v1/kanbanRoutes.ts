import { Router } from "express";

import { kanbanControllers } from "@/controllers";
import { asyncWrapper } from "@/middlewares";

const router = Router();

router.post("/", asyncWrapper(kanbanControllers.createKanban));
router.get("/:id", asyncWrapper(kanbanControllers.getKanbanById));
router.patch("/:id/rename", asyncWrapper(kanbanControllers.renameKanban));

export default router;
