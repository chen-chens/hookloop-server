import mongoose, { Schema } from "mongoose";

export interface IPlan {
  name: "Free" | "Standard" | "Premium";
  price: number;
  endAt: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
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
    // items: [
    //   // 用途？
    //   {
    //     name: String,
    //   },
    // ],
  },
  {
    timestamps: true, // generate : createdAt, updatedAt
    versionKey: false,
  },
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
