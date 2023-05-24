import { ValField, ValidationFn } from "@/types";

import { validateFieldsAndGetErrorData } from "./validationHelper";

const getTags: ValidationFn = (req) => {
  const valFields: ValField[] = [
    { field: "kanbanId", fieldName: "kanban Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
  ];
  return validateFieldsAndGetErrorData(req, valFields);
};

const createTag: ValidationFn = (req) => {
  const valFields: ValField[] = [
    { field: "kanbanId", fieldName: "kanban Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
    { field: "name", fieldName: "name", rules: [{ type: "fieldExist" }, { type: "string" }] },
    { field: "color", fieldName: "color", rules: [{ type: "string" }] },
    { field: "icon", fieldName: "icon", rules: [{ type: "string" }] },
  ];
  return validateFieldsAndGetErrorData(req, valFields);
};

const getTagById: ValidationFn = (req) => {
  const valFields: ValField[] = [
    { field: "kanbanId", fieldName: "kanban Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
    { field: "tagId", fieldName: "tag Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
  ];
  return validateFieldsAndGetErrorData(req, valFields);
};

const updateTagById: ValidationFn = (req) => {
  const valFields: ValField[] = [
    { field: "kanbanId", fieldName: "kanban Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
    { field: "tagId", fieldName: "tag Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
    { field: "name", fieldName: "name", rules: [{ type: "string" }] },
    { field: "color", fieldName: "color", rules: [{ type: "string" }] },
    { field: "icon", fieldName: "icon", rules: [{ type: "string" }] },
  ];
  return validateFieldsAndGetErrorData(req, valFields);
};

const archiveTag: ValidationFn = (req) => {
  const valFields: ValField[] = [
    { field: "kanbanId", fieldName: "kanban Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
    { field: "tagId", fieldName: "tag Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
    { field: "archive", fieldName: "archive", rules: [{ type: "boolean" }] },
  ];
  return validateFieldsAndGetErrorData(req, valFields);
};

export default {
  getTags,
  createTag,
  getTagById,
  updateTagById,
  archiveTag,
};
