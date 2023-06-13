import { PlanOptions } from "@/types";

export enum PriceOptions {
  FREE = 0,
  STANDARD = 310,
  PREMIUM = 250,
}
const getPriceByPlan = (plan: PlanOptions): number => {
  if (plan === PlanOptions.STANDARD) {
    return PriceOptions.STANDARD;
  }
  if (plan === PlanOptions.PREMIUM) {
    return PriceOptions.PREMIUM;
  }
  return PriceOptions.FREE; // PlanOptions.FREE
};

export default getPriceByPlan;
