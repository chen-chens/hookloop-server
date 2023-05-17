import { Router } from "express";

import { cardControllers } from "@/controllers";
import { asyncWrapper } from "@/middlewares";

const router = Router();

router.post("/", asyncWrapper(cardControllers.createCard));
router.get("/:id", asyncWrapper(cardControllers.getCardById));
router.patch("/:id", asyncWrapper(cardControllers.updateCard));
router.patch("/:id/archive", asyncWrapper(cardControllers.archiveCard));
router.patch("/move", asyncWrapper(cardControllers.moveCard));

export default router;
