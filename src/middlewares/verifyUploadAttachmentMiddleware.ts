import multer from "multer";

import { ApiResults, CustomError } from "@/types";
import statusCode from "@/types/statusCode";
import { generateErrorData } from "@/utils";

const verifyUpLoadAttachmentMiddleware = multer({
  // 設定暫存到檔案系統，或可用 memoryStorage 存儲在伺服器的記憶體中(但會消耗更多的記憶體資源)
  dest: "uploads/",
  // 限制檔案大小
  limits: {
    fileSize: 1000 * 1000,
  },
  // 驗證檔案類型
  fileFilter: (req, file, cb) => {
    const acceptedMimetypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ];
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/svg+xml"
    ) {
      if (file.size > 1000 * 500) {
        const error = new CustomError(
          statusCode.BAD_REQUEST,
          ApiResults.FAIL_UPLOAD_IMAGE_SIZE,
          generateErrorData("attachment", "Image size is too large."),
        );
        cb(error);
      } else {
        cb(null, true);
      }
    } else if (acceptedMimetypes.includes(file.mimetype)) {
      if (file.size > 1000 * 1000) {
        const error = new CustomError(
          statusCode.BAD_REQUEST,
          ApiResults.FAIL_UPLOAD_FILE_SIZE,
          generateErrorData("attachment", "File size is too large."),
        );
        cb(error);
      } else {
        cb(null, true);
      }
    } else {
      const error = new CustomError(
        statusCode.BAD_REQUEST,
        ApiResults.FAIL_UPLOAD_FILE_TYPE,
        generateErrorData("attachment", "File type is not allowed."),
      );
      cb(error);
    }
  },
});

export default verifyUpLoadAttachmentMiddleware;
