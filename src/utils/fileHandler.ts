import axios from "axios";
import { NextFunction } from "express";
import fileupload from "express-fileupload";

import { forwardCustomError } from "@/middlewares";
import { ApiResults, StatusCode } from "@/types";

const maxFileSize = 1000 * 1000; // 1MB
const imageBaseUrl = "https://www.filestackapi.com/api/file";

function getKeys() {
  return {
    key: process.env.FILESTACK_API_KEY,
    policy: process.env.FILESTACK_POLICY_KEY,
    signature: process.env.FILESTACK_SIGNATURE_KEY,
  };
}

const fileGetMeta = async (fileId: string, next: NextFunction) => {
  console.log("GetId:", fileId);

  const response = await axios({
    url: `${imageBaseUrl}/${fileId}/metadata`,
  }).catch((err: any) => {
    if (err.response.status === 404) {
      forwardCustomError(next, StatusCode.NOT_FOUND, ApiResults.FILE_NOT_FOUND);
    } else {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ);
    }
  });

  console.log("Get Result:", response);

  if (response) {
    console.log(response);
    const imgMeta = response!.data;
    return imgMeta;
  }
  return false;
};

// INFO: 改用 multer 套件處理上傳檔案驗證
const filePost = async (file: any, _: NextFunction) => {
  console.log("Post:", file);
  const { key } = getKeys();
  const { mimetype } = file;
  const response = await axios({
    method: "post",
    url: `https://www.filestackapi.com/api/store/S3`,
    data: file.data,
    headers: { "Content-type": mimetype },
    params: { key },
  });

  console.log("Upload Result:", response);

  if (response) {
    const { data } = response!;
    const fileData = {
      fileId: data.url.replace("https://cdn.filestackcontent.com/", ""),
      url: data.url,
      size: data.size,
      type: data.mimetype,
    };
    return fileData;
  }
  return false;
};

const filePatch = async (fileId: string, file: fileupload.UploadedFile, next: NextFunction) => {
  // 檢查檔案大小
  if (file.size > maxFileSize) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FILE_HANDLER_FAIL);
    return null;
  }

  const { policy, signature } = getKeys();
  const { mimetype } = file;
  const response = await axios({
    method: "post",
    url: `${imageBaseUrl}/${fileId}`,
    data: file.data,
    headers: { "Content-type": mimetype },
    params: {
      policy,
      signature,
    },
  }).catch((err: any) => {
    if (err.response.status === 404) {
      forwardCustomError(next, StatusCode.NOT_FOUND, ApiResults.FILE_NOT_FOUND);
    } else {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE);
    }
  });

  console.log("Patch Result:", response);

  if (response) {
    const { data } = response;
    const fileData = {
      fileId: data.url.replace("https://cdn.filestackcontent.com/", ""),
      url: data.url,
      size: data.size,
      type: data.mimetype,
    };
    return fileData;
  }
  return false;
};

const fileDelete = async (fileId: string, next: NextFunction) => {
  console.log("DeleteId:", fileId);

  const { key, policy, signature } = getKeys();
  const response = await axios({
    method: "delete",
    url: `${imageBaseUrl}/${fileId}`,
    params: {
      key,
      policy,
      signature,
    },
  }).catch((err: any) => {
    console.log(err);
    if (err.response.status === 404) {
      forwardCustomError(next, StatusCode.NOT_FOUND, ApiResults.FILE_NOT_FOUND);
    } else {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_DELETE);
    }
  });

  console.log("Delete Result:", response);

  return !!response;
};

export default {
  filePost,
  fileGetMeta,
  filePatch,
  fileDelete,
};
