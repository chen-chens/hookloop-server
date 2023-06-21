import mongoose, { Schema, Types } from "mongoose";

export interface IPlan {
  name: "Free" | "Standard" | "Premium";
  price: number;
  endAt: Date;
  userId: Types.ObjectId;
  status: "UN-PAID" | "NONE" | "PAY-SUCCESS" | "PAY-FAIL";
  createdAt: Date;
  updatedAt: Date;
  merchantOrderNo: string;
  paymentType: string;
  payBankCode?: string;
  payerAccount5Code?: string;
  payTime: string;
  user?: {
    username: string;
    email: string;
  };
}
const planSchema = new Schema<IPlan>(
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
      // 付費狀態
      type: String,
      enum: ["UN-PAID", "NONE", "PAY-SUCCESS", "PAY-FAIL"], // NONE 代表 FREE 方案，沒有付費狀態
      required: true,
    },
    merchantOrderNo: {
      // 用來與藍新金流核對
      type: String,
    },
    paymentType: {
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
    payTime: {
      type: String,
    },
  },
  {
    timestamps: true, // generate : createdAt, updatedAt
    versionKey: false,
  },
);

planSchema.index({ endAt: -1 }); // 在 endAt 上創建索引，方便 UserModel 指向最新方案資料。
planSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
  options: {
    select: "username email",
  },
});
const Plan = mongoose.model("Plan", planSchema);

export default Plan;
