import CryptoJS from "crypto-js";
import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import Plan from "@/models/planModel";
import { IUser } from "@/models/userModel";
import { ApiResults, IPaymentTradeInfoType, IPlanOrderRequest, StatusCode } from "@/types";
import { getPriceByPlan, sendSuccessResponse, transferTradeInfoString } from "@/utils";

const createOrderForPayment = async (req: IPlanOrderRequest, res: Response, next: NextFunction) => {
  /* -- FREE Plan 會在前端處理掉，這裡針對要付費的 Standard/Premium -- */
  const { PAY_MERCHANT_ID, PAY_VERSION, PAY_RETURN_URL, PAY_NOTIFY_URL, PAY_HASH_IV, PAY_HASH_KEY } = process.env;
  const { email, isArchived, id } = req.user as IUser;
  const { targetPlan } = req.body;
  if (isArchived) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.USER_IS_ARCHIVED);
    return;
  }
  if (!targetPlan) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.PLAN_FOR_PAYMENT_IS_REQUIRED);
    return;
  }
  if (!PAY_MERCHANT_ID || !PAY_VERSION || !PAY_RETURN_URL || !PAY_NOTIFY_URL || !PAY_HASH_IV || !PAY_HASH_KEY) {
    forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
    return;
  }

  const tradeInfo: IPaymentTradeInfoType = {
    MerchantID: PAY_MERCHANT_ID,
    RespondType: "JSON",
    TimeStamp: `${Math.floor(Date.now() / 1000)}`,
    Version: PAY_VERSION,
    LoginType: "en",
    MerchantOrderNo: `${targetPlan.charAt(0)}${Date.now()}`, // 商品編號，先用時間戳使用。
    Amt: getPriceByPlan(targetPlan),
    ItemDesc: targetPlan,
    TradeLimit: 900, // 交易有效時間內未完成交易，則視為交易失敗 ---> DB 顯示交易未完成。（交易成功、交易失敗、交易未完成）
    ReturnURL: PAY_RETURN_URL, // 只接受 80 與 443 Port ?
    NotifyURL: PAY_NOTIFY_URL, // 只接受 80 與 443 Port ?
    Email: email,
    EmailModify: 0, // 付款人電子信箱欄位是 否開放讓付款人修改: 不可改: 0
    WEBATM: 1,
  };

  // 回傳加密後訂單資訊給前端
  // Step1: 生成請求字串
  const tradeString = transferTradeInfoString(tradeInfo);

  // Step2: 將請求字串加密
  const key = CryptoJS.enc.Utf8.parse(PAY_HASH_KEY); // 先轉成 CryptoJS 可接受加密格式：WordArray
  const iv = CryptoJS.enc.Utf8.parse(PAY_HASH_IV);
  const aesEncrypted = CryptoJS.AES.encrypt(tradeString, key, {
    iv,
    mode: CryptoJS.mode.CBC, // AES-256-CBC: AES加密-密鑰長度(PAY_HASH_KEY)256-CBC模式
    padding: CryptoJS.pad.Pkcs7, // PKCS7 填充
  }).ciphertext.toString(CryptoJS.enc.Hex); // 轉成 十六進位制

  // Step3: 將 AES加密字串產生檢查碼
  const hashString = `HashKey=${PAY_HASH_KEY}&${aesEncrypted}&HashIV=${PAY_HASH_IV}`;
  const sha256Hash = CryptoJS.SHA256(hashString);
  const shaHex = sha256Hash.toString(CryptoJS.enc.Hex);
  const shaEncrypted = shaHex.toUpperCase();

  // DB 建立一筆訂單:
  const oneMonth = 30 * 24 * 60 * 60 * 1000;
  await Plan.create({
    name: targetPlan,
    price: getPriceByPlan(targetPlan),
    endAt: Date.now() + oneMonth, // 1 month
    userId: id,
    status: "UN-PAID",
    merchantOrderNo: tradeInfo.MerchantOrderNo,
  });

  sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
    tradeInfo,
    aesEncrypted,
    shaEncrypted,
  });
};

const paymentNotify = async (req: Request, res: Response, next: NextFunction) => {
  const { PAY_MERCHANT_ID, PAY_VERSION, PAY_RETURN_URL, PAY_NOTIFY_URL, PAY_HASH_IV, PAY_HASH_KEY } = process.env;
  const receivePaymentData = req.body;
  console.log("🚀 ~ file: planControllers.ts:80 ~ paymentNotify :", receivePaymentData);

  if (!PAY_MERCHANT_ID || !PAY_VERSION || !PAY_RETURN_URL || !PAY_NOTIFY_URL || !PAY_HASH_IV || !PAY_HASH_KEY) {
    forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
    return;
  }
  // 解密資料，核對 產品編號是否一致
  const key = CryptoJS.enc.Utf8.parse(PAY_HASH_KEY); // 先轉成 CryptoJS 可接受加密格式：WordArray
  const iv = CryptoJS.enc.Utf8.parse(PAY_HASH_IV);
  const ciphertext = CryptoJS.enc.Hex.parse(req.body.TradeInfo as string);
  const decrypted = CryptoJS.AES.decrypt(ciphertext.toString(), key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decryptedWithoutPadding = CryptoJS.enc.Utf8.stringify(decrypted).replace(/\0+$/, "");
  console.log("🚀 ~ file: planControllers.ts:95 ~ paymentNotify ~ decryptedWithoutPadding:", decryptedWithoutPadding);
  const [returnInfo] = decryptedWithoutPadding.split("&").map((item) => {
    const [prop, value] = item.split("=");
    return { [prop]: value };
  });
  if (returnInfo.status !== "SUCCESS") {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_TO_PAY);
    return;
  }

  const updateDbTradeRecord = Plan.findOneAndUpdate(
    { merchantOrderNo: returnInfo.merchantOrderNo },
    {
      status: returnInfo.status === "SUCCESS" ? "PAID" : "UN-PAID",
      payMethod: "WEBATM",
    },
  );
  if (!updateDbTradeRecord) {
    forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.FAIL_UPDATE);
    return;
  }
  sendSuccessResponse(res, ApiResults.SUCCESS_TO_PAY);
  // 如果資料一致，就可以更新到 DB
  console.log("🚀 ~ file: planControllers.ts:87 ~ paymentReturn ~ res:", res, next);
};

const paymentReturn = async (req: Request, res: Response, next: NextFunction) => {
  const receivePaymentData = req.body;
  console.log("🚀 ~ file: planControllers.ts:80 ~ paymentReturn:", receivePaymentData);

  // 解密資料，核對 產品編號是否一致
  // 如果資料一致，就可以更新到 DB
  console.log("🚀 ~ file: planControllers.ts:87 ~ paymentReturn ~ res:", res, next);
};

export default {
  createOrderForPayment,
  paymentNotify,
  paymentReturn,
};
