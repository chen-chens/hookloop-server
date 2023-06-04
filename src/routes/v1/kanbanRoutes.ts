import { Router } from "express";

import { kanbanControllers } from "@/controllers";
import { asyncWrapper, validate } from "@/middlewares";
import { kanbanValidators } from "@/utils";

const router = Router();

router.post("/", asyncWrapper(kanbanControllers.createKanban));
router.get("/:key", asyncWrapper(kanbanControllers.getKanbanByKey));
router.get("/:key/members", asyncWrapper(kanbanControllers.getKanbanMembers));
router.patch("/:key/name", asyncWrapper(kanbanControllers.renameKanban));
router.patch("/:key/key", asyncWrapper(kanbanControllers.modifyKanbanKey));
router.patch("/:key/archive", asyncWrapper(kanbanControllers.archiveKanban));
router.patch("/:key/pin", asyncWrapper(kanbanControllers.pinKanban));
router.get("/:kanbanId/filter", asyncWrapper(kanbanControllers.filterKanbanCards));

router.post(
  "/:kanbanId/tag",
  validate(kanbanValidators.createTag, "CREATE"),
  asyncWrapper(kanbanControllers.createTag),
);
router.get("/:kanbanId/tag", validate(kanbanValidators.getTags, "READ"), asyncWrapper(kanbanControllers.getTags));
router.get(
  "/:kanbanId/tag/:tagId",
  validate(kanbanValidators.getTagById, "READ"),
  asyncWrapper(kanbanControllers.getTagById),
);
router.patch(
  "/:kanbanId/tag/:tagId",
  validate(kanbanValidators.updateTagById, "UPDATE"),
  asyncWrapper(kanbanControllers.updateTagById),
);
router.patch(
  "/:kanbanId/tag/:tagId/isArchived",
  validate(kanbanValidators.archiveTag, "DELETE"),
  asyncWrapper(kanbanControllers.archiveTag),
);

export default router;
