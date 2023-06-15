import { NextFunction, Request, Response, Router } from "express";

import { forwardCustomError } from "@/middlewares";
import Plan from "@/models/planModel";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse } from "@/utils";

import v1Routes from "./v1";

const router = Router();

router.get("/", (_req, res) => {
  console.log("Hello World!");
  res.cookie("WHERE_AM_I", "WHERE_AM_I", { expires: new Date(Date.now() + 24 * 2 * 60 * 60 * 1000) });
  res.send("Hello World!");
});
router.use("/api/v1", v1Routes);

router.post("/paymentNotify", async (req: Request, res: Response, next: NextFunction) => {
  const { PAY_MERCHANT_ID, PAY_VERSION, PAY_RETURN_URL, PAY_NOTIFY_URL, PAY_HASH_IV, PAY_HASH_KEY } = process.env;
  // const receivePaymentData = req.body;
  console.log("🚀 ~ file: planControllers ~ paymentNotify req :", req);

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
});

export default router;
