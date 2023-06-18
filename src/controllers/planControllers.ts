import CryptoJS from "crypto-js";
import { NextFunction, Request, Response } from "express";

import dbOptions from "@/config/dbOptions";
import { forwardCustomError } from "@/middlewares";
import { Plan } from "@/models";
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
  const { returnInfo } = req.returnInfo;
  // if (returnInfo.Status !== "SUCCESS") {
  //   forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_TO_PAY);
  //   return;
  // }

  // 如果訂單編號一致，就可以更新到 DB
  const updateDbTradeRecord = await Plan.findOneAndUpdate(
    { merchantOrderNo: returnInfo.Result.MerchantOrderNo },
    {
      status: returnInfo.Status === "SUCCESS" ? "PAY-SUCCESS" : "PAY-FAIL",
      paymentType: returnInfo.Result.PaymentType,
      payBankCode: returnInfo.Result.PayBankCode,
    },
    dbOptions,
  );
  if (!updateDbTradeRecord) {
    forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.FAIL_UPDATE);
    return;
  }
  sendSuccessResponse(res, ApiResults.SUCCESS_TO_PAY);
};

const paymentReturn = async (req: Request, res: Response) => {
  const { returnInfo } = req.returnInfo;

  const targetTradeRecord = await Plan.findOne({ merchantOrderNo: returnInfo.Result.MerchantOrderNo });
  if (targetTradeRecord) {
    res.status(StatusCode.OK).json(returnInfo);
    res.redirect(`/plan?targetPlan=${targetTradeRecord.name}`);
  }
};

export default {
  createOrderForPayment,
  paymentNotify,
  paymentReturn,
};
