import mongoose, { Schema } from "mongoose";

const cardSchema = new Schema(
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
    description: {
      type: String,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignee: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    targetStartDate: {
      type: Date,
    },
    targetEndDate: {
      type: Date,
    },
    actualStartDate: {
      type: Date,
    },
    actualEndDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Done"],
      default: "Pending",
    },
    tag: {
      type: [Schema.Types.ObjectId],
      ref: "Tag",
    },
    webLink: [
      {
        name: String,
        url: String,
      },
    ],
    attachment: [
      {
        name: String,
        url: String,
      },
    ],
    isArchived: {
      type: Boolean,
    },
  },
  {
    timestamps: true, // generate : createdAt, updatedAt
    versionKey: false,
  },
);

const Card = mongoose.model("Card", cardSchema);
export default Card;
