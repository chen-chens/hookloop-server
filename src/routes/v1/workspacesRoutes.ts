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
  deleteUserFromWorkspace,
  getWorkspacesByUserId,
  getKanbansByWorkspaceId,
} = workspaceControllers;

const router = Router();

router.get("/me", verifyToken, asyncWrapper(getWorkspacesByUserId));
router.get("/:id", verifyToken, asyncWrapper(getWorkspacesById));
router.get("/:id/kanbans", asyncWrapper(getKanbansByWorkspaceId));
router.post("", verifyToken, asyncWrapper(createWorkspace));
router.patch("/:id", verifyToken, verifyWorkspaceEditAuth, asyncWrapper(updateWorkspaceById));
router.patch("/:id/isArchived", verifyToken, verifyWorkspaceEditAuth, asyncWrapper(closeWorkspaceById));
router.delete("/:workspaceId/member", verifyToken, verifyWorkspaceEditAuth, asyncWrapper(deleteUserFromWorkspace));

export default router;
