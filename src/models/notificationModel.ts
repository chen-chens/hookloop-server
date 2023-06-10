import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      maxLength: 100,
    },
    content: {
      type: String,
      maxLength: 500,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
    },
    kanbanId: {
      type: Schema.Types.ObjectId,
      ref: "Kanban",
    },
    listId: {
      type: Schema.Types.ObjectId,
      ref: "List",
    },
    cardId: {
      type: Schema.Types.ObjectId,
      ref: "Card",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // generate : createdAt, updatedAt
    versionKey: false,
  },
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
