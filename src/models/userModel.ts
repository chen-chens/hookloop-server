import mongoose, { Schema } from "mongoose";

// 定義 User 模型的介面
export interface IUser extends Document {
  id: string;
  email: string;
  username: string;
  password: string;
  avatar: string;
  isArchived: boolean;
  plan: any;
  lastActiveTime: Date;
  createdAt: Date;
  updatedAt: Date;
}
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "",
    },
    username: {
      type: String,
      required: true,
      trim: true,
      default: "",
      minlength: 2,
      maxLength: 100,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      select: false,
      default: "",
    },
    avatar: {
      type: String,
      trim: true,
      default: "",
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastActiveTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // generate : createdAt, updatedAt
    versionKey: false,
  },
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
