import { NextFunction, Request, Response, Router } from "express";
import fileupload from "express-fileupload";
import { asyncWrapper, forwardCustomError } from "@/middlewares";
import { ApiResults, StatusCode } from "@/types";
import { fileHandler } from "@/utils";

const router = Router();
router.use(fileupload());

// GET
router.get(
  "/:id",
  asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const fileId = req.params.id;
    const fileMeta = await fileHandler.fileGetMeta(fileId, next);
    res.send(fileMeta);
  }),
);

// POST
router.post(
  "/",
  asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    // 檢查上傳檔案
    const validFile = fileHandler.getValidFile(req.files);

    if (!validFile) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FILE_HANDLER_FAIL);
    } else {
      const uploadedFileMeta = await fileHandler.filePost(validFile, next);
      res.send(uploadedFileMeta);
    }
  }),
);

// PATCH
router.patch(
  "/:id",
  asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const fileId = req.params.id;

    const validFile = fileHandler.getValidFile(req.files);

    if (!validFile) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FILE_HANDLER_FAIL);
    } else {
      const updatedFileMeta = await fileHandler.filePatch(fileId, validFile, next);
      res.send(updatedFileMeta);
    }
  }),
);

// DELETE
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const fileId = req.params.id;
    const resultMessage = await fileHandler.fileDelete(fileId, next);

    if (!resultMessage) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_DELETE);
    } else {
      res.send(resultMessage);
    }
  }),
);

export default router;