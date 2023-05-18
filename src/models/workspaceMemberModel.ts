import mongoose, { Schema } from "mongoose";

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
  },
);

workspaceMemberSchema.virtual("WorkspaceMemberWithPlan", {
  ref: "Plan",
  localField: "userId",
  foreignField: "userId",
  justOne: true,
  options: { select: "userId name endAt" },
});

const WorkspaceMember = mongoose.model("WorkspaceMember", workspaceMemberSchema);

export default WorkspaceMember;
