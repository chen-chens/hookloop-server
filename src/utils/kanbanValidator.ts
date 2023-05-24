import { ValField, ValidationFn } from "@/types";

import { validateFieldsAndGetErrorData } from "./validationHelper";

const getTags: ValidationFn = (req) => {
  const valFields: ValField[] = [
    { field: "kanbanId", fieldName: "Kanban Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
  ];
  return validateFieldsAndGetErrorData(req, valFields);
};

const createTag: ValidationFn = (req) => {
  const valFields: ValField[] = [
    { field: "kanbanId", fieldName: "kanban Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
    {
      field: "name",
      fieldName: "Name",
      rules: [{ type: "fieldExist" }, { type: "string" }, { type: "lengthRange", min: 1, max: 50 }],
    },
    { field: "color", fieldName: "Color", rules: [{ type: "string" }] },
    { field: "icon", fieldName: "Icon", rules: [{ type: "string" }] },
  ];
  return validateFieldsAndGetErrorData(req, valFields);
};

const getTagById: ValidationFn = (req) => {
  const valFields: ValField[] = [
    { field: "kanbanId", fieldName: "Kanban Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
    { field: "tagId", fieldName: "Tag Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
  ];
  return validateFieldsAndGetErrorData(req, valFields);
};

const updateTagById: ValidationFn = (req) => {
  const valFields: ValField[] = [
    { field: "kanbanId", fieldName: "kanban Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
    { field: "tagId", fieldName: "Tag Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
    { field: "name", fieldName: "Name", rules: [{ type: "string" }, { type: "lengthRange", min: 1, max: 50 }] },
    { field: "color", fieldName: "Color", rules: [{ type: "string" }] },
    { field: "icon", fieldName: "Icon", rules: [{ type: "string" }] },
  ];
  return validateFieldsAndGetErrorData(req, valFields);
};

const archiveTag: ValidationFn = (req) => {
  const valFields: ValField[] = [
    { field: "kanbanId", fieldName: "Kanban Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
    { field: "tagId", fieldName: "Tag Id", rules: [{ type: "paramExist" }, { type: "paramId" }] },
    { field: "isArchived", fieldName: "Is Archived", rules: [{ type: "fieldExist" }, { type: "boolean" }] },
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
