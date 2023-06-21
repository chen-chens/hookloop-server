import { Request } from "express";

import PlanOptions from "./planOptions";

enum PayStatus {
  "UN-PAID",
  "NONE",
  "PAY-SUCCESS",
  "PAY-FAIL",
}
interface IPlansRequest extends Request {
  body: {
    userId: string;
    username: string;
    email: string;
    planType?: PlanOptions;
    payTime?: string;
    status?: PayStatus;
    merchantOrderNo?: string;
  };
}

export default IPlansRequest;
