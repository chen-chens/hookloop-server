import { IPaymentTradeInfoType } from "@/types";

const transferTradeInfoString = (tradeInfo: IPaymentTradeInfoType): string => {
  // 特殊符號 與 中文字 要轉成編碼
  // const dataString = `
  //   MerchantID=${tradeInfo.MerchantID}&
  //   RespondType=${tradeInfo.RespondType}&
  //   TimeStamp=${tradeInfo.TimeStamp}&
  //   Version=${tradeInfo.Version}&
  //   LoginType=${tradeInfo.LoginType}&
  //   MerchantOrderNo=${tradeInfo.MerchantOrderNo}&
  //   Amt=${tradeInfo.Amt}&
  //   ItemDesc=${encodeURI(tradeInfo.ItemDesc)}&
  //   TradeLimit=${tradeInfo.TradeLimit}&
  //   ReturnURL=${tradeInfo.ReturnURL}&
  //   NotifyURL=${tradeInfo.NotifyURL}&
  //   Email=${encodeURIComponent(tradeInfo.Email)}&
  //   EmailModify=${tradeInfo.EmailModify}&
  //   WEBATM=${tradeInfo.WEBATM}
  // `;
  // const dataString = `MerchantID=${tradeInfo.MerchantID}&RespondType=${tradeInfo.RespondType}&TimeStamp=${
  //   tradeInfo.TimeStamp
  // }&Version=${tradeInfo.Version}&LoginType=${tradeInfo.LoginType}&
  // MerchantOrderNo=${tradeInfo.MerchantOrderNo}&Amt=${tradeInfo.Amt}&ItemDesc=${encodeURI(
  //   tradeInfo.ItemDesc,
  // )}&TradeLimit=${tradeInfo.TradeLimit}&ReturnURL=${tradeInfo.ReturnURL}&
  // NotifyURL=${tradeInfo.NotifyURL}&Email=${encodeURIComponent(tradeInfo.Email)}&EmailModify=${
  //   tradeInfo.EmailModify
  // }&WEBATM=${tradeInfo.WEBATM}`;
  const dataString = Object.entries(tradeInfo)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return dataString;
};

export default transferTradeInfoString;
