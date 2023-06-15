import mongoose, { Schema } from "mongoose";

export interface IPlan {
  name: "Free" | "Standard" | "Premium";
  price: number;
  endAt: Date;
  userId: string;
  status?: "PAID" | "UN-PAID";
  createdAt: Date;
  updatedAt: Date;
  merchantOrderNo: string;
  payBankCode?: string;
  payerAccount5Code?: string;
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
      enum: ["PAID", "UN-PAID"],
    },
    merchantOrderNo: {
      // 用來與藍新金流核對
      type: String,
    },
    payMethod: {
      // 付款人交易方式
      type: String,
      enum: ["WEBATM", "CREDIT_CARD"],
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
  {
    timestamps: true, // generate : createdAt, updatedAt
    versionKey: false,
  },
);

planSchema.index({ endAt: -1 }); // 在 endAt 上創建索引，方便 UserModel 指向最新方案資料。
const Plan = mongoose.model("Plan", planSchema);

export default Plan;
