import { Router } from "express";

import { cardControllers } from "@/controllers";
import { asyncWrapper, validate, verifyUploadMiddleware } from "@/middlewares";
import { cardValidator } from "@/utils";

const router = Router();

router.post("/", validate(cardValidator.createCard, "CREATE"), asyncWrapper(cardControllers.createCard));
router.get("/:id", validate(cardValidator.getCardById, "READ"), asyncWrapper(cardControllers.getCardById));
router.patch("/:id/update", validate(cardValidator.updateCard, "UPDATE"), asyncWrapper(cardControllers.updateCard));
router.patch(
  "/:id/isArchived",
  validate(cardValidator.archiveCard, "DELETE"),
  asyncWrapper(cardControllers.archiveCard),
);
router.patch("/move", asyncWrapper(cardControllers.moveCard));

router.post(
  "/:cardId/attachment",
  validate(cardValidator.addAttachment, "UPLOAD"),
  // .single("file") 限制處理單一檔案，但若無檔案不會報錯
  verifyUploadMiddleware.attachment.single("file"),
  asyncWrapper(cardControllers.addAttachment),
);
router.delete(
  "/:cardId/attachment/:attachmentId",
  validate(cardValidator.deleteAttachment, "DELETE"),
  asyncWrapper(cardControllers.deleteAttachment),
);

router.get("/:cardId/comment", validate(cardValidator.getComments, "READ"), asyncWrapper(cardControllers.getComments));
router.post("/:cardId/comment", validate(cardValidator.addComment, "CREATE"), asyncWrapper(cardControllers.addComment));
router.patch(
  "/:cardId/comment/:commentId",
  validate(cardValidator.updateComment, "UPDATE"),

  asyncWrapper(cardControllers.updateComment),
);
router.patch(
  "/:cardId/comment/:commentId/isArchived",
  validate(cardValidator.archiveComment, "DELETE"),
  asyncWrapper(cardControllers.archiveComment),
);
router.get(
  "/:cardId/comment/:commentId",
  validate(cardValidator.getCommentHistory, "READ"),
  asyncWrapper(cardControllers.getCommentHistory),
);
export default router;
