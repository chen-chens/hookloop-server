import { NextFunction, Request, Response, Router } from "express";
import fileupload from "express-fileupload";

import { asyncWrapper, forwardCustomError } from "@/middlewares";
import { ApiResults, ApiStatus, StatusCode } from "@/types";
import { responsePattern } from "@/utils";
import fileHandler from "@/utils/fileHandler";

const router = Router();
router.use(fileupload());

// GET 取得檔案
router.get(
  "/:id",
  asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const fileId = req.params.id;
    const fileMeta = await fileHandler.fileGetMeta(fileId, next);

    if (!fileMeta) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ);
    } else {
      res.json(fileMeta);
    }
  }),
);

// POST 新增檔案
router.post(
  "/",
  asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    // 檢查上傳檔案
    const { files } = req;
    if (!files || !Object.keys(files).length) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FILE_HANDLER_FAIL);
    } else {
      // fileHandler.filePost() 每次只處理一個檔案
      const validFile = files[Object.keys(files)[0]] as fileupload.UploadedFile;
      if (!validFile) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FILE_HANDLER_FAIL);
      } else {
        const uploadedFileMeta = await fileHandler.filePost(validFile, next);
        res.json(uploadedFileMeta);
      }
    }
  }),
);

// PATCH 更新檔案
router.patch(
  "/:id",
  asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const fileId = req.params.id;

    // 檢查上傳檔案
    const { files } = req;
    if (!files || !Object.keys(files).length) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FILE_HANDLER_FAIL);
    } else {
      // fileHandler.filePost() 只接受一個檔案，該檔案會覆蓋同個 fileId 的檔案
      const validFile = files[Object.keys(files)[0]] as fileupload.UploadedFile;
      if (!validFile) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FILE_HANDLER_FAIL);
      } else {
        const updatedFileMeta = await fileHandler.filePatch(fileId, validFile, next);
        res.json(updatedFileMeta);
      }
    }
  }),
);

// DELETE 刪除檔案
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const fileId = req.params.id;
    const successfullyDeleted = await fileHandler.fileDelete(fileId, next);

    if (!successfullyDeleted) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_DELETE);
    } else {
      res.json(responsePattern(ApiStatus.SUCCESS, ApiResults.SUCCESS_DELETE, {}));
    }
  }),
);

export default router;
