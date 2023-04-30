import mongoose, { Schema } from "mongoose";
import validator from "validator";

const memberSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required !"],
      unique: true,
      trim: true,
      default: "",
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email !");
        }
      },
    },
    name: {
      type: String,
      required: [true, "User name is required !"],
      trim: true,
      default: "",
      minlength: 2,
      maxLength: 100,
    },
    password: {
      type: String,
      required: [true, "Password is required !"],
      trim: true,
      default: "",
      minlength: 6,
      maxLength: 20,
      validate(value: string) {
        const regexRule = /[A-Za-z0-9]+/;
        if (!value.match(regexRule)) {
          throw new Error("Password is invalid! ");
        }
      },
    },
    avatar: {
      type: String,
      trim: true,
      default: "",
    },
    registerTime: {
      type: Date,
      default: Date.now,
    },
    updatedTime: {
      type: Date,
      default: Date.now,
    },
    lastActiveTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false },
);

const Member = mongoose.model("Member", memberSchema);

export default Member;
