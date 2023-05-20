import { Router } from "express";

import { workspaceControllers } from "@/controllers";
import { asyncWrapper, verifyTokenMiddleware } from "@/middlewares";

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

router.get("/me", verifyTokenMiddleware, asyncWrapper(getWorkspacesByUserId));
router.get("/:id", verifyTokenMiddleware, asyncWrapper(getWorkspacesById));
router.post("", verifyTokenMiddleware, asyncWrapper(createWorkspace));
router.patch("/:id", verifyTokenMiddleware, asyncWrapper(updateWorkspaceById));
router.patch("/:id/isArchived", verifyTokenMiddleware, asyncWrapper(closeWorkspaceById));

// 待確認的 API：看 User, Workspace Schema 怎麼關聯
router.get("/:id/availableUsers", asyncWrapper(getAvailableUsersByWorkspaceId));
router.put("/:id/isPinned", asyncWrapper(addPinnedByWorkspaceId));
router.delete("/:workspaceId/members/:memberId", asyncWrapper(deleteUserFromWorkspace));

export default router;
