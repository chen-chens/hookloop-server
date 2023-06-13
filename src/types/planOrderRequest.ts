import { Request } from "express";

import PlanOptions from "./planOptions";

interface IPlanOrderRequest extends Request {
  body: {
    targetPlan: PlanOptions;
  };
}

export default IPlanOrderRequest;
