import { Router } from "express";

import { kanbanControllers } from "@/controllers";
import { asyncWrapper, validate, verifyTokenMiddleware } from "@/middlewares";
import { kanbanValidators } from "@/utils";

const router = Router();

router.post("/", asyncWrapper(kanbanControllers.createKanban));
router.get("/:key", verifyTokenMiddleware, asyncWrapper(kanbanControllers.getKanbanByKey));
router.get("/:key/members", asyncWrapper(kanbanControllers.getKanbanMembers));
router.patch("/:key/name", asyncWrapper(kanbanControllers.renameKanban));
router.patch("/:key/key", asyncWrapper(kanbanControllers.modifyKanbanKey));
router.patch("/:key/archive", asyncWrapper(kanbanControllers.archiveKanban));
router.patch("/:key/pin", asyncWrapper(kanbanControllers.pinKanban));
router.get("/:kanbanId/filter", asyncWrapper(kanbanControllers.filterKanbanCards));

router.post(
  "/:kanbanId/tag",
  verifyTokenMiddleware,
  validate(kanbanValidators.createTag, "CREATE"),
  asyncWrapper(kanbanControllers.createTag),
);
router.get(
  "/:kanbanId/tag",
  verifyTokenMiddleware,
  validate(kanbanValidators.getTags, "READ"),
  asyncWrapper(kanbanControllers.getTags),
);
router.get(
  "/:kanbanId/tag/:tagId",
  verifyTokenMiddleware,
  validate(kanbanValidators.getTagById, "READ"),
  asyncWrapper(kanbanControllers.getTagById),
);
router.patch(
  "/:kanbanId/tag/:tagId",
  verifyTokenMiddleware,
  validate(kanbanValidators.updateTagById, "UPDATE"),
  asyncWrapper(kanbanControllers.updateTagById),
);
router.patch(
  "/:kanbanId/tag/:tagId/isArchived",
  verifyTokenMiddleware,
  validate(kanbanValidators.archiveTag, "DELETE"),
  asyncWrapper(kanbanControllers.archiveTag),
);

export default router;
