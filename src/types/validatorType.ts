import { Request } from "express";

export type ValErrorData = {
  field: string;
  error: string;
};

export type ValidationFn = (req: Request) => ValErrorData | null;

export type ValReturn = ValErrorData | null;

export type ValType =
  | "paramExist"
  | "fieldExist"
  | "paramId"
  | "objectId"
  | "date"
  | "url"
  | "string"
  | "array"
  | "boolean"
  | "objectIdArray"
  | "urlArray"
  | "lengthRange"
  | "maxLength"
  | "enum";

export type ValRule = {
  type: ValType;
  min?: number;
  max?: number;
  enumArray?: string[];
};

export type ValField = {
  field: string;
  fieldName: string;
  rules: ValRule[];
};
