import mongoose, { Schema } from "mongoose";

const tagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    kanbanId: {
      type: Schema.Types.ObjectId,
      ref: "Kanban",
      required: true,
    },
    color: {
      type: String,
      default: "#000000",
    },
    icon: {
      type: String,
      default: "fas fa-tag",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
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

const Tag = mongoose.model("Tag", tagSchema);
export default Tag;
