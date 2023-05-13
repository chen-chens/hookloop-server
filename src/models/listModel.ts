import mongoose, { Schema } from "mongoose";

const listSchema = new Schema(
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
    cardOrder: {
      type: [Schema.Types.ObjectId],
      ref: "Card",
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

const List = mongoose.model("List", listSchema);
export default List;
