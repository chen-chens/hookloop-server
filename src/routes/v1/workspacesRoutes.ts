import { Router } from "express";

import { workspaceControllers } from "@/controllers";
import { asyncWrapper } from "@/middlewares";

const {
  getWorkspacesById,
  createWorkspace,
  updateWorkspaceById,
  closeWorkspaceById,
  getAvailableUsersByWorkspaceId,
  addPinnedByWorkspaceId,
  deleteUserFromWorkspace,
  getWorkspacesByUserId,
} = workspaceControllers;

const router = Router();

router.get("/me", asyncWrapper(getWorkspacesByUserId));
router.get("/:id", asyncWrapper(getWorkspacesById));
router.post("", asyncWrapper(createWorkspace));
router.patch("/:id", asyncWrapper(updateWorkspaceById));
router.patch("/:id/isArchived", asyncWrapper(closeWorkspaceById));

// 待確認的 API：看 User, Workspace Schema 怎麼關聯
router.get("/:id/availableUsers", asyncWrapper(getAvailableUsersByWorkspaceId));
router.put("/:id/isPinned", asyncWrapper(addPinnedByWorkspaceId));
router.delete("/:workspaceId/members/:memberId", asyncWrapper(deleteUserFromWorkspace));

export default router;
