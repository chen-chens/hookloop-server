import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "",
    },
    name: {
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
    lastActiveTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false },
);

const User = mongoose.model("User", userSchema);

export default User;
