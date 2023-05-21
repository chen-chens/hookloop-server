// Check if the id is a valid mongo id

import { Request } from "express";
import mongoose from "mongoose";
import validator from "validator";

import { ValErrorData, ValField, ValReturn, ValRule } from "@/types";

const generateErrorData = (field: string, error: string): ValErrorData => {
  return { field, error };
};

const valFieldExist = (req: Request, field: string, fieldName: string): ValReturn => {
  const fieldValue = req.body[field];
  if (!fieldValue) {
    return generateErrorData(field, `${fieldName} is required`);
  }
  return null;
};
const valParamExist = (req: Request, field: string, fieldName: string): ValReturn => {
  const fieldValue = req.params[field];
  if (!fieldValue) {
    return generateErrorData(field, `${fieldName} is required`);
  }
  return null;
};

const valObjectIdParam = (req: Request, field: string, fieldName: string): ValReturn => {
  const id = req.params[field];
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return generateErrorData(field, `${fieldName} must be a valid ObjectId`);
  }
  return null;
};

const valObjectIdField = (req: Request, field: string, fieldName: string): ValReturn => {
  const id = req.body[field];
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return generateErrorData(field, `${fieldName} must be a valid ObjectId`);
  }
  return null;
};

const valDate = (req: Request, field: string, fieldName: string): ValReturn => {
  const fieldValue = req.body[field];
  if (fieldValue && !validator.isDate(field)) {
    return generateErrorData(field, `${fieldName} must be a valid date.`);
  }
  return null;
};

const valUrl = (req: Request, field: string, fieldName: string): ValReturn => {
  const fieldValue = req.body[field];
  if (fieldValue && !validator.isURL(fieldValue)) {
    return generateErrorData(field, `${fieldName} must be a valid URL.`);
  }
  return null;
};

const valString = (req: Request, field: string, fieldName: string): ValReturn => {
  const fieldValue = req.body[field];
  if (fieldValue && typeof fieldValue !== "string") {
    return generateErrorData(field, `${fieldName} must be a string`);
  }
  return null;
};

const valArray = (req: Request, field: string, fieldName: string): ValReturn => {
  const fieldValue = req.body[field];
  if (fieldValue && !Array.isArray(fieldValue)) {
    return generateErrorData(field, `${fieldName} must be an array`);
  }
  return null;
};

const valObjectIdArray = (req: Request, field: string, fieldName: string): ValReturn => {
  const ids = req.body[field];
  if (ids && !Array.isArray(ids)) {
    return generateErrorData(field, `${fieldName} must be an array`);
  }
  if (ids) {
    const invalidIds = ids.filter((id: any) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length !== 0) {
      return generateErrorData(field, `${fieldName} is not a valid ObjectId Array`);
    }
  }
  return null;
};

const valUrlArray = (req: Request, field: string, fieldName: string): ValReturn => {
  const urls = req.body[field];
  if (urls && !Array.isArray(urls)) {
    return generateErrorData(field, `${fieldName} must be an array`);
  }
  if (urls) {
    const invalidIds = urls.filter((url: any) => !validator.isURL(url));
    if (invalidIds.length !== 0) {
      return generateErrorData(field, `${fieldName} must be a valid URL array`);
    }
  }
  return null;
};

const valLengthInRange = (req: Request, field: string, fieldName: string, min: number, max: number): ValReturn => {
  const fieldValue = req.body[field];
  if (typeof fieldValue === "string" && !validator.isLength(fieldValue, { min, max })) {
    return generateErrorData(field, `${fieldName} must be between ${min} and ${max} characters`);
  }
  return null;
};

const valMaxLength = (req: Request, field: string, fieldName: string, max: number): ValReturn => {
  const fieldValue = req.body[field];
  if (typeof fieldValue === "string" && !validator.isLength(fieldValue, { max })) {
    return generateErrorData(field, `${fieldName} must be no more than ${max} characters`);
  }
  return null;
};

const valEnum = (req: Request, field: string, fieldName: string, enumArray: string[]): ValReturn => {
  const fieldValue = req.body[field];
  const enumValues = enumArray.join(", ");
  if (fieldValue && !validator.isIn(fieldValue, enumArray)) {
    return generateErrorData(field, `${fieldName} must be one of the following: ${enumValues}`);
  }
  return null;
};

const getValidators = (req: Request, field: string, fieldName: string, rules: ValRule[]): ValReturn[] => {
  return rules.map((rule) => {
    switch (rule.type) {
      case "paramExist":
        return valParamExist(req, field, fieldName);
      case "fieldExist":
        return valFieldExist(req, field, fieldName);
      case "paramId":
        return valObjectIdParam(req, field, fieldName);
      case "objectId":
        return valObjectIdField(req, field, fieldName);
      case "date":
        return valDate(req, field, fieldName);
      case "url":
        return valUrl(req, field, fieldName);
      case "string":
        return valString(req, field, fieldName);
      case "array":
        return valArray(req, field, fieldName);
      case "objectIdArray":
        return valObjectIdArray(req, field, fieldName);
      case "urlArray":
        return valUrlArray(req, field, fieldName);
      case "lengthRange":
        if (rule.min !== undefined && rule.max !== undefined) {
          return valLengthInRange(req, field, fieldName, rule.min, rule.max);
        }
        throw new Error(`Validate ${field} ${rule.type} : min and max must be defined`);
      case "maxLength":
        if (rule.max !== undefined) {
          return valMaxLength(req, field, fieldName, rule.max);
        }
        throw new Error(`Validate ${field} ${rule.type} : min and max must be defined`);
      case "enum":
        if (rule.enumArray !== undefined) {
          return valEnum(req, field, fieldName, rule.enumArray);
        }
        throw new Error(`Validate ${field} ${rule.type} : enumArray must be defined`);

      default:
        throw new Error(`Validate ${field} ${rule.type} : type is not defined`);
    }
  });
};

export const validateFields = (req: Request, valFields: ValField[]): ValReturn[] => {
  return valFields.reduce<ValReturn[]>((acc, valField) => {
    return acc.concat(getValidators(req, valField.field, valField.fieldName, valField.rules));
  }, []);
};

export const aggregateErrors = (validationResults: ValReturn[]): ValReturn => {
  const validErrors = validationResults.filter((item): item is ValErrorData => item !== null);
  if (validErrors.length === 0) {
    console.log("validSuccess");
    return null;
  }
  const fields = new Set(validErrors.map((error) => error.field));
  const uniqueFields = Array.from(fields).join(" ");
  const errorMessages = validErrors.reduce((acc, validationResult) => `${acc} ${validationResult.error}\n`, "");
  return {
    field: uniqueFields,
    error: errorMessages,
  };
};

export const validateFieldsAndGetErrorData = (req: Request, valFields: ValField[]): ValReturn => {
  const validationResults = validateFields(req, valFields);
  return aggregateErrors(validationResults);
};
