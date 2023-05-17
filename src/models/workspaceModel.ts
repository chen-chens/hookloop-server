import mongoose, { Schema } from "mongoose";

const workspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: "",
      minlength: 2,
      maxLength: 100,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    kanban: [
      {
        type: Schema.Types.ObjectId,
        ref: "Kanban",
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // generate : createdAt, updatedAt
    versionKey: false,
  },
);

// 加入 WorkspaceMember 資訊：
workspaceSchema.virtual("membersRole", {
  ref: "WorkspaceMember",
  localField: "_id",
  foreignField: "workspaceId",
  justOne: false,
  options: { select: "userId role" },
});
const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace;
