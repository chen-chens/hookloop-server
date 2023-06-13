import { NextFunction, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { IUser } from "@/models/userModel";
import { ApiResults, IPaymentTradeInfoType, IPlanOrderRequest, StatusCode } from "@/types";
import { getPriceByPlan } from "@/utils";

const createOrder = async (req: IPlanOrderRequest, res: Response, next: NextFunction) => {
  const { email, isArchived } = req.user as IUser;
  const { targetPlan } = req.body;
  if (isArchived) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.USER_IS_ARCHIVED);
    return;
  }
  if (!targetPlan) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.PLAN_FOR_PAYMENT_IS_REQUIRED);
    return;
  }
  console.log(req, res, next);

  const tradeInfo: IPaymentTradeInfoType = {
    MerchantID: process.env.PAY_MERCHANT_ID!,
    RespondType: "JSON",
    TimeStamp: Date.now().toString(),
    Version: process.env.PAY_VERSION!,
    LoginType: "en",
    MerchantOrderNo: "???", //
    Amt: getPriceByPlan(targetPlan),
    ItemDesc: targetPlan,
    TradeLimit: 900, // 交易有效時間內未完成交易，則視為交易失敗 ---> DB 顯示交易未完成。（交易成功、交易失敗、交易未完成）
    ReturnURL: process.env.PAY_RETURN_URL!, // 只接受 80 與 443 Port ?
    NotifyURL: process.env.PAY_NOTIFY_URL!, // 只接受 80 與 443 Port ?
    Email: email,
    EmailModify: 0, // 付款人電子信箱欄位是 否開放讓付款人修改: 不可改: 0
    WEBATM: 1,
  };
  console.log("🚀 ~ file: planControllers.ts:24 ~ createOrder ~ tradeInfo:", tradeInfo);
};

export default {
  createOrder,
};
