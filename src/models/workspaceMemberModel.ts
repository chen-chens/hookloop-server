import mongoose, { Document, Schema, Types } from "mongoose";

import { IUser } from "./userModel";
import { IWorkspace } from "./workspaceModel";

export interface IWorkspaceMember extends Document {
  workspaceId: Types.ObjectId;
  userId: Types.ObjectId;
  role: "Admin" | "Member" | "Owner";
  workspace?: IWorkspace;
  user?: IUser;
  createdAt: Date;
  updatedAt: Date;
}
const workspaceMemberSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Member", "Owner"],
      default: "Member",
    },
  },
  {
    timestamps: true, // generate : createdAt, updatedAt
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

workspaceMemberSchema.virtual("workspace", {
  ref: "Workspace",
  localField: "workspaceId",
  foreignField: "_id",
  justOne: true,
  options: { select: "name memberIds kanbans isArchived updatedAt" },
});
workspaceMemberSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
  options: { select: "username isArchived" },
});
// workspaceMemberSchema.virtual("WorkspaceMemberWithPlan", {
//   ref: "Plan",
//   localField: "userId",
//   foreignField: "userId",
//   justOne: true,
//   options: { select: "userId name endAt" },
// });

const WorkspaceMember = mongoose.model<IWorkspaceMember>("WorkspaceMember", workspaceMemberSchema);

export default WorkspaceMember;
