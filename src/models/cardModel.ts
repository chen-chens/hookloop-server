import mongoose, { Schema } from "mongoose";

const cardSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50,
    },
    kanbanId: {
      type: Schema.Types.ObjectId,
      ref: "Kanban",
      required: true,
    },
    description: {
      type: String,
      maxLength: 500,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignee: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
    tag: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
        maxLength: 10,
      },
    ],
    webLink: [
      {
        name: {
          type: String,
          maxLength: 30,
        },
        url: String,
      },
    ],
    attachment: [
      {
        name: {
          type: String,
          maxLength: 30,
        },
        url: String,
      },
    ],
    comment: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
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

const Card = mongoose.model("Card", cardSchema);
export default Card;
