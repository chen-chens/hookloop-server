import mongoose, { Schema } from "mongoose";

export interface IResetPasswordSchema {
  userId: string;
  tempToken: string;
  expiresAt: Date;
}
const resetPasswordSchema = new Schema<IResetPasswordSchema>({
  userId: {
    type: String,
    ref: "User",
    required: true,
  },
  tempToken: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const ResetPassword = mongoose.model<IResetPasswordSchema>("ResetPassword", resetPasswordSchema);
resetPasswordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // 在指定時間，自動從 DB 刪除這筆紀錄

export default ResetPassword;
