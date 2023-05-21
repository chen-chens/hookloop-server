import mongoose, { Schema, Types } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  memberIds: Types.ObjectId[];
  kanbans: Types.ObjectId[];
  isArchived: boolean;
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

const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace;
