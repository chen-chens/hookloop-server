import mongoose, { Schema } from "mongoose";

const kanbanSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "",
      minlength: 2,
      maxLength: 100,
    },
    name: {
      type: String,
      required: true,
      default: "",
      minlength: 2,
      maxLength: 100,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    listOrder: [
      {
        type: Schema.Types.ObjectId,
        ref: "List",
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // generate : createdAt, updatedAt
    versionKey: false,
  },
);

const Kanban = mongoose.model("Kanban", kanbanSchema);

export default Kanban;
