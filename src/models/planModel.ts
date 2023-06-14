import mongoose, { Schema } from "mongoose";

export interface IPlan {
  name: "Free" | "Standard" | "Premium";
  price: number;
  endAt: Date;
  userId: string;
  status: "PAID" | "UN-PAID";
  createdAt: Date;
  updatedAt: Date;
  merchantOrderNo: string;
}
const planSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      enum: ["Free", "Standard", "Premium"],
    },
    price: {
      type: Number,
      require: true,
      default: 0,
    },
    endAt: {
      type: Date,
      require: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      require: true,
      enum: ["PAID", "UN-PAID"],
    },
    merchantOrderNo: {
      // 用來與藍新金流核對
      type: String,
      required: true,
    },
    tradeResults: {
      // 藍新金流交易後回傳狀態
      status: {
        type: String,
      },
      message: {
        // 藍新金流交易後回傳訊息
        type: String,
      },
      payBankCode: {
        // 付款人金融機構代碼
        type: String,
      },
      payerAccount5Code: {
        // 付款人金融機構帳號末五碼
        type: String,
      },
    },
  },
  {
    timestamps: true, // generate : createdAt, updatedAt
    versionKey: false,
  },
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
