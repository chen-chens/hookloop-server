import { ValidationForRequest, ValidatorSchema } from "@/types";

import validationHelper from "./validationHelper";

const {
  validateFieldsAndGetErrorData,
  valArrayAndItem,
  valObjectArrayAndProp,
  valString,
  valBoolean,
  valObjectId,
  valDate,
  valUrl,
  valLengthInRange,
  valMaxLength,
  valEnum,
} = validationHelper;

const createCard: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    name: {
      validators: [valLengthInRange(1, 50)],
      isRequired: true,
    },
    kanbanId: {
      validators: [valObjectId],
      isRequired: true,
    },
    listId: {
      validators: [valObjectId],
      isRequired: true,
    },
    socketData: {
      isSocketData: true,
    },
  };
  return validateFieldsAndGetErrorData(schema, "Card", req.body);
};

const getCardById: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    id: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
  };
  return validateFieldsAndGetErrorData(schema, "Card", req.body, req.params);
};
const updateCard: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    id: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    kanbanId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    name: {
      validators: [valString, valLengthInRange(1, 50)],
    },
    description: {
      validators: [valString, valMaxLength(500)],
    },
    reporter: {
      validators: [valObjectId],
    },
    assignee: {
      validators: [valArrayAndItem([valObjectId])],
    },
    targetStartDate: {
      validators: [valDate],
    },
    targetEndDate: {
      validators: [valDate],
    },
    actualStartDate: {
      validators: [valDate],
    },
    actualEndDate: {
      validators: [valDate],
    },
    priority: {
      validators: [valEnum(["Low", "Medium", "High"])],
    },
    status: {
      validators: [valEnum(["Pending", "In Progress", "Done"])],
    },
    tag: {
      validators: [valArrayAndItem([valObjectId])],
    },
    webLink: {
      validators: [
        valObjectArrayAndProp({ name: { validators: [valString] }, url: { validators: [valUrl], isRequired: true }, id: { validators: [valObjectId] }}),
      ],
    },
    isArchived: {
      validators: [valBoolean],
    },
    socketData: {
      isSocketData: true,
    },
  };
  return validateFieldsAndGetErrorData(schema, "Card", req.body, req.params);
};

const archiveCard: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    id: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    isArchived: {
      validators: [valBoolean],
      isRequired: true,
    },
    listId: {
      validators: [valObjectId],
      isRequired: true,
    },
    kanbanId: {
      validators: [valObjectId],
      isRequired: true,
    },
    socketData: {
      isSocketData: true,
    },
  };
  return validateFieldsAndGetErrorData(schema, "Card", req.body, req.params);
};

const addAttachment: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    cardId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
  };
  return validateFieldsAndGetErrorData(schema, "Attachment", req.body, req.params);
};
const deleteAttachment: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    cardId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    attachmentId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
  };
  return validateFieldsAndGetErrorData(schema, "Attachment", req.body, req.params);
};
const getComments: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    cardId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
  };
  return validateFieldsAndGetErrorData(schema, "Comment", req.body, req.params);
};

const addComment: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    cardId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    currentComment: {
      validators: [valString, valLengthInRange(1, 500)],
      isRequired: true,
    },
    userId: {
      validators: [valObjectId],
      isRequired: true,
    },
  };
  return validateFieldsAndGetErrorData(schema, "Comment", req.body, req.params);
};
const updateComment: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    cardId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    commentId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    currentComment: {
      validators: [valString, valLengthInRange(1, 500)],
      isRequired: true,
    },
    previousComment: {
      validators: [valString, valLengthInRange(1, 500)],
      isRequired: true,
    },
    previousCommentTime: {
      validators: [valDate],
      isRequired: true,
    },
  };
  return validateFieldsAndGetErrorData(schema, "Comment", req.body, req.params);
};
const archiveComment: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    cardId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    commentId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    isArchived: {
      validators: [valBoolean],
      isRequired: true,
    },
  };
  return validateFieldsAndGetErrorData(schema, "Comment", req.body, req.params);
};
const getCommentHistory: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    cardId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    commentId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
  };
  return validateFieldsAndGetErrorData(schema, "Comment", req.body, req.params);
};

export default {
  createCard,
  getCardById,
  updateCard,
  archiveCard,
  addAttachment,
  deleteAttachment,
  getComments,
  addComment,
  updateComment,
  archiveComment,
  getCommentHistory,
};
