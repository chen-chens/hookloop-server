import { NextFunction, Request, Response, Router } from "express";
import fileupload from "express-fileupload";

import { asyncWrapper, forwardCustomError } from "@/middlewares";
import { ApiResults, ApiStatus, StatusCode } from "@/types";
import { responsePattern } from "@/utils";
import fileHandler from "@/utils/fileHandler";

const router = Router();
router.use(fileupload());

// GET
router.get(
  "/:id",
  asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const fileId = req.params.id;
    const fileMeta = await fileHandler.fileGetMeta(fileId, next);

    if (!fileMeta) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ);
    } else {
      res.send(fileMeta);
    }
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
    const successfullyDeleted = await fileHandler.fileDelete(fileId, next);

    if (!successfullyDeleted) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_DELETE);
    } else {
      res.send(responsePattern(ApiStatus.SUCCESS, ApiResults.SUCCESS_DELETE, {}));
    }
  }),
);

export default router;
