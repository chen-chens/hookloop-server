import { Router } from "express";

import { cardControllers } from "@/controllers";
import { asyncWrapper, validate } from "@/middlewares";
import { cardValidator } from "@/utils";

const router = Router();

router.post("/", validate(cardValidator.createCard), asyncWrapper(cardControllers.createCard));
router.get("/:id", validate(cardValidator.getCardById), asyncWrapper(cardControllers.getCardById));
router.patch("/:id", validate(cardValidator.updateCard), asyncWrapper(cardControllers.updateCard));
router.patch("/:id/archive", validate(cardValidator.archiveCard), asyncWrapper(cardControllers.archiveCard));
router.patch("/move", asyncWrapper(cardControllers.moveCard));
// router.post("/:cardId/attachment", asyncWrapper(cardControllers.addAttachment));
// router.get("/:cardId/attachment/:attahmentId", asyncWrapper(cardControllers.getAttachment));
// router.delete("/:cardId/attachment/:attahmentId", asyncWrapper(cardControllers.deleteAttachment));

export default router;
