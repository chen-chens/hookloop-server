import mongoose from "mongoose";
import validator from "validator";

import { ValidationFn } from "@/types";

import { aggregateErrors, mongoIdsValidator, mongoIdValidator } from "./validationHelper";

const createCard = (req: any) => {
  let field: string = "";
  let error: string = "";
  const { name } = req.body;
  if (!name || name.length > 50) {
    field += name;
    error += "Card's name is required and should not exceed 50 characters.";
  }
  const kanbanIdResult = mongoIdValidator(req, "kanbanId");

  return aggregateErrors([{ field, error }, kanbanIdResult]);
};

const updateCard: ValidationFn = (req) => {
  let errorMessage: string = "";
  const idValidationError = mongoIdsValidator(req);
  if (idValidationError) {
    return idValidationError;
  }
  const {
    name,
    description,
    reporter,
    assignee,
    targetStartDate,
    targetEndDate,
    actualStartDate,
    actualEndDate,
    priority,
    status,
    tag,
    webLink,
  } = req.body;

  if (name && !validator.isLength(name, { min: 1, max: 50 })) {
    errorMessage += "Name must be between 1 and 30 characters. \n";
  }
  if (description && !validator.isLength(description, { max: 500 })) {
    errorMessage += "Description must be between 1 and 500 characters. \n";
  }
  if (reporter && !mongoose.Types.ObjectId.isValid(reporter)) {
    errorMessage += "Reporter must be a valid ObjectId. \n";
  }
  if (assignee && !Array.isArray(assignee)) {
    errorMessage += "Assignee must be an array. \n";
    assignee.forEach((assigneeId: any) => {
      if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
        errorMessage += "Assignee must be a valid ObjectId. \n";
      }
    });
  }
  if (targetStartDate && !validator.isDate(targetStartDate)) {
    errorMessage += "Target start date must be a valid date. \n";
  }
  if (targetEndDate && !validator.isDate(targetEndDate)) {
    errorMessage += "Target end date must be a valid date. \n";
  }
  if (actualStartDate && !validator.isDate(actualStartDate)) {
    errorMessage += "Actual start date must be a valid date. \n";
  }
  if (actualEndDate && !validator.isDate(actualEndDate)) {
    errorMessage += "Actual end date must be a valid date. \n";
  }
  if (priority && !validator.isIn(priority, ["Low", "Medium", "High"])) {
    errorMessage += "Priority must be Low, Medium or High. \n";
  }
  if (status && !validator.isIn(status, ["Pending", "In Progress", "Done"])) {
    errorMessage += "Status must be Pending, In Progress or Done. \n";
  }
  if (tag && !Array.isArray(tag)) {
    errorMessage += "Tag must be an array. \n";
    tag.forEach((tagId: any) => {
      if (!mongoose.Types.ObjectId.isValid(tagId)) {
        errorMessage += "Tag must be a valid ObjectId. \n";
      }
    });
  }
  if (webLink && !Array.isArray(webLink)) {
    errorMessage += "Web link must be an array. \n";
    webLink.forEach((webLinkItem: any) => {
      if (!validator.isURL(webLinkItem.url)) {
        errorMessage += "Web link must be a valid URL. \n";
      }
    });
  }
  return errorMessage ? { field: "card", error: errorMessage } : null;
};

export default {
  createCard,
  // getCardById,
  updateCard,
  // archiveCard,
  // moveCard,
};
