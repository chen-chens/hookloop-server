import mongoose, { Schema } from "mongoose";

const cardCommentSchema = new Schema(
  {
    currentContent: {
      type: String,
      required: true,
    },
    previousContent: [
      {
        content: String,
        time: Date,
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cardId: {
      type: Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },
    isEdited: {
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

const CardComment = mongoose.model("CardComment", cardCommentSchema);
export default CardComment;
