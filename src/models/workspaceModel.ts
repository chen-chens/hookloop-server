import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  memberIds: Types.ObjectId[];
  kanbans: Types.ObjectId[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
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
    memberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "WorkspaceMember",
      },
    ],
    kanbans: [
      {
        type: mongoose.Schema.Types.ObjectId,
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

const Workspace = mongoose.model<IWorkspace>("Workspace", workspaceSchema);

export default Workspace;
