import { NextFunction, Request, Response } from "express";

import { ApiResults, StatusCode } from "@/types";

import { forwardCustomError } from "./errorMiddleware";

const verifyDecrypedPaymentMiddleware = (req: Request, _: Response, next: NextFunction) => {
  const { PAY_MERCHANT_ID, PAY_VERSION, PAY_RETURN_URL, PAY_NOTIFY_URL, PAY_HASH_IV, PAY_HASH_KEY } = process.env;
  console.log("🚀 ======================= 進入藍新回傳 Notify / Payment Return =====================");
  console.log("🚀 ~ =======================  paymentNotify req.body :", req.body);
  // console.log("🚀 ~ =======================  paymentNotify Source req.headers :", req.headers);

  if (!PAY_MERCHANT_ID || !PAY_VERSION || !PAY_RETURN_URL || !PAY_NOTIFY_URL || !PAY_HASH_IV || !PAY_HASH_KEY) {
    return forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
  }

  // 解密資料，核對 產品編號是否一致
  const key = CryptoJS.enc.Utf8.parse(PAY_HASH_KEY); // 先轉成 CryptoJS 可接受加密格式：WordArray
  const iv = CryptoJS.enc.Utf8.parse(PAY_HASH_IV);
  const ciphertext = CryptoJS.enc.Hex.parse(`${req.body.TradeInfo}`);
  const decrypted = CryptoJS.AES.decrypt({ ciphertext } as CryptoJS.lib.CipherParams, key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decryptedWithoutPadding = CryptoJS.enc.Utf8.stringify(decrypted).replace(/\0+$/, "");
  const returnInfo = JSON.parse(decodeURIComponent(decryptedWithoutPadding));
  console.log("🚀 ~ ~ ~ ~ ~ ~ ~  paymentNotify ~ returnInfo:", returnInfo);

  req.returnInfo = returnInfo;

  return next();
};

export default verifyDecrypedPaymentMiddleware;
