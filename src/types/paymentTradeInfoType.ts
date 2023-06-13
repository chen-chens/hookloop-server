import PlanOptions from "./planOptions";

interface IPaymentTradeInfoType {
  MerchantID: string;
  RespondType: string;
  TimeStamp: string;
  Version: string;
  LoginType: string;
  MerchantOrderNo: string;
  Amt: number;
  ItemDesc: PlanOptions;
  TradeLimit: number;
  ReturnURL: string;
  NotifyURL: string;
  Email: string;
  EmailModify: number;
  WEBATM: number;
}
export default IPaymentTradeInfoType;
