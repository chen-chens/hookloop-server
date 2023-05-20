import { Request } from "express";

export type ValErrorData = {
  field: string;
  error: string;
};

export type ValidationFn = (req: Request) => ValErrorData | null;

export type ValReturn = ValErrorData | null;

export type ValType =
  | "paramId"
  | "objectId"
  | "exist"
  | "lengthRange"
  | "maxLength"
  | "array"
  | "objectIdArray"
  | "date"
  | "enum"
  | "url"
  | "urlArray";

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
