import mongoose, { Schema } from "mongoose";

const historySchema = new Schema(
  {
    cardId: {
      type: Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["create", "update", "delete"],
      required: true,
    },
    content: {
      type: String,
      enum: [
        "name",
        "description",
        "reporter",
        "assignee",
        "targetStartDate",
        "targetEndDate",
        "actualStartDate",
        "actualEndDate",
        "priority",
        "status",
        "tag",
        "webLink",
        "comment",
        "attachment",
      ],
      required: true,
    },
    time: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // generate : createdAt, updatedAt
    versionKey: false,
  },
);

const History = mongoose.model("History", historySchema);
export default History;
