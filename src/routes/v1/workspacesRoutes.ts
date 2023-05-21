import { Router } from "express";

import { workspaceControllers } from "@/controllers";
import {
  asyncWrapper,
  verifyTokenMiddleware as verifyToken,
  verifyWorkspaceEditAuthMiddleware as verifyWorkspaceEditAuth,
} from "@/middlewares";

const {
  getWorkspacesById,
  createWorkspace,
  updateWorkspaceById,
  closeWorkspaceById,
  getAvailableUsersByWorkspaceId,
  deleteUserFromWorkspace,
  getWorkspacesByUserId,
} = workspaceControllers;

const router = Router();

router.get("/me", verifyToken, asyncWrapper(getWorkspacesByUserId));
router.get("/:id", verifyToken, asyncWrapper(getWorkspacesById));
router.post("", verifyToken, asyncWrapper(createWorkspace));
router.patch("/:id", verifyToken, verifyWorkspaceEditAuth, asyncWrapper(updateWorkspaceById));
router.patch("/:id/isArchived", verifyToken, verifyWorkspaceEditAuth, asyncWrapper(closeWorkspaceById));
router.delete(
  "/:workspaceId/members/:memberId",
  verifyToken,
  verifyWorkspaceEditAuth,
  asyncWrapper(deleteUserFromWorkspace),
);

// 待確認:
router.get("/:id/availableUsers", asyncWrapper(getAvailableUsersByWorkspaceId));

export default router;
