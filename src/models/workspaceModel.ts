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
    manager: {
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
    isClosed: {
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
