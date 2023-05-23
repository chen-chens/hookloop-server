import multer from "multer";

import { ApiResults, CustomError } from "@/types";
import statusCode from "@/types/statusCode";
import { generateErrorData } from "@/utils";

const attachment = multer({
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
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
    ];
    if (acceptedMimetypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new CustomError(
        statusCode.BAD_REQUEST,
        ApiResults.FAIL_UPLOAD_FILE_TYPE,
        generateErrorData(
          file.fieldname,
          `${file.fieldname} types must be image, pdf, txt, doc, docx, xls, xlsx, ppt, pptx.`,
        ),
      );
      cb(error);
    }
  },
});

const image = multer({
  // 設定暫存到檔案系統，或可用 memoryStorage 存儲在伺服器的記憶體中(但會消耗更多的記憶體資源)
  dest: "uploads/",
  // 限制檔案大小
  limits: {
    fileSize: 500 * 1000,
  },
  // 驗證檔案類型只能是圖片
  fileFilter: (req, file, cb) => {
    const acceptedMimetypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    if (acceptedMimetypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new CustomError(
        statusCode.BAD_REQUEST,
        ApiResults.FAIL_UPLOAD_FILE_TYPE,
        generateErrorData(file.fieldname, `${file.fieldname} types must be png, jpeg, jpg, svg.`),
      );
      cb(error);
    }
  },
});

export default {
  attachment,
  image,
};
