import mongoose, { Schema } from "mongoose";

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
    items: [
      {
        name: String,
      },
    ],
  },
  {
    timestamps: true, // generate : createdAt, updatedAt
    versionKey: false,
  },
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
