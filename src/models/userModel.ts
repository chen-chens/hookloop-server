import mongoose, { Schema } from "mongoose";

// 定義 User 模型的介面
export interface IUser extends Document {
  id: string;
  email: string;
  username: string;
  password: string;
  avatar: string;
  isArchived: boolean;
  lastActiveTime: Date;
  createdAt: Date;
  updatedAt: Date;
  resetToken?: {
    token: string;
    expiresAt: Date;
  };
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
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastActiveTime: {
      type: Date,
      default: Date.now,
    },
    resetToken: {
      token: String,
      expiresAt: {
        type: Date,
        expires: 0,
      },
    },
  },
  {
    timestamps: true, // generate : createdAt, updatedAt
    versionKey: false,
  },
);

const User = mongoose.model<IUser>("User", userSchema);
userSchema.index({ "resetToken.expiresAt": 1 }, { expireAfterSeconds: 0 }); // resetToken 在指定時間，自動從 DB 刪除欄位內容

export default User;
