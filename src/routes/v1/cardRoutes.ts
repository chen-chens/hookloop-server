import { Router } from "express";

import { cardControllers } from "@/controllers";
import { asyncWrapper, validate, verifyTokenMiddleware, verifyUploadMiddleware } from "@/middlewares";
import { cardValidator } from "@/utils";

const router = Router();

router.post(
  "/",
  verifyTokenMiddleware,
  validate(cardValidator.createCard, "CREATE"),
  asyncWrapper(cardControllers.createCard),
);
router.get(
  "/:id",
  verifyTokenMiddleware,
  validate(cardValidator.getCardById, "READ"),
  asyncWrapper(cardControllers.getCardById),
);
router.patch(
  "/:id/update",
  verifyTokenMiddleware,
  validate(cardValidator.updateCard, "UPDATE"),
  asyncWrapper(cardControllers.updateCard),
);
router.patch(
  "/:id/isArchived",
  verifyTokenMiddleware,
  validate(cardValidator.archiveCard, "DELETE"),
  asyncWrapper(cardControllers.archiveCard),
);
router.patch("/move", verifyTokenMiddleware, asyncWrapper(cardControllers.moveCard));

router.post(
  "/:cardId/attachment",
  verifyTokenMiddleware,
  validate(cardValidator.addAttachment, "UPLOAD"),
  // .single("file") 限制處理單一檔案，但若無檔案不會報錯
  verifyUploadMiddleware.attachment.single("file"),
  asyncWrapper(cardControllers.addAttachment),
);
router.delete(
  "/:cardId/attachment/:attachmentId",
  verifyTokenMiddleware,
  validate(cardValidator.deleteAttachment, "DELETE"),
  asyncWrapper(cardControllers.deleteAttachment),
);

router.get(
  "/:cardId/comment",
  verifyTokenMiddleware,
  validate(cardValidator.getComments, "READ"),
  asyncWrapper(cardControllers.getComments),
);
router.post(
  "/:cardId/comment",
  verifyTokenMiddleware,
  validate(cardValidator.addComment, "CREATE"),
  asyncWrapper(cardControllers.addComment),
);
router.patch(
  "/:cardId/comment/:commentId",
  verifyTokenMiddleware,
  validate(cardValidator.updateComment, "UPDATE"),
  asyncWrapper(cardControllers.updateComment),
);
router.patch(
  "/:cardId/comment/:commentId/isArchived",
  verifyTokenMiddleware,
  validate(cardValidator.archiveComment, "DELETE"),
  asyncWrapper(cardControllers.archiveComment),
);
router.get(
  "/:cardId/comment/:commentId",
  verifyTokenMiddleware,
  validate(cardValidator.getCommentHistory, "READ"),
  asyncWrapper(cardControllers.getCommentHistory),
);
export default router;
