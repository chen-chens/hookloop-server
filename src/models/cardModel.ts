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
      },
    ],
    webLink: [
      new Schema(
        {
          name: {
            type: String,
            maxLength: 50,
          },
          url: String,
        },
        { id: false },
      ),
    ],
    attachment: [
      new Schema(
        {
          name: String,
          url: String,
          fileId: String,
          size: Number,
          mimeType: String,
        },
        {
          id: false,
          _id: false,
        },
      ),
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // generate : createdAt, updatedAt
    versionKey: false,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

cardSchema.virtual("cardComment", {
  ref: "CardComment",
  localField: "_id",
  foreignField: "cardId",
});
cardSchema.virtual("cardCommentCount", {
  ref: "CardComment",
  localField: "_id",
  foreignField: "cardId",
  count: true,
});
cardSchema.virtual("notificationCommentCount", {
  ref: "Notification",
  localField: "_id",
  foreignField: "cardId",
  options: {
    match: { isRead: false },
  },
  count: true,
});
cardSchema.virtual("cardHistory", {
  ref: "CardHistory",
  localField: "_id",
  foreignField: "cardId",
});
cardSchema.virtual("kanbanTag", {
  ref: "Tag",
  localField: "kanbanId",
  foreignField: "kanbanId",
});
const Card = mongoose.model("Card", cardSchema);
export default Card;
