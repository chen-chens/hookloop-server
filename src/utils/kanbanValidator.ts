import { ValidationForRequest, ValidatorSchema } from "@/types";

import validationHelper from "./validationHelper";

const { validateFieldsAndGetErrorData, valString, valBoolean, valObjectId, valLengthInRange } = validationHelper;
const getTags: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    kanbanId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
  };
  return validateFieldsAndGetErrorData(schema, "Tags", req.body, req.params);
};

const createTag: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    kanbanId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    name: {
      validators: [valString, valLengthInRange(1, 50)],
      isRequired: true,
    },
    color: {
      validators: [valString],
    },
    icon: {
      validators: [valString],
    },
  };
  return validateFieldsAndGetErrorData(schema, "Tag", req.body, req.params);
};

const getTagById: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    kanbanId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    tagId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
  };
  return validateFieldsAndGetErrorData(schema, "Tag", req.body, req.params);
};

const updateTagById: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    kanbanId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    tagId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    name: {
      validators: [valString, valLengthInRange(1, 50)],
    },
    color: {
      validators: [valString],
    },
    icon: {
      validators: [valString],
    },
  };
  return validateFieldsAndGetErrorData(schema, "Tag", req.body, req.params);
};

const archiveTag: ValidationForRequest = (req) => {
  const schema: ValidatorSchema = {
    kanbanId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    tagId: {
      validators: [valObjectId],
      isRequired: true,
      isParams: true,
    },
    isArchived: {
      validators: [valBoolean],
      isRequired: true,
    },
  };
  return validateFieldsAndGetErrorData(schema, "Tag", req.body, req.params);
};

export default {
  getTags,
  createTag,
  getTagById,
  updateTagById,
  archiveTag,
};
