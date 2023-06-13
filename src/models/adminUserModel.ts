import mongoose, { Schema } from "mongoose";

export interface IAdminUser extends Document {
  id: string;
  username: string;
  password: string;
  lastActiveTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    username: { type: String, required: true, trim: true, default: "", minlength: 2, maxLength: 100 },
    password: { type: String, required: true, trim: true, select: false, default: "" },
    lastActiveTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // generate : createdAt, updatedAt
    timestamps: true,
    versionKey: false,
  },
);

const AdminUser = mongoose.model("AdminUser", AdminUserSchema);
export default AdminUser;
