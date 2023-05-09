import { Router } from "express";

import { workspaceControllers } from "@/controllers";
import { asyncWrapper } from "@/middlewares";

const {
  getAllWorkspaces,
  createWorkspace,
  updateWorkspaceById,
  archiveWorkspaceById,
  getAvailableUsersByWorkspaceId,
  addPinnedByWorkspaceId,
  deleteUserFromWorkspace,
  getWorkspacesByUserId,
} = workspaceControllers;

const router = Router();

router.get("", asyncWrapper(getAllWorkspaces));
router.post("", asyncWrapper(createWorkspace));
router.put("/:id", asyncWrapper(updateWorkspaceById));
router.patch("/:id/isArchived", asyncWrapper(archiveWorkspaceById));
router.get("/:id/availableUsers", asyncWrapper(getAvailableUsersByWorkspaceId));
router.put("/:id/isPinned", asyncWrapper(addPinnedByWorkspaceId));
router.delete("/:workspaceId/members/:memberId", asyncWrapper(deleteUserFromWorkspace));

router.get("/:userId", getWorkspacesByUserId);

export default router;
