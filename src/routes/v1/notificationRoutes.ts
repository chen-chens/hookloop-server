import { Router } from "express";

import { notificationControllers } from "@/controllers";
import { asyncWrapper } from "@/middlewares";

const router = Router();

router.get("/user/:userId", asyncWrapper(notificationControllers.getNotificationsByUserId));
router.patch("/:id/read", asyncWrapper(notificationControllers.isReadNotification));
router.patch("/user/:userId", asyncWrapper(notificationControllers.markAllIsReadByUserId));

export default router;
