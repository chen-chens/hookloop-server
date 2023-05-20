import { ValField, ValidationFn } from "@/types";

import { validateFieldsAndGetErrorData } from "./validationHelper";

const createCard: ValidationFn = (req) => {
  const valFields: ValField[] = [
    {
      field: "name",
      fieldName: "Card Name",
      rules: [{ type: "exist" }, { type: "lengthRange", min: 1, max: 50 }],
    },
    { field: "kanbanId", fieldName: "Kanban Id", rules: [{ type: "exist" }, { type: "objectId" }] },
  ];
  return validateFieldsAndGetErrorData(req, valFields);
};

const getCardById: ValidationFn = (req) => {
  const valFields: ValField[] = [
    { field: "id", fieldName: "Card Id", rules: [{ type: "exist" }, { type: "paramId" }, { type: "objectId" }] },
  ];
  return validateFieldsAndGetErrorData(req, valFields);
};

const updateCard: ValidationFn = (req) => {
  const valFields: ValField[] = [
    { field: "name", fieldName: "Card Name", rules: [{ type: "lengthRange", min: 1, max: 50 }] },
    { field: "description", fieldName: "Description", rules: [{ type: "maxLength", max: 500 }] },
    { field: "reporter", fieldName: "Reporter", rules: [{ type: "objectId" }] },
    { field: "assignee", fieldName: "Assignee", rules: [{ type: "objectIdArray" }] },
    { field: "targetStartDate", fieldName: "Target start date", rules: [{ type: "date" }] },
    { field: "targetEndDate", fieldName: "Target end date", rules: [{ type: "date" }] },
    { field: "actualStartDate", fieldName: "Actual start date", rules: [{ type: "date" }] },
    { field: "actualEndDate", fieldName: "Actual end date", rules: [{ type: "date" }] },
    { field: "priority", fieldName: "Priority", rules: [{ type: "enum", enumArray: ["Low", "Medium", "High"] }] },
    {
      field: "status",
      fieldName: "Status",
      rules: [{ type: "enum", enumArray: ["Pending", "In Progress", "Done"] }],
    },
    { field: "tag", fieldName: "Tag", rules: [{ type: "objectIdArray" }] },
    { field: "webLink", fieldName: "Web link", rules: [{ type: "urlArray" }] },
  ];

  return validateFieldsAndGetErrorData(req, valFields);
};

const archiveCard: ValidationFn = (req) => {
  const valFields: ValField[] = [
    { field: "id", fieldName: "Card Id", rules: [{ type: "exist" }, { type: "paramId" }, { type: "objectId" }] },
    { field: "isArchived", fieldName: "Is Archived", rules: [{ type: "exist" }] },
  ];
  return validateFieldsAndGetErrorData(req, valFields);
};

export default {
  createCard,
  getCardById,
  updateCard,
  archiveCard,
};
